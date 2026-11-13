# Hostella — Backend (API)

Express + Prisma 7 + PostgreSQL, sur le modèle de VoirAuto.

```bash
npm install
npm run db:up        # PostgreSQL dans Docker (port 5435)
npm run db:deploy    # crée / met à jour les tables
npm run admin:create -- email@exemple.com Prénom Nom
npm run dev          # http://localhost:5000
```

- `GET  /api/public/content` : coordonnées, images remplacées, galerie (site public)
- `POST /api/public/quotes | applications | messages` : formulaires du site (anti-spam : limite par IP + champ piège)
- `/api/admin/...` : espace admin. La session est gardée dans un cookie HttpOnly de 8 h, avec un en-tête anti-CSRF `x-hostella-admin`, un mot de passe provisoire à changer et un journal d'audit.

Commandes utiles :
- `npm run admin:reset -- email` : nouveau mot de passe provisoire
- `npm run db:studio` : voir la base dans le navigateur
