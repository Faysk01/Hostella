import { ArrowLeft, Check, KeyRound, Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../context/auth';
import { errorMessage } from '../services/api';

function Brand() {
  return (
    <div className="login-brand">
      <img src="/logo.png" alt="" />
      <div>
        <div className="brand-name">HOSTELLA</div>
        <div className="brand-sub">Administration</div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { admin, checking, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!checking && admin) return <Navigate to={admin.mustChangePassword ? '/mot-de-passe' : '/'} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const a = await signIn(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(a.mustChangePassword ? '/mot-de-passe' : from && from !== '/connexion' ? from : '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Connexion impossible'));
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <Brand />
        <h2>Accès réservé</h2>
        <p className="muted">Espace de gestion de Hostella Agency : demandes, planning, équipe et contenu du site.</p>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@hostella.com" />
        </label>
        <label className="field">
          <span>Mot de passe</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="alert">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? <Loader2 className="spin" size={16} /> : <Lock size={16} />} Se connecter
        </button>
        <p className="login-foot"><ShieldCheck size={14} /> Connexions enregistrées · session de 8 h</p>
      </form>
    </div>
  );
}

const RULES = [
  { label: '12 caractères minimum', test: (p: string) => p.length >= 12 },
  { label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p: string) => /\d/.test(p) },
];

export function ChangePasswordPage() {
  const { admin, checking, changePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (checking) return <div className="splash"><div className="spinner" /></div>;
  if (!admin) return <Navigate to="/connexion" replace />;
  const forced = admin.mustChangePassword;
  const valid = RULES.every((r) => r.test(next)) && next === confirm && current.length > 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setBusy(true);
    try {
      await changePassword(current, next);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Enregistrement impossible'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <Brand />
        <h2>{forced ? `Bienvenue ${admin.firstName}` : 'Changer mon mot de passe'}</h2>
        <p className="muted">{forced ? 'Vous utilisez un mot de passe provisoire. Choisissez votre mot de passe personnel pour continuer.' : 'Vos autres sessions ouvertes seront déconnectées.'}</p>
        <label className="field">
          <span>{forced ? 'Mot de passe provisoire' : 'Mot de passe actuel'}</span>
          <input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label className="field">
          <span>Nouveau mot de passe</span>
          <input type="password" autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} />
        </label>
        <ul className="rules">
          {RULES.map((r) => {
            const ok = r.test(next);
            return <li key={r.label} className={ok ? 'ok' : ''}>{ok ? <Check size={13} /> : <X size={13} />} {r.label}</li>;
          })}
        </ul>
        <label className="field">
          <span>Confirmer le nouveau mot de passe</span>
          <input type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {confirm && confirm !== next && <small className="field-error">Les deux mots de passe ne correspondent pas</small>}
        </label>
        {error && <div className="alert">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy || !valid}>
          {busy ? <Loader2 className="spin" size={16} /> : <KeyRound size={16} />} Enregistrer mon mot de passe
        </button>
        {forced ? (
          <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={() => void signOut()}>Se déconnecter</button>
        ) : (
          <p className="login-foot"><Link to="/" className="link"><ArrowLeft size={14} /> Retour au tableau de bord</Link></p>
        )}
      </form>
    </div>
  );
}
