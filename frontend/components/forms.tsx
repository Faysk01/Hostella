"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Building2, Check, Copy, Heart, Loader2, Mail, Music, PartyPopper, Send, Sparkles, Users } from "lucide-react";
import { useContent } from "./ContentProvider";
import { WhatsAppIcon } from "./ui";

/* Les formulaires enregistrent la demande dans l'espace admin (API).
   Si l'API est injoignable, ils basculent sur WhatsApp avec le message pré-rempli. */

type SendResult = { mode: "saved"; reference?: string } | { mode: "whatsapp" };

/** Envoie un formulaire à l'API. `network: true` = API injoignable → repli WhatsApp */
async function postForm(apiUrl: string, path: string, body: unknown): Promise<{ ok: true; reference?: string } | { ok: false; network: boolean; message: string }> {
  if (!apiUrl) return { ok: false, network: true, message: "" };
  try {
    const res = await fetch(`${apiUrl}/api/public/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "1" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(75000), // le serveur gratuit peut mettre ~1 min à se réveiller
    });
    const json = await res.json().catch(() => null);
    if (res.ok) return { ok: true, reference: json?.data?.reference };
    if (res.status >= 500) return { ok: false, network: true, message: "" };
    return { ok: false, network: false, message: json?.message ?? "Vérifiez les informations saisies." };
  } catch {
    return { ok: false, network: true, message: "" };
  }
}

/** Après 5 s d'attente : on rassure le visiteur (serveur en train de se réveiller) */
function SlowHint({ active, className = "" }: { active: boolean; className?: string }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return setSlow(false);
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, [active]);
  if (!slow) return null;
  return <p className={`text-sm text-white/60 ${className}`}>Connexion au serveur… encore quelques secondes, merci de patienter.</p>;
}

/** Champ invisible anti-robot */
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={value} onChange={(e) => onChange(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

function Choice({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left font-semibold transition-colors md:p-5 ${
        active ? "border-gold bg-gold/10 text-white" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30"
      }`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${active ? "bg-gold text-ink" : "bg-white/10 text-gold"}`}>{icon}</span>
      <span className="flex-1">{label}</span>
      <AnimatePresence>
        {active && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="grid h-6 w-6 place-items-center rounded-full bg-gold text-ink">
            <Check className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-sm font-bold text-white/80">{children}</span>;
}

/* =========================================================
   Formulaire « Demander un devis » en 4 étapes
   ========================================================= */
const eventTypes = [
  { v: "Mariage / réception privée", i: <Heart className="h-5 w-5" /> },
  { v: "Conférence / séminaire", i: <Users className="h-5 w-5" /> },
  { v: "Événement d'entreprise / lancement", i: <Briefcase className="h-5 w-5" /> },
  { v: "Cérémonie officielle / institutionnelle", i: <Building2 className="h-5 w-5" /> },
  { v: "Événement culturel / festival", i: <Music className="h-5 w-5" /> },
  { v: "Autre événement", i: <PartyPopper className="h-5 w-5" /> },
];
const prestations = [
  "Hôtesses et personnel d'accueil",
  "Service pendant la réception",
  "Organisation / coordination",
  "Accueil promotionnel / marque",
];

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const { apiUrl } = useContent();
  const [sent, setSent] = useState<SendResult | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trap, setTrap] = useState("");
  const [d, setD] = useState({
    type: "",
    prestations: [] as string[],
    ville: "Bobo-Dioulasso",
    date: "",
    invites: "",
    hotesses: "",
    nom: "",
    tel: "",
    email: "",
    message: "",
  });
  const set = (k: keyof typeof d, v: string) => setD((p) => ({ ...p, [k]: v }));
  const togglePrest = (p: string) =>
    setD((s) => ({ ...s, prestations: s.prestations.includes(p) ? s.prestations.filter((x) => x !== p) : [...s.prestations, p] }));

  const canNext = [d.type !== "", d.prestations.length > 0, d.ville.trim() !== "" && d.date !== "", d.nom.trim() !== "" && d.tel.trim().length >= 8][step];
  const titles = ["Votre événement", "Prestations souhaitées", "Détails pratiques", "Vos coordonnées"];

  const summary = [
    "Bonjour Hostella Agency, je souhaite une proposition pour mon événement.",
    "",
    `• Type d'événement : ${d.type}`,
    `• Prestation(s) : ${d.prestations.join(", ")}`,
    `• Ville : ${d.ville}`,
    `• Date : ${d.date ? new Date(d.date + "T00:00").toLocaleDateString("fr-FR", { dateStyle: "long" }) : "-"}`,
    `• Nombre d'invités estimé : ${d.invites || "-"}`,
    `• Nombre d'hôtesses souhaité : ${d.hotesses || "à définir"}`,
    "",
    `Nom : ${d.nom}`,
    `Téléphone : ${d.tel}`,
    d.email ? `E-mail : ${d.email}` : "",
    d.message ? `\nInformations complémentaires : ${d.message}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const submit = async () => {
    setSending(true);
    setError(null);
    const r = await postForm(apiUrl, "quotes", {
      eventType: d.type,
      services: d.prestations,
      city: d.ville,
      eventDate: d.date,
      guests: d.invites,
      hostesses: d.hotesses,
      fullName: d.nom,
      phone: d.tel,
      email: d.email,
      message: d.message,
      website: trap,
    });
    setSending(false);
    if (r.ok) setSent({ mode: "saved", reference: r.reference });
    else if (r.network) setSent({ mode: "whatsapp" });
    else setError(r.message);
  };

  if (sent) return <Success summary={summary} result={sent} onBack={() => setSent(null)} kind="devis" />;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-night-2/80 p-5 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
      {/* Progression */}
      <div className="mb-8 flex items-center gap-2">
        {titles.map((t, i) => (
          <button key={t} type="button" onClick={() => i < step && go(i)} className="flex-1 text-left" aria-label={`Étape ${i + 1} : ${t}`}>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full bg-gradient-to-r from-magenta to-gold" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
            </div>
            <span className={`mt-2 hidden text-xs font-bold md:block ${i === step ? "text-gold" : "text-white/40"}`}>
              {i + 1}. {t}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.25em] text-magenta">Étape {step + 1} / 4</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold text-white md:text-4xl">{titles[step]}</h2>

      <div className="relative mt-7 min-h-[300px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {eventTypes.map((e) => (
                  <Choice key={e.v} active={d.type === e.v} onClick={() => set("type", e.v)} icon={e.i} label={e.v} />
                ))}
              </div>
            )}
            {step === 1 && (
              <>
                <p className="mb-4 text-white/60">Plusieurs choix possibles.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {prestations.map((p) => (
                    <Choice key={p} active={d.prestations.includes(p)} onClick={() => togglePrest(p)} icon={<Sparkles className="h-5 w-5" />} label={p} />
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <Label>Ville *</Label>
                  <input className="field" value={d.ville} onChange={(e) => set("ville", e.target.value)} placeholder="Bobo-Dioulasso" />
                </label>
                <label>
                  <Label>Date de l&apos;événement *</Label>
                  <input type="date" className="field" value={d.date} onChange={(e) => set("date", e.target.value)} />
                </label>
                <label>
                  <Label>Nombre d&apos;invités (estimé)</Label>
                  <input type="number" min={1} inputMode="numeric" className="field" value={d.invites} onChange={(e) => set("invites", e.target.value)} placeholder="Ex. 250" />
                </label>
                <label>
                  <Label>Nombre d&apos;hôtesses souhaité</Label>
                  <input type="number" min={1} inputMode="numeric" className="field" value={d.hotesses} onChange={(e) => set("hotesses", e.target.value)} placeholder="Ex. 6 (ou à définir)" />
                </label>
                <label className="sm:col-span-2">
                  <Label>Informations complémentaires</Label>
                  <textarea rows={4} className="field resize-none" value={d.message} onChange={(e) => set("message", e.target.value)} placeholder="Horaires, lieu, tenue souhaitée, invités VIP…" />
                </label>
              </div>
            )}
            {step === 3 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <Label>Nom et prénom / structure *</Label>
                  <input className="field" value={d.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Ex. Awa Traoré — Société X" autoComplete="name" />
                </label>
                <label>
                  <Label>Téléphone / WhatsApp *</Label>
                  <input type="tel" className="field" value={d.tel} onChange={(e) => set("tel", e.target.value)} placeholder="+226 …" autoComplete="tel" />
                </label>
                <label>
                  <Label>E-mail (facultatif)</Label>
                  <input type="email" className="field" value={d.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.com" autoComplete="email" />
                </label>
                <p className="text-sm text-white/45 sm:col-span-2">Vos informations servent uniquement à préparer votre proposition. Elles ne sont jamais cédées à des tiers.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-bold text-white/70 transition hover:text-white disabled:invisible">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        {step < 3 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => go(step + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep px-7 py-3.5 font-extrabold text-ink transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            Continuer <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canNext || sending}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep px-7 py-3.5 font-extrabold text-ink transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Envoyer ma demande
          </button>
        )}
      </div>
      <Honeypot value={trap} onChange={setTrap} />
      <SlowHint active={sending} className="mt-4 text-right" />
      {error && <p className="mt-4 rounded-xl bg-magenta/15 px-4 py-3 text-sm font-semibold text-white">{error}</p>}
    </div>
  );
}

/* =========================================================
   Formulaire de candidature
   ========================================================= */
const langs = ["Français", "Dioula", "Mooré", "Fulfuldé", "Anglais", "Autre"];
const dispos = ["Week-ends", "Soirées", "En semaine", "Flexible"];

export function ApplicationForm() {
  const { apiUrl } = useContent();
  const [sent, setSent] = useState<SendResult | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trap, setTrap] = useState("");
  const [consent, setConsent] = useState(false);
  const [d, setD] = useState({ nom: "", ville: "Bobo-Dioulasso", tel: "", email: "", age: "", experience: "", motivation: "" });
  const [l, setL] = useState<string[]>(["Français"]);
  const [dispo, setDispo] = useState<string[]>([]);
  const set = (k: keyof typeof d, v: string) => setD((p) => ({ ...p, [k]: v }));
  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const ok = d.nom.trim() && d.ville.trim() && d.tel.trim().length >= 8 && dispo.length > 0 && consent;
  const summary = [
    "Bonjour Hostella Agency, je souhaite rejoindre votre vivier d'hôtesses.",
    "",
    `Nom et prénom : ${d.nom}`,
    `Ville : ${d.ville}`,
    `Téléphone : ${d.tel}`,
    d.email ? `E-mail : ${d.email}` : "",
    d.age ? `Âge : ${d.age} ans` : "",
    `Disponibilités : ${dispo.join(", ")}`,
    `Langues parlées : ${l.join(", ")}`,
    `Expérience : ${d.experience || "Débutante, motivée pour apprendre"}`,
    d.motivation ? `\nMotivation : ${d.motivation}` : "",
    "",
    "(Je peux vous envoyer mon CV et une photo dans cette conversation.)",
  ]
    .filter((x) => x !== "")
    .join("\n");

  if (sent) return <Success summary={summary} result={sent} onBack={() => setSent(null)} kind="candidature" />;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ok) return;
        setSending(true);
        setError(null);
        const r = await postForm(apiUrl, "applications", {
          fullName: d.nom,
          city: d.ville,
          phone: d.tel,
          email: d.email,
          age: d.age,
          availability: dispo,
          languages: l,
          experience: d.experience,
          motivation: d.motivation,
          consent: true,
          website: trap,
        });
        setSending(false);
        if (r.ok) setSent({ mode: "saved", reference: r.reference });
        else if (r.network) setSent({ mode: "whatsapp" });
        else setError(r.message);
      }}
      className="relative grid gap-5 rounded-[2rem] border border-white/10 bg-night-2/80 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:grid-cols-2 md:p-10"
    >
      <label className="sm:col-span-2">
        <Label>Nom et prénom *</Label>
        <input required className="field" value={d.nom} onChange={(e) => set("nom", e.target.value)} autoComplete="name" />
      </label>
      <label>
        <Label>Ville *</Label>
        <input required className="field" value={d.ville} onChange={(e) => set("ville", e.target.value)} />
      </label>
      <label>
        <Label>Téléphone / WhatsApp *</Label>
        <input required type="tel" className="field" value={d.tel} onChange={(e) => set("tel", e.target.value)} placeholder="+226 …" autoComplete="tel" />
      </label>
      <label>
        <Label>E-mail (facultatif)</Label>
        <input type="email" className="field" value={d.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
      </label>
      <label>
        <Label>Âge (facultatif)</Label>
        <input type="number" min={18} max={60} inputMode="numeric" className="field" value={d.age} onChange={(e) => set("age", e.target.value)} />
      </label>

      <div className="sm:col-span-2">
        <Label>Disponibilités *</Label>
        <div className="flex flex-wrap gap-2">
          {dispos.map((x) => (
            <Chip key={x} on={dispo.includes(x)} onClick={() => toggle(dispo, setDispo, x)}>
              {x}
            </Chip>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <Label>Langues parlées</Label>
        <div className="flex flex-wrap gap-2">
          {langs.map((x) => (
            <Chip key={x} on={l.includes(x)} onClick={() => toggle(l, setL, x)}>
              {x}
            </Chip>
          ))}
        </div>
      </div>
      <label className="sm:col-span-2">
        <Label>Expérience (accueil, hôtellerie, restauration, événementiel…)</Label>
        <textarea rows={3} className="field resize-none" value={d.experience} onChange={(e) => set("experience", e.target.value)} placeholder="Débutante ? Pas de souci : la motivation compte !" />
      </label>
      <label className="sm:col-span-2">
        <Label>Pourquoi voulez-vous rejoindre Hostella ?</Label>
        <textarea rows={3} className="field resize-none" value={d.motivation} onChange={(e) => set("motivation", e.target.value)} />
      </label>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-white/65 sm:col-span-2">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-[#e8b53a]" />
        J&apos;accepte que Hostella Agency utilise ces informations uniquement pour étudier ma candidature. Elles restent confidentielles et ne sont jamais cédées à des tiers.
      </label>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/45">Le CV et la photo pourront être envoyés ensuite sur WhatsApp.</p>
        <Honeypot value={trap} onChange={setTrap} />
        <button
          type="submit"
          disabled={!ok || sending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep px-7 py-4 font-extrabold text-ink transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Envoyer ma candidature
        </button>
      </div>
      <SlowHint active={sending} className="sm:col-span-2" />
      {error && <p className="rounded-xl bg-magenta/15 px-4 py-3 text-sm font-semibold text-white sm:col-span-2">{error}</p>}
    </form>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${on ? "border-gold bg-gold text-ink" : "border-white/15 text-white/70 hover:border-white/40"}`}
    >
      {children}
    </motion.button>
  );
}

/* Écran de confirmation animé */
function Success({ summary, result, onBack, kind }: { summary: string; result: SendResult; onBack: () => void; kind: "devis" | "candidature" }) {
  const { site, wa } = useContent();
  const [copied, setCopied] = useState(false);
  const saved = result.mode === "saved";
  const box = useRef<HTMLDivElement>(null);
  // Ramène la confirmation à l'écran (le formulaire était plus haut)
  useEffect(() => box.current?.scrollIntoView({ behavior: "smooth", block: "center" }), []);
  return (
    <motion.div
      ref={box}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-night-2 p-8 text-center md:p-14"
    >
      <div className="pattern-diamonds absolute inset-0 opacity-[0.06]" />
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className={`absolute left-1/2 top-24 h-2 w-2 rotate-45 ${i % 2 ? "bg-gold" : "bg-magenta"}`}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 180, y: Math.sin((i / 14) * Math.PI * 2) * 120, opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-ink"
      >
        <Check className="h-10 w-10" strokeWidth={3} />
      </motion.div>
      <h3 className="font-display relative mt-6 text-3xl font-extrabold text-white md:text-4xl">
        {saved ? (kind === "devis" ? "Demande bien reçue !" : "Candidature bien reçue !") : kind === "devis" ? "Votre demande est prête !" : "Votre candidature est prête !"}
      </h3>
      {saved && result.reference && (
        <p className="relative mt-3 text-sm text-white/60">
          Référence : <span className="font-mono font-bold tracking-wider text-gold">{result.reference}</span>
        </p>
      )}
      <p className="relative mx-auto mt-3 max-w-md text-white/70">
        {saved
          ? kind === "devis"
            ? "Notre équipe étudie votre demande et vous recontacte très vite. Pour aller plus vite, écrivez-nous aussi sur WhatsApp."
            : "Merci ! Nous vous contacterons lors de la prochaine session de sélection. Vous pouvez nous envoyer votre CV et une photo sur WhatsApp."
          : "Appuyez sur le bouton WhatsApp ci-dessous : votre message est déjà rédigé, il ne reste qu’à l’envoyer."}
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <a href={wa(summary)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-3 font-bold text-[#06260f]">
          <WhatsAppIcon className="h-5 w-5" /> {saved ? "Écrire sur WhatsApp" : "Envoyer sur WhatsApp"}
        </a>
        <a href={`mailto:${site.email}?subject=${encodeURIComponent(kind === "devis" ? "Demande de devis" : "Candidature hôtesse")}&body=${encodeURIComponent(summary)}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-bold text-white">
          <Mail className="h-5 w-5" /> Par e-mail
        </a>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(summary).then(() => setCopied(true)).catch(() => {});
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-bold text-white"
        >
          <Copy className="h-5 w-5" /> {copied ? "Copié !" : "Copier le message"}
        </button>
      </div>
      <button type="button" onClick={onBack} className="relative mt-6 text-sm font-semibold text-white/50 underline-offset-4 hover:underline">
        {saved ? "Envoyer une autre demande" : "Modifier ma demande"}
      </button>
    </motion.div>
  );
}

/* Petit formulaire de contact rapide */
export function QuickContact() {
  const { site, wa, apiUrl } = useContent();
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [msg, setMsg] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const text = `Bonjour Hostella Agency, je suis ${nom || "…"}.\n\n${msg}`;
  const ready = nom.trim().length >= 2 && msg.trim().length >= 5;

  const send = async () => {
    setState("sending");
    setError(null);
    const r = await postForm(apiUrl, "messages", { fullName: nom, phone: tel, message: msg, website: trap });
    if (r.ok) return setState("sent");
    setState("idle");
    setError(r.network ? "Envoi impossible pour le moment : utilisez WhatsApp ou l’e-mail ci-dessous." : r.message);
  };

  if (state === "sent") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center gap-3 rounded-[2rem] border border-gold/30 bg-night-2 p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-ink"><Check className="h-8 w-8" strokeWidth={3} /></span>
        <p className="font-display text-2xl font-extrabold text-white">Message envoyé !</p>
        <p className="text-white/65">Merci {nom.split(" ")[0]}, nous vous répondons très vite.</p>
        <button type="button" className="text-sm font-semibold text-white/50 underline-offset-4 hover:underline" onClick={() => { setMsg(""); setState("idle"); }}>Écrire un autre message</button>
      </motion.div>
    );
  }

  return (
    <div className="relative grid gap-4 rounded-[2rem] border border-white/10 bg-night-2/80 p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <Label>Votre nom *</Label>
          <input className="field" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" />
        </label>
        <label>
          <Label>Téléphone (facultatif)</Label>
          <input type="tel" className="field" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="+226 …" autoComplete="tel" />
        </label>
      </div>
      <label>
        <Label>Votre message *</Label>
        <textarea rows={5} className="field resize-none" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Bonjour, j'aimerais avoir des informations sur…" />
      </label>
      <Honeypot value={trap} onChange={setTrap} />
      <SlowHint active={state === "sending"} />
      {error && <p className="rounded-xl bg-magenta/15 px-4 py-3 text-sm font-semibold text-white">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!ready || state === "sending"}
          onClick={() => void send()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-light via-gold to-gold-deep px-6 py-3.5 font-extrabold text-ink transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Envoyer
        </button>
        <a
          href={wa(text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!msg.trim()}
          className={`inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-3.5 font-extrabold text-[#06260f] transition hover:scale-105 ${!msg.trim() ? "pointer-events-none opacity-40" : ""}`}
        >
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp
        </a>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent("Message depuis le site")}&body=${encodeURIComponent(text)}`}
          className={`inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-bold text-white transition hover:border-gold hover:text-gold ${!msg.trim() ? "pointer-events-none opacity-40" : ""}`}
        >
          <Mail className="h-5 w-5" /> E-mail
        </a>
      </div>
    </div>
  );
}
