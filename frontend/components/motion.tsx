"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, animate } from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Apparition au défilement ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  x = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, x, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/* ---------- Titre qui apparaît mot par mot ---------- */
export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.06,
  highlight = [],
  highlightClass = "text-shine font-serif italic font-normal",
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  highlight?: string[];
  highlightClass?: string;
  immediate?: boolean;
}) {
  const words = text.split(" ");
  const anim = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <motion.span
      className={`inline ${className}`}
      initial="hidden"
      {...anim}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => {
        const clean = w.replace(/[.,!?;:]/g, "");
        const hl = highlight.includes(clean);
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom" aria-hidden>
            <motion.span
              className={`inline-block ${hl ? highlightClass + " pr-[0.08em]" : ""}`}
              variants={{
                hidden: { y: "110%", rotate: 6, opacity: 0 },
                show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 0.9, ease: EASE } },
              }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </motion.span>
  );
}

/* ---------- Image avec effet de profondeur (parallaxe) ---------- */
export function ParallaxImage({
  src,
  alt,
  className = "",
  strength = 80,
  sizes = "100vw",
  priority = false,
  zoom = true,
}: {
  src: string;
  alt: string;
  className?: string;
  strength?: number;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], zoom ? [1.25, 1.12, 1.25] : [1.15, 1.15, 1.15]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </motion.div>
    </div>
  );
}

/* ---------- Image révélée par un rideau ---------- */
export function CurtainImage({ src, alt, className = "", sizes = "50vw", delay = 0 }: { src: string; alt: string; className?: string; sizes?: string; delay?: number }) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, delay, ease: EASE }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.35 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay, ease: EASE }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

/* ---------- Bouton aimanté ---------- */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Compteur animé ---------- */
export function Counter({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const c = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => (node.textContent = Math.round(v).toString().padStart(2, "0") + suffix),
    });
    return () => c.stop();
  }, [inView, to, suffix]);
  return (
    <span ref={ref} className={className}>
      00{suffix}
    </span>
  );
}

/* ---------- Bandeau défilant ---------- */
export function Marquee({ items, reverse = false, className = "" }: { items: string[]; reverse?: boolean; className?: string }) {
  const list = [...items, ...items];
  return (
    <div className={`relative flex overflow-hidden select-none ${className}`}>
      <div className={`flex shrink-0 items-center gap-10 pr-10 whitespace-nowrap ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}>
        {list.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>{t}</span>
            <Diamond className="h-4 w-4 shrink-0 text-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Diamond({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 1 23 12 12 23 1 12Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7 17 12 12 17 7 12Z" fill="currentColor" />
    </svg>
  );
}

/* ---------- Étiquette de section ---------- */
export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <Reveal y={20}>
      <span
        className={`inline-flex items-center gap-3 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] ${
          light ? "border-bordeaux/25 text-bordeaux" : "border-gold/30 text-gold"
        }`}
      >
        <Diamond className="h-3 w-3" />
        {children}
      </span>
    </Reveal>
  );
}
