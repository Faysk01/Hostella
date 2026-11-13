import { CalendarPlus, Loader2, Phone, Save, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useCounts } from '../components/Layout';
import { ConfirmDialog, DL, Drawer, EmptyState, ErrorState, Loading, MISSION_STATUS, PageHead, Pagination, QUOTE_STATUS, SearchInput, StatusBadge, Tabs } from '../components/ui';
import { useApi, useDebounced } from '../hooks/use-api';
import { api, errorMessage } from '../services/api';
import type { Paged, Quote, QuoteStatus } from '../services/types';
import { ago, fmtDate, fmtDateTime, fmtLong, waTo } from '../utils/format';

type Filter = '' | QuoteStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: '', label: 'Tous (hors archives)' },
  { value: 'NOUVEAU', label: 'Nouveaux' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'DEVIS_ENVOYE', label: 'Devis envoyé' },
  { value: 'ACCEPTE', label: 'Acceptés' },
  { value: 'REFUSE', label: 'Refusés' },
  { value: 'ARCHIVE', label: 'Archivés' },
];

export function QuotesPage() {
  const [status, setStatus] = useState<Filter>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const search = useDebounced(q);
  const { data, loading, error, reload } = useApi(
    () => api.get<Paged<Quote> & { counts: Record<string, number> }>('/quotes', { status, q: search, page }),
    [status, search, page],
  );

  return (
    <div>
      <PageHead docRef="Registre des demandes" title="Demandes de devis" subtitle="Les demandes envoyées depuis le formulaire « Demander un devis » du site." />
      <div className="toolbar">
        <Tabs value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={FILTERS.map((f) => ({ ...f, count: f.value ? data?.counts[f.value] : undefined }))} />
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Nom, téléphone, référence, ville…" />
      </div>
      <div className="card card-flush">
        {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? (
          <EmptyState text="Aucune demande dans ce registre." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Réf.</th><th>Client</th><th>Événement</th><th>Date prévue</th><th>Invités</th><th>Reçue</th><th>Statut</th></tr></thead>
                <tbody>
                  {data.items.map((x) => (
                    <tr key={x.id} className={`clickable ${x.status === 'NOUVEAU' ? 'is-unread' : ''}`} onClick={() => setOpenId(x.id)}>
                      <td className="mono nowrap">{x.reference}</td>
                      <td><div className="cell-main">{x.fullName}</div><div className="cell-sub">{x.phone}</div></td>
                      <td><div>{x.eventType}</div><div className="cell-sub">{x.city}</div></td>
                      <td className="nowrap">{fmtDate(x.eventDate)}</td>
                      <td>{x.guests ?? '—'}</td>
                      <td className="nowrap cell-sub">{ago(x.createdAt)}</td>
                      <td><StatusBadge map={QUOTE_STATUS} value={x.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </div>
      {openId && <QuoteDrawer id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
    </div>
  );
}

function QuoteDrawer({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const navigate = useNavigate();
  const { refresh } = useCounts();
  const { data: quote, setData, loading, error } = useApi(() => api.get<Quote>(`/quotes/${id}`), [id]);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = async (body: Partial<Quote>, key: string) => {
    setBusy(key);
    setMsg(null);
    try {
      const updated = await api.patch<Quote>(`/quotes/${id}`, body);
      setData((d) => (d ? { ...d, ...updated } : d));
      onChanged();
      refresh();
      if (key === 'note') setMsg('Note enregistrée.');
    } catch (e) {
      setMsg(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const toMission = async () => {
    setBusy('mission');
    try {
      await api.post(`/quotes/${id}/mission`);
      onChanged();
      refresh();
      navigate('/planning');
    } catch (e) {
      setMsg(errorMessage(e));
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await api.delete(`/quotes/${id}`);
      onChanged();
      refresh();
      onClose();
    } catch (e) {
      setMsg(errorMessage(e));
      setBusy(null);
    }
  };

  // Ouvrir une demande « Nouveau » la passe automatiquement « En cours » (une seule fois)
  const autoDone = useRef(false);
  useEffect(() => {
    if (quote?.status === 'NOUVEAU' && !autoDone.current) {
      autoDone.current = true;
      void patch({ status: 'EN_COURS' }, 'auto');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.status]);

  return (
    <Drawer
      docRef={quote?.reference}
      title={quote ? quote.fullName : 'Demande'}
      onClose={onClose}
      footer={quote && (
        <>
          <a className="btn btn-whatsapp" href={waTo(quote.phone, `Bonjour ${quote.fullName}, Hostella Agency vous recontacte au sujet de votre demande (${quote.reference}).`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a className="btn btn-secondary" href={`tel:${quote.phone}`}><Phone size={15} /> Appeler</a>
          <button className="btn btn-gold" onClick={toMission} disabled={!!busy}>{busy === 'mission' ? <Loader2 className="spin" size={15} /> : <CalendarPlus size={15} />} Créer la mission</button>
          <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)}><Trash2 size={15} /></button>
        </>
      )}
    >
      {loading && !quote ? <Loading /> : error || !quote ? <ErrorState message={error ?? 'Erreur'} /> : (
        <>
          <label className="field" style={{ marginBottom: 0 }}>
            <span>Statut de la demande</span>
            <select value={quote.status} onChange={(e) => void patch({ status: e.target.value as QuoteStatus }, 'status')} disabled={!!busy}>
              {Object.entries(QUOTE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <DL rows={[
            ['Événement', quote.eventType],
            ['Prestations', quote.services.map((s) => <span key={s} className="chip">{s}</span>)],
            ['Date', <span style={{ textTransform: 'capitalize' }}>{fmtLong(quote.eventDate)}</span>],
            ['Ville', quote.city],
            ['Invités', quote.guests ?? '—'],
            ['Hôtesses', quote.hostesses ?? 'À définir'],
            ['Téléphone', <a className="link" href={`tel:${quote.phone}`}>{quote.phone}</a>],
            ['E-mail', quote.email ? <a className="link" href={`mailto:${quote.email}`}>{quote.email}</a> : '—'],
            ['Reçue le', fmtDateTime(quote.createdAt)],
          ]} />
          {quote.message && (
            <div>
              <div className="field" style={{ marginBottom: 6 }}><span>Message du client</span></div>
              <div className="quote-text">{quote.message}</div>
            </div>
          )}
          {!!quote.missions?.length && (
            <div>
              <div className="field" style={{ marginBottom: 6 }}><span>Missions liées</span></div>
              {quote.missions.map((m) => (
                <div key={m.id} className="row-between card" style={{ padding: 10, marginBottom: 6 }}>
                  <span><span className="mono">{m.reference}</span> · {fmtDate(m.startAt)}</span>
                  <StatusBadge map={MISSION_STATUS} value={m.status} />
                </div>
              ))}
            </div>
          )}
          <label className="field">
            <span>Notes internes</span>
            <textarea rows={4} value={note ?? quote.adminNote ?? ''} onChange={(e) => setNote(e.target.value)} placeholder="Tarif proposé, rappels, décisions… (jamais visible par le client)" />
          </label>
          <div className="row-between" style={{ marginTop: -6 }}>
            <span className="small muted">{msg}</span>
            <button className="btn btn-secondary btn-sm" disabled={note === null || busy === 'note'} onClick={() => void patch({ adminNote: note ?? '' }, 'note')}>
              {busy === 'note' ? <Loader2 className="spin" size={14} /> : <Save size={14} />} Enregistrer la note
            </button>
          </div>
        </>
      )}
      {confirmDelete && (
        <ConfirmDialog title="Supprimer la demande ?" message="Cette demande sera définitivement effacée. Préférez « Archivé » pour la garder en mémoire." confirmLabel="Supprimer" danger busy={busy === 'delete'} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
      )}
    </Drawer>
  );
}
