import { Loader2, Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { ErrorState, Loading, PageHead } from '../components/ui';
import { useApi } from '../hooks/use-api';
import { api, errorMessage } from '../services/api';
import type { Contacts, Settings } from '../services/types';

const FIELDS: { key: keyof Contacts; label: string; hint?: string; full?: boolean }[] = [
  { key: 'whatsapp', label: 'WhatsApp professionnel *', hint: 'Format international : +226 70 43 82 76. Utilisé par tous les boutons WhatsApp et les formulaires.' },
  { key: 'phone', label: 'Téléphone *' },
  { key: 'email', label: 'E-mail *' },
  { key: 'city', label: 'Ville affichée *' },
  { key: 'zone', label: 'Zone d’intervention', full: true },
  { key: 'facebook', label: 'Page Facebook', hint: 'Lien complet https://…' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'linkedin', label: 'LinkedIn' },
];

export function ContactsPage() {
  const { data, loading, error, reload } = useApi(() => api.get<Settings>('/settings'), []);
  const [f, setF] = useState<Contacts | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (data) setF(data.contacts);
  }, [data]);

  if (loading && !data) return <Loading />;
  if (error || !data || !f) return <ErrorState message={error ?? 'Chargement…'} onRetry={reload} />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      setF(await api.put<Contacts>('/settings/contacts', f));
      setMsg({ text: 'Coordonnées enregistrées. Le site se met à jour en moins d’une minute.', ok: true });
    } catch (err) {
      setMsg({ text: errorMessage(err), ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHead docRef="Site public · Contacts" title="Coordonnées" subtitle="Ces informations apparaissent dans le menu, le pied de page, la page Contact et les boutons WhatsApp du site." />
      <form className="card" style={{ marginTop: 18, maxWidth: 820 }} onSubmit={submit}>
        <div className="form-grid">
          {FIELDS.map((x) => (
            <label key={x.key} className={`field ${x.full ? 'full' : ''}`}>
              <span>{x.label}</span>
              <input value={f[x.key]} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} required={x.label.endsWith('*')} />
              {x.hint && <small className="field-hint">{x.hint}</small>}
            </label>
          ))}
        </div>
        {msg && <div className={msg.ok ? 'success' : 'alert'} style={{ marginBottom: 12 }}>{msg.text}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? <Loader2 className="spin" size={15} /> : <Save size={15} />} Enregistrer</button>
      </form>
    </div>
  );
}
