# Mettre Hostella en ligne — pas à pas

Durée : environ 45 minutes, une seule fois. Tout est gratuit.

| Partie | Hébergeur | Adresse obtenue (exemple) |
|---|---|---|
| Base de données | **Neon** (gratuit, sans expiration) | `postgresql://…neon.tech/…` |
| Backend (API) | **Render** (gratuit) | `https://hostella-backend.onrender.com` |
| Site public | **Vercel** | `https://hostella.vercel.app` |
| Espace admin | **Vercel** | `https://hostella-admin.vercel.app` |

Les clés à coller (JWT_SECRET, REVALIDATE_SECRET) sont dans **SECRETS-A-COPIER.txt**.

---

## Étape 1 — Envoyer le projet sur GitHub (un seul dépôt)

1. Sur github.com, cliquez **New repository**. Nom : `hostella`. Choisissez **Private**, puis **Create**.
2. Dans un terminal, dans le dossier `HostellaSite` :
   ```bash
   git init
   git add .
   git commit -m "Hostella : site, backend et admin"
   git branch -M main
   git remote add origin https://github.com/Faysk01/hostella.git
   git push -u origin main
   ```
   Les fichiers `.env`, `node_modules` et `SECRETS-A-COPIER.txt` ne sont **pas** envoyés. C'est voulu.

## Étape 2 — Base de données sur Neon

1. Sur neon.com, cliquez **Sign up** (avec GitHub), puis **Create project**. Nom : `hostella`. Région : **Frankfurt** (AWS eu-central-1), la plus proche du Burkina.
2. Cliquez **Connect** et **décochez « Connection pooling »**, puis copiez l'adresse.
3. Gardez seulement `?sslmode=require` à la fin. Supprimez `&channel_binding=require` s'il est présent. Exemple :
   `postgresql://neondb_owner:XXXX@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

## Étape 3 — Backend sur Render

1. Sur render.com, cliquez **New → Blueprint**, puis choisissez le dépôt `hostella`. Render lit le fichier `render.yaml` et prépare `hostella-backend`.
2. Remplissez les variables :
   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | l'adresse Neon (étape 2) |
   | `JWT_SECRET` | voir SECRETS-A-COPIER.txt |
   | `REVALIDATE_SECRET` | voir SECRETS-A-COPIER.txt |
   | `CORS_ORIGIN` | `https://hostella.vercel.app` (à corriger après l'étape 4 si l'adresse diffère) |
   | `SITE_URL` | même adresse que `CORS_ORIGIN` |
   | `CLOUDINARY_…` | vos 3 clés Cloudinary (ou vide pour l'instant) |
3. Cliquez **Apply**. Au bout de 3 à 5 minutes, ouvrez `https://hostella-backend.onrender.com/api/health` : vous devez voir `"status":"ok"`.
4. **Créez votre compte admin en ligne.** Dans Render, ouvrez le service, onglet **Shell**, puis tapez :
   ```bash
   npm run admin:create -- votre@email.com Fayssal NomDeFamille
   ```
   Notez le mot de passe provisoire.

## Étape 4 — Site public sur Vercel

1. Sur vercel.com, cliquez **Add New → Project**, puis importez `hostella`.
2. Dans **Root Directory**, choisissez **`frontend`**. Le framework Next.js est détecté tout seul.
3. **Environment Variables** :
   - `NEXT_PUBLIC_API_URL` = `https://hostella-backend.onrender.com`
   - `REVALIDATE_SECRET` = voir SECRETS-A-COPIER.txt
4. Cliquez **Deploy**. Notez l'adresse obtenue, par exemple `https://hostella.vercel.app`. Si elle diffère, corrigez `CORS_ORIGIN` et `SITE_URL` sur Render (onglet Environment), puis enregistrez : Render redémarre.

## Étape 5 — Espace admin sur Vercel

1. Dans `admin/vercel.json`, remplacez `https://VOTRE-BACKEND.onrender.com` par l'adresse Render, puis :
   ```bash
   git add . && git commit -m "Admin : adresse du backend" && git push
   ```
2. Sur Vercel, cliquez **Add New → Project**, importez `hostella` **une deuxième fois**, et choisissez **`admin`** comme Root Directory.
3. Variable : `VITE_SITE_URL` = l'adresse du site (étape 4). Cliquez **Deploy**.
4. Ouvrez l'admin, connectez-vous avec le mot de passe provisoire, puis choisissez le vôtre.

## Étape 6 — Garder le backend réveillé (recommandé)

Le Render gratuit s'endort après 15 minutes sans visite, et le réveil prend environ 1 minute. Le site reste affiché grâce à son cache, mais l'envoi d'un formulaire peut prendre plus de temps.

Sur GitHub, ouvrez le dépôt, puis **Settings → Secrets and variables → Actions → onglet Variables → New variable** :
`BACKEND_URL` = `https://hostella-backend.onrender.com`

Le fichier `.github/workflows/reveil-backend.yml` appellera alors le backend toutes les 10 minutes.

## Étape 7 — Vérifier sur téléphone

- [ ] Ouvrir le site sur un iPhone (Safari) et un Android (Chrome).
- [ ] Envoyer un devis de test, puis vérifier qu'il apparaît dans l'admin avec une référence.
- [ ] Changer une image dans **Images du site**, puis recharger le site : la nouvelle image apparaît.
- [ ] iPhone : Partager → « Sur l'écran d'accueil ». Android : menu ⋮ → « Ajouter à l'écran d'accueil ». L'icône Hostella s'installe.

## Ensuite

Chaque `git push` met à jour automatiquement le site, l'admin et le backend.

Pour un **nom de domaine** (ex. `hostella-agency.com`) : achetez-le, puis dans Vercel ouvrez le projet frontend, **Settings → Domains**. Pensez ensuite à mettre à jour `CORS_ORIGIN` et `SITE_URL` sur Render.
