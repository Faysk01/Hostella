import type { Metadata } from "next";
import { values } from "@/lib/site";
import { getContent } from "@/lib/content";
import { CurtainImage, Diamond, Reveal } from "@/components/motion";
import { CTABand, PageHero, ScrollRevealText, SectionTitle } from "@/components/sections";
import { CultureIdentity } from "@/components/about";

export const metadata: Metadata = {
  title: "À propos",
  description: "Hostella Agency, une nouvelle vision de l'accueil événementiel à Bobo-Dioulasso : mission, vision, valeurs et identité.",
};

export default async function AboutPage() {
  const { img } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Qui sommes-nous ?"
        title="Une nouvelle vision de l'accueil."
        highlight={["l'accueil."]}
        text="Née à Bobo-Dioulasso, Hostella Agency allie l'hospitalité burkinabè aux exigences de l'événementiel moderne."
        image={img.about_hero}
      />

      {/* Histoire + mission / vision */}
      <section data-bg="ivory" className="px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ScrollRevealText
              light
              className="font-display text-3xl font-bold leading-[1.2] md:text-[2.6rem]"
              text="Accueillir, ce n'est pas seulement recevoir. C'est offrir une première impression positive. Une hôtesse porte l'image de votre événement : nous la choisissons, la formons et l'accompagnons avec soin."
            />
          </div>
          <CurtainImage src={img.about_story} alt="Hôtesse Hostella de dos lors d'un événement" className="h-[300px] rounded-[2rem] lg:col-span-5 lg:h-[380px]" sizes="40vw" />
        </div>

        <div className="mx-auto mt-16 grid max-w-7xl gap-5 md:grid-cols-2">
          {[
            { k: "Notre mission", v: "Offrir un accueil professionnel, chaleureux et élégant, et accompagner nos clients jusqu'à la réussite de leur événement.", c: "from-bordeaux to-wine" },
            { k: "Notre vision", v: "Devenir l'agence de référence de l'accueil au Burkina Faso, en valorisant l'hospitalité burkinabè.", c: "from-magenta to-bordeaux" },
          ].map((b, i) => (
            <Reveal key={b.k} delay={i * 0.15}>
              <div className={`relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br ${b.c} p-8 md:p-10`}>
                <div className="pattern-diamonds absolute inset-0 opacity-10" />
                <Diamond className="relative h-7 w-7 text-gold-light" />
                <h2 className="font-display relative mt-5 text-3xl font-extrabold text-white">{b.k}</h2>
                <p className="relative mt-3 text-lg leading-relaxed text-white/85">{b.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Valeurs */}
      <section data-bg="blush" className="px-5 py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionTitle light center eyebrow="Nos valeurs" title="Ce qui nous guide." highlight={["guide."]} />
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="group w-[260px] rounded-[1.5rem] border border-ink/10 bg-white/80 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-bordeaux/30 hover:bg-bordeaux hover:shadow-xl hover:shadow-bordeaux/20">
                  <Diamond className="h-6 w-6 text-bordeaux transition-colors group-hover:text-gold" />
                  <h3 className="font-display mt-4 text-xl font-extrabold text-ink transition-colors group-hover:text-white">{v.title}</h3>
                  <p className="mt-1 text-sm text-ink/65 transition-colors group-hover:text-white/80">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Identité culturelle */}
      <section data-bg="champagne" className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32">
        <div className="pattern-diamonds absolute inset-0 opacity-[0.07]" />
        <div className="relative mx-auto max-w-7xl">
          <SectionTitle light eyebrow="Notre emblème" title="La tradition rencontre l'élégance." highlight={["l'élégance."]} />
          <div className="mt-14">
            <CultureIdentity />
          </div>
        </div>
      </section>

      <CTABand title="Écrivons ensemble la suite de l'histoire Hostella." />
    </>
  );
}
