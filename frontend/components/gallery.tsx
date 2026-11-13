"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { img } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { useLenis } from "./Providers";

/* Photos d'illustration : affichées tant que la galerie de l'admin est vide */
const defaultPhotos = [
  { src: img.team, cat: "Hôtesses", title: "L'équipe Hostella", tall: true },
  { src: img.weddingDance, cat: "Mariages", title: "Première danse sous les lumières" },
  { src: img.conference, cat: "Conférences", title: "Prise de parole en séminaire" },
  { src: img.drums, cat: "Culture", title: "Tambours et danse traditionnelle" },
  { src: img.hostessBack, cat: "Hôtesses", title: "Hôtesse en mission de concert" },
  { src: img.weddingReception, cat: "Mariages", title: "Réception et buffet", tall: true },
  { src: img.crowd, cat: "Concerts", title: "Grande scène, grand public" },
  { src: img.drumGold, cat: "Culture", title: "Élégance traditionnelle", tall: true },
  { src: img.stage, cat: "Conférences", title: "Scène et public" },
  { src: img.weddingKigali, cat: "Mariages", title: "Cérémonie élégante", tall: true },
  { src: img.festival, cat: "Concerts", title: "Festival de nuit", tall: true },
  { src: img.service, cat: "Hôtesses", title: "Service en réception" },
  { src: img.weddingGuests, cat: "Mariages", title: "Invitées en tenue de fête" },
  { src: img.concert, cat: "Concerts", title: "L'énergie d'un live" },
];
const baseCats = ["Hôtesses", "Mariages", "Conférences", "Culture", "Concerts", "Entreprises"];

export function Gallery() {
  const [cat, setCat] = useState("Tout");
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();
  const { gallery } = useContent();
  // Photos de l'admin (Cloudinary) si elles existent, sinon les photos d'illustration
  const photos = gallery.length ? gallery.map((p) => ({ src: p.url, cat: p.category, title: p.title, tall: p.tall })) : defaultPhotos;
  const cats = ["Tout", ...baseCats.filter((c) => photos.some((p) => p.cat === c)), ...[...new Set(photos.map((p) => p.cat))].filter((c) => !baseCats.includes(c))];
  const list = cat === "Tout" ? photos : photos.filter((p) => p.cat === cat);

  useEffect(() => {
    if (open !== null) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis, list.length]);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="relative rounded-full px-5 py-2.5 text-sm font-bold">
            {cat === c && <motion.span layoutId="gal-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-light to-gold" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
            <span className={`relative ${cat === c ? "text-ink" : "text-ink/60 hover:text-ink"}`}>{c}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.button
              layout
              key={p.src + p.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
              onClick={() => setOpen(i)}
              data-cursor
              className={`group relative block w-full break-inside-avoid overflow-hidden rounded-[1.5rem] ${p.tall ? "h-[460px]" : "h-[300px]"}`}
            >
              <Image src={p.src} alt={p.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-left transition-transform duration-500 group-hover:translate-y-0">
                <span className="rounded-full bg-magenta/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">{p.cat}</span>
                <p className="font-display mt-2 text-xl font-extrabold text-white">{p.title}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Visionneuse */}
      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div className="fixed inset-0 z-[95] flex items-center justify-center bg-night/95 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div
              key={open}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative h-[75svh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={list[open].src} alt={list[open].title} fill sizes="100vw" className="rounded-2xl object-contain" />
            </motion.div>
            <p className="font-display absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-lg font-bold text-white">{list[open].title}</p>
            <button aria-label="Fermer" onClick={() => setOpen(null)} className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white">
              <X />
            </button>
            <button aria-label="Précédente" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white md:left-8">
              <ChevronLeft />
            </button>
            <button aria-label="Suivante" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white md:right-8">
              <ChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
