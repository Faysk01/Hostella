import { rateLimit } from 'express-rate-limit';

const msg = (message: string) => ({ success: false, code: 'TOO_MANY_REQUESTS', message });
const base = { standardHeaders: true, legacyHeaders: false } as const;

/** Formulaires du site public : 8 envois par heure et par adresse IP (anti-spam) */
export const formLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 8, message: msg('Trop d’envois. Réessayez plus tard ou écrivez-nous sur WhatsApp.') });

/** Lecture du contenu public */
export const publicReadLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 120, message: msg('Trop de requêtes.') });

/** Connexion admin : 10 essais / 15 min par IP */
export const authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 10, message: msg('Trop de tentatives. Réessayez dans quelques minutes.') });

/** Connexion admin : 5 échecs / 15 min par EMAIL, même si l'attaquant change d'IP */
export const loginAccountLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `login:${String(req.body?.email ?? '').trim().toLowerCase()}`,
  message: { success: false, code: 'TOO_MANY_ATTEMPTS', message: 'Trop de tentatives sur ce compte. Réessayez dans 15 minutes.' },
});

/** Modifications dans l'admin */
export const writeLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 300, message: msg('Trop de requêtes. Réessayez plus tard.') });
