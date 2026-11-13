import type { Request, Response } from 'express';

import { env } from '../config/env';

/** Lit un cookie de la requête (sans dépendance externe). */
export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(rest.join('='));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Cookie de session : HttpOnly (illisible par le JavaScript), SameSite=Strict (anti-CSRF),
 * Secure en production (HTTPS uniquement).
 */
export function setSessionCookie(res: Response, name: string, value: string, maxAgeMs: number, path: string) {
  res.cookie(name, value, { httpOnly: true, secure: env.isProduction, sameSite: 'strict', path, maxAge: maxAgeMs });
}

export function clearSessionCookie(res: Response, name: string, path: string) {
  res.clearCookie(name, { httpOnly: true, secure: env.isProduction, sameSite: 'strict', path });
}
