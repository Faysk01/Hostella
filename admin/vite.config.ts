import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * Le navigateur appelle /api/... sur localhost:5173 et Vite relaie vers le backend.
 * Pour le navigateur tout reste sur la même adresse : le cookie de session admin
 * (HttpOnly + SameSite=Strict) fonctionne et il n'y a pas de CORS.
 * En ligne, c'est vercel.json qui relaie /api vers le backend (Render).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';
  const proxy = { '/api': { target, changeOrigin: true, secure: true, headers: { 'ngrok-skip-browser-warning': '1' } } };
  console.log(`\n  ➜  API Hostella : ${target}\n`);
  return { plugins: [react()], server: { port: 5173, proxy }, preview: { port: 4173, proxy } };
});
