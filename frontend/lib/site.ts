/* ==========================================================
   HOSTELLA — Contenu du site
   Les coordonnées, les images et la galerie se modifient depuis
   l'espace admin. Les valeurs ci-dessous sont utilisées par défaut
   (et si l'API est injoignable).
   ========================================================== */

export type Contacts = {
  whatsapp: string;
  phone: string;
  email: string;
  city: string;
  zone: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
};

export const defaultContacts: Contacts = {
  whatsapp: "+226 70 43 82 76",
  phone: "+226 70 43 82 76",
  email: "agency@hostella.com",
  city: "Bobo-Dioulasso, Burkina Faso",
  zone: "Bobo-Dioulasso, Ouagadougou et autres villes sur étude de la demande",
};

/** Informations affichées par le site, construites à partir des coordonnées */
export function buildSite(c: Contacts) {
  return {
    name: "Hostella Agency",
    slogan: "Le charme de l'accueil",
    tagline: "Plus qu'un accueil, une expérience qui marque les esprits.",
    city: c.city,
    zone: c.zone,
    whatsapp: c.whatsapp,
    whatsappRaw: c.whatsapp.replace(/\D/g, ""),
    phone: c.phone,
    phoneRaw: c.phone.replace(/[^\d+]/g, ""),
    email: c.email,
    socials: [
      { label: "Facebook", href: c.facebook || "" },
      { label: "Instagram", href: c.instagram || "" },
      { label: "TikTok", href: c.tiktok || "" },
      { label: "LinkedIn", href: c.linkedin || "" },
    ].filter((s) => s.href),
  };
}
export type SiteInfo = ReturnType<typeof buildSite>;

export const DEFAULT_WA_TEXT = "Bonjour Hostella Agency, je souhaite avoir des informations.";
export const waLinkFor = (s: SiteInfo, text = DEFAULT_WA_TEXT) => `https://wa.me/${s.whatsappRaw}?text=${encodeURIComponent(text)}`;

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/recrutement", label: "Recrutement" },
  { href: "/contact", label: "Contact" },
];

/* Images : remplacez simplement les fichiers dans /public/images (même nom)
   ou mettez ici une URL Cloudinary. */
export const img = {
  logo: "/images/logo.png",
  team: "/images/equipe-hotesses.jpg",
  hostessBack: "/images/hotesse-dos.jpg",
  weddingDance: "/images/mariage-danse.jpg",
  weddingReception: "/images/mariage-reception.jpg",
  weddingKigali: "/images/mariage-kigali.jpg",
  weddingGuests: "/images/invites-mariage.jpg",
  conference: "/images/conference.jpg",
  stage: "/images/scene-conference.jpg",
  drums: "/images/tambours.jpg",
  drumGold: "/images/tambour-or.jpg",
  concert: "/images/concert.jpg",
  crowd: "/images/foule-concert.jpg",
  festival: "/images/festival-nuit.jpg",
  portrait: "/images/portrait-hotesse.jpg",
  portraitYellow: "/images/portrait-jaune.jpg",
  service: "/images/service-boisson.jpg",
};

/** Emplacements d'images remplaçables depuis l'admin (« Images du site ») */
export const slotDefaults = {
  hero: img.team,
  conviction1: img.portrait,
  conviction2: img.hostessBack,
  recruitHome: img.portraitYellow,
  service_accueil: img.team,
  service_reception: img.service,
  service_organisation: img.weddingDance,
  service_promotion: img.crowd,
  universe_pro: img.conference,
  universe_prive: img.weddingReception,
  universe_institution: img.stage,
  universe_culture: img.drums,
  about_hero: img.team,
  about_story: img.hostessBack,
  services_hero: img.conference,
  realisations_hero: img.festival,
  recrutement_hero: img.portraitYellow,
  contact_hero: img.weddingDance,
};
export type SlotKey = keyof typeof slotDefaults;
export type Slots = Record<SlotKey, string>;

export type GalleryPhoto = { id?: string; url: string; title: string; category: string; tall?: boolean };

export const services = [
  {
    slug: "accueil",
    n: "01",
    title: "Hôtesses & protocole",
    short: "Une première impression qui fait la différence.",
    text: "Accueillir, orienter et accompagner vos invités, de l'entrée jusqu'à leur place.",
    image: "service_accueil" as SlotKey,
    color: "from-bordeaux to-wine",
    items: ["Accueil et orientation des invités", "Listes, badges et émargements", "Accueil des VIP et officiels", "Protocole et placement"],
  },
  {
    slug: "reception",
    n: "02",
    title: "Service en réception",
    short: "Un service attentif, des invités comblés.",
    text: "Un personnel encadré pendant vos cocktails, buffets et cérémonies.",
    image: "service_reception" as SlotKey,
    color: "from-ruby to-bordeaux",
    items: ["Service de boissons et collations", "Cocktails et buffets", "Espaces VIP", "Lien avec le traiteur"],
  },
  {
    slug: "organisation",
    n: "03",
    title: "Organisation d'événements",
    short: "Vous imaginez, nous réalisons.",
    text: "De l'idée au bilan : lieux, prestataires, planning et équipes coordonnés.",
    image: "service_organisation" as SlotKey,
    color: "from-magenta to-bordeaux",
    items: ["Concept et planning", "Lieux et prestataires", "Coordination du jour J", "Bilan après l'événement"],
  },
  {
    slug: "promotion",
    n: "04",
    title: "Accueil promotionnel",
    short: "Votre marque, portée avec élégance.",
    text: "Des hôtesses briefées pour vos lancements, salons et campagnes.",
    image: "service_promotion" as SlotKey,
    color: "from-gold-deep to-bordeaux",
    items: ["Lancements de produits", "Stands, salons et foires", "Distribution de supports", "Présentation après briefing"],
  },
];

export const universes = [
  { title: "Professionnels", text: "Conférences, séminaires, salons, lancements.", image: "universe_pro" as SlotKey },
  { title: "Privés", text: "Mariages, anniversaires, baptêmes, galas.", image: "universe_prive" as SlotKey },
  { title: "Institutionnels", text: "Cérémonies officielles, ateliers, ONG.", image: "universe_institution" as SlotKey },
  { title: "Culturels", text: "Festivals, spectacles, défilés, expositions.", image: "universe_culture" as SlotKey },
];

export const values = [
  { title: "Hospitalité", text: "Chaque invité reçu avec attention." },
  { title: "Élégance", text: "Une tenue et une posture soignées." },
  { title: "Professionnalisme", text: "Des engagements toujours tenus." },
  { title: "Discipline", text: "Ponctualité et rigueur." },
  { title: "Respect", text: "Dignité et considération mutuelle." },
  { title: "Esprit d'équipe", text: "Ensemble, pour un service harmonieux." },
  { title: "Authenticité", text: "Notre culture, avec un regard moderne." },
];

export const steps = [
  { title: "Vous nous contactez", text: "Type d'événement, date, lieu et nombre d'invités." },
  { title: "Nous vous proposons", text: "Une offre sur mesure : hôtesses, durée, tenue." },
  { title: "Le jour J", text: "Une équipe briefée, guidée par un coordinateur." },
];

export const faq = [
  { q: "Peut-on demander uniquement des hôtesses ?", a: "Oui. Vous pouvez demander seulement du personnel d'accueil, sans nous confier toute l'organisation." },
  { q: "Où intervenez-vous ?", a: "En priorité à Bobo-Dioulasso, et aussi à Ouagadougou ou ailleurs selon le projet." },
  { q: "Comment demander un devis ?", a: "Remplissez le formulaire « Demander un devis » ou écrivez-nous sur WhatsApp. Nous vous répondons avec une proposition." },
  { q: "Comment devenir hôtesse Hostella ?", a: "Déposez votre candidature dans la page Recrutement. Nous vous contactons lors des sessions de sélection." },
];
