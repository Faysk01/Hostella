import type { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../config/prisma';
import type { ApplicationStatus, Prisma, QuoteStatus } from '../../generated/prisma/client';
import { AppError } from '../../utils/app-error';
import { makeReference } from '../../utils/reference';
import { audit, paged, paging, str } from './admin.middleware';

/* =================================================================
   Demandes reçues par le site : devis, candidatures, messages
   ================================================================= */

const QUOTE_STATUSES = ['NOUVEAU', 'EN_COURS', 'DEVIS_ENVOYE', 'ACCEPTE', 'REFUSE', 'ARCHIVE'] as const;
const APP_STATUSES = ['NOUVELLE', 'ENTRETIEN', 'RETENUE', 'REFUSEE', 'ARCHIVEE'] as const;
const note = z.string().trim().max(4000).nullable().optional();

// ---------------- Devis ----------------
export async function listQuotes(req: Request, res: Response) {
  const { page, limit, skip } = paging(req.query);
  const status = str(req.query.status);
  const q = str(req.query.q);
  const where: Prisma.QuoteRequestWhereInput = {
    ...(QUOTE_STATUSES.includes(status as QuoteStatus) ? { status: status as QuoteStatus } : { status: { not: 'ARCHIVE' } }),
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { reference: { contains: q, mode: 'insensitive' } },
        { eventType: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };
  const [items, total, counts] = await Promise.all([
    prisma.quoteRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.quoteRequest.count({ where }),
    prisma.quoteRequest.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  res.json({ success: true, data: { ...paged(items, total, page, limit), counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) } });
}

export async function getQuote(req: Request, res: Response) {
  const quote = await prisma.quoteRequest.findUniqueOrThrow({
    where: { id: req.params.id },
    include: { missions: { select: { id: true, reference: true, title: true, startAt: true, status: true } } },
  });
  res.json({ success: true, data: quote });
}

export async function updateQuote(req: Request, res: Response) {
  const d = z.object({ status: z.enum(QUOTE_STATUSES).optional(), adminNote: note }).parse(req.body);
  const quote = await prisma.quoteRequest.update({ where: { id: req.params.id }, data: d });
  if (d.status) await audit(req, 'QUOTE_STATUS', { type: 'QUOTE', id: quote.id, label: `${quote.reference} — ${quote.fullName}` }, { status: d.status });
  res.json({ success: true, data: quote });
}

export async function deleteQuote(req: Request, res: Response) {
  const quote = await prisma.quoteRequest.delete({ where: { id: req.params.id } });
  await audit(req, 'QUOTE_DELETED', { type: 'QUOTE', id: quote.id, label: `${quote.reference} — ${quote.fullName}` });
  res.json({ success: true, data: { ok: true } });
}

/** Transforme une demande de devis acceptée en mission au planning */
export async function quoteToMission(req: Request, res: Response) {
  const quote = await prisma.quoteRequest.findUniqueOrThrow({ where: { id: req.params.id } });
  const day = quote.eventDate ?? new Date(Date.now() + 7 * 86400000);
  const start = new Date(day);
  start.setUTCHours(16, 0, 0, 0);
  const end = new Date(day);
  end.setUTCHours(22, 0, 0, 0);
  const mission = await prisma.mission.create({
    data: {
      reference: makeReference('MIS'),
      title: quote.eventType,
      client: quote.fullName,
      clientPhone: quote.phone,
      location: quote.city,
      startAt: start,
      endAt: end,
      hostessesNeeded: quote.hostesses ?? 1,
      notes: [quote.services.join(', '), quote.message].filter(Boolean).join('\n\n') || null,
      quoteId: quote.id,
    },
  });
  if (quote.status === 'NOUVEAU' || quote.status === 'EN_COURS' || quote.status === 'DEVIS_ENVOYE') {
    await prisma.quoteRequest.update({ where: { id: quote.id }, data: { status: 'ACCEPTE' } });
  }
  await audit(req, 'MISSION_CREATED', { type: 'MISSION', id: mission.id, label: `${mission.reference} — ${mission.title}` }, { fromQuote: quote.reference });
  res.status(201).json({ success: true, data: mission });
}

// ---------------- Candidatures ----------------
export async function listApplications(req: Request, res: Response) {
  const { page, limit, skip } = paging(req.query);
  const status = str(req.query.status);
  const q = str(req.query.q);
  const where: Prisma.ApplicationWhereInput = {
    ...(APP_STATUSES.includes(status as ApplicationStatus) ? { status: status as ApplicationStatus } : { status: { not: 'ARCHIVEE' } }),
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { city: { contains: q, mode: 'insensitive' } },
        { reference: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };
  const [items, total, counts] = await Promise.all([
    prisma.application.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { hostess: { select: { id: true } } } }),
    prisma.application.count({ where }),
    prisma.application.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  res.json({ success: true, data: { ...paged(items, total, page, limit), counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) } });
}

export async function updateApplication(req: Request, res: Response) {
  const d = z.object({ status: z.enum(APP_STATUSES).optional(), adminNote: note }).parse(req.body);
  const app = await prisma.application.update({ where: { id: req.params.id }, data: d });
  if (d.status) await audit(req, 'APPLICATION_STATUS', { type: 'APPLICATION', id: app.id, label: `${app.reference} — ${app.fullName}` }, { status: d.status });
  res.json({ success: true, data: app });
}

export async function deleteApplication(req: Request, res: Response) {
  const app = await prisma.application.delete({ where: { id: req.params.id } });
  await audit(req, 'APPLICATION_DELETED', { type: 'APPLICATION', id: app.id, label: `${app.reference} — ${app.fullName}` });
  res.json({ success: true, data: { ok: true } });
}

/** Candidate retenue → fiche hôtesse dans l'équipe */
export async function applicationToHostess(req: Request, res: Response) {
  const app = await prisma.application.findUniqueOrThrow({ where: { id: req.params.id }, include: { hostess: true } });
  if (app.hostess) throw new AppError(409, 'Cette candidate fait déjà partie de l’équipe', 'ALREADY_HOSTESS');
  const [firstName, ...rest] = app.fullName.split(/\s+/);
  const hostess = await prisma.hostess.create({
    data: {
      firstName,
      lastName: rest.join(' ') || '-',
      phone: app.phone,
      email: app.email,
      city: app.city,
      languages: app.languages,
      note: app.experience ? `Expérience : ${app.experience}` : null,
      applicationId: app.id,
    },
  });
  await prisma.application.update({ where: { id: app.id }, data: { status: 'RETENUE' } });
  await audit(req, 'HOSTESS_CREATED', { type: 'HOSTESS', id: hostess.id, label: app.fullName }, { fromApplication: app.reference });
  res.status(201).json({ success: true, data: hostess });
}

// ---------------- Messages ----------------
export async function listMessages(req: Request, res: Response) {
  const { page, limit, skip } = paging(req.query);
  const where: Prisma.ContactMessageWhereInput = req.query.unread === '1' ? { isRead: false } : {};
  const [items, total, unread] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);
  res.json({ success: true, data: { ...paged(items, total, page, limit), unread } });
}

export async function updateMessage(req: Request, res: Response) {
  const { isRead } = z.object({ isRead: z.boolean() }).parse(req.body);
  res.json({ success: true, data: await prisma.contactMessage.update({ where: { id: req.params.id }, data: { isRead } }) });
}

export async function deleteMessage(req: Request, res: Response) {
  await prisma.contactMessage.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: { ok: true } });
}
