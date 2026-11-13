/**
 * Client HTTP de l'espace admin (fetch natif).
 * - La session vit dans un cookie HttpOnly posé par le backend : le JavaScript ne voit jamais le jeton.
 * - L'en-tête x-hostella-admin protège les modifications contre les attaques CSRF.
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

type Query = Record<string, string | number | boolean | undefined | null>;
const BASE = '/api/admin';

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  const qs = params.toString();
  return `${BASE}${path}${qs ? `?${qs}` : ''}`;
}

async function request<T>(method: string, path: string, options: { body?: unknown; query?: Query } = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.query), {
      method,
      credentials: 'same-origin',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'x-hostella-admin': '1',
        'ngrok-skip-browser-warning': '1',
        ...(options.body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Serveur injoignable. Vérifiez que le backend est démarré.', 0, 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    if (res.status === 401 && !path.startsWith('/auth/login')) onUnauthorized?.();
    throw new ApiError(json?.message ?? 'Réponse inattendue du serveur', res.status, json?.code, json?.fieldErrors);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body: body ?? {} }),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, { body }),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, { body }),
  delete: <T = { ok: true }>(path: string) => request<T>('DELETE', path),
};

export const errorMessage = (e: unknown, fallback = 'Une erreur est survenue') =>
  e instanceof ApiError ? (e.fieldErrors ? Object.values(e.fieldErrors)[0] : e.message) : fallback;
