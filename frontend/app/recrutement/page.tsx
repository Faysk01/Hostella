import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { Diamond, Reveal } from "@/components/motion";
import { PageHero, SectionTitle } from "@/components/sections";
import { ApplicationForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Recrutement",
  description: "Devenez hôtesse événementielle Hostella à Bobo-Dioulasso : profils recherchés, sélection et candidature.",
};

const profils = ["Présentation soignée", "Aisance à l'oral", "Sens de l'accueil", "Ponctualité et sérieux", "Esprit d'équipe", "Discrétion"];
const process = ["Candidature", "Entretien", "Mise en situation", "Formation", "Première mission"];

export default async function RecrutementPage() {
  const { img } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Recrutement"
        title="Votre élégance attire l'attention."
        highlight={["élégance"]}
        text="Rejoignez une équipe d'hôtesses motivées et passionnées. Débutante ? Votre motivation compte aussi."
        image={img.recrutement_hero}
      />

      <section data-bg="ivory" className="px-5 py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2">
          <div>
            <SectionTitle light eyebrow="Le profil" title="Ce que nous recherchons." highlight={["recherchons."]} />
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {profils.map((p, i) => (
                <Reveal as="li" key={p} delay={i * 0.06}>
                  <div className="flex h-full items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-1 hover:border-magenta/40">
                    <Diamond className="h-4 w-4 shrink-0 text-magenta" />
                    <span className="font-semibold text-ink/85">{p}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.2}>
              <p className="mt-6 text-ink/60">Le français est important ; le dioula et d&apos;autres langues sont un plus.</p>
            </Reveal>
          </div>
          <div>
            <SectionTitle light eyebrow="La sélection" title="Cinq étapes." highlight={["étapes."]} />
            <ol className="relative mt-8 space-y-3">
              {process.map((p, i) => (
                <Reveal as="li" key={p} delay={i * 0.08} x={30} y={0}>
                  <div className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all duration-500 hover:translate-x-2 hover:bg-bordeaux">
                    <span className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/20 text-lg font-extrabold text-bordeaux transition group-hover:bg-gold group-hover:text-ink">{i + 1}</span>
                    <span className="font-display text-lg font-extrabold text-ink transition-colors group-hover:text-white">{p}</span>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="candidature" data-bg="blush" className="relative overflow-hidden px-5 py-24 md:px-8 md:py-28">
        <div className="absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-magenta/20 blur-[140px]" />
        <div className="relative mx-auto max-w-4xl">
          <SectionTitle light center eyebrow="Candidature" title="Rejoignez l'équipe." highlight={["l'équipe."]} text="Votre candidature s'ouvre dans WhatsApp, prête à envoyer. Joignez-y votre CV et une photo." />
          <Reveal className="mt-12">
            <ApplicationForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
