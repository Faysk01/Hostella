import { KeyRound, Loader2, Plus, ShieldOff, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Badge, EmptyState, ErrorState, Loading, Modal, PageHead, Pagination } from '../components/ui';
import { useAuth } from '../context/auth';
import { useApi } from '../hooks/use-api';
import { api, errorMessage } from '../services/api';
import type { Admin, AuditEntry, Paged } from '../services/types';
import { fmtDateTime } from '../utils/format';

export function AdminsPage() {
  const { admin: me } = useAuth();
  const { data, setData, loading, error, reload } = useApi(() => api.get<Admin[]>('/admins'), []);
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState<{ who: string; email: string; password: string } | null>(null);

  const reset = async (a: Admin) => {
    if (!window.confirm(`Générer un nouveau mot de passe provisoire pour ${a.firstName} ${a.lastName} ?`)) return;
    try {
      const r = await api.post<{ admin: Admin; temporaryPassword: string }>(`/admins/${a.id}/reset-password`);
      setSecret({ who: `${a.firstName} ${a.lastName}`, email: a.email, password: r.temporaryPassword });
      reload();
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };
  const toggle = async (a: Admin) => {
    try {
      const u = await api.patch<Admin>(`/admins/${a.id}/status`, { isActive: !a.isActive });
      setData((d) => d?.map((x) => (x.id === u.id ? u : x)) ?? d);
    } catch (e) {
      window.alert(errorMessage(e));
    }
  };

  return (
    <div>
      <PageHead docRef="Sécurité" title="Administrateurs" subtitle="Les personnes qui ont accès à cet espace. Chaque nouveau compte reçoit un mot de passe provisoire à changer." actions={<button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Nouvel administrateur</button>} />
      <div className="card card-flush" style={{ marginTop: 18 }}>
        {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : (
          <table className="table">
            <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Dernière connexion</th><th>État</th><th /></tr></thead>
            <tbody>
              {data?.map((a) => (
                <tr key={a.id}>
                  <td className="cell-main">{a.firstName} {a.lastName}{a.id === me?.id && <span className="muted"> (vous)</span>}</td>
                  <td>{a.email}</td>
                  <td>{a.role === 'SUPER_ADMIN' ? <Badge tone="bordeaux">Super admin</Badge> : <Badge>Admin</Badge>}</td>
                  <td className="nowrap">{a.lastLoginAt ? fmtDateTime(a.lastLoginAt) : <span className="muted">Jamais</span>}</td>
                  <td>{!a.isActive ? <Badge tone="red">Suspendu</Badge> : a.mustChangePassword ? <Badge tone="amber">Mot de passe provisoire</Badge> : <Badge tone="green">Actif</Badge>}</td>
                  <td className="right nowrap">
                    {a.id !== me?.id && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => void reset(a)}><KeyRound size={13} /> Réinitialiser</button>{' '}
                        <button className={`btn btn-sm ${a.isActive ? 'btn-danger' : 'btn-secondary'}`} onClick={() => void toggle(a)}>{a.isActive ? <><ShieldOff size={13} /> Suspendre</> : <><ShieldCheck size={13} /> Réactiver</>}</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {creating && <CreateAdmin onClose={() => setCreating(false)} onCreated={(a, password) => { setCreating(false); setSecret({ who: `${a.firstName} ${a.lastName}`, email: a.email, password }); reload(); }} />}
      {secret && (
        <Modal title="Mot de passe provisoire" onClose={() => setSecret(null)} footer={<button className="btn btn-primary" onClick={() => setSecret(null)}>J’ai noté le mot de passe</button>}>
          <p>Transmettez ces informations à <strong>{secret.who}</strong> ({secret.email}).</p>
          <div className="password-box">{secret.password}</div>
          <p className="small muted">Il ne sera plus jamais affiché. Il devra être changé à la première connexion.</p>
        </Modal>
      )}
    </div>
  );
}

function CreateAdmin({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Admin, password: string) => void }) {
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', role: 'ADMIN' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api.post<{ admin: Admin; temporaryPassword: string }>('/admins', f);
      onCreated(r.admin, r.temporaryPassword);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };
  return (
    <Modal title="Nouvel administrateur" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Annuler</button><button className="btn btn-primary" form="admin-form" disabled={busy}>{busy && <Loader2 className="spin" size={15} />} Créer le compte</button></>}>
      <form id="admin-form" onSubmit={submit} className="form-grid">
        <label className="field"><span>Prénom</span><input required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></label>
        <label className="field"><span>Nom</span><input required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></label>
        <label className="field full"><span>E-mail</span><input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="field full"><span>Rôle</span>
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            <option value="ADMIN">Administrateur (gestion quotidienne)</option>
            <option value="SUPER_ADMIN">Super administrateur (gère aussi les comptes)</option>
          </select>
        </label>
      </form>
      {error && <div className="alert">{error}</div>}
    </Modal>
  );
}

const ACTIONS: Record<string, string> = {
  LOGIN_SUCCESS: 'Connexion', LOGIN_FAILED: 'Échec de connexion', LOGOUT: 'Déconnexion', PASSWORD_CHANGED: 'Mot de passe changé',
  ADMIN_CREATED: 'Compte admin créé', ADMIN_PASSWORD_RESET: 'Mot de passe réinitialisé', ADMIN_SUSPENDED: 'Compte suspendu', ADMIN_REACTIVATED: 'Compte réactivé',
  QUOTE_STATUS: 'Statut de devis', QUOTE_DELETED: 'Devis supprimé', APPLICATION_STATUS: 'Statut de candidature', APPLICATION_DELETED: 'Candidature supprimée',
  HOSTESS_CREATED: 'Hôtesse ajoutée', HOSTESS_UPDATED: 'Fiche hôtesse modifiée', HOSTESS_DELETED: 'Hôtesse retirée',
  MISSION_CREATED: 'Mission créée', MISSION_UPDATED: 'Mission modifiée', MISSION_DELETED: 'Mission supprimée', MISSION_ASSIGN: 'Affectation',
  PHOTO_ADDED: 'Photo ajoutée', PHOTO_DELETED: 'Photo supprimée', CONTACTS_UPDATED: 'Coordonnées modifiées', SITE_IMAGE_UPDATED: 'Image du site remplacée', SITE_IMAGE_RESET: 'Image du site rétablie',
};

export function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(() => api.get<Paged<AuditEntry>>('/audit', { page }), [page]);
  return (
    <div>
      <PageHead docRef="Sécurité" title="Journal d’audit" subtitle="Qui a fait quoi, et quand. Les entrées ne peuvent pas être modifiées." />
      <div className="card card-flush" style={{ marginTop: 18 }}>
        {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState text="Journal vide." /> : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Date</th><th>Administrateur</th><th>Action</th><th>Élément</th><th>Détail</th></tr></thead>
                <tbody>
                  {data.items.map((e) => (
                    <tr key={e.id}>
                      <td className="nowrap mono">{fmtDateTime(e.createdAt)}</td>
                      <td>{e.admin ? `${e.admin.firstName} ${e.admin.lastName}` : <span className="muted">—</span>}</td>
                      <td><Badge tone={e.action.includes('FAILED') || e.action.includes('DELETED') || e.action.includes('SUSPENDED') ? 'red' : 'gray'}>{ACTIONS[e.action] ?? e.action}</Badge></td>
                      <td>{e.targetLabel ?? '—'}</td>
                      <td className="small muted">{e.metadata ? Object.entries(e.metadata).map(([k, v]) => `${k} : ${String(v)}`).join(' · ') : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
