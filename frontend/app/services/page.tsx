import type { Metadata } from "next";
import { services } from "@/lib/site";
import { getContent } from "@/lib/content";
import { CurtainImage, Diamond, Marquee, Reveal } from "@/components/motion";
import { Button } from "@/components/ui";
import { CTABand, PageHero, SectionTitle, Steps } from "@/components/sections";

export const metadata: Metadata = {
  title: "Nos services",
  description: "Hôtesses et protocole, service en réception, organisation d'événements et accueil promotionnel à Bobo-Dioulasso.",
};

export default async function ServicesPage() {
  const { img } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Nos services"
        title="Du premier sourire au dernier invité."
        highlight={["sourire"]}
        text="Des hôtesses pour vos invités, et un accompagnement pour l'organisation de vos événements."
        image={img.services_hero}
      />

      {services.map((s, i) => {
        const reverse = i % 2 === 1;
        return (
          <section key={s.slug} id={s.slug} data-bg={i % 2 ? "blush" : "ivory"} className="scroll-mt-28 px-5 py-20 md:px-8 md:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={`relative ${reverse ? "lg:order-2" : ""}`}>
                <CurtainImage src={img[s.image]} alt={s.title} className="h-[320px] rounded-[2rem] md:h-[440px]" sizes="(min-width:1024px) 45vw, 100vw" />
                <div className={`absolute -bottom-5 left-6 rounded-2xl bg-gradient-to-br ${s.color} px-5 py-2.5 shadow-xl`}>
                  <span className="font-display text-gold-light text-3xl font-extrabold">{s.n}</span>
                </div>
              </div>
              <div className={reverse ? "lg:order-1" : ""}>
                <Reveal>
                  <h2 className="font-display text-4xl font-extrabold leading-[1] text-ink md:text-5xl">{s.title}</h2>
                  <p className="font-serif mt-3 text-2xl italic text-bordeaux">{s.short}</p>
                  <p className="mt-4 text-lg text-ink/70">{s.text}</p>
                </Reveal>
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {s.items.map((it, k) => (
                    <Reveal as="li" key={it} delay={k * 0.06} y={20}>
                      <div className="flex h-full items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-bordeaux/30 hover:shadow-lg hover:shadow-bordeaux/10">
                        <Diamond className="h-4 w-4 shrink-0 text-magenta" />
                        <span className="font-semibold text-ink/85">{it}</span>
                      </div>
                    </Reveal>
                  ))}
                </ul>
                <Reveal className="mt-8">
                  <Button href="/devis" variant="dark">
                    Demander ce service
                  </Button>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <div className="overflow-hidden py-4">
        <div className="font-display -rotate-1 border-y border-gold/30 bg-gradient-to-r from-bordeaux via-magenta to-bordeaux py-5 text-3xl font-extrabold text-white md:text-5xl">
          <Marquee reverse items={["Mariages", "Conférences", "Lancements", "Galas", "Festivals", "Cérémonies"]} />
        </div>
      </div>

      <section data-bg="champagne" className="px-5 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionTitle light center eyebrow="Comment ça marche" title="Simple comme 1, 2, 3." highlight={["1,", "2,", "3."]} />
          <div className="mt-16">
            <Steps />
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
