"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { img, nav } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { WhatsAppIcon } from "./ui";

/** Pied de page compact : identité, navigation, contact. */
export default function Footer() {
  const { site, wa } = useContent();

  return (
    <footer data-bg="sand" className="relative overflow-hidden bg-sand text-ink">
      <div className="textile-band opacity-80" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-magenta/15 blur-[110px]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-12 md:gap-8 md:px-8 md:py-16">
        {/* Identité */}
        <div className="flex flex-col items-center text-center md:col-span-5 md:items-start md:text-left">
          <Link href="/" className="flex items-center gap-4" aria-label="Hostella Agency, accueil">
            <span className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
              <Image src={img.logo} alt="" fill sizes="96px" className="object-contain" />
            </span>
            <span className="text-left leading-none">
              <span className="font-display block text-3xl font-extrabold tracking-tight text-bordeaux md:text-4xl">HOSTELLA</span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-[0.35em] text-gold-deep">Agency</span>
            </span>
          </Link>
          <p className="font-serif mt-4 text-xl italic text-ink/70">{site.slogan}.</p>
          {site.socials.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-bordeaux hover:text-bordeaux">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="md:col-span-3" aria-label="Pied de page">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-bordeaux md:text-left">Navigation</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-center md:grid-cols-1 md:text-left">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink/70 transition-colors hover:text-bordeaux">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="md:col-span-4">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-bordeaux md:text-left">Contact</p>
          <ul className="mx-auto max-w-xs space-y-3 text-ink/75 md:mx-0">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-bordeaux" /> {site.city}</li>
            <li>
              <a href={wa()} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-bordeaux">
                <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1f9d55]" /> {site.whatsapp}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phoneRaw}`} className="flex gap-3 hover:text-bordeaux">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" /> {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 break-all hover:text-bordeaux">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" /> {site.email}
              </a>
            </li>
          </ul>
          <div className="mt-6 flex justify-center md:justify-start">
            <Link href="/devis" className="group inline-flex items-center gap-2 rounded-full bg-bordeaux px-5 py-3 text-sm font-bold text-white transition hover:bg-wine">
              Demander un devis <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative border-t border-ink/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-5 py-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] text-center text-xs text-ink/50 md:flex-row md:px-8 md:text-left">
          <p>© 2026 {site.name} — {site.slogan}.</p>
          <p>Photos d&apos;illustration provisoires.</p>
        </div>
      </div>
    </footer>
  );
}
