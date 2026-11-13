import { revalidateTag } from "next/cache";

/**
 * Appelé par le backend après une modification dans l'admin :
 * le site recharge aussitôt les coordonnées, images et galerie.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  // « max » : la page actuelle reste servie pendant que la nouvelle version se prépare
  revalidateTag("content", "max");
  return Response.json({ ok: true });
}
