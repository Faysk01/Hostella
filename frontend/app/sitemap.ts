import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Plan du site pour Google */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/services", "/a-propos", "/realisations", "/recrutement", "/devis", "/contact"].map((p, i) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: i === 0 ? 1 : 0.7,
  }));
}
