import type { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../config/prisma';
import { DUMMY_HASH, hashPassword, verifyPassword } from '../../lib/password';
import { ADMIN_SESSION_MAX_AGE_MS, signAdminToken } from '../../lib/tokens';
import { AppError } from '../../utils/app-error';
import { clearSessionCookie, setSessionCookie } from '../../utils/cookies';
import { ADMIN_COOKIE, ADMIN_COOKIE_PATH, adminId, audit } from './admin.middleware';

const publicAdmin = { id: true, firstName: true, lastName: true, email: true, role: true, mustChangePassword: true, lastLoginAt: true } as const;

export const passwordRule = z
  .string()
  .min(12, '12 caractères minimum')
  .max(128)
  .regex(/[A-Z]/, 'Ajoutez une majuscule')
  .regex(/[a-z]/, 'Ajoutez une minuscule')
  .regex(/\d/, 'Ajoutez un chiffre');

export async function login(req: Request, res: Response) {
  const { email, password } = z.object({ email: z.string().trim().toLowerCase().max(120), password: z.string().max(128) }).parse(req.body);
  const admin = await prisma.admin.findUnique({ where: { email } });
  // On vérifie toujours un hash (même factice) : le temps de réponse ne révèle pas si l'email existe
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok || !admin.isActive) {
    await audit(req, 'LOGIN_FAILED', { type: 'ADMIN', id: admin?.id, label: email }, undefined, admin?.id ?? null);
    throw new AppError(401, admin && !admin.isActive && ok ? 'Ce compte est suspendu' : 'Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }
  const updated = await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() }, select: publicAdmin });
  setSessionCookie(res, ADMIN_COOKIE, signAdminToken(admin.id, admin.sessionVersion), ADMIN_SESSION_MAX_AGE_MS, ADMIN_COOKIE_PATH);
  await audit(req, 'LOGIN_SUCCESS', { type: 'ADMIN', id: admin.id, label: `${admin.firstName} ${admin.lastName}` }, undefined, admin.id);
  res.json({ success: true, data: updated });
}

export async function logout(req: Request, res: Response) {
  if (req.admin) await audit(req, 'LOGOUT', { type: 'ADMIN', id: req.admin.id, label: req.admin.label });
  clearSessionCookie(res, ADMIN_COOKIE, ADMIN_COOKIE_PATH);
  res.json({ success: true, data: { ok: true } });
}

export async function me(req: Request, res: Response) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId(req) }, select: publicAdmin });
  res.json({ success: true, data: admin });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = z
    .object({ currentPassword: z.string().max(128), newPassword: passwordRule })
    .parse(req.body);
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: adminId(req) } });
  if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
    throw new AppError(400, 'Mot de passe actuel incorrect', 'INVALID_PASSWORD', { currentPassword: 'Mot de passe actuel incorrect' });
  }
  if (currentPassword === newPassword) throw new AppError(400, 'Choisissez un mot de passe différent', 'SAME_PASSWORD');
  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false, sessionVersion: { increment: 1 } },
    select: { ...publicAdmin, sessionVersion: true },
  });
  // Les autres sessions sont fermées ; celle-ci reçoit un nouveau cookie
  setSessionCookie(res, ADMIN_COOKIE, signAdminToken(admin.id, updated.sessionVersion), ADMIN_SESSION_MAX_AGE_MS, ADMIN_COOKIE_PATH);
  await audit(req, 'PASSWORD_CHANGED', { type: 'ADMIN', id: admin.id, label: `${admin.firstName} ${admin.lastName}` });
  const { sessionVersion: _v, ...data } = updated;
  res.json({ success: true, data });
}
