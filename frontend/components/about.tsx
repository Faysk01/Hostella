"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { img, values } from "@/lib/site";
import { Diamond, Reveal } from "./motion";

/* Liste des valeurs : survol (ou toucher) pour révéler */
export function ValuesList() {
  const [active, setActive] = useState(0);
  return (
    <ul className="border-t border-white/10">
      {values.map((v, i) => {
        const on = active === i;
        return (
          <Reveal as="li" key={v.title} delay={i * 0.04}>
            <button
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className="group relative block w-full overflow-hidden border-b border-white/10 py-5 text-left md:py-7"
            >
              <motion.span
                className="absolute inset-0 origin-left bg-gradient-to-r from-bordeaux via-magenta/60 to-transparent"
                initial={false}
                animate={{ scaleX: on ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="relative flex flex-col gap-2 px-3 md:flex-row md:items-center md:gap-10 md:px-6">
                <span className="flex items-center gap-4">
                  <span className="font-display w-8 text-sm font-bold text-gold">0{i + 1}</span>
                  <span className={`font-display text-3xl font-extrabold transition-all duration-500 md:text-6xl ${on ? "translate-x-2 text-white" : "text-white/35"}`}>{v.title}</span>
                </span>
                <motion.span
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, height: on ? "auto" : 0 }}
                  className="overflow-hidden pl-12 text-white/85 md:ml-auto md:max-w-sm md:pl-0 md:text-right"
                >
                  {v.text}
                </motion.span>
              </span>
            </button>
          </Reveal>
        );
      })}
    </ul>
  );
}

/* Identité culturelle : logo qui tourne + symboles */
export function CultureIdentity() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const ring = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const symbols = [
    { k: "H & A", v: "L'identité de Hostella Agency." },
    { k: "La figure féminine", v: "L'élégance et les métiers de l'accueil." },
    { k: "La calebasse", v: "Le partage, la générosité, l'hospitalité." },
    { k: "Les motifs géométriques", v: "Nos traditions et notre artisanat textile." },
    { k: "Le bordeaux", v: "Le raffinement et la distinction." },
    { k: "L'or", v: "Le prestige et la valeur de chaque invité." },
  ];
  return (
    <div ref={ref} className="grid items-center gap-14 lg:grid-cols-2">
      <div className="relative mx-auto aspect-square w-full max-w-[520px]">
        <motion.div style={{ rotate: ring }} className="absolute inset-0 rounded-full border border-dashed border-gold/40" />
        <motion.div style={{ rotate: ring }} className="absolute inset-[8%] rounded-full border border-magenta/30" />
        <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-bordeaux/60 to-magenta/20 blur-2xl" />
        <motion.div style={{ rotate, scale }} className="absolute inset-[10%]">
          <Image src={img.logo} alt="Emblème Hostella Agency" fill sizes="(min-width:1024px) 40vw, 80vw" className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,.6)]" />
        </motion.div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {symbols.map((s, i) => (
          <Reveal as="li" key={s.k} delay={i * 0.08}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:-translate-y-1 hover:border-gold/40">
              <Diamond className="h-5 w-5 text-gold" />
              <p className="font-display mt-3 text-lg font-extrabold text-white">{s.k}</p>
              <p className="mt-1 text-sm text-white/65">{s.v}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
