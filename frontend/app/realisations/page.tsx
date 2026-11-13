import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/motion";
import { CTABand, PageHero } from "@/components/sections";
import { Gallery } from "@/components/gallery";

export const metadata: Metadata = {
  title: "Réalisations",
  description: "Galerie des prestations Hostella Agency : mariages, conférences, événements culturels et lancements.",
};

export default async function RealisationsPage() {
  const { img } = await getContent();
  return (
    <>
      <PageHero eyebrow="Réalisations" title="Des moments qui marquent les esprits." highlight={["marquent"]} text="Notre galerie grandit à chaque prestation." image={img.realisations_hero} />
      <section data-bg="champagne" className="px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="mb-8 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-ink/75">
              <span className="font-bold text-bordeaux">Bientôt :</span> les photos de nos premières missions à Bobo-Dioulasso.
            </p>
          </Reveal>
          <Gallery />
        </div>
      </section>
      <CTABand title="Et si votre événement était le prochain ?" />
    </>
  );
}
