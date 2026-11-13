import { cacheLife, cacheTag } from "next/cache";
import { buildSite, defaultContacts, slotDefaults, type Contacts, type GalleryPhoto, type SiteInfo, type Slots } from "./site";

/** Adresse de l'API (backend Hostella). Sans elle, le site utilise ses contenus par défaut. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type SiteContent = { site: SiteInfo; img: Slots; gallery: GalleryPhoto[] };

type ApiContent = { contacts: Contacts; images: Partial<Record<keyof Slots, string>>; gallery: GalleryPhoto[] };

/**
 * Contenu modifiable depuis l'admin (coordonnées, images, galerie).
 *
 * Mis en cache côté serveur : le visiteur reçoit toujours une page immédiate.
 * La mise à jour se fait en arrière-plan (toutes les 5 min, ou tout de suite après
 * une modification dans l'admin via /api/revalidate).
 *
 * Backend en veille (offre gratuite de Render, ~1 min de réveil) : on patiente en arrière-plan.
 * S'il ne répond pas, on garde la dernière version connue au lieu de revenir aux images d'origine.
 */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag("content");
  cacheLife({ stale: 300, revalidate: 300, expire: 60 * 60 * 24 * 365 });

  const building = process.env.NEXT_PHASE === "phase-production-build";
  let data: ApiContent | null = null;
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/api/public/content`, {
        // Pendant la construction du site on n'attend pas longtemps ; en ligne, on laisse au backend le temps de se réveiller
        signal: AbortSignal.timeout(building ? 8000 : 70000),
        headers: { "ngrok-skip-browser-warning": "1" },
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      data = ((await res.json()) as { data: ApiContent }).data;
    } catch (error) {
      // En ligne : on lève l'erreur → Next.js conserve la dernière version en cache
      if (!building) throw error;
      data = null; // à la construction : contenus par défaut
    }
  }

  const img = { ...slotDefaults } as Slots;
  for (const [k, v] of Object.entries(data?.images ?? {})) if (k in img && v) img[k as keyof Slots] = v;

  return {
    site: buildSite({ ...defaultContacts, ...(data?.contacts ?? {}) }),
    img,
    gallery: data?.gallery ?? [],
  };
}
