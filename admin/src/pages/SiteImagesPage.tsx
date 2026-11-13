import { Loader2, RotateCcw, Upload } from 'lucide-react';
import { useState } from 'react';

import { ImagePicker, type PickedImage } from '../components/ImagePicker';
import { Badge, ErrorState, Loading, Modal, PageHead } from '../components/ui';
import { useApi } from '../hooks/use-api';
import { api, errorMessage } from '../services/api';
import type { ImageSlot, Settings } from '../services/types';
import { siteAsset } from '../utils/format';

export function SiteImagesPage() {
  const { data, setData, loading, error, reload } = useApi(() => api.get<Settings>('/settings'), []);
  const [slot, setSlot] = useState<ImageSlot | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (loading && !data) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const groups = [...new Set(data.slots.map((s) => s.group))];
  const reset = async (s: ImageSlot) => {
    if (!window.confirm(`Revenir à l’image d’origine pour « ${s.label} » ?`)) return;
    setBusy(s.key);
    try {
      const images = await api.delete<Settings['images']>(`/settings/images/${s.key}`);
      setData({ ...data, images });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHead
        docRef="Site public · Visuels"
        title="Images du site"
        subtitle="Remplacez les photos d’illustration par vos vraies photos. « Rétablir » remet l’image d’origine. Le site se met à jour en moins d’une minute."
      />
      {groups.map((g) => (
        <div key={g} className="slot-group">
          <h3>{g}</h3>
          <div className="photo-grid">
            {data.slots.filter((s) => s.group === g).map((s) => {
              const custom = data.images[s.key];
              return (
                <div key={s.key} className="photo-card">
                  <div className="photo-thumb">
                    <img src={custom?.url ?? siteAsset(s.default, data.siteUrl)} alt={s.label} loading="lazy" />
                    {custom ? <Badge tone="green">Personnalisée</Badge> : <Badge>Illustration</Badge>}
                  </div>
                  <div className="photo-body"><strong>{s.label}</strong></div>
                  <div className="photo-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => setSlot(s)}><Upload size={13} /> Remplacer</button>
                    {custom && (
                      <button className="btn btn-secondary btn-sm" disabled={busy === s.key} onClick={() => void reset(s)}>
                        {busy === s.key ? <Loader2 className="spin" size={13} /> : <RotateCcw size={13} />} Rétablir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {slot && <ReplaceModal slot={slot} cloudinary={data.cloudinary} onClose={() => setSlot(null)} onSaved={(images) => { setData({ ...data, images }); setSlot(null); }} />}
    </div>
  );
}

function ReplaceModal({ slot, cloudinary, onClose, onSaved }: { slot: ImageSlot; cloudinary: boolean; onClose: () => void; onSaved: (images: Settings['images']) => void }) {
  const [img, setImg] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    if (!img) return;
    setBusy(true);
    setError(null);
    try {
      onSaved(await api.put<Settings['images']>(`/settings/images/${slot.key}`, img));
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };
  return (
    <Modal
      title={`Remplacer : ${slot.label}`}
      onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Annuler</button><button className="btn btn-primary" disabled={!img || busy} onClick={() => void save()}>{busy && <Loader2 className="spin" size={15} />} Mettre en ligne</button></>}
    >
      {img ? (
        <>
          <img className="preview-img" src={img.url} alt="" />
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setImg(null)}>Choisir une autre photo</button>
        </>
      ) : (
        <ImagePicker folder="site" cloudinary={cloudinary} onPicked={setImg} />
      )}
      <p className="small muted" style={{ marginTop: 12 }}>Conseil : une photo horizontale d’au moins 1600 px de large, nette et bien éclairée.</p>
      {error && <div className="alert" style={{ marginTop: 10 }}>{error}</div>}
    </Modal>
  );
}
