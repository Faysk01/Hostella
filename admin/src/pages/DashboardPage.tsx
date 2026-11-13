import { CalendarDays, ClipboardList, FileText, Mail, UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import { APP_STATUS, EmptyState, ErrorState, Loading, MISSION_STATUS, QUOTE_STATUS, StatusBadge } from '../components/ui';
import { useApi } from '../hooks/use-api';
import { api } from '../services/api';
import type { Stats } from '../services/types';
import { ago, fmtDate, fmtLong, fmtTime } from '../utils/format';

export function DashboardPage() {
  const { data, loading, error, reload } = useApi(() => api.get<Stats>('/stats'), []);
  if (loading && !data) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  return (
    <div className="stack">
      <div className="stats-grid">
        <Link to="/devis" className="stat-card tone-bordeaux">
          <div className="stat-label"><FileText size={13} /> Nouveaux devis</div>
          <div className="stat-value">{data.newQuotes}</div>
          <div className="stat-hint">{data.openQuotes} demande{data.openQuotes > 1 ? 's' : ''} en cours de traitement</div>
        </Link>
        <Link to="/candidatures" className="stat-card tone-gold">
          <div className="stat-label"><ClipboardList size={13} /> Candidatures</div>
          <div className="stat-value">{data.newApplications}</div>
          <div className="stat-hint">nouvelles, à étudier</div>
        </Link>
        <Link to="/messages" className="stat-card tone-blue">
          <div className="stat-label"><Mail size={13} /> Messages</div>
          <div className="stat-value">{data.unreadMessages}</div>
          <div className="stat-hint">non lus</div>
        </Link>
        <Link to="/hotesses" className="stat-card tone-green">
          <div className="stat-label"><UsersRound size={13} /> Hôtesses actives</div>
          <div className="stat-value">{data.activeHostesses}</div>
          <div className="stat-hint">dans l’équipe</div>
        </Link>
      </div>

      <div className="card card-flush">
        <div className="card-head">
          <div className="card-title"><CalendarDays size={17} /> Prochaines missions (30 jours)</div>
          <Link to="/planning" className="link">Ouvrir le planning →</Link>
        </div>
        {data.upcoming.length === 0 ? (
          <EmptyState text="Aucune mission prévue pour les 30 prochains jours." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Date</th><th>Mission</th><th>Lieu</th><th>Équipe</th><th>Statut</th></tr></thead>
              <tbody>
                {data.upcoming.map((m) => (
                  <tr key={m.id}>
                    <td className="nowrap"><div className="cell-main" style={{ textTransform: 'capitalize' }}>{fmtLong(m.startAt)}</div><div className="cell-sub">{fmtTime(m.startAt)}</div></td>
                    <td><div className="cell-main">{m.title}</div><div className="cell-sub">{m.client} · <span className="mono">{m.reference}</span></div></td>
                    <td>{m.location}</td>
                    <td className="nowrap">{m._count.assignments} / {m.hostessesNeeded}</td>
                    <td><StatusBadge map={MISSION_STATUS} value={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card card-flush">
          <div className="card-head">
            <div className="card-title"><FileText size={17} /> Dernières demandes de devis</div>
            <Link to="/devis" className="link">Tout voir →</Link>
          </div>
          {data.recentQuotes.length === 0 ? <EmptyState text="Aucune demande pour l’instant." /> : (
            <table className="table">
              <tbody>
                {data.recentQuotes.map((q) => (
                  <tr key={q.id}>
                    <td><div className="cell-main">{q.fullName}</div><div className="cell-sub">{q.eventType} · {fmtDate(q.eventDate)}</div></td>
                    <td className="right"><StatusBadge map={QUOTE_STATUS} value={q.status} /><div className="cell-sub">{ago(q.createdAt)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card card-flush">
          <div className="card-head">
            <div className="card-title"><ClipboardList size={17} /> Dernières candidatures</div>
            <Link to="/candidatures" className="link">Tout voir →</Link>
          </div>
          {data.recentApplications.length === 0 ? <EmptyState text="Aucune candidature pour l’instant." /> : (
            <table className="table">
              <tbody>
                {data.recentApplications.map((a) => (
                  <tr key={a.id}>
                    <td><div className="cell-main">{a.fullName}</div><div className="cell-sub">{a.city}</div></td>
                    <td className="right"><StatusBadge map={APP_STATUS} value={a.status} /><div className="cell-sub">{ago(a.createdAt)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
