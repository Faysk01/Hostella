"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Teintes douces du fond de page (une par ambiance de section) */
export const BG = {
  ivory: "#fffaf5",
  blush: "#fcefef",
  champagne: "#f9f0e1",
  rose: "#f8e9ee",
  sand: "#f6ede2",
} as const;

/**
 * Fond qui change de couleur en douceur pendant le défilement.
 * Chaque section porte data-bg="blush" (ou champagne, rose…) : quand elle passe
 * au milieu de l'écran, le fond de la page glisse vers sa couleur.
 */
export default function ScrollBackground() {
  const pathname = usePathname();
  useEffect(() => {
    const body = document.body;
    body.style.backgroundColor = BG.ivory;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-bg]")];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const key = (e.target as HTMLElement).dataset.bg as keyof typeof BG;
          body.style.backgroundColor = BG[key] ?? BG.ivory;
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
