import jwt from 'jsonwebtoken';

import { env } from '../config/env';

const ISSUER = 'hostella-api';
const AUDIENCE = 'hostella-admin';

/** Session admin : une journée de travail */
export const ADMIN_SESSION_TTL = '8h';
export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

/** La « version de session » permet de fermer toutes les sessions d'un admin (mot de passe changé, compte suspendu) */
export type AdminTokenPayload = { adminId: string; v: number };

export function signAdminToken(adminId: string, sessionVersion: number): string {
  return jwt.sign({ adminId, v: sessionVersion }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: ADMIN_SESSION_TTL,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const d = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'], issuer: ISSUER, audience: AUDIENCE });
    if (typeof d === 'object' && typeof d.adminId === 'string' && typeof d.v === 'number') return { adminId: d.adminId, v: d.v };
    return null;
  } catch {
    return null;
  }
}
