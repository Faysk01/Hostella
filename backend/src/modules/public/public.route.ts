import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../config/prisma';
import { formLimiter, publicReadLimiter } from '../../middlewares/rate-limit';
import { asyncHandler } from '../../utils/async-handler';
import { makeReference } from '../../utils/reference';
import { getPublicContent } from '../content';

/* =================================================================
   API publique (sans connexion) utilisée par le site vitrine
   ================================================================= */
const router = Router();

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));
const phone = z.string().trim().min(8, 'Numéro de téléphone invalide').max(30).regex(/^[+\d\s().-]+$/, 'Numéro de téléphone invalide');
const optionalInt = (min: number, max: number) =>
  z.union([z.number(), z.string()]).optional().transform((v, ctx) => {
    if (v === undefined || v === '') return undefined;
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) {
      ctx.addIssue({ code: 'custom', message: `Doit être un nombre entre ${min} et ${max}` });
      return z.NEVER;
    }
    return n;
  });
/** Champ piège invisible : un robot le remplit, un humain non */
const honeypot = { website: z.string().max(0, 'Requête refusée').optional() };

const quoteSchema = z.object({
  eventType: text(80).min(2, 'Choisissez un type d’événement'),
  services: z.array(text(80)).min(1, 'Choisissez au moins une prestation').max(6),
  city: text(80).min(2, 'Indiquez la ville'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide').optional().or(z.literal('')),
  guests: optionalInt(1, 100000),
  hostesses: optionalInt(1, 500),
  fullName: text(120).min(2, 'Indiquez votre nom'),
  phone,
  email: z.email('E-mail invalide').max(120).optional().or(z.literal('')),
  message: optionalText(2000),
  ...honeypot,
});

const applicationSchema = z.object({
  fullName: text(120).min(2, 'Indiquez votre nom et prénom'),
  city: text(80).min(2, 'Indiquez la ville'),
  phone,
  email: z.email('E-mail invalide').max(120).optional().or(z.literal('')),
  age: optionalInt(18, 65),
  availability: z.array(text(40)).min(1, 'Indiquez vos disponibilités').max(6),
  languages: z.array(text(40)).max(10).default([]),
  experience: optionalText(2000),
  motivation: optionalText(2000),
  consent: z.literal(true, 'Vous devez accepter la notice de confidentialité'),
  ...honeypot,
});

const messageSchema = z.object({
  fullName: text(120).min(2, 'Indiquez votre nom'),
  phone: phone.optional().or(z.literal('')),
  message: text(2000).min(5, 'Votre message est trop court'),
  ...honeypot,
});

/** Contenu du site : contacts, images remplacées, galerie */
router.get(
  '/content',
  publicReadLimiter,
  asyncHandler(async (_req, res) => {
    res.set('Cache-Control', 'public, max-age=30');
    res.json({ success: true, data: await getPublicContent() });
  }),
);

router.post(
  '/quotes',
  formLimiter,
  asyncHandler(async (req, res) => {
    const d = quoteSchema.parse(req.body);
    const quote = await prisma.quoteRequest.create({
      data: {
        reference: makeReference('DEV'),
        eventType: d.eventType,
        services: d.services,
        city: d.city,
        eventDate: d.eventDate ? new Date(`${d.eventDate}T12:00:00Z`) : null,
        guests: d.guests,
        hostesses: d.hostesses,
        fullName: d.fullName,
        phone: d.phone,
        email: d.email || null,
        message: d.message,
      },
      select: { reference: true },
    });
    res.status(201).json({ success: true, data: quote });
  }),
);

router.post(
  '/applications',
  formLimiter,
  asyncHandler(async (req, res) => {
    const d = applicationSchema.parse(req.body);
    const app = await prisma.application.create({
      data: {
        reference: makeReference('CAN'),
        fullName: d.fullName,
        city: d.city,
        phone: d.phone,
        email: d.email || null,
        age: d.age,
        availability: d.availability,
        languages: d.languages,
        experience: d.experience,
        motivation: d.motivation,
      },
      select: { reference: true },
    });
    res.status(201).json({ success: true, data: app });
  }),
);

router.post(
  '/messages',
  formLimiter,
  asyncHandler(async (req, res) => {
    const d = messageSchema.parse(req.body);
    await prisma.contactMessage.create({ data: { fullName: d.fullName, phone: d.phone || null, message: d.message } });
    res.status(201).json({ success: true, data: { ok: true } });
  }),
);

export default router;
