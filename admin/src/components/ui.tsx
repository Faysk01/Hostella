import { ChevronLeft, ChevronRight, Inbox, Loader2, Search, X } from 'lucide-react';
import { Fragment, useEffect, type ReactNode } from 'react';

import type { ApplicationStatus, MissionStatus, QuoteStatus } from '../services/types';

type Tone = 'gray' | 'bordeaux' | 'gold' | 'green' | 'amber' | 'red' | 'blue';

export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export const QUOTE_STATUS: Record<QuoteStatus, { label: string; tone: Tone }> = {
  NOUVEAU: { label: 'Nouveau', tone: 'bordeaux' },
  EN_COURS: { label: 'En cours', tone: 'amber' },
  DEVIS_ENVOYE: { label: 'Devis envoyé', tone: 'blue' },
  ACCEPTE: { label: 'Accepté', tone: 'green' },
  REFUSE: { label: 'Refusé', tone: 'red' },
  ARCHIVE: { label: 'Archivé', tone: 'gray' },
};
export const APP_STATUS: Record<ApplicationStatus, { label: string; tone: Tone }> = {
  NOUVELLE: { label: 'Nouvelle', tone: 'bordeaux' },
  ENTRETIEN: { label: 'Entretien', tone: 'amber' },
  RETENUE: { label: 'Retenue', tone: 'green' },
  REFUSEE: { label: 'Refusée', tone: 'red' },
  ARCHIVEE: { label: 'Archivée', tone: 'gray' },
};
export const MISSION_STATUS: Record<MissionStatus, { label: string; tone: Tone }> = {
  PLANIFIEE: { label: 'Planifiée', tone: 'amber' },
  CONFIRMEE: { label: 'Confirmée', tone: 'green' },
  TERMINEE: { label: 'Terminée', tone: 'gray' },
  ANNULEE: { label: 'Annulée', tone: 'red' },
};

export function StatusBadge<T extends string>({ map, value }: { map: Record<T, { label: string; tone: Tone }>; value: T }) {
  const s = map[value];
  return <Badge tone={s?.tone}>{s?.label ?? value}</Badge>;
}

export function PageHead({ title, subtitle, actions, docRef }: { title: string; subtitle?: ReactNode; actions?: ReactNode; docRef?: string }) {
  return (
    <div className="page-head">
      <div>
        {docRef && <div className="doc-ref">{docRef}</div>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="search">
      <Search size={16} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={80} />
    </label>
  );
}

export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'is-active' : ''} onClick={() => onChange(o.value)} role="tab" aria-selected={o.value === value}>
          {o.label}
          {o.count !== undefined && o.count > 0 && <span className="tab-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="pagination">
      <span>{total} enregistrement{total > 1 ? 's' : ''}</span>
      <div className="pagination-controls">
        <button className="icon-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Page précédente"><ChevronLeft size={16} /></button>
        <span>Page {page} / {pages}</span>
        <button className="icon-btn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Page suivante"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

export const Loading = () => <div className="state"><Loader2 className="spin" size={20} /> Chargement…</div>;

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state-error">
      {message}
      {onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}>Réessayer</button>}
    </div>
  );
}

export const EmptyState = ({ text }: { text: string }) => <div className="state"><Inbox size={20} /> {text}</div>;

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}

export function Modal({ title, children, footer, onClose, wide }: { title: string; children: ReactNode; footer?: ReactNode; onClose: () => void; wide?: boolean }) {
  useEscape(onClose);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" style={wide ? { maxWidth: 720 } : undefined} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ docRef, title, children, footer, onClose }: { docRef?: string; title: ReactNode; children: ReactNode; footer?: ReactNode; onClose: () => void }) {
  useEscape(onClose);
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div>
            {docRef && <div className="doc-ref mono">{docRef}</div>}
            <h3>{title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>
  );
}

export function ConfirmDialog({ title, message, confirmLabel, danger, busy, onConfirm, onCancel }: {
  title: string; message: ReactNode; confirmLabel: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>Annuler</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
            {busy && <Loader2 className="spin" size={15} />} {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

/** Ligne libellé / valeur d'une fiche */
export function DL({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="dl">
      {rows.map(([k, v]) => (
        <Fragment key={k}>
          <dt>{k}</dt>
          <dd>{v ?? '—'}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
