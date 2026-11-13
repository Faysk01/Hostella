import type { MetadataRoute } from "next";

/** « Ajouter à l'écran d'accueil » sur Android (et icône sur iPhone via apple-icon.png) */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hostella Agency — Le charme de l'accueil",
    short_name: "Hostella",
    description: "Hôtesses événementielles & organisation d'événements à Bobo-Dioulasso.",
    start_url: "/",
    display: "standalone",
    background_color: "#120509",
    theme_color: "#120509",
    lang: "fr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
