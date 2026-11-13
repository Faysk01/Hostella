import { env } from '../config/env';

/**
 * Prévient le site public (Next.js sur Vercel) qu'un contenu a changé :
 * il se met à jour tout de suite au lieu d'attendre 1 minute. Ne bloque jamais.
 */
export function refreshPublicSite(): void {
  if (!env.SITE_URL || !env.REVALIDATE_SECRET) return;
  fetch(`${env.SITE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { 'x-revalidate-secret': env.REVALIDATE_SECRET },
    signal: AbortSignal.timeout(5000),
  }).catch(() => undefined);
}
