import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import { verifyAdminToken } from '../../lib/tokens';
import { AppError } from '../../utils/app-error';
import { readCookie } from '../../utils/cookies';

export const ADMIN_COOKIE = 'hostella_admin';
export const ADMIN_COOKIE_PATH = '/api/admin';
/** En-tête exigé sur les requêtes qui modifient : un autre site ne peut pas l'ajouter (protection CSRF) */
export const ADMIN_CSRF_HEADER = 'x-hostella-admin';

/**
 * Protège les routes admin :
 * 1. session valide dans le cookie HttpOnly
 * 2. compte toujours actif EN BASE et session non révoquée
 * 3. en-tête anti-CSRF sur les modifications
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = readCookie(req, ADMIN_COOKIE);
    const session = token ? verifyAdminToken(token) : null;
    if (!session) return next(new AppError(401, 'Session expirée, reconnectez-vous', 'ADMIN_SESSION_REQUIRED'));

    if (!['GET', 'HEAD'].includes(req.method) && req.get(ADMIN_CSRF_HEADER) !== '1') {
      return next(new AppError(403, 'Requête refusée', 'CSRF_REJECTED'));
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, role: true, isActive: true, sessionVersion: true, mustChangePassword: true, firstName: true, lastName: true },
    });
    if (!admin || !admin.isActive || admin.sessionVersion !== session.v) {
      return next(new AppError(401, 'Session expirée, reconnectez-vous', 'ADMIN_SESSION_REQUIRED'));
    }
    req.admin = { id: admin.id, role: admin.role, mustChangePassword: admin.mustChangePassword, label: `${admin.firstName} ${admin.lastName}` };
    next();
  } catch (error) {
    next(error);
  }
}

/** Tant que le mot de passe provisoire n'est pas remplacé, rien d'autre n'est accessible */
export function requirePasswordChanged(req: Request, _res: Response, next: NextFunction) {
  if (req.admin?.mustChangePassword) return next(new AppError(403, 'Vous devez d’abord choisir votre mot de passe', 'PASSWORD_CHANGE_REQUIRED'));
  next();
}

/** Comptes administrateurs et journal : super admin uniquement */
export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.admin?.role !== 'SUPER_ADMIN') return next(new AppError(403, 'Réservé au super administrateur', 'SUPER_ADMIN_REQUIRED'));
  next();
}

export const adminId = (req: Request) => {
  if (!req.admin) throw new AppError(401, 'Session expirée, reconnectez-vous', 'ADMIN_SESSION_REQUIRED');
  return req.admin.id;
};

/** Journal d'audit : qui a fait quoi, quand. Ne bloque jamais l'action. */
export async function audit(
  req: Request,
  action: string,
  target?: { type: string; id?: string; label?: string },
  metadata?: Record<string, unknown>,
  adminOverride?: string | null,
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: adminOverride !== undefined ? adminOverride : (req.admin?.id ?? null),
        action,
        targetType: target?.type,
        targetId: target?.id,
        targetLabel: target?.label,
        metadata: metadata as Prisma.InputJsonValue | undefined,
        ip: req.ip,
      },
    });
  } catch (e) {
    console.error('[audit]:', e);
  }
}

/** Pagination commune : ?page=1&limit=20 */
export function paging(q: Request['query'], defaultLimit = 20) {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}
export const paged = <T>(items: T[], total: number, page: number, limit: number) => ({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });

export const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
