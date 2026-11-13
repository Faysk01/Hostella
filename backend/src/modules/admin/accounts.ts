import type { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../config/prisma';
import { generateTemporaryPassword, hashPassword } from '../../lib/password';
import { AppError } from '../../utils/app-error';
import { adminId, audit, paged, paging } from './admin.middleware';

/* =================================================================
   Tableau de bord, comptes administrateurs, journal d'audit
   ================================================================= */

export async function stats(_req: Request, res: Response) {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const [newQuotes, openQuotes, newApplications, unreadMessages, activeHostesses, upcoming, recentQuotes, recentApplications] = await Promise.all([
    prisma.quoteRequest.count({ where: { status: 'NOUVEAU' } }),
    prisma.quoteRequest.count({ where: { status: { in: ['NOUVEAU', 'EN_COURS', 'DEVIS_ENVOYE'] } } }),
    prisma.application.count({ where: { status: 'NOUVELLE' } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.hostess.count({ where: { isActive: true } }),
    prisma.mission.findMany({
      where: { endAt: { gte: now }, startAt: { lte: in30 }, status: { in: ['PLANIFIEE', 'CONFIRMEE'] } },
      orderBy: { startAt: 'asc' },
      take: 6,
      select: { id: true, reference: true, title: true, client: true, location: true, startAt: true, status: true, hostessesNeeded: true, _count: { select: { assignments: true } } },
    }),
    prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, reference: true, fullName: true, eventType: true, eventDate: true, status: true, createdAt: true } }),
    prisma.application.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, reference: true, fullName: true, city: true, status: true, createdAt: true } }),
  ]);
  res.json({ success: true, data: { newQuotes, openQuotes, newApplications, unreadMessages, activeHostesses, upcoming, recentQuotes, recentApplications } });
}

const publicAdmin = { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, mustChangePassword: true, lastLoginAt: true, createdAt: true } as const;

export async function listAdmins(_req: Request, res: Response) {
  res.json({ success: true, data: await prisma.admin.findMany({ orderBy: { createdAt: 'asc' }, select: publicAdmin }) });
}

export async function createAdmin(req: Request, res: Response) {
  const d = z
    .object({
      firstName: z.string().trim().min(1, 'Prénom requis').max(60),
      lastName: z.string().trim().min(1, 'Nom requis').max(60),
      email: z.email('E-mail invalide').trim().toLowerCase().max(120),
      role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
    })
    .parse(req.body);
  const password = generateTemporaryPassword();
  const admin = await prisma.admin.create({ data: { ...d, passwordHash: await hashPassword(password), mustChangePassword: true }, select: publicAdmin });
  await audit(req, 'ADMIN_CREATED', { type: 'ADMIN', id: admin.id, label: `${admin.firstName} ${admin.lastName} (${admin.email})` }, { role: admin.role });
  // Le mot de passe provisoire n'est montré qu'une seule fois
  res.status(201).json({ success: true, data: { admin, temporaryPassword: password } });
}

export async function resetAdminPassword(req: Request, res: Response) {
  if (req.params.id === adminId(req)) throw new AppError(400, 'Utilisez « Mon mot de passe » pour votre propre compte', 'SELF');
  const password = generateTemporaryPassword();
  const admin = await prisma.admin.update({
    where: { id: req.params.id },
    data: { passwordHash: await hashPassword(password), mustChangePassword: true, sessionVersion: { increment: 1 } },
    select: publicAdmin,
  });
  await audit(req, 'ADMIN_PASSWORD_RESET', { type: 'ADMIN', id: admin.id, label: `${admin.firstName} ${admin.lastName}` });
  res.json({ success: true, data: { admin, temporaryPassword: password } });
}

export async function setAdminStatus(req: Request, res: Response) {
  const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
  if (req.params.id === adminId(req)) throw new AppError(400, 'Vous ne pouvez pas suspendre votre propre compte', 'SELF');
  const admin = await prisma.admin.update({ where: { id: req.params.id }, data: { isActive, sessionVersion: { increment: 1 } }, select: publicAdmin });
  await audit(req, isActive ? 'ADMIN_REACTIVATED' : 'ADMIN_SUSPENDED', { type: 'ADMIN', id: admin.id, label: `${admin.firstName} ${admin.lastName}` });
  res.json({ success: true, data: admin });
}

export async function auditLog(req: Request, res: Response) {
  const { page, limit, skip } = paging(req.query, 30);
  const [items, total] = await Promise.all([
    prisma.adminAuditLog.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit, include: { admin: { select: { firstName: true, lastName: true } } } }),
    prisma.adminAuditLog.count(),
  ]);
  res.json({ success: true, data: paged(items, total, page, limit) });
}
