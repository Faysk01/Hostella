"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { nav, img } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { Diamond } from "./motion";
import { WhatsAppIcon } from "./ui";
import { useLenis } from "./Providers";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const lenis = useLenis();
  const { site, wa } = useContent();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 300 && y > prev && !open);
  });

  // Bloquer le défilement quand le menu mobile est ouvert
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Barre de progression du défilement */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-magenta via-gold to-gold-light"
      />

      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6 md:pt-[calc(env(safe-area-inset-top)+1rem)]"
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 md:px-4 ${
            scrolled || open ? "border border-white/10 bg-night/80 shadow-2xl shadow-black/30 backdrop-blur-xl" : "border border-white/10 bg-night/30 backdrop-blur-md"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5" aria-label="Hostella Agency, accueil">
            <span className="relative h-11 w-11 shrink-0 md:h-12 md:w-12">
              <Image src={img.logo} alt="" fill sizes="48px" className="object-contain" priority />
            </span>
            <span className="leading-none">
              <span className="font-display block text-lg font-extrabold tracking-tight text-white md:text-xl">HOSTELLA</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Agency</span>
            </span>
          </Link>

          {/* Menu ordinateur */}
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} className="relative rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white">
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/10" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/devis"
              className="hidden rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep px-5 py-2.5 text-sm font-extrabold text-ink transition-transform hover:scale-105 active:scale-95 sm:inline-flex"
            >
              Demander un devis
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
            >
              <motion.span animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }} className="absolute h-0.5 w-5 rounded bg-white" />
              <motion.span animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }} className="absolute h-0.5 w-5 rounded bg-white" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-night lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="pattern-diamonds pointer-events-none absolute inset-0 opacity-[0.07]" />
            <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-magenta/30 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gold/20 blur-[120px]" />
            <nav className="relative mt-[calc(env(safe-area-inset-top)+6.5rem)] flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-6">
              {[...nav, { href: "/devis", label: "Demander un devis" }].map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.6 }}
                >
                  <Link
                    href={l.href}
                    className={`font-display flex items-center gap-4 py-1.5 text-[clamp(1.6rem,7.5vw,2.25rem)] font-extrabold [@media(max-height:640px)]:py-0.5 [@media(max-height:640px)]:text-2xl ${pathname === l.href ? "text-gold" : "text-white"}`}
                  >
                    <span className="w-8 text-sm font-semibold text-white/30">0{i + 1}</span>
                    {l.label}
                    {pathname === l.href && <Diamond className="h-5 w-5 text-magenta" />}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="relative space-y-3 px-6 pb-[calc(env(safe-area-inset-bottom)+1.75rem)] pt-4">
              <a href={wa()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 rounded-full bg-[#25d366] py-4 font-bold text-[#06260f]">
                <WhatsAppIcon className="h-5 w-5" /> WhatsApp {site.whatsapp}
              </a>
              <p className="text-center text-sm text-white/50">{site.city}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
