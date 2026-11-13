import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('[database]: Connecté à PostgreSQL');
  } catch (error) {
    console.error('[database]: Connexion impossible. Docker est-il lancé ? (npm run db:up)', error);
    process.exit(1);
  }
  console.log(`[cloudinary]: ${env.CLOUDINARY.enabled ? 'configuré' : 'non configuré (les images peuvent être ajoutées par URL)'}`);

  const server = app.listen(env.PORT, () => {
    console.log(`[server]: API Hostella sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    console.error(err.code === 'EADDRINUSE' ? `[server]: Le port ${env.PORT} est déjà utilisé.` : `[server]: ${err.message}`);
    process.exit(1);
  });

  const shutdown = (signal: string) => {
    console.log(`[server]: ${signal} reçu, arrêt...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start();
