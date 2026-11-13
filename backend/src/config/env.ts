import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
};

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) throw new Error('JWT_SECRET doit contenir au moins 32 caractères.');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? '';
const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? '';
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? '';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  PORT: Number(process.env.PORT) || 5000,
  /** Liste des origines autorisées (site public + admin) */
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: jwtSecret,

  /** Cloudinary est facultatif : sans lui, l'admin peut coller une URL d'image */
  CLOUDINARY: { enabled: Boolean(cloudName && apiKey && apiSecret), cloudName, apiKey, apiSecret },

  /** Mise à jour instantanée du site public après une modification dans l'admin */
  SITE_URL: process.env.SITE_URL?.trim().replace(/\/$/, '') ?? '',
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET?.trim() ?? '',
};
