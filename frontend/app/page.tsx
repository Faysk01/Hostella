import { getContent } from "@/lib/content";
import { CurtainImage, Diamond, Reveal } from "@/components/motion";
import { Button } from "@/components/ui";
import { CTABand, HomeHero, HorizontalUniverses, ScrollRevealText, SectionTitle, StackedServices, Steps } from "@/components/sections";

export default async function Home() {
  const { img } = await getContent();
  return (
    <>
      <HomeHero />

      {/* ===== Notre conviction ===== */}
      <section className="relative overflow-hidden px-5 py-24 md:px-8 md:py-32">
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-magenta/10 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-bordeaux">Notre conviction</p>
            </Reveal>
            <ScrollRevealText
              light
              className="font-display text-3xl font-bold leading-[1.15] md:text-5xl"
              text="Un événement réussi commence dès l'arrivée du premier invité. Nous y mettons l'élégance et la chaleur de l'hospitalité burkinabè."
            />
            <Reveal delay={0.2} className="mt-10">
              <Button href="/a-propos" variant="dark">
                Qui sommes-nous ?
              </Button>
            </Reveal>
          </div>
          <div className="relative h-[440px] lg:col-span-5">
            <CurtainImage src={img.conviction1} alt="Hôtesse souriante" className="absolute right-0 top-0 h-[80%] w-[72%] rounded-[2rem]" sizes="(min-width:1024px) 30vw, 70vw" />
            <CurtainImage src={img.conviction2} alt="Hôtesse Hostella lors d'un concert" className="absolute bottom-0 left-0 h-[40%] w-[70%] rounded-[1.5rem] border-4 border-cream" sizes="(min-width:1024px) 30vw, 70vw" delay={0.3} />
            <div className="animate-float absolute left-[6%] top-[10%] grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-magenta to-bordeaux shadow-xl shadow-magenta/30">
              <Diamond className="h-7 w-7 text-gold-light" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Services ===== */}
      <section className="relative bg-white pt-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle light eyebrow="Nos services" title="Quatre façons de sublimer votre événement." highlight={["sublimer"]} />
        </div>
        <StackedServices />
      </section>

      {/* ===== Univers ===== */}
      <HorizontalUniverses />

      {/* ===== Comment ça marche ===== */}
      <section className="bg-white px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionTitle light center eyebrow="Comment ça marche" title="Simple comme 1, 2, 3." highlight={["1,", "2,", "3."]} />
          <div className="mt-16">
            <Steps />
          </div>
          <Reveal className="mt-14 flex justify-center">
            <Button href="/devis">Demander un devis</Button>
          </Reveal>
        </div>
      </section>

      {/* ===== Recrutement ===== */}
      <section className="relative overflow-hidden bg-night px-5 py-24 md:px-8 md:py-28">
        <div className="pattern-diamonds absolute inset-0 opacity-[0.05]" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-magenta/25 blur-[130px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <CurtainImage src={img.recruitHome} alt="Hôtesse Hostella souriante" className="h-[380px] rounded-[2rem] md:h-[480px]" sizes="(min-width:1024px) 50vw, 100vw" />
          <div>
            <SectionTitle eyebrow="Recrutement" title="Devenez hôtesse Hostella." highlight={["Hostella."]} />
            <Reveal delay={0.2}>
              <p className="mt-6 text-lg text-white/70">Souriante, ponctuelle et passionnée par l&apos;accueil ? Nous vous formons et vous accompagnons sur de vrais événements.</p>
              <div className="mt-8">
                <Button href="/recrutement">Déposer ma candidature</Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
