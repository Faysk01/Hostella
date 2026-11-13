import type { Request, Response } from 'express';
import { z } from 'zod';

import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { createUploadSignature, deleteImage, isAllowedImageUrl } from '../../lib/cloudinary';
import { refreshPublicSite } from '../../lib/revalidate';
import { AppError } from '../../utils/app-error';
import { contactsSchema, getContacts, getImages, IMAGE_KEYS, IMAGE_SLOTS } from '../content';
import { audit } from './admin.middleware';

/* =================================================================
   Contenu du site : galerie, images, contacts, envoi Cloudinary
   ================================================================= */

export const GALLERY_CATEGORIES = ['Hôtesses', 'Mariages', 'Conférences', 'Culture', 'Concerts', 'Entreprises'];

const imageUrl = z.string().trim().max(1000).refine(isAllowedImageUrl, 'Adresse refusée : utilisez une image Cloudinary, Pexels ou Unsplash (https://…)');
const publicId = z.string().trim().max(300).nullable().optional();

/** Autorisation signée pour envoyer une photo directement à Cloudinary */
export async function uploadSignature(req: Request, res: Response) {
  const { folder } = z.object({ folder: z.enum(['gallery', 'site']) }).parse(req.body);
  res.json({ success: true, data: createUploadSignature(folder) });
}

// ---------------- Galerie ----------------
const photoSchema = z.object({
  url: imageUrl,
  publicId,
  title: z.string().trim().min(2, 'Titre requis').max(120),
  category: z.string().trim().min(2).max(40),
  tall: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export async function listPhotos(_req: Request, res: Response) {
  const items = await prisma.photo.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'desc' }] });
  res.json({ success: true, data: { items, categories: GALLERY_CATEGORIES } });
}

export async function createPhoto(req: Request, res: Response) {
  const d = photoSchema.parse(req.body);
  const min = await prisma.photo.aggregate({ _min: { position: true } });
  const photo = await prisma.photo.create({ data: { ...d, position: (min._min.position ?? 1) - 1 } });
  await audit(req, 'PHOTO_ADDED', { type: 'PHOTO', id: photo.id, label: photo.title });
  refreshPublicSite();
  res.status(201).json({ success: true, data: photo });
}

export async function updatePhoto(req: Request, res: Response) {
  const d = photoSchema.omit({ url: true, publicId: true }).partial().parse(req.body);
  const photo = await prisma.photo.update({ where: { id: req.params.id }, data: d });
  refreshPublicSite();
  res.json({ success: true, data: photo });
}

export async function deletePhoto(req: Request, res: Response) {
  const photo = await prisma.photo.delete({ where: { id: req.params.id } });
  await deleteImage(photo.publicId);
  await audit(req, 'PHOTO_DELETED', { type: 'PHOTO', id: photo.id, label: photo.title });
  refreshPublicSite();
  res.json({ success: true, data: { ok: true } });
}

/** Nouvel ordre d'affichage de la galerie */
export async function reorderPhotos(req: Request, res: Response) {
  const { ids } = z.object({ ids: z.array(z.string().uuid()).max(500) }).parse(req.body);
  await prisma.$transaction(ids.map((id, position) => prisma.photo.update({ where: { id }, data: { position } })));
  refreshPublicSite();
  res.json({ success: true, data: { ok: true } });
}

// ---------------- Réglages : contacts + images ----------------
export async function getSettings(_req: Request, res: Response) {
  const [contacts, images] = await Promise.all([getContacts(), getImages()]);
  res.json({
    success: true,
    data: { contacts, images, slots: IMAGE_SLOTS, cloudinary: env.CLOUDINARY.enabled, siteUrl: env.SITE_URL },
  });
}

export async function updateContacts(req: Request, res: Response) {
  const contacts = contactsSchema.parse(req.body);
  await prisma.setting.upsert({ where: { key: 'contacts' }, create: { key: 'contacts', value: contacts }, update: { value: contacts } });
  await audit(req, 'CONTACTS_UPDATED', { type: 'SETTINGS', label: 'Coordonnées du site' });
  refreshPublicSite();
  res.json({ success: true, data: contacts });
}

/** Remplacer une image du site (ou revenir à l'image d'origine avec DELETE) */
export async function setImage(req: Request, res: Response) {
  const key = req.params.key;
  if (!IMAGE_KEYS.includes(key)) throw new AppError(404, 'Emplacement d’image inconnu', 'UNKNOWN_SLOT');
  const d = z.object({ url: imageUrl, publicId }).parse(req.body);
  const images = await getImages();
  const previous = images[key];
  images[key] = { url: d.url, publicId: d.publicId ?? null };
  await prisma.setting.upsert({ where: { key: 'images' }, create: { key: 'images', value: images }, update: { value: images } });
  if (previous?.publicId && previous.publicId !== d.publicId) await deleteImage(previous.publicId);
  const slot = IMAGE_SLOTS.find((s) => s.key === key);
  await audit(req, 'SITE_IMAGE_UPDATED', { type: 'SETTINGS', label: slot?.label ?? key });
  refreshPublicSite();
  res.json({ success: true, data: images });
}

export async function resetImage(req: Request, res: Response) {
  const key = req.params.key;
  const images = await getImages();
  const previous = images[key];
  delete images[key];
  await prisma.setting.upsert({ where: { key: 'images' }, create: { key: 'images', value: images }, update: { value: images } });
  await deleteImage(previous?.publicId);
  const slot = IMAGE_SLOTS.find((s) => s.key === key);
  await audit(req, 'SITE_IMAGE_RESET', { type: 'SETTINGS', label: slot?.label ?? key });
  refreshPublicSite();
  res.json({ success: true, data: images });
}
