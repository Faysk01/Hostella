import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { ImagePicker, type PickedImage } from '../components/ImagePicker';
import { Badge, ConfirmDialog, EmptyState, ErrorState, Loading, Modal, PageHead } from '../components/ui';
import { useApi } from '../hooks/use-api';
import { api, errorMessage } from '../services/api';
import type { Photo, Settings } from '../services/types';

export function GalleryPage() {
  const { data, setData, loading, error, reload } = useApi(() => api.get<{ items: Photo[]; categories: string[] }>('/photos'), []);
  const { data: settings } = useApi(() => api.get<Settings>('/settings'), []);
  const [editing, setEditing] = useState<Photo | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);

  const items = data?.items ?? [];
  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setData((d) => (d ? { ...d, items: next } : d));
    await api.post('/photos/reorder', { ids: next.map((p) => p.id) }).catch(() => reload());
  };
  const togglePublish = async (p: Photo) => {
    const u = await api.patch<Photo>(`/photos/${p.id}`, { isPublished: !p.isPublished });
    setData((d) => (d ? { ...d, items: d.items.map((x) => (x.id === u.id ? u : x)) } : d));
  };
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    await api.delete(`/photos/${deleting.id}`).catch(() => undefined);
    setBusy(false);
    setDeleting(null);
    reload();
  };

  return (
    <div>
      <PageHead
        docRef="Site public · Réalisations"
        title="Galerie photos"
        subtitle="Les photos de la page « Réalisations ». Tant que la galerie est vide, le site affiche les photos d’illustration actuelles."
        actions={<button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={16} /> Ajouter une photo</button>}
      />
      <div style={{ marginTop: 18 }}>
        {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : items.length === 0 ? (
          <div className="card"><EmptyState text="Aucune photo pour l’instant : le site affiche les photos d’illustration. Ajoutez vos vraies prestations ici." /></div>
        ) : (
          <>
            <p className="small muted" style={{ marginBottom: 12 }}>{items.filter((p) => p.isPublished).length} photo(s) visibles sur le site · l’ordre ci-dessous est l’ordre d’affichage.</p>
            <div className="photo-grid">
              {items.map((p, i) => (
                <div key={p.id} className={`photo-card ${p.isPublished ? '' : 'is-hidden'}`}>
                  <div className="photo-thumb">
                    <img src={p.url} alt={p.title} loading="lazy" />
                    {!p.isPublished && <Badge>Masquée</Badge>}
                  </div>
                  <div className="photo-body">
                    <strong>{p.title}</strong>
                    <span className="small muted">{p.category}{p.tall ? ' · grand format' : ''}</span>
                  </div>
                  <div className="photo-actions">
                    <button className="icon-btn" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="Avancer"><ArrowUp size={14} /></button>
                    <button className="icon-btn" onClick={() => void move(i, 1)} disabled={i === items.length - 1} aria-label="Reculer"><ArrowDown size={14} /></button>
                    <button className="icon-btn" onClick={() => void togglePublish(p)} title={p.isPublished ? 'Masquer du site' : 'Afficher sur le site'}>{p.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    <button className="icon-btn" onClick={() => setEditing(p)} aria-label="Modifier"><Pencil size={14} /></button>
                    <button className="icon-btn" style={{ marginLeft: 'auto', color: 'var(--red)' }} onClick={() => setDeleting(p)} aria-label="Supprimer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {editing && data && (
        <PhotoForm photo={editing === 'new' ? null : editing} categories={data.categories} cloudinary={!!settings?.cloudinary} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      )}
      {deleting && <ConfirmDialog title="Supprimer la photo ?" message={`« ${deleting.title} » sera retirée du site${deleting.publicId ? ' et de Cloudinary' : ''}.`} confirmLabel="Supprimer" danger busy={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />}
    </div>
  );
}

function PhotoForm({ photo, categories, cloudinary, onClose, onSaved }: { photo: Photo | null; categories: string[]; cloudinary: boolean; onClose: () => void; onSaved: () => void }) {
  const [img, setImg] = useState<PickedImage | null>(photo ? { url: photo.url, publicId: photo.publicId } : null);
  const [f, setF] = useState({ title: photo?.title ?? '', category: photo?.category ?? categories[0], tall: photo?.tall ?? false, isPublished: photo?.isPublished ?? true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!img) return setError('Choisissez d’abord une photo.');
    setBusy(true);
    setError(null);
    try {
      if (photo) await api.patch(`/photos/${photo.id}`, f);
      else await api.post('/photos', { ...f, url: img.url, publicId: img.publicId });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      wide
      title={photo ? 'Modifier la photo' : 'Ajouter une photo'}
      onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Annuler</button><button className="btn btn-primary" form="photo-form" disabled={busy || !img}>{busy && <Loader2 className="spin" size={15} />} Enregistrer</button></>}
    >
      {img ? (
        <div style={{ marginBottom: 14 }}>
          <img className="preview-img" src={img.url} alt="" />
          {!photo && <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setImg(null)}>Choisir une autre photo</button>}
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}><ImagePicker folder="gallery" cloudinary={cloudinary} onPicked={setImg} /></div>
      )}
      <form id="photo-form" onSubmit={submit} className="form-grid">
        <label className="field full"><span>Titre (affiché sur le site) *</span><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ex. Accueil VIP — Forum de Bobo 2026" /></label>
        <label className="field"><span>Catégorie (filtre du site)</span>
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <div className="field"><span>Options</span>
          <label className="check"><input type="checkbox" checked={f.tall} onChange={(e) => setF({ ...f, tall: e.target.checked })} /> Grand format (photo en hauteur)</label>
          <label className="check"><input type="checkbox" checked={f.isPublished} onChange={(e) => setF({ ...f, isPublished: e.target.checked })} /> Visible sur le site</label>
        </div>
      </form>
      {error && <div className="alert">{error}</div>}
    </Modal>
  );
}
