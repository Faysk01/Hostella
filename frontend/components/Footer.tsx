"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { img, nav } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { Button, WhatsAppIcon } from "./ui";
import { Marquee } from "./motion";

export default function Footer() {
  const { site, wa } = useContent();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-night pt-10">
      <div className="textile-band opacity-90" />
      <div className="font-display border-y border-white/10 py-6 text-3xl font-extrabold text-white/90 md:text-5xl">
        <Marquee items={["Hôtesses d'accueil", "Protocole", "Mariages", "Conférences", "Lancements", "Galas", "Festivals", "Salons"]} />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-bordeaux/30 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 pt-20 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] text-white md:text-6xl">
              Votre événement mérite un <span className="text-shine font-serif font-normal italic">accueil</span> à la hauteur.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/devis">Demander un devis</Button>
              <Button href={wa()} external variant="whatsapp">
                <span className="flex items-center gap-2">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </span>
              </Button>
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-gold">Navigation</p>
            <ul className="space-y-2.5">
              {[...nav, { href: "/devis", label: "Demander un devis" }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                    <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-5" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-gold">Contact</p>
            <ul className="space-y-4 text-white/75">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-magenta" /> {site.city}
              </li>
              <li>
                <a href={wa()} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-white">
                  <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#25d366]" /> {site.whatsapp}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phoneRaw}`} className="flex gap-3 hover:text-white">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="flex gap-3 break-all hover:text-white">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> {site.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/70 transition hover:border-gold hover:text-gold">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grand nom en bas de page */}
      <motion.div style={{ y, scale }} className="relative mt-16 flex items-end justify-center gap-4 px-4 pb-4 md:mt-24">
        <span className="relative hidden h-[14vw] w-[14vw] max-h-48 max-w-48 sm:block">
          <Image src={img.logo} alt="" fill sizes="200px" className="object-contain" />
        </span>
        <span className="font-display text-gold-grad select-none text-[19vw] font-black leading-[0.8] tracking-[-0.06em] sm:text-[16vw]">HOSTELLA</span>
      </motion.div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-white/45 md:flex-row md:px-8">
          <p>© 2026 {site.name} — {site.slogan}.</p>
          <p>Photos d&apos;illustration provisoires (Pexels &amp; visuels Hostella).</p>
        </div>
      </div>
    </footer>
  );
}
