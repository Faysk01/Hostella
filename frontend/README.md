# Hostella Agency — Site vitrine (frontend)

Next.js 16 + Tailwind CSS 4 + Motion (animations) + Lenis (défilement fluide).

## Lancer le site sur votre ordinateur

```bash
cd frontend
npm install
npm run dev
```
Puis ouvrez http://localhost:3000

## Modifier les textes, contacts et images

- **Contacts, images du site, galerie** : depuis l'espace admin (rubriques « Coordonnées »,
  « Images du site », « Galerie photos »).
- **Textes** (services, valeurs, étapes, FAQ…) : `lib/site.ts`.
- **Couleurs** : `app/globals.css` (bloc `@theme`).

## Mettre en ligne sur Vercel

1. Créez un dépôt GitHub (ex. `hostella-frontend`) et poussez le dossier `frontend` :
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Site Hostella Agency"
   git branch -M main
   git remote add origin https://github.com/<votre-compte>/hostella-frontend.git
   git push -u origin main
   ```
2. Sur vercel.com : **Add New → Project → Import** le dépôt → **Deploy**.
3. Chaque `git push` met le site à jour automatiquement.

## Lien avec l'espace admin

- `NEXT_PUBLIC_API_URL` (fichier `.env.local`) : adresse du backend.
- Coordonnées, images du site et galerie viennent de l'admin (`lib/content.ts`), avec repli
  sur les valeurs de `lib/site.ts` et les images de `public/images` si l'API ne répond pas.
- Les formulaires enregistrent les demandes dans l'admin ; si l'API est injoignable, ils
  proposent l'envoi par WhatsApp.

Photos d'illustration provisoires : Pexels (licence libre) et visuels Hostella.
