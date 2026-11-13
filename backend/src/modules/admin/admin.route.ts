import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';

import { authLimiter, loginAccountLimiter, writeLimiter } from '../../middlewares/rate-limit';
import { asyncHandler as h } from '../../utils/async-handler';
import * as acc from './accounts';
import { requireAdmin, requirePasswordChanged, requireSuperAdmin } from './admin.middleware';
import * as auth from './auth';
import * as rq from './requests';
import * as site from './site';
import * as team from './team';

const router = Router();
const w: RequestHandler = writeLimiter;

// Déconnexion : on note dans l'audit qui se déconnecte si la session est encore valide
const optionalAdmin = (req: Request, res: Response, next: NextFunction) => requireAdmin(req, res, () => next());

// ---------- Session ----------
router.post('/auth/login', authLimiter, loginAccountLimiter, h(auth.login));
router.post('/auth/logout', optionalAdmin, h(auth.logout));
router.get('/auth/me', requireAdmin, h(auth.me));
router.post('/auth/password', requireAdmin, authLimiter, h(auth.changePassword));

// ---------- Tout ce qui suit : admin connecté avec son propre mot de passe ----------
router.use(requireAdmin, requirePasswordChanged);

router.get('/stats', h(acc.stats));

// Demandes reçues
router.get('/quotes', h(rq.listQuotes));
router.get('/quotes/:id', h(rq.getQuote));
router.patch('/quotes/:id', w, h(rq.updateQuote));
router.delete('/quotes/:id', w, h(rq.deleteQuote));
router.post('/quotes/:id/mission', w, h(rq.quoteToMission));

router.get('/applications', h(rq.listApplications));
router.patch('/applications/:id', w, h(rq.updateApplication));
router.delete('/applications/:id', w, h(rq.deleteApplication));
router.post('/applications/:id/hostess', w, h(rq.applicationToHostess));

router.get('/messages', h(rq.listMessages));
router.patch('/messages/:id', w, h(rq.updateMessage));
router.delete('/messages/:id', w, h(rq.deleteMessage));

// Équipe et planning
router.get('/hostesses', h(team.listHostesses));
router.get('/hostesses/:id', h(team.getHostess));
router.post('/hostesses', w, h(team.createHostess));
router.put('/hostesses/:id', w, h(team.updateHostess));
router.delete('/hostesses/:id', w, h(team.deleteHostess));

router.get('/missions', h(team.listMissions));
router.get('/missions/:id', h(team.getMission));
router.post('/missions', w, h(team.createMission));
router.put('/missions/:id', w, h(team.updateMission));
router.delete('/missions/:id', w, h(team.deleteMission));
router.post('/missions/:id/assignments', w, h(team.assignHostess));
router.delete('/missions/:id/assignments/:hostessId', w, h(team.unassignHostess));

// Contenu du site
router.post('/uploads/signature', w, h(site.uploadSignature));
router.get('/photos', h(site.listPhotos));
router.post('/photos', w, h(site.createPhoto));
router.post('/photos/reorder', w, h(site.reorderPhotos));
router.patch('/photos/:id', w, h(site.updatePhoto));
router.delete('/photos/:id', w, h(site.deletePhoto));

router.get('/settings', h(site.getSettings));
router.put('/settings/contacts', w, h(site.updateContacts));
router.put('/settings/images/:key', w, h(site.setImage));
router.delete('/settings/images/:key', w, h(site.resetImage));

// ---------- Super admin ----------
router.get('/admins', requireSuperAdmin, h(acc.listAdmins));
router.post('/admins', requireSuperAdmin, w, h(acc.createAdmin));
router.post('/admins/:id/reset-password', requireSuperAdmin, w, h(acc.resetAdminPassword));
router.patch('/admins/:id/status', requireSuperAdmin, w, h(acc.setAdminStatus));
router.get('/audit', requireSuperAdmin, h(acc.auditLog));

export default router;
