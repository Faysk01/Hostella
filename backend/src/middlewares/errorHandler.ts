import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env';
import { Prisma } from '../generated/prisma/client';
import { AppError } from '../utils/app-error';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: `Route introuvable : ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message;
    return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: Object.values(fieldErrors)[0] ?? 'Certaines informations sont invalides', fieldErrors });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, code: err.code, message: err.message, ...(err.fieldErrors && { fieldErrors: err.fieldErrors }) });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, code: 'ALREADY_EXISTS', message: 'Cet élément existe déjà' });
    if (err.code === 'P2025') return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Élément introuvable' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, code: 'INVALID_JSON', message: 'Requête invalide' });
  }
  console.error('[error]:', err);
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Erreur interne du serveur',
    ...(!env.isProduction && err instanceof Error && { error: err.message }),
  });
};
