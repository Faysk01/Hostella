import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[90svh] place-items-center overflow-hidden bg-night px-5 pt-24 text-center">
      <div className="pattern-diamonds absolute inset-0 opacity-[0.05]" />
      <div className="absolute h-96 w-96 rounded-full bg-magenta/25 blur-[140px]" />
      <div className="relative">
        <p className="font-display text-gold text-[30vw] font-black leading-none md:text-[14rem]">404</p>
        <h1 className="font-display text-3xl font-extrabold text-white md:text-5xl">Cette page s&apos;est éclipsée…</h1>
        <p className="mt-3 text-white/60">Laissez-nous vous raccompagner.</p>
        <div className="mt-8 flex justify-center">
          <Button href="/">Retour à l&apos;accueil</Button>
        </div>
      </div>
    </section>
  );
}
