"use client";

import { MotionConfig } from "motion/react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Défilement fluide (Lenis) + réglages globaux des animations. */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const ref = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.2 });
    ref.current = l;
    setLenis(l);
    return () => {
      l.destroy();
      ref.current = null;
    };
  }, []);

  // Revenir en haut à chaque changement de page
  useEffect(() => {
    if (ref.current) ref.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenis}>
      <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </MotionConfig>
    </LenisContext.Provider>
  );
}
