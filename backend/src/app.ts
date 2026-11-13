import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler';
import adminRoutes from './modules/admin/admin.route';
import publicRoutes from './modules/public/public.route';

const app: Application = express();

// Derrière un hébergeur (Render) ou ngrok : on fait confiance au premier proxy pour l'IP réelle
app.set('trust proxy', 1);

app.use(helmet());
// Le site public et l'admin appellent l'API depuis le navigateur.
// credentials: true → le cookie de session admin peut circuler (uniquement vers les origines listées)
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' })); // les images passent par Cloudinary, jamais par le JSON

app.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'API Hostella Agency', timestamp: new Date().toISOString() });
});
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, status: 'ok', environment: env.NODE_ENV });
});

app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
