import { ChevronLeft, ChevronRight, Clock, Loader2, MapPin, Pencil, Phone, Plus, Shirt, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import { ConfirmDialog, DL, Drawer, EmptyState, ErrorState, Loading, MISSION_STATUS, Modal, PageHead, StatusBadge } from '../components/ui';
import { useApi } from '../hooks/use-api';
import { api, ApiError, errorMessage } from '../services/api';
import type { Hostess, Mission, MissionStatus } from '../services/types';
import { fmtLong, fmtTime, toLocalInput, waTo } from '../utils/format';

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Les 6 semaines affichées (lundi → dimanche) autour du mois */
function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function PlanningPage() {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [editing, setEditing] = useState<Mission | { startAt: Date } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const days = useMemo(() => monthGrid(month), [month]);
  const from = days[0];
  const to = new Date(days[41].getFullYear(), days[41].getMonth(), days[41].getDate() + 1);
  const { data, loading, error, reload } = useApi(() => api.get<Mission[]>('/missions', { from: from.toISOString(), to: to.toISOString() }), [month]);

  // Une mission sur plusieurs jours apparaît chaque jour
  const byDay = useMemo(() => {
    const map = new Map<string, Mission[]>();
    for (const m of data ?? []) {
      const s = new Date(m.startAt);
      const e = new Date(m.endAt);
      for (let d = new Date(s.getFullYear(), s.getMonth(), s.getDate()); d <= e; d.setDate(d.getDate() + 1)) {
        const k = dayKey(d);
        map.set(k, [...(map.get(k) ?? []), m]);
      }
    }
    return map;
  }, [data]);
  const dayMissions = byDay.get(dayKey(selected)) ?? [];
  const monthMissions = (data ?? []).filter((m) => new Date(m.startAt).getMonth() === month.getMonth());
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div>
      <PageHead
        docRef="Registre des missions"
        title="Planning"
        subtitle="Cliquez sur un jour pour voir ses missions, ou créez-en une. Une demande de devis peut aussi devenir une mission."
        actions={<button className="btn btn-primary" onClick={() => setEditing({ startAt: selected })}><Plus size={16} /> Nouvelle mission</button>}
      />
      <div className="row-between" style={{ margin: '18px 0 12px' }}>
        <div className="row">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Mois précédent"><ChevronLeft size={16} /></button>
          <h3 className="serif" style={{ fontSize: 20, minWidth: 190, textAlign: 'center', textTransform: 'capitalize' }}>{monthFmt.format(month)}</h3>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Mois suivant"><ChevronRight size={16} /></button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today); }}>Aujourd’hui</button>
        </div>
        <div className="row small muted">
          {monthMissions.length} mission{monthMissions.length > 1 ? 's' : ''} ce mois ·
          {(['PLANIFIEE', 'CONFIRMEE', 'TERMINEE', 'ANNULEE'] as MissionStatus[]).map((s) => <StatusBadge key={s} map={MISSION_STATUS} value={s} />)}
        </div>
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="planning-layout">
          <div style={{ position: 'relative' }}>
            {loading && <div style={{ position: 'absolute', top: 6, right: 8, zIndex: 2 }}><Loader2 className="spin" size={16} /></div>}
            <div className="calendar">
              {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
              {days.map((d) => {
                const list = byDay.get(dayKey(d)) ?? [];
                return (
                  <div
                    key={d.toISOString()}
                    className={`cal-day ${d.getMonth() !== month.getMonth() ? 'is-out' : ''} ${sameDay(d, today) ? 'is-today' : ''} ${sameDay(d, selected) ? 'is-selected' : ''}`}
                    onClick={() => setSelected(d)}
                    onDoubleClick={() => setEditing({ startAt: d })}
                  >
                    <span className="cal-num">{d.getDate()}</span>
                    {list.slice(0, 3).map((m) => (
                      <div key={m.id} className={`cal-event st-${m.status}`} title={`${m.title} — ${m.client}`} onClick={(e) => { e.stopPropagation(); setOpenId(m.id); }}>
                        {fmtTime(m.startAt)} {m.title}
                      </div>
                    ))}
                    {list.length > 3 && <span className="cal-more">+ {list.length - 3} autre{list.length > 4 ? 's' : ''}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title" style={{ textTransform: 'capitalize' }}>{fmtLong(selected)}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ startAt: selected })}><Plus size={14} /> Ajouter</button>
            </div>
            {loading && !data ? <Loading /> : dayMissions.length === 0 ? <EmptyState text="Aucune mission ce jour-là." /> : dayMissions.map((m) => (
              <button key={m.id} className={`mission-item st-${m.status}`} onClick={() => setOpenId(m.id)}>
                <div className="row-between">
                  <strong>{m.title}</strong>
                  <StatusBadge map={MISSION_STATUS} value={m.status} />
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>{m.client}</div>
                <div className="small" style={{ marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span className="row" style={{ gap: 4 }}><Clock size={13} /> {fmtTime(m.startAt)} – {fmtTime(m.endAt)}</span>
                  <span className="row" style={{ gap: 4 }}><MapPin size={13} /> {m.location}</span>
                </div>
                <div className={`staffing ${m.assignments.length >= m.hostessesNeeded ? 'full' : ''}`}>
                  <span style={{ width: `${Math.min(100, (m.assignments.length / m.hostessesNeeded) * 100)}%` }} />
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>{m.assignments.length} / {m.hostessesNeeded} hôtesse{m.hostessesNeeded > 1 ? 's' : ''} affectée{m.assignments.length > 1 ? 's' : ''}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <MissionForm
          mission={'id' in editing ? editing : null}
          defaultDay={'id' in editing ? undefined : editing.startAt}
          onClose={() => setEditing(null)}
          onSaved={(m) => { setEditing(null); reload(); setSelected(new Date(m.startAt)); setOpenId(m.id); }}
        />
      )}
      {openId && <MissionDrawer id={openId} onClose={() => setOpenId(null)} onChanged={reload} onEdit={(m) => { setOpenId(null); setEditing(m); }} />}
    </div>
  );
}

function MissionDrawer({ id, onClose, onChanged, onEdit }: { id: string; onClose: () => void; onChanged: () => void; onEdit: (m: Mission) => void }) {
  const { data: m, setData, loading, error } = useApi(() => api.get<Mission>(`/missions/${id}`), [id]);
  const { data: team } = useApi(() => api.get<Hostess[]>('/hostesses', { active: 1 }), []);
  const [pick, setPick] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; conflict?: boolean } | null>(null);
  const [confirm, setConfirm] = useState(false);

  const assign = async (force = false) => {
    if (!pick) return;
    setBusy('assign');
    setMsg(null);
    try {
      setData(await api.post<Mission>(`/missions/${id}/assignments`, { hostessId: pick, role: role || undefined, force }));
      setPick('');
      setRole('');
      onChanged();
    } catch (e) {
      setMsg({ text: errorMessage(e), conflict: e instanceof ApiError && e.code === 'SCHEDULE_CONFLICT' });
    } finally {
      setBusy(null);
    }
  };
  const unassign = async (hostessId: string) => {
    setBusy(hostessId);
    try {
      setData(await api.delete<Mission>(`/missions/${id}/assignments/${hostessId}`));
      onChanged();
    } finally {
      setBusy(null);
    }
  };
  const setStatus = async (status: MissionStatus) => {
    if (!m) return;
    setBusy('status');
    try {
      setData(await api.put<Mission>(`/missions/${id}`, { ...m, status }));
      onChanged();
    } catch (e) {
      setMsg({ text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  };
  const remove = async () => {
    setBusy('delete');
    await api.delete(`/missions/${id}`).catch(() => undefined);
    onChanged();
    onClose();
  };

  const available = (team ?? []).filter((h) => !m?.assignments.some((a) => a.hostess.id === h.id));
  const teamText = m ? `Mission ${m.title} — ${fmtLong(m.startAt)}, ${fmtTime(m.startAt)}–${fmtTime(m.endAt)}, ${m.location}.${m.dressCode ? ` Tenue : ${m.dressCode}.` : ''}` : '';

  return (
    <Drawer
      docRef={m?.reference}
      title={m?.title ?? 'Mission'}
      onClose={onClose}
      footer={m && (
        <>
          <button className="btn btn-secondary" onClick={() => onEdit(m)}><Pencil size={15} /> Modifier</button>
          {m.clientPhone && <a className="btn btn-whatsapp" href={waTo(m.clientPhone, `Bonjour ${m.client}, `)} target="_blank" rel="noopener noreferrer">WhatsApp client</a>}
          <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirm(true)}><Trash2 size={15} /></button>
        </>
      )}
    >
      {loading && !m ? <Loading /> : error || !m ? <ErrorState message={error ?? 'Erreur'} /> : (
        <>
          <label className="field" style={{ marginBottom: 0 }}>
            <span>Statut</span>
            <select value={m.status} onChange={(e) => void setStatus(e.target.value as MissionStatus)} disabled={!!busy}>
              {Object.entries(MISSION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <DL rows={[
            ['Client', <>{m.client}{m.clientPhone && <> · <a className="link" href={`tel:${m.clientPhone}`}><Phone size={12} /> {m.clientPhone}</a></>}</>],
            ['Date', <span style={{ textTransform: 'capitalize' }}>{fmtLong(m.startAt)}</span>],
            ['Horaires', `${fmtTime(m.startAt)} – ${fmtTime(m.endAt)}`],
            ['Lieu', m.location],
            ['Tenue', m.dressCode ? <span className="row" style={{ gap: 4 }}><Shirt size={13} /> {m.dressCode}</span> : '—'],
            ['Devis d’origine', m.quote?.reference ?? '—'],
          ]} />
          {m.notes && <div className="quote-text">{m.notes}</div>}

          <div className="card">
            <div className="card-head" style={{ marginBottom: 10 }}>
              <div className="card-title">Équipe affectée</div>
              <span className={`badge ${m.assignments.length >= m.hostessesNeeded ? 'badge-green' : 'badge-amber'}`}>{m.assignments.length} / {m.hostessesNeeded}</span>
            </div>
            {m.assignments.length === 0 ? <p className="muted small">Aucune hôtesse affectée pour l’instant.</p> : (
              <table className="table">
                <tbody>
                  {m.assignments.map((a) => (
                    <tr key={a.id}>
                      <td><div className="cell-main">{a.hostess.firstName} {a.hostess.lastName}</div><div className="cell-sub">{a.role ?? 'Accueil'} · {a.hostess.phone}</div></td>
                      <td className="right nowrap">
                        <a className="btn btn-whatsapp btn-sm" href={waTo(a.hostess.phone, `Bonjour ${a.hostess.firstName}, ${teamText}`)} target="_blank" rel="noopener noreferrer">Prévenir</a>{' '}
                        <button className="btn btn-danger btn-sm" disabled={busy === a.hostess.id} onClick={() => void unassign(a.hostess.id)} aria-label="Retirer"><UserMinus size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: 14 }}>
              <div className="form-grid">
                <label className="field"><span>Ajouter une hôtesse</span>
                  <select value={pick} onChange={(e) => { setPick(e.target.value); setMsg(null); }}>
                    <option value="">— Choisir —</option>
                    {available.map((h) => <option key={h.id} value={h.id}>{h.firstName} {h.lastName}</option>)}
                  </select>
                </label>
                <label className="field"><span>Poste</span><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Accueil, VIP, vestiaire…" /></label>
              </div>
              {msg && (
                <div className="alert">
                  {msg.text}
                  {msg.conflict && <div style={{ marginTop: 8 }}><button className="btn btn-secondary btn-sm" onClick={() => void assign(true)}>Affecter quand même</button></div>}
                </div>
              )}
              <button className="btn btn-primary btn-sm" disabled={!pick || busy === 'assign'} onClick={() => void assign()}>
                {busy === 'assign' ? <Loader2 className="spin" size={14} /> : <UserPlus size={14} />} Affecter
              </button>
              {!team?.length && <p className="small muted" style={{ marginTop: 8 }}>Ajoutez d’abord des hôtesses dans la page « Hôtesses ».</p>}
            </div>
          </div>
        </>
      )}
      {confirm && <ConfirmDialog title="Supprimer la mission ?" message="La mission et ses affectations seront effacées. Pour garder une trace, choisissez plutôt « Annulée »." confirmLabel="Supprimer" danger busy={busy === 'delete'} onConfirm={remove} onCancel={() => setConfirm(false)} />}
    </Drawer>
  );
}

function MissionForm({ mission, defaultDay, onClose, onSaved }: { mission: Mission | null; defaultDay?: Date; onClose: () => void; onSaved: (m: Mission) => void }) {
  const start = defaultDay ? new Date(defaultDay.getFullYear(), defaultDay.getMonth(), defaultDay.getDate(), 17) : new Date();
  const end = new Date(start.getTime() + 5 * 3600000);
  const [f, setF] = useState({
    title: mission?.title ?? '',
    client: mission?.client ?? '',
    clientPhone: mission?.clientPhone ?? '',
    location: mission?.location ?? 'Bobo-Dioulasso',
    startAt: toLocalInput(mission?.startAt ?? start),
    endAt: toLocalInput(mission?.endAt ?? end),
    hostessesNeeded: mission?.hostessesNeeded ?? 2,
    dressCode: mission?.dressCode ?? 'Uniforme Hostella bordeaux et or',
    status: mission?.status ?? ('PLANIFIEE' as MissionStatus),
    notes: mission?.notes ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...f, startAt: new Date(f.startAt).toISOString(), endAt: new Date(f.endAt).toISOString() };
      onSaved(mission ? await api.put<Mission>(`/missions/${mission.id}`, body) : await api.post<Mission>('/missions', body));
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      wide
      title={mission ? `Modifier ${mission.reference}` : 'Nouvelle mission'}
      onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Annuler</button><button className="btn btn-primary" form="mission-form" disabled={busy}>{busy && <Loader2 className="spin" size={15} />} Enregistrer</button></>}
    >
      <form id="mission-form" onSubmit={submit} className="form-grid">
        <label className="field full"><span>Intitulé *</span><input required value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex. Mariage Traoré — réception" /></label>
        <label className="field"><span>Client *</span><input required value={f.client} onChange={(e) => set('client', e.target.value)} /></label>
        <label className="field"><span>Téléphone du client</span><input value={f.clientPhone} onChange={(e) => set('clientPhone', e.target.value)} placeholder="+226 …" /></label>
        <label className="field full"><span>Lieu *</span><input required value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="Salle, hôtel, adresse…" /></label>
        <label className="field"><span>Début *</span><input type="datetime-local" required value={f.startAt} onChange={(e) => set('startAt', e.target.value)} /></label>
        <label className="field"><span>Fin *</span><input type="datetime-local" required value={f.endAt} onChange={(e) => set('endAt', e.target.value)} /></label>
        <label className="field"><span>Hôtesses nécessaires</span><input type="number" min={1} max={500} value={f.hostessesNeeded} onChange={(e) => set('hostessesNeeded', Number(e.target.value))} /></label>
        <label className="field"><span>Statut</span>
          <select value={f.status} onChange={(e) => set('status', e.target.value as MissionStatus)}>
            {Object.entries(MISSION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label className="field full"><span>Tenue</span><input value={f.dressCode} onChange={(e) => set('dressCode', e.target.value)} /></label>
        <label className="field full"><span>Consignes / notes</span><textarea rows={4} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Heure de briefing, contact sur place, déroulé…" /></label>
      </form>
      {error && <div className="alert">{error}</div>}
    </Modal>
  );
}
