import { Loader2, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Badge, ConfirmDialog, DL, Drawer, EmptyState, ErrorState, Loading, MISSION_STATUS, Modal, PageHead, SearchInput, StatusBadge, Tabs } from '../components/ui';
import { useApi, useDebounced } from '../hooks/use-api';
import { api, errorMessage } from '../services/api';
import type { Hostess } from '../services/types';
import { fmtDate, waTo } from '../utils/format';

const LANGS = ['Français', 'Dioula', 'Mooré', 'Fulfuldé', 'Anglais'];

export function HostessesPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'active'>('active');
  const [editing, setEditing] = useState<Hostess | 'new' | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const search = useDebounced(q);
  const { data, loading, error, reload } = useApi(() => api.get<Hostess[]>('/hostesses', { q: search, active: filter === 'active' ? 1 : undefined }), [search, filter]);

  return (
    <div>
      <PageHead
        docRef="Fichier du personnel"
        title="Équipe d’hôtesses"
        subtitle="Les hôtesses mobilisables pour les missions. Une candidate retenue peut être ajoutée depuis « Candidatures »."
        actions={<button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={16} /> Nouvelle hôtesse</button>}
      />
      <div className="toolbar">
        <Tabs value={filter} onChange={setFilter} options={[{ value: 'active', label: 'Actives' }, { value: 'all', label: 'Toutes' }]} />
        <SearchInput value={q} onChange={setQ} placeholder="Nom, téléphone, ville…" />
      </div>
      <div className="card card-flush">
        {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.length ? (
          <EmptyState text="Aucune hôtesse enregistrée pour l’instant." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Nom</th><th>Téléphone</th><th>Ville</th><th>Langues</th><th>Missions</th><th>Prochaine mission</th><th>État</th></tr></thead>
              <tbody>
                {data.map((h) => (
                  <tr key={h.id} className="clickable" onClick={() => setOpenId(h.id)}>
                    <td className="cell-main">{h.lastName.toUpperCase()} {h.firstName}</td>
                    <td className="nowrap">{h.phone}</td>
                    <td>{h.city}</td>
                    <td>{h.languages.join(', ') || '—'}</td>
                    <td>{h._count?.assignments ?? 0}</td>
                    <td>{h.assignments?.[0] ? <><div>{h.assignments[0].mission.title}</div><div className="cell-sub">{fmtDate(h.assignments[0].mission.startAt)}</div></> : <span className="muted">Disponible</span>}</td>
                    <td>{h.isActive ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editing && <HostessForm hostess={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {openId && (
        <HostessDrawer id={openId} onClose={() => setOpenId(null)} onEdit={(h) => { setOpenId(null); setEditing(h); }} onDeleted={() => { setOpenId(null); reload(); }} />
      )}
    </div>
  );
}

function HostessDrawer({ id, onClose, onEdit, onDeleted }: { id: string; onClose: () => void; onEdit: (h: Hostess) => void; onDeleted: () => void }) {
  const { data: h, loading, error } = useApi(() => api.get<Hostess>(`/hostesses/${id}`), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    await api.delete(`/hostesses/${id}`).catch(() => undefined);
    onDeleted();
  };
  return (
    <Drawer
      docRef="Fiche hôtesse"
      title={h ? `${h.firstName} ${h.lastName}` : '…'}
      onClose={onClose}
      footer={h && (
        <>
          <a className="btn btn-whatsapp" href={waTo(h.phone, `Bonjour ${h.firstName}, `)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a className="btn btn-secondary" href={`tel:${h.phone}`}><Phone size={15} /> Appeler</a>
          <button className="btn btn-secondary" onClick={() => onEdit(h)}><Pencil size={15} /> Modifier</button>
          <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirm(true)}><Trash2 size={15} /></button>
        </>
      )}
    >
      {loading && !h ? <Loading /> : error || !h ? <ErrorState message={error ?? 'Erreur'} /> : (
        <>
          <DL rows={[
            ['État', h.isActive ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>],
            ['Téléphone', h.phone],
            ['E-mail', h.email ?? '—'],
            ['Ville', h.city],
            ['Langues', h.languages.length ? h.languages.map((l) => <span key={l} className="chip">{l}</span>) : '—'],
            ['Candidature', h.application?.reference ?? '—'],
            ['Dans l’équipe depuis', fmtDate(h.createdAt)],
          ]} />
          {h.note && <div className="quote-text">{h.note}</div>}
          <div>
            <div className="field" style={{ marginBottom: 6 }}><span>Historique des missions</span></div>
            {!h.assignments?.length ? <p className="muted small">Aucune mission pour l’instant.</p> : (
              <table className="table card" style={{ padding: 0 }}>
                <tbody>
                  {h.assignments.map((a) => (
                    <tr key={a.mission.id}>
                      <td><div className="cell-main">{a.mission.title}</div><div className="cell-sub">{a.mission.location} · <span className="mono">{a.mission.reference}</span></div></td>
                      <td className="nowrap">{fmtDate(a.mission.startAt)}</td>
                      <td>{a.mission.status && <StatusBadge map={MISSION_STATUS} value={a.mission.status} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
      {confirm && <ConfirmDialog title="Retirer cette hôtesse ?" message="Sa fiche et ses affectations seront supprimées. Pour la garder en mémoire, rendez-la plutôt « inactive »." confirmLabel="Supprimer" danger busy={busy} onConfirm={remove} onCancel={() => setConfirm(false)} />}
    </Drawer>
  );
}

function HostessForm({ hostess, onClose, onSaved }: { hostess: Hostess | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    firstName: hostess?.firstName ?? '',
    lastName: hostess?.lastName ?? '',
    phone: hostess?.phone ?? '',
    email: hostess?.email ?? '',
    city: hostess?.city ?? 'Bobo-Dioulasso',
    languages: hostess?.languages ?? ['Français'],
    isActive: hostess?.isActive ?? true,
    note: hostess?.note ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (hostess) await api.put(`/hostesses/${hostess.id}`, f);
      else await api.post('/hostesses', f);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={hostess ? 'Modifier la fiche' : 'Nouvelle hôtesse'}
      onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Annuler</button><button className="btn btn-primary" form="hostess-form" disabled={busy}>{busy && <Loader2 className="spin" size={15} />} Enregistrer</button></>}
    >
      <form id="hostess-form" onSubmit={submit} className="form-grid">
        <label className="field"><span>Prénom *</span><input required value={f.firstName} onChange={(e) => set('firstName', e.target.value)} /></label>
        <label className="field"><span>Nom *</span><input required value={f.lastName} onChange={(e) => set('lastName', e.target.value)} /></label>
        <label className="field"><span>Téléphone *</span><input required value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+226 …" /></label>
        <label className="field"><span>E-mail</span><input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></label>
        <label className="field"><span>Ville</span><input value={f.city} onChange={(e) => set('city', e.target.value)} /></label>
        <div className="field">
          <span>Langues</span>
          <div className="row" style={{ gap: 6 }}>
            {LANGS.map((l) => (
              <label key={l} className="check" style={{ marginBottom: 0 }}>
                <input type="checkbox" checked={f.languages.includes(l)} onChange={(e) => set('languages', e.target.checked ? [...f.languages, l] : f.languages.filter((x) => x !== l))} /> {l}
              </label>
            ))}
          </div>
        </div>
        <label className="field full"><span>Notes</span><textarea rows={3} value={f.note} onChange={(e) => set('note', e.target.value)} placeholder="Taille d’uniforme, points forts, remarques…" /></label>
        <label className="check full"><input type="checkbox" checked={f.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active (peut être affectée aux missions)</label>
      </form>
      {error && <div className="alert">{error}</div>}
    </Modal>
  );
}
