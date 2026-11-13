# Hostella Agency — Site, API et espace admin

```
HostellaSite/
├── frontend/   Site public (Next.js)               → Vercel        http://localhost:3000
├── backend/    API + base de données (Express)     → Render        http://localhost:5000
└── admin/      Espace d'administration (React)     → Vercel        http://localhost:5173
```

- **Le site public** affiche les coordonnées, les images et la galerie réglées dans l'admin. Ses formulaires (devis, candidature, message) arrivent dans l'admin.
  Si l'API ne répond pas, le site continue de fonctionner avec ses images d'origine, et les formulaires passent par WhatsApp.
- **L'admin** sert à traiter les demandes de devis, les candidatures et les messages. Il gère aussi l'équipe d'hôtesses, le planning des missions, la galerie photos, les images et les coordonnées du site, les administrateurs et le journal d'audit.

---

## 1. Premier lancement sur votre ordinateur

Prérequis : **Node.js 20+** et **Docker Desktop** (comme pour VoirAuto).

### a) Backend + base de données

```bash
cd backend
npm install
npm run db:up          # démarre PostgreSQL dans Docker (port 5435)
npm run db:deploy      # crée les tables
npm run admin:create -- votre@email.com Prénom Nom
npm run dev            # API sur http://localhost:5000
```

`admin:create` affiche un **mot de passe provisoire** une seule fois : notez-le. Le premier compte créé est super administrateur.

### b) Espace admin (2ᵉ terminal)

```bash
cd admin
npm install
npm run dev            # http://localhost:5173
```

Connectez-vous avec votre e-mail et le mot de passe provisoire, puis choisissez votre mot de passe personnel.

### c) Site public (3ᵉ terminal)

```bash
cd frontend
npm run dev            # http://localhost:3000
```

Les fichiers `.env` (backend), `.env` (admin) et `.env.local` (frontend) sont déjà remplis pour travailler en local.

---

## 2. Photos avec Cloudinary (comme VoirAuto)

Dans `backend/.env`, renseignez les trois clés de votre compte Cloudinary (Dashboard → API Keys) :

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Redémarrez ensuite le backend. Dans l'admin, « Galerie photos » et « Images du site » proposent alors **Depuis l'ordinateur**. La photo part directement du navigateur vers Cloudinary, avec une signature du backend. Elle est rangée dans `hostella/galerie` ou `hostella/site`.

Sans Cloudinary, vous pouvez coller l'adresse d'une image Cloudinary, Pexels ou Unsplash.

---

## 3. Mise en ligne

Suivez **DEPLOIEMENT.md** : base de données sur Neon, backend sur Render, site et admin sur Vercel, le tout depuis un seul dépôt GitHub.

---

## 4. Au quotidien

| Je veux… | Où dans l'admin |
|---|---|
| Traiter une demande de devis, la rappeler sur WhatsApp | **Demandes de devis** (le statut passe à « En cours » à l'ouverture) |
| Transformer une demande acceptée en mission | Demande → **Créer la mission** |
| Étudier une candidate, noter l'entretien, l'ajouter à l'équipe | **Candidatures** → **Ajouter à l'équipe** |
| Planifier un événement, affecter des hôtesses, les prévenir sur WhatsApp | **Planning** (le planning signale une hôtesse déjà prise au même moment) |
| Mettre les vraies photos de nos prestations | **Galerie photos** (tant qu'elle est vide, le site garde les photos d'illustration) |
| Remplacer une image du site (bannières, services…) | **Images du site** → Remplacer / Rétablir |
| Changer le numéro WhatsApp, l'e-mail, les réseaux sociaux | **Coordonnées** |
| Donner l'accès à un collègue | **Administrateurs** (super admin) |

Le site public se met à jour en moins d'une minute après chaque modification, et immédiatement si `SITE_URL` et `REVALIDATE_SECRET` sont configurés.
