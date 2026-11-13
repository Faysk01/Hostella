"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { faq, img, services, steps, universes } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { Counter, Diamond, Eyebrow, Marquee, ParallaxImage, Reveal, SplitText } from "./motion";
import { Button, WhatsAppIcon } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* =========================================================
   HERO — page d'accueil
   ========================================================= */
export function HomeHero() {
  const { img: slots } = useContent();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      {/* Image de fond */}
      <motion.div style={{ scale: imgScale }} className="absolute inset-0">
        <Image src={slots.hero} alt="Hôtesses Hostella en uniforme bordeaux et or" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/60 to-night" />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/70 to-transparent" />
      <div className="pattern-diamonds absolute inset-0 opacity-[0.06]" />

      {/* Halos de couleur */}
      <motion.div animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-magenta/30 blur-[130px]" />
      <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-20 bottom-10 h-[380px] w-[380px] rounded-full bg-gold/20 blur-[130px]" />

      <motion.div style={{ y: yText, opacity: fade }} className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-28 pt-28 md:px-8 md:pb-36 md:pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur sm:px-4 sm:text-xs sm:tracking-[0.2em]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-magenta" />
            Bobo-Dioulasso · Burkina Faso
          </span>
        </motion.div>

        <h1 className="font-display mt-5 max-w-5xl text-[13vw] md:mt-7 font-extrabold leading-[0.92] text-white sm:text-7xl lg:text-[7.2rem]">
          <SplitText immediate delay={0.4} text="L'accueil qui rend votre événement inoubliable." highlight={["inoubliable"]} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-white/75 [@media(max-height:600px)]:line-clamp-2 sm:text-lg md:mt-7 md:text-xl"
        >
          Hôtesses événementielles soigneusement sélectionnées, préparées et coordonnées. L&apos;élégance qui accueille, le professionnalisme qui fait la différence.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.9 }} className="mt-7 flex flex-wrap gap-3 md:mt-9">
          <Button href="/devis">Demander un devis</Button>
          <Button href="/services" variant="outline">
            Découvrir nos services
          </Button>
        </motion.div>
      </motion.div>

      {/* Badge rotatif */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 1, ease: EASE }}
        className="absolute bottom-28 right-5 hidden h-36 w-36 md:right-10 md:block lg:h-44 lg:w-44"
      >
        <motion.svg style={{ rotate }} viewBox="0 0 200 200" className="animate-spin-slow absolute inset-0 h-full w-full">
          <defs>
            <path id="circle" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
          </defs>
          <text className="fill-gold text-[17px] font-bold uppercase tracking-[0.32em]">
            <textPath href="#circle">Le charme de l&apos;accueil • Hostella •</textPath>
          </text>
        </motion.svg>
        <div className="absolute inset-[26%] rounded-full bg-night/60 p-2 backdrop-blur">
          <div className="relative h-full w-full">
            <Image src={img.logo} alt="" fill sizes="90px" className="object-contain" />
          </div>
        </div>
      </motion.div>

      {/* Indicateur de défilement */}
      <motion.div style={{ opacity: fade }} className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 md:flex">
        Défiler
        <span className="relative h-10 w-[2px] overflow-hidden rounded bg-white/15">
          <motion.span animate={{ y: ["-100%", "100%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-x-0 h-1/2 bg-gold" />
        </span>
      </motion.div>

      <div className="font-display absolute inset-x-0 bottom-0 -rotate-1 border-y border-gold/30 bg-gradient-to-r from-bordeaux via-magenta to-bordeaux py-4 text-xl font-extrabold text-white md:text-2xl">
        <Marquee items={["Hôtesses d'accueil", "Protocole & VIP", "Service en réception", "Organisation d'événements", "Accueil promotionnel", "Mariages", "Conférences", "Galas"]} />
      </div>
    </section>
  );
}

/* =========================================================
   Texte manifeste qui s'illumine au défilement
   ========================================================= */
export function ScrollRevealText({ text, className = "", light = false }: { text: string; className?: string; light?: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((w, i) => (
        <Word key={i} light={light} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range, light }: { children: string; progress: MotionValue<number>; range: [number, number]; light: boolean }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const base = light ? "#1d0b10" : "#ffffff";
  const hl = light ? "#b81e4a" : "#e8b53a";
  const color = useTransform(progress, range, [base, children.match(/accueil|élégance|hospitalité|inoubliable|burkinabè/i) ? hl : base]);
  return (
    <motion.span style={{ opacity, color }} className="mr-[0.25em] mt-[0.1em]">
      {children}
    </motion.span>
  );
}

/* =========================================================
   Bande de chiffres
   ========================================================= */
export function StatsBand() {
  const stats = [
    { n: 4, label: "services sur mesure" },
    { n: 4, label: "univers d'événements" },
    { n: 6, label: "étapes claires" },
    { n: 7, label: "valeurs qui nous guident" },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={i} delay={i * 0.1} className="bg-night-2 p-6 md:p-8">
          <Counter to={s.n} className="font-display text-gold-grad text-5xl font-extrabold md:text-7xl" />
          <p className="mt-2 text-sm font-semibold text-white/60 md:text-base">{s.label}</p>
        </Reveal>
      ))}
    </div>
  );
}

/* =========================================================
   Services en cartes empilées (sticky)
   ========================================================= */
export function StackedServices() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="relative">
      {services.map((s, i) => (
        <ServiceCard key={s.slug} s={s} i={i} total={services.length} progress={scrollYProgress} />
      ))}
    </div>
  );
}

function ServiceCard({ s, i, total, progress }: { s: (typeof services)[number]; i: number; total: number; progress: MotionValue<number> }) {
  const { img: slots } = useContent();
  const targetScale = 1 - (total - 1 - i) * 0.05;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const brightness = useTransform(progress, [i / total, 1], [1, 0.55 + i * 0.12]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);
  return (
    <div className="sticky top-0 flex h-[100svh] items-center justify-center px-3 md:px-6" style={{ paddingTop: `${80 + i * 22}px` }}>
      <motion.article
        style={{ scale, filter }}
        className={`relative grid h-[78svh] max-h-[680px] w-full max-w-6xl origin-top overflow-hidden rounded-[2rem] bg-gradient-to-br ${s.color} shadow-2xl shadow-black/50 md:grid-cols-2`}
      >
        <div className="pattern-diamonds pointer-events-none absolute inset-0 opacity-[0.08]" />
        <div className="relative flex flex-col justify-between p-6 md:p-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-display text-gold-grad text-5xl font-extrabold md:text-7xl">{s.n}</span>
              <span className="h-px flex-1 bg-white/20" />
            </div>
            <h3 className="font-display mt-4 text-3xl font-extrabold leading-[1.02] text-white md:text-5xl">{s.title}</h3>
            <p className="font-serif mt-3 text-xl italic text-gold-light md:text-2xl">{s.short}</p>
            <p className="mt-4 hidden max-w-md text-white/75 sm:block">{s.text}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.items.slice(0, 4).map((it) => (
              <span key={it} className="rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-xs font-semibold text-white/85 md:text-sm">
                {it}
              </span>
            ))}
          </div>
          <Link href={`/services#${s.slug}`} className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold">
            Voir le détail
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
        </div>
        <div className="relative hidden md:block">
          <Image src={slots[s.image]} alt={s.title} fill sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 -z-0 md:hidden">
          <Image src={slots[s.image]} alt="" fill sizes="100vw" className="object-cover opacity-20 mix-blend-luminosity" />
        </div>
      </motion.article>
    </div>
  );
}

/* =========================================================
   Univers d'événements — défilement horizontal
   ========================================================= */
export function HorizontalUniverses() {
  const { img: slots } = useContent();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const x = useTransform(smooth, [0, 1], [0, -dist]);

  useIsoLayout(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section ref={section} className="relative bg-cream text-ink" style={{ height: `calc(100svh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="pattern-diamonds pointer-events-none absolute inset-0 opacity-[0.12]" />
        <motion.div ref={track} style={{ x }} className="relative flex items-stretch gap-5 px-5 md:gap-8 md:px-12">
          <div className="flex w-[82vw] shrink-0 flex-col justify-center sm:w-[60vw] lg:w-[34vw]">
            <Eyebrow light>Nos univers</Eyebrow>
            <h2 className="font-display mt-5 text-5xl font-extrabold leading-[0.95] md:text-7xl">
              Chaque événement a son <span className="font-serif font-normal italic text-bordeaux">histoire.</span>
            </h2>
            <p className="mt-5 max-w-sm text-lg text-ink/70">Une approche personnalisée, adaptée à la nature de l&apos;événement, à son importance et au public attendu.</p>
            <p className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-bordeaux">
              Faites défiler <span className="inline-block animate-[float_2s_ease-in-out_infinite]">→</span>
            </p>
          </div>
          {universes.map((u, i) => (
            <article key={u.title} className="group relative h-[64svh] w-[78vw] shrink-0 overflow-hidden rounded-[2rem] sm:w-[52vw] lg:w-[30vw]">
              <Image src={slots[u.image]} alt={u.title} fill sizes="(min-width:1024px) 30vw, 80vw" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
              <span className="font-display absolute right-5 top-4 text-6xl font-extrabold text-white/25">0{i + 1}</span>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Événements</p>
                <h3 className="font-display mt-1 text-4xl font-extrabold text-white md:text-5xl">{u.title}</h3>
                <p className="mt-3 max-w-xs text-white/75">{u.text}</p>
              </div>
            </article>
          ))}
          <div className="flex w-[70vw] shrink-0 flex-col items-start justify-center sm:w-[40vw] lg:w-[24vw]">
            <p className="font-serif text-4xl italic text-bordeaux md:text-5xl">Et le vôtre ?</p>
            <Link href="/devis" className="group mt-6 inline-flex items-center gap-3 rounded-full bg-bordeaux px-6 py-4 font-bold text-white transition hover:bg-magenta">
              Parlons de votre projet <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
   Étapes — 3 cartes reliées par une ligne qui se dessine
   ========================================================= */
export function Steps({ light = true }: { light?: boolean }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
        transition={{ duration: 1.4, ease: EASE }}
        className="absolute left-[16%] right-[16%] top-8 hidden h-[2px] origin-left bg-gradient-to-r from-gold via-magenta to-gold md:block"
      />
      <ol className="relative grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 0.18} className="text-center">
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              whileInView={{ scale: 1, rotate: 45 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.3 + i * 0.2 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gold-light to-gold-deep shadow-lg shadow-gold/30"
            >
              <span className="font-display -rotate-45 text-2xl font-extrabold text-ink">{i + 1}</span>
            </motion.span>
            <h3 className={`font-display mt-6 text-2xl font-extrabold ${light ? "text-ink" : "text-white"}`}>{s.title}</h3>
            <p className={`mx-auto mt-2 max-w-xs ${light ? "text-ink/65" : "text-white/65"}`}>{s.text}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/* =========================================================
   FAQ — accordéon
   ========================================================= */
export function FAQ({ light = true }: { light?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={`divide-y rounded-3xl border ${light ? "divide-ink/10 border-ink/10 bg-white" : "divide-white/10 border-white/10 bg-white/[0.03]"}`}>
      {faq.map((f, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={f.q} delay={i * 0.05}>
            <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-6 px-5 py-6 text-left md:px-8" aria-expanded={isOpen}>
              <span className={`font-display text-lg font-bold transition-colors md:text-2xl ${isOpen ? (light ? "text-bordeaux" : "text-gold") : light ? "text-ink" : "text-white"}`}>{f.q}</span>
              <motion.span animate={{ rotate: isOpen ? 135 : 0 }} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isOpen ? "bg-gold text-ink" : light ? "bg-ink/5 text-ink" : "bg-white/10 text-white"}`}>
                <Plus className="h-5 w-5" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                  <p className={`px-5 pb-6 md:px-8 md:text-lg ${light ? "text-ink/70" : "text-white/70"}`}>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        );
      })}
    </div>
  );
}

/* =========================================================
   Bandeau d'appel à l'action
   ========================================================= */
export function CTABand({ title = "Prêt à offrir un accueil inoubliable ?", text = "Parlez-nous de votre événement : nous préparons une proposition adaptée." }: { title?: string; text?: string }) {
  const { site, wa } = useContent();
  return (
    <section className="px-3 py-16 md:px-6 md:py-24">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-magenta via-ruby to-wine px-6 py-16 text-center md:px-16 md:py-24">
          <div className="pattern-diamonds absolute inset-0 opacity-[0.15]" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -right-24 -top-24 h-72 w-72 opacity-30">
            <Image src={img.logo} alt="" fill sizes="300px" className="object-contain" />
          </motion.div>
          <div className="relative">
            <h2 className="font-display mx-auto max-w-4xl text-4xl font-extrabold leading-[1] text-white md:text-7xl">
              <SplitText text={title} highlight={["inoubliable", "équipe", "Hostella"]} highlightClass="font-serif italic font-normal text-gold-light" />
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">{text}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/devis">Demander un devis</Button>
              <Button href={wa()} external variant="whatsapp">
                <span className="flex items-center gap-2">
                  <WhatsAppIcon className="h-4 w-4" /> {site.whatsapp}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* =========================================================
   En-tête des pages intérieures
   ========================================================= */
export function PageHero({ eyebrow, title, highlight = [], text, image }: { eyebrow: string; title: string; highlight?: string[]; text: string; image: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return (
    <section ref={ref} className="relative flex min-h-[78svh] items-end overflow-hidden pb-16 pt-36 md:min-h-[86svh] md:pb-24">
      <ParallaxImage src={image} alt="" className="!absolute inset-0" strength={120} priority />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/75 to-night/40" />
      <div className="pattern-diamonds absolute inset-0 opacity-[0.05]" />
      <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-magenta/25 blur-[120px]" />
      <motion.div style={{ y, opacity }} className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <span className="inline-flex items-center gap-3 rounded-full border border-gold/30 bg-night/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-gold backdrop-blur">
            <Diamond className="h-3 w-3" /> {eyebrow}
          </span>
        </motion.div>
        <h1 className="font-display mt-6 max-w-5xl text-[12vw] font-extrabold leading-[0.95] text-white sm:text-6xl lg:text-8xl">
          <SplitText immediate delay={0.5} text={title} highlight={highlight} />
        </h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="mt-6 max-w-2xl text-lg text-white/75 md:text-xl">
          {text}
        </motion.p>
      </motion.div>
    </section>
  );
}

/* Titre de section standard */
export function SectionTitle({ eyebrow, title, highlight = [], text, light = false, center = false }: { eyebrow: string; title: string; highlight?: string[]; text?: string; light?: boolean; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`font-display mt-5 text-4xl font-extrabold leading-[1] md:text-6xl ${light ? "text-ink" : "text-white"}`}>
        <SplitText text={title} highlight={highlight} highlightClass={light ? "font-serif italic font-normal text-bordeaux" : undefined} />
      </h2>
      {text && (
        <Reveal delay={0.2}>
          <p className={`mt-5 text-lg ${light ? "text-ink/70" : "text-white/65"}`}>{text}</p>
        </Reveal>
      )}
    </div>
  );
}
