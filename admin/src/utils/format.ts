const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const longFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dtFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const fmtDate = (d?: string | Date | null) => (d ? dateFmt.format(new Date(d)) : '—');
export const fmtLong = (d?: string | Date | null) => (d ? longFmt.format(new Date(d)) : '—');
export const fmtTime = (d?: string | Date | null) => (d ? timeFmt.format(new Date(d)) : '—');
export const fmtDateTime = (d?: string | Date | null) => (d ? dtFmt.format(new Date(d)) : '—');

export function ago(d: string) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'à l’instant';
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 7 * 86400) return `il y a ${Math.floor(s / 86400)} j`;
  return fmtDate(d);
}

export const initials = (a = '', b = '') => `${a[0] ?? ''}${b[0] ?? ''}`.toUpperCase();

/** Lien WhatsApp vers un numéro (Burkina par défaut si le numéro n'a pas d'indicatif) */
export function waTo(phone: string, text = '') {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 8) digits = `226${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Pour <input type="datetime-local"> */
export function toLocalInput(d: string | Date) {
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
/** Les images d'origine du site sont des chemins (/images/...) : on les affiche depuis le site public */
export const siteAsset = (path: string, siteUrl?: string) => (path.startsWith('/') ? `${siteUrl || SITE_URL}${path}` : path);
