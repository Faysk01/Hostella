import { Check, MailOpen, Phone, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useCounts } from '../components/Layout';
import { EmptyState, ErrorState, Loading, PageHead, Pagination, Tabs } from '../components/ui';
import { useApi } from '../hooks/use-api';
import { api } from '../services/api';
import type { Message, Paged } from '../services/types';
import { fmtDateTime, waTo } from '../utils/format';

export function MessagesPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const { refresh } = useCounts();
  const { data, setData, loading, error, reload } = useApi(
    () => api.get<Paged<Message> & { unread: number }>('/messages', { unread: filter === 'unread' ? 1 : undefined, page }),
    [filter, page],
  );

  const setRead = async (m: Message, isRead: boolean) => {
    const u = await api.patch<Message>(`/messages/${m.id}`, { isRead });
    setData((d) => (d ? { ...d, unread: d.unread + (isRead ? -1 : 1), items: d.items.map((x) => (x.id === u.id ? u : x)) } : d));
    refresh();
  };
  const remove = async (m: Message) => {
    if (!window.confirm(`Supprimer le message de ${m.fullName} ?`)) return;
    await api.delete(`/messages/${m.id}`);
    reload();
    refresh();
  };

  return (
    <div>
      <PageHead docRef="Courrier entrant" title="Messages" subtitle="Les messages envoyés depuis le formulaire « Message rapide » de la page Contact." />
      <div className="toolbar">
        <Tabs value={filter} onChange={(v) => { setFilter(v); setPage(1); }} options={[{ value: 'all', label: 'Tous' }, { value: 'unread', label: 'Non lus', count: data?.unread }]} />
      </div>
      {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? (
        <div className="card"><EmptyState text="Aucun message." /></div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {data.items.map((m) => (
            <div key={m.id} className="card" style={{ borderLeft: `4px solid ${m.isRead ? 'var(--border)' : 'var(--bordeaux)'}` }}>
              <div className="row-between">
                <div>
                  <strong className="serif" style={{ fontSize: 16 }}>{m.fullName}</strong>
                  {!m.isRead && <span className="badge badge-bordeaux" style={{ marginLeft: 8 }}>Non lu</span>}
                  <div className="small muted">{fmtDateTime(m.createdAt)}{m.phone ? ` · ${m.phone}` : ''}</div>
                </div>
                <div className="row">
                  {m.phone && <a className="btn btn-whatsapp btn-sm" href={waTo(m.phone, `Bonjour ${m.fullName}, merci pour votre message. `)} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                  {m.phone && <a className="btn btn-secondary btn-sm" href={`tel:${m.phone}`}><Phone size={13} /></a>}
                  <button className="btn btn-secondary btn-sm" onClick={() => void setRead(m, !m.isRead)}>
                    {m.isRead ? <><MailOpen size={13} /> Marquer non lu</> : <><Check size={13} /> Marquer lu</>}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => void remove(m)} aria-label="Supprimer"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="quote-text" style={{ marginTop: 12 }}>{m.message}</div>
            </div>
          ))}
          <div className="card card-flush"><Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} /></div>
        </div>
      )}
    </div>
  );
}
