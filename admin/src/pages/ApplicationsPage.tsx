import { Loader2, Phone, Save, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { useCounts } from '../components/Layout';
import { APP_STATUS, ConfirmDialog, DL, Drawer, EmptyState, ErrorState, Loading, PageHead, Pagination, SearchInput, StatusBadge, Tabs } from '../components/ui';
import { useApi, useDebounced } from '../hooks/use-api';
import { api, errorMessage } from '../services/api';
import type { Application, ApplicationStatus, Paged } from '../services/types';
import { ago, fmtDateTime, waTo } from '../utils/format';

type Filter = '' | ApplicationStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: '', label: 'Toutes (hors archives)' },
  { value: 'NOUVELLE', label: 'Nouvelles' },
  { value: 'ENTRETIEN', label: 'Entretien' },
  { value: 'RETENUE', label: 'Retenues' },
  { value: 'REFUSEE', label: 'Refusées' },
  { value: 'ARCHIVEE', label: 'Archivées' },
];

export function ApplicationsPage() {
  const [status, setStatus] = useState<Filter>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Application | null>(null);
  const search = useDebounced(q);
  const { data, setData, loading, error, reload } = useApi(
    () => api.get<Paged<Application> & { counts: Record<string, number> }>('/applications', { status, q: search, page }),
    [status, search, page],
  );
  const replace = (a: Application) => {
    setData((d) => (d ? { ...d, items: d.items.map((x) => (x.id === a.id ? { ...x, ...a } : x)) } : d));
    setOpen((o) => (o && o.id === a.id ? { ...o, ...a } : o));
  };

  return (
    <div>
      <PageHead docRef="Registre du personnel" title="Candidatures" subtitle="Les candidatures envoyées depuis la page Recrutement du site." />
      <div className="toolbar">
        <Tabs value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={FILTERS.map((f) => ({ ...f, count: f.value ? data?.counts[f.value] : undefined }))} />
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Nom, téléphone, ville…" />
      </div>
      <div className="card card-flush">
        {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? (
          <EmptyState text="Aucune candidature dans ce registre." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Réf.</th><th>Candidate</th><th>Ville</th><th>Disponibilités</th><th>Langues</th><th>Reçue</th><th>Statut</th></tr></thead>
                <tbody>
                  {data.items.map((x) => (
                    <tr key={x.id} className={`clickable ${x.status === 'NOUVELLE' ? 'is-unread' : ''}`} onClick={() => setOpen(x)}>
                      <td className="mono nowrap">{x.reference}</td>
                      <td><div className="cell-main">{x.fullName}</div><div className="cell-sub">{x.phone}{x.age ? ` · ${x.age} ans` : ''}</div></td>
                      <td>{x.city}</td>
                      <td>{x.availability.join(', ')}</td>
                      <td>{x.languages.join(', ') || '—'}</td>
                      <td className="nowrap cell-sub">{ago(x.createdAt)}</td>
                      <td><StatusBadge map={APP_STATUS} value={x.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </div>
      {open && <ApplicationDrawer app={open} onClose={() => setOpen(null)} onUpdated={replace} onDeleted={() => { setOpen(null); reload(); }} />}
    </div>
  );
}

function ApplicationDrawer({ app, onClose, onUpdated, onDeleted }: { app: Application; onClose: () => void; onUpdated: (a: Application) => void; onDeleted: () => void }) {
  const { refresh } = useCounts();
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = async (body: Partial<Application>, key: string) => {
    setBusy(key);
    setMsg(null);
    try {
      onUpdated(await api.patch<Application>(`/applications/${app.id}`, body));
      refresh();
      if (key === 'note') setMsg({ text: 'Note enregistrée.', ok: true });
    } catch (e) {
      setMsg({ text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  };

  const toHostess = async () => {
    setBusy('hostess');
    try {
      const h = await api.post<{ id: string }>(`/applications/${app.id}/hostess`);
      onUpdated({ ...app, status: 'RETENUE', hostess: { id: h.id } });
      refresh();
      setMsg({ text: `${app.fullName} a été ajoutée à l’équipe (page Hôtesses).`, ok: true });
    } catch (e) {
      setMsg({ text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await api.delete(`/applications/${app.id}`);
      refresh();
      onDeleted();
    } catch (e) {
      setMsg({ text: errorMessage(e) });
      setBusy(null);
    }
  };

  return (
    <Drawer
      docRef={app.reference}
      title={app.fullName}
      onClose={onClose}
      footer={
        <>
          <a className="btn btn-whatsapp" href={waTo(app.phone, `Bonjour ${app.fullName}, ici Hostella Agency au sujet de votre candidature (${app.reference}).`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a className="btn btn-secondary" href={`tel:${app.phone}`}><Phone size={15} /> Appeler</a>
          <button className="btn btn-gold" onClick={toHostess} disabled={!!busy || !!app.hostess}>
            {busy === 'hostess' ? <Loader2 className="spin" size={15} /> : <UserPlus size={15} />} {app.hostess ? 'Déjà dans l’équipe' : 'Ajouter à l’équipe'}
          </button>
          <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)}><Trash2 size={15} /></button>
        </>
      }
    >
      {msg && <div className={msg.ok ? 'success' : 'alert'}>{msg.text}</div>}
      <label className="field" style={{ marginBottom: 0 }}>
        <span>Statut</span>
        <select value={app.status} onChange={(e) => void patch({ status: e.target.value as ApplicationStatus }, 'status')} disabled={!!busy}>
          {Object.entries(APP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </label>
      <DL rows={[
        ['Ville', app.city],
        ['Téléphone', <a className="link" href={`tel:${app.phone}`}>{app.phone}</a>],
        ['E-mail', app.email ?? '—'],
        ['Âge', app.age ? `${app.age} ans` : '—'],
        ['Disponibilités', app.availability.map((s) => <span key={s} className="chip">{s}</span>)],
        ['Langues', app.languages.length ? app.languages.map((s) => <span key={s} className="chip">{s}</span>) : '—'],
        ['Reçue le', fmtDateTime(app.createdAt)],
      ]} />
      {app.experience && (<div><div className="field" style={{ marginBottom: 6 }}><span>Expérience</span></div><div className="quote-text">{app.experience}</div></div>)}
      {app.motivation && (<div><div className="field" style={{ marginBottom: 6 }}><span>Motivation</span></div><div className="quote-text">{app.motivation}</div></div>)}
      <label className="field">
        <span>Notes d’entretien</span>
        <textarea rows={4} value={note ?? app.adminNote ?? ''} onChange={(e) => setNote(e.target.value)} placeholder="Présentation, aisance, ponctualité, mise en situation…" />
      </label>
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: -6 }}>
        <button className="btn btn-secondary btn-sm" disabled={note === null || busy === 'note'} onClick={() => void patch({ adminNote: note ?? '' }, 'note')}>
          {busy === 'note' ? <Loader2 className="spin" size={14} /> : <Save size={14} />} Enregistrer la note
        </button>
      </div>
      {confirmDelete && (
        <ConfirmDialog title="Supprimer la candidature ?" message="Elle sera définitivement effacée. Préférez « Archivée » pour la garder." confirmLabel="Supprimer" danger busy={busy === 'delete'} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
      )}
    </Drawer>
  );
}
