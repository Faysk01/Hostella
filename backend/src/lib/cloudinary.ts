import { createHash } from 'node:crypto';

import { env } from '../config/env';
import { AppError } from '../utils/app-error';

/**
 * Cloudinary sans SDK (comme VoirAuto) : le backend SIGNE l'envoi,
 * le navigateur de l'admin envoie la photo DIRECTEMENT à Cloudinary.
 * Le secret ne quitte jamais le serveur.
 */
const { cloudName, apiKey, apiSecret } = env.CLOUDINARY;

export const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,heic,avif';
export const FOLDERS = { gallery: 'hostella/galerie', site: 'hostella/site' } as const;
export type UploadFolder = keyof typeof FOLDERS;

function sign(params: Record<string, string | number>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export function createUploadSignature(folder: UploadFolder) {
  if (!env.CLOUDINARY.enabled) {
    throw new AppError(503, 'Cloudinary n’est pas encore configuré sur le serveur. Collez plutôt l’adresse (URL) de l’image.', 'CLOUDINARY_DISABLED');
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: FOLDERS[folder], timestamp, allowed_formats: ALLOWED_FORMATS };
  return { uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, apiKey, ...params, signature: sign(params) };
}

/** Supprime une image de Cloudinary. Ne bloque jamais l'appelant. */
export async function deleteImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId || !env.CLOUDINARY.enabled) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: apiKey, signature: sign(params) });
  try {
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body });
  } catch (error) {
    console.error('[cloudinary]: suppression impossible', publicId, error);
  }
}

/**
 * Hébergeurs d'images acceptés (le site Next.js n'affiche que ceux-là) :
 * Cloudinary (vos photos), Pexels et Unsplash (photos libres de droits).
 */
export const IMAGE_HOSTS = ['res.cloudinary.com', 'images.pexels.com', 'images.unsplash.com'];

export function isAllowedImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

/** Version optimisée d'une image Cloudinary (format et qualité automatiques) */
export function optimized(url: string, width = 1600): string {
  if (!url.includes('res.cloudinary.com') || url.includes('/upload/f_auto')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
