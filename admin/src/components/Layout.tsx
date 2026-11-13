import {
  CalendarDays, ClipboardList, ExternalLink, FileText, GalleryHorizontalEnd, Image, LayoutDashboard, LogOut, Mail, Menu,
  Phone, ScrollText, ShieldCheck, UserCog, UsersRound, X,
} from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router';

import { useAuth } from '../context/auth';
import { api } from '../services/api';
import type { Stats } from '../services/types';
import { fmtLong, initials, SITE_URL } from '../utils/format';

type Counts = { quotes: number; applications: number; messages: number };
const CountsContext = createContext<{ counts: Counts; refresh: () => void }>({ counts: { quotes: 0, applications: 0, messages: 0 }, refresh: () => {} });
/** Les pages appellent refresh() après une action pour mettre à jour les pastilles du menu */
export const useCounts = () => useContext(CountsContext);

const TITLES: Record<string, string> = {
  '/': 'Tableau de bord',
  '/devis': 'Demandes de devis',
  '/candidatures': 'Candidatures',
  '/messages': 'Messages',
  '/planning': 'Planning des missions',
  '/hotesses': 'Équipe d’hôtesses',
  '/galerie': 'Galerie photos',
  '/images': 'Images du site',
  '/coordonnees': 'Coordonnées',
  '/administrateurs': 'Administrateurs',
  '/journal': 'Journal d’audit',
  '/mot-de-passe': 'Mon mot de passe',
};

const navClass = ({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'is-active' : ''}`;

function Item({ to, icon: Icon, label, count, end, onClick }: { to: string; icon: typeof Mail; label: string; count?: number; end?: boolean; onClick: () => void }) {
  return (
    <NavLink to={to} end={end} className={navClass} onClick={onClick}>
      <Icon size={17} /> {label}
      {!!count && <span className="nav-count">{count}</span>}
    </NavLink>
  );
}

function Sidebar({ open, onClose, counts }: { open: boolean; onClose: () => void; counts: Counts }) {
  const { admin, signOut } = useAuth();
  const isSuper = admin?.role === 'SUPER_ADMIN';
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand">
          <img src="/logo.png" alt="" />
          <div>
            <div className="brand-name">HOSTELLA</div>
            <div className="brand-sub">Administration</div>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Fermer le menu"><X size={16} /></button>
        </div>
        <nav className="sidebar-nav">
          <Item to="/" end icon={LayoutDashboard} label="Tableau de bord" onClick={onClose} />
          <span className="sidebar-section">Courrier</span>
          <Item to="/devis" icon={FileText} label="Demandes de devis" count={counts.quotes} onClick={onClose} />
          <Item to="/candidatures" icon={ClipboardList} label="Candidatures" count={counts.applications} onClick={onClose} />
          <Item to="/messages" icon={Mail} label="Messages" count={counts.messages} onClick={onClose} />
          <span className="sidebar-section">Organisation</span>
          <Item to="/planning" icon={CalendarDays} label="Planning" onClick={onClose} />
          <Item to="/hotesses" icon={UsersRound} label="Hôtesses" onClick={onClose} />
          <span className="sidebar-section">Site public</span>
          <Item to="/galerie" icon={GalleryHorizontalEnd} label="Galerie photos" onClick={onClose} />
          <Item to="/images" icon={Image} label="Images du site" onClick={onClose} />
          <Item to="/coordonnees" icon={Phone} label="Coordonnées" onClick={onClose} />
          <span className="sidebar-section">Sécurité</span>
          {isSuper && <Item to="/administrateurs" icon={UserCog} label="Administrateurs" onClick={onClose} />}
          {isSuper && <Item to="/journal" icon={ScrollText} label="Journal d’audit" onClick={onClose} />}
          <Item to="/mot-de-passe" icon={ShieldCheck} label="Mon mot de passe" onClick={onClose} />
          {SITE_URL && (
            <a className="site-link" href={SITE_URL} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Voir le site public</a>
          )}
        </nav>
        <button className="nav-item nav-logout" onClick={() => void signOut()}><LogOut size={17} /> Déconnexion</button>
      </aside>
    </>
  );
}

export function Layout() {
  const { admin, checking } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, setCounts] = useState<Counts>({ quotes: 0, applications: 0, messages: 0 });

  const refresh = useCallback(() => {
    api.get<Stats>('/stats').then((s) => setCounts({ quotes: s.newQuotes, applications: s.newApplications, messages: s.unreadMessages })).catch(() => undefined);
  }, []);

  const ready = !!admin && !admin.mustChangePassword;
  useEffect(() => {
    if (!ready) return;
    refresh();
    const t = setInterval(refresh, 60_000); // nouvelles demandes : vérification chaque minute
    return () => clearInterval(t);
  }, [ready, refresh]);

  if (checking) return <div className="splash"><div className="spinner" /></div>;
  if (!admin) return <Navigate to="/connexion" replace state={{ from: pathname }} />;
  if (admin.mustChangePassword) return <Navigate to="/mot-de-passe" replace />;

  return (
    <CountsContext.Provider value={{ counts, refresh }}>
      <div className="shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} counts={counts} />
        <div className="main">
          <header className="topbar">
            <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu"><Menu size={18} /></button>
            <div>
              <h1 className="topbar-title">{TITLES[pathname] ?? 'Hostella'}</h1>
              <div className="topbar-date">{fmtLong(new Date())}</div>
            </div>
            <div className="topbar-user">
              <div className="topbar-user-text">
                <strong>{admin.firstName} {admin.lastName}</strong>
                <span>{admin.role === 'SUPER_ADMIN' ? 'Super administrateur' : 'Administrateur'}</span>
              </div>
              <div className="avatar">{initials(admin.firstName, admin.lastName)}</div>
            </div>
          </header>
          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>
    </CountsContext.Provider>
  );
}

export function SuperAdminOnly({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  return admin?.role === 'SUPER_ADMIN' ? <>{children}</> : <Navigate to="/" replace />;
}

