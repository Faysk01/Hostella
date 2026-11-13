import { randomInt } from 'node:crypto';

/** Référence lisible et unique, ex : DEV-2611-7K3Q (préfixe-année/mois-aléa) */
export function makeReference(prefix: 'DEV' | 'CAN' | 'MIS'): string {
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join('');
  return `${prefix}-${ym}-${code}`;
}
