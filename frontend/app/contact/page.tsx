import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { waLinkFor } from "@/lib/site";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/motion";
import { FAQ, PageHero, SectionTitle } from "@/components/sections";
import { QuickContact } from "@/components/forms";
import { WhatsAppIcon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Hostella Agency à Bobo-Dioulasso : WhatsApp, téléphone et e-mail.",
};

export default async function ContactPage() {
  const { img, site } = await getContent();
  const cards = [
    { icon: <WhatsAppIcon className="h-6 w-6" />, label: "WhatsApp", value: site.whatsapp, href: waLinkFor(site), color: "from-[#25d366] to-[#128c4b]", ext: true },
    { icon: <Phone className="h-6 w-6" />, label: "Téléphone", value: site.phone, href: `tel:${site.phoneRaw}`, color: "from-gold to-gold-deep" },
    { icon: <Mail className="h-6 w-6" />, label: "E-mail", value: site.email, href: `mailto:${site.email}`, color: "from-magenta to-ruby" },
    { icon: <MapPin className="h-6 w-6" />, label: "Ville", value: "Bobo-Dioulasso", href: "https://www.google.com/maps/search/?api=1&query=Bobo-Dioulasso", color: "from-bordeaux to-wine", ext: true },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="Parlons de votre projet." highlight={["projet."]} text="Mariage, conférence, lancement ou réception : nous vous répondons rapidement." image={img.contact_hero} />

      <section data-bg="ivory" className="px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.08}>
                <a
                  href={c.href}
                  {...(c.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full flex-col rounded-[1.75rem] border border-ink/10 bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-bordeaux/10"
                >
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-lg transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>{c.icon}</span>
                  <span className="mt-6 text-sm text-ink/50">{c.label}</span>
                  <span className="font-display mt-1 break-words text-xl font-extrabold text-ink">{c.value}</span>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle light eyebrow="Message rapide" title="Écrivez-nous." highlight={["Écrivez-nous."]} />
              <Reveal delay={0.2} className="mt-8">
                <QuickContact />
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div className="relative h-[380px] overflow-hidden rounded-[2rem] border border-ink/10 lg:h-full lg:min-h-[460px]">
                <iframe title="Carte de Bobo-Dioulasso" src="https://www.google.com/maps?q=Bobo-Dioulasso,Burkina%20Faso&z=13&output=embed" className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section data-bg="rose" className="px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionTitle light center eyebrow="FAQ" title="Questions fréquentes" highlight={["fréquentes"]} />
          <div className="mt-10">
            <FAQ />
          </div>
        </div>
      </section>
    </>
  );
}
