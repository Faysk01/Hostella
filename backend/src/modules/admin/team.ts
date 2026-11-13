import type { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../config/prisma';
import type { MissionStatus, Prisma } from '../../generated/prisma/client';
import { AppError } from '../../utils/app-error';
import { makeReference } from '../../utils/reference';
import { audit, str } from './admin.middleware';

/* =================================================================
   Équipe (hôtesses) et planning des missions
   ================================================================= */

const optional = (max: number) => z.string().trim().max(max).nullable().optional().transform((v) => (v ? v : null));

const hostessSchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(60),
  lastName: z.string().trim().min(1, 'Nom requis').max(60),
  phone: z.string().trim().min(8, 'Téléphone invalide').max(30),
  email: z.email('E-mail invalide').max(120).nullable().optional().or(z.literal('')).transform((v) => v || null),
  city: z.string().trim().min(2).max(80).default('Bobo-Dioulasso'),
  languages: z.array(z.string().trim().max(40)).max(10).default([]),
  isActive: z.boolean().default(true),
  note: optional(2000),
});

// ---------------- Hôtesses ----------------
export async function listHostesses(req: Request, res: Response) {
  const q = str(req.query.q);
  const where: Prisma.HostessWhereInput = {
    ...(req.query.active === '1' && { isActive: true }),
    ...(q && {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { city: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };
  const now = new Date();
  const items = await prisma.hostess.findMany({
    where,
    orderBy: [{ isActive: 'desc' }, { lastName: 'asc' }],
    include: {
      _count: { select: { assignments: true } },
      assignments: {
        where: { mission: { startAt: { gte: now }, status: { in: ['PLANIFIEE', 'CONFIRMEE'] } } },
        select: { mission: { select: { id: true, title: true, startAt: true } } },
        orderBy: { mission: { startAt: 'asc' } },
        take: 1,
      },
    },
  });
  res.json({ success: true, data: items });
}

export async function getHostess(req: Request, res: Response) {
  const h = await prisma.hostess.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      application: { select: { id: true, reference: true } },
      assignments: { include: { mission: { select: { id: true, reference: true, title: true, startAt: true, status: true, location: true } } }, orderBy: { mission: { startAt: 'desc' } } },
    },
  });
  res.json({ success: true, data: h });
}

export async function createHostess(req: Request, res: Response) {
  const d = hostessSchema.parse(req.body);
  const h = await prisma.hostess.create({ data: d });
  await audit(req, 'HOSTESS_CREATED', { type: 'HOSTESS', id: h.id, label: `${h.firstName} ${h.lastName}` });
  res.status(201).json({ success: true, data: h });
}

export async function updateHostess(req: Request, res: Response) {
  const d = hostessSchema.partial().parse(req.body);
  const h = await prisma.hostess.update({ where: { id: req.params.id }, data: d });
  await audit(req, 'HOSTESS_UPDATED', { type: 'HOSTESS', id: h.id, label: `${h.firstName} ${h.lastName}` });
  res.json({ success: true, data: h });
}

export async function deleteHostess(req: Request, res: Response) {
  const h = await prisma.hostess.delete({ where: { id: req.params.id } });
  await audit(req, 'HOSTESS_DELETED', { type: 'HOSTESS', id: h.id, label: `${h.firstName} ${h.lastName}` });
  res.json({ success: true, data: { ok: true } });
}

// ---------------- Missions (planning) ----------------
const MISSION_STATUSES = ['PLANIFIEE', 'CONFIRMEE', 'TERMINEE', 'ANNULEE'] as const;

const missionSchema = z
  .object({
    title: z.string().trim().min(2, 'Intitulé requis').max(150),
    client: z.string().trim().min(2, 'Client requis').max(150),
    clientPhone: optional(30),
    location: z.string().trim().min(2, 'Lieu requis').max(200),
    startAt: z.coerce.date({ message: 'Début invalide' }),
    endAt: z.coerce.date({ message: 'Fin invalide' }),
    hostessesNeeded: z.coerce.number().int().min(1).max(500).default(1),
    dressCode: optional(150),
    status: z.enum(MISSION_STATUSES).default('PLANIFIEE'),
    notes: optional(4000),
  })
  .refine((d) => d.endAt > d.startAt, { message: 'La fin doit être après le début', path: ['endAt'] });

const missionInclude = {
  assignments: {
    include: { hostess: { select: { id: true, firstName: true, lastName: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  },
  quote: { select: { id: true, reference: true } },
} satisfies Prisma.MissionInclude;

export async function listMissions(req: Request, res: Response) {
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  const status = str(req.query.status);
  const where: Prisma.MissionWhereInput = {
    ...(from && !isNaN(+from) && to && !isNaN(+to) && { startAt: { lt: to }, endAt: { gte: from } }),
    ...(MISSION_STATUSES.includes(status as MissionStatus) && { status: status as MissionStatus }),
  };
  const items = await prisma.mission.findMany({ where, orderBy: { startAt: 'asc' }, include: missionInclude, take: 500 });
  res.json({ success: true, data: items });
}

export async function getMission(req: Request, res: Response) {
  res.json({ success: true, data: await prisma.mission.findUniqueOrThrow({ where: { id: req.params.id }, include: missionInclude }) });
}

export async function createMission(req: Request, res: Response) {
  const d = missionSchema.parse(req.body);
  const m = await prisma.mission.create({ data: { ...d, reference: makeReference('MIS') }, include: missionInclude });
  await audit(req, 'MISSION_CREATED', { type: 'MISSION', id: m.id, label: `${m.reference} — ${m.title}` });
  res.status(201).json({ success: true, data: m });
}

export async function updateMission(req: Request, res: Response) {
  const d = missionSchema.parse(req.body);
  const m = await prisma.mission.update({ where: { id: req.params.id }, data: d, include: missionInclude });
  await audit(req, 'MISSION_UPDATED', { type: 'MISSION', id: m.id, label: `${m.reference} — ${m.title}` }, { status: m.status });
  res.json({ success: true, data: m });
}

export async function deleteMission(req: Request, res: Response) {
  const m = await prisma.mission.delete({ where: { id: req.params.id } });
  await audit(req, 'MISSION_DELETED', { type: 'MISSION', id: m.id, label: `${m.reference} — ${m.title}` });
  res.json({ success: true, data: { ok: true } });
}

/** Affecter une hôtesse à une mission (refus si elle est déjà prise sur un créneau qui chevauche) */
export async function assignHostess(req: Request, res: Response) {
  const { hostessId, role, force } = z
    .object({ hostessId: z.string().uuid(), role: z.string().trim().max(60).optional(), force: z.boolean().optional() })
    .parse(req.body);
  const mission = await prisma.mission.findUniqueOrThrow({ where: { id: req.params.id } });
  const hostess = await prisma.hostess.findUniqueOrThrow({ where: { id: hostessId } });
  if (!hostess.isActive) throw new AppError(400, 'Cette hôtesse est inactive', 'HOSTESS_INACTIVE');

  if (!force) {
    const clash = await prisma.missionAssignment.findFirst({
      where: {
        hostessId,
        missionId: { not: mission.id },
        mission: { status: { in: ['PLANIFIEE', 'CONFIRMEE'] }, startAt: { lt: mission.endAt }, endAt: { gt: mission.startAt } },
      },
      include: { mission: { select: { title: true, reference: true } } },
    });
    if (clash) {
      throw new AppError(409, `${hostess.firstName} est déjà prise sur « ${clash.mission.title} » (${clash.mission.reference}) au même moment.`, 'SCHEDULE_CONFLICT');
    }
  }
  await prisma.missionAssignment.upsert({
    where: { missionId_hostessId: { missionId: mission.id, hostessId } },
    create: { missionId: mission.id, hostessId, role: role || null },
    update: { role: role || null },
  });
  await audit(req, 'MISSION_ASSIGN', { type: 'MISSION', id: mission.id, label: `${mission.reference} — ${mission.title}` }, { hostess: `${hostess.firstName} ${hostess.lastName}` });
  res.json({ success: true, data: await prisma.mission.findUniqueOrThrow({ where: { id: mission.id }, include: missionInclude }) });
}

export async function unassignHostess(req: Request, res: Response) {
  await prisma.missionAssignment.delete({ where: { missionId_hostessId: { missionId: req.params.id, hostessId: req.params.hostessId } } });
  res.json({ success: true, data: await prisma.mission.findUniqueOrThrow({ where: { id: req.params.id }, include: missionInclude }) });
}
