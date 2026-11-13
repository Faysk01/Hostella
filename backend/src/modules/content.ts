import { z } from 'zod';

import { prisma } from '../config/prisma';
import { optimized } from '../lib/cloudinary';

/* =================================================================
   Réglages du site modifiables depuis l'admin : contacts et images
   ================================================================= */

export const contactsSchema = z.object({
  whatsapp: z.string().trim().min(8, 'Numéro WhatsApp invalide').max(30),
  phone: z.string().trim().min(8, 'Numéro de téléphone invalide').max(30),
  email: z.email('E-mail invalide').max(120),
  city: z.string().trim().min(2).max(80),
  zone: z.string().trim().max(200),
  facebook: z.string().trim().max(300).default(''),
  instagram: z.string().trim().max(300).default(''),
  tiktok: z.string().trim().max(300).default(''),
  linkedin: z.string().trim().max(300).default(''),
});
export type Contacts = z.infer<typeof contactsSchema>;

export const DEFAULT_CONTACTS: Contacts = {
  whatsapp: '+226 70 43 82 76',
  phone: '+226 70 43 82 76',
  email: 'agency@hostella.com',
  city: 'Bobo-Dioulasso, Burkina Faso',
  zone: 'Bobo-Dioulasso, Ouagadougou et autres villes sur étude de la demande',
  facebook: '',
  instagram: '',
  tiktok: '',
  linkedin: '',
};

/** Emplacements d'images du site. `default` = image actuelle du site (dossier /public/images du frontend). */
export const IMAGE_SLOTS = [
  { key: 'hero', group: 'Accueil', label: 'Grande photo d’accueil (bannière)', default: '/images/equipe-hotesses.jpg' },
  { key: 'conviction1', group: 'Accueil', label: '« Notre conviction » — portrait', default: '/images/portrait-hotesse.jpg' },
  { key: 'conviction2', group: 'Accueil', label: '« Notre conviction » — petite photo', default: '/images/hotesse-dos.jpg' },
  { key: 'recruitHome', group: 'Accueil', label: 'Bloc recrutement', default: '/images/portrait-jaune.jpg' },
  { key: 'service_accueil', group: 'Services', label: 'Service 01 — Hôtesses & protocole', default: '/images/equipe-hotesses.jpg' },
  { key: 'service_reception', group: 'Services', label: 'Service 02 — Service en réception', default: '/images/service-boisson.jpg' },
  { key: 'service_organisation', group: 'Services', label: 'Service 03 — Organisation', default: '/images/mariage-danse.jpg' },
  { key: 'service_promotion', group: 'Services', label: 'Service 04 — Accueil promotionnel', default: '/images/foule-concert.jpg' },
  { key: 'universe_pro', group: 'Univers', label: 'Événements professionnels', default: '/images/conference.jpg' },
  { key: 'universe_prive', group: 'Univers', label: 'Événements privés', default: '/images/mariage-reception.jpg' },
  { key: 'universe_institution', group: 'Univers', label: 'Événements institutionnels', default: '/images/scene-conference.jpg' },
  { key: 'universe_culture', group: 'Univers', label: 'Événements culturels', default: '/images/tambours.jpg' },
  { key: 'about_hero', group: 'Bannières des pages', label: 'À propos', default: '/images/equipe-hotesses.jpg' },
  { key: 'about_story', group: 'Bannières des pages', label: 'À propos — photo de l’histoire', default: '/images/hotesse-dos.jpg' },
  { key: 'services_hero', group: 'Bannières des pages', label: 'Services', default: '/images/conference.jpg' },
  { key: 'realisations_hero', group: 'Bannières des pages', label: 'Réalisations', default: '/images/festival-nuit.jpg' },
  { key: 'recrutement_hero', group: 'Bannières des pages', label: 'Recrutement', default: '/images/portrait-jaune.jpg' },
  { key: 'contact_hero', group: 'Bannières des pages', label: 'Contact', default: '/images/mariage-danse.jpg' },
] as const;
export type ImageKey = (typeof IMAGE_SLOTS)[number]['key'];
export const IMAGE_KEYS = IMAGE_SLOTS.map((s) => s.key) as string[];

/** Image remplacée : URL + identifiant Cloudinary (pour pouvoir la supprimer ensuite) */
export type ImageOverride = { url: string; publicId?: string | null };
export type ImagesSetting = Record<string, ImageOverride>;

export async function getContacts(): Promise<Contacts> {
  const row = await prisma.setting.findUnique({ where: { key: 'contacts' } });
  const parsed = contactsSchema.safeParse({ ...DEFAULT_CONTACTS, ...((row?.value as object) ?? {}) });
  return parsed.success ? parsed.data : DEFAULT_CONTACTS;
}

export async function getImages(): Promise<ImagesSetting> {
  const row = await prisma.setting.findUnique({ where: { key: 'images' } });
  const value = (row?.value ?? {}) as ImagesSetting;
  return Object.fromEntries(Object.entries(value).filter(([k, v]) => IMAGE_KEYS.includes(k) && v?.url));
}

/** Ce que le site public affiche : contacts, images remplacées et galerie publiée */
export async function getPublicContent() {
  const [contacts, images, photos] = await Promise.all([
    getContacts(),
    getImages(),
    prisma.photo.findMany({
      where: { isPublished: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, url: true, title: true, category: true, tall: true },
    }),
  ]);
  return {
    contacts,
    images: Object.fromEntries(Object.entries(images).map(([k, v]) => [k, optimized(v.url, 2000)])),
    gallery: photos.map((p) => ({ ...p, url: optimized(p.url, 1600) })),
  };
}
