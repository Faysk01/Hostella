import type { Metadata } from "next";
import { waLinkFor } from "@/lib/site";
import { getContent } from "@/lib/content";
import { Diamond, Reveal, SplitText } from "@/components/motion";
import { QuoteForm } from "@/components/forms";
import { WhatsAppIcon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Demander un devis",
  description: "Demandez une proposition personnalisée à Hostella Agency : hôtesses, service en réception, organisation d'événements.",
};

export default async function DevisPage() {
  const { site } = await getContent();
  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-32 md:px-8 md:pb-28 md:pt-40">
      <div className="absolute -right-40 -top-20 h-[520px] w-[520px] rounded-full bg-magenta/15 blur-[150px]" />
      <div className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-gold/20 blur-[150px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal y={20}>
            <span className="inline-flex items-center gap-3 rounded-full border border-bordeaux/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-bordeaux">
              <Diamond className="h-3 w-3" /> Demander un devis
            </span>
          </Reveal>
          <h1 className="font-display mt-6 text-5xl font-extrabold leading-[0.95] text-ink md:text-7xl">
            <SplitText immediate delay={0.3} text="Parlons de votre événement." highlight={["événement."]} highlightClass="font-serif italic font-normal text-bordeaux" />
          </h1>
          <Reveal delay={0.5}>
            <p className="mt-6 text-lg text-ink/70">4 questions rapides, puis nous vous envoyons une proposition sur mesure, sans engagement.</p>
            <a href={waLinkFor(site)} target="_blank" rel="noopener noreferrer" className="mt-8 flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 transition hover:border-[#25d366]">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#25d366] text-white">
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-sm text-ink/55">Pressé ? Écrivez-nous</span>
                <span className="font-display text-xl font-extrabold text-ink">{site.whatsapp}</span>
              </span>
            </a>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <Reveal delay={0.3}>
            <QuoteForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
