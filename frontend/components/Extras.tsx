"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { img } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { WhatsAppIcon } from "./ui";

/* ---------- Écran d'ouverture (une fois par visite) ---------- */
export function Preloader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("hostella-intro") === "1";
      sessionStorage.setItem("hostella-intro", "1");
    } catch {}
    const t = setTimeout(() => setShow(false), seen ? 300 : 2100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-night"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="pattern-diamonds absolute inset-0 opacity-[0.06]" />
          <div className="absolute h-80 w-80 rounded-full bg-magenta/25 blur-[100px]" />
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-36 w-36 md:h-44 md:w-44"
            >
              <Image src={img.logo} alt="Hostella Agency" fill sizes="180px" priority className="object-contain" />
            </motion.div>
            <div className="mt-6 overflow-hidden">
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-gold-grad text-3xl font-black tracking-[0.2em]"
              >
                HOSTELLA
              </motion.p>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="font-serif mt-1 text-lg italic text-white/70">
              Le charme de l&apos;accueil
            </motion.p>
            <motion.div className="mt-6 h-[2px] w-40 origin-left bg-gradient-to-r from-magenta to-gold" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.6, ease: "easeInOut" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Halo lumineux qui suit la souris (ordinateur) ---------- */
export function CursorGlow() {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 120, damping: 20 });
  const sy = useSpring(y, { stiffness: 120, damping: 20 });
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHover(!!t?.closest("a,button,[data-cursor]"));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed left-0 top-0 z-[5] -ml-[200px] -mt-[200px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(230,51,127,.13),transparent_65%)]"
      />
      <motion.div
        aria-hidden
        style={{ x, y }}
        animate={{ scale: hover ? 2.6 : 1 }}
        className="pointer-events-none fixed left-0 top-0 z-[80] -ml-2 -mt-2 h-4 w-4 rounded-full border border-gold mix-blend-difference"
      />
    </>
  );
}

/* ---------- Bouton WhatsApp flottant ---------- */
/** Pages avec formulaire : sur mobile, le bouton flottant cacherait « Continuer / Envoyer » */
const FORM_PAGES = ["/devis", "/recrutement", "/contact"];

export function WhatsAppFloat() {
  const { wa } = useContent();
  const pathname = usePathname();
  const onForm = FORM_PAGES.includes(pathname);
  return (
    <motion.a
      href={wa()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire sur WhatsApp"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 2.4, type: "spring", stiffness: 200, damping: 14 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`pulse-ring fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-[calc(env(safe-area-inset-right)+1.25rem)] z-[35] ${onForm ? "hidden md:grid" : "grid"} h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-black/40 md:bottom-[calc(env(safe-area-inset-bottom)+1.75rem)] md:right-7 md:h-16 md:w-16`}
    >
      <WhatsAppIcon className="h-7 w-7 md:h-8 md:w-8" />
    </motion.a>
  );
}
