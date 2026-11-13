import { ImagePlus, Link2, Loader2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

import { api, ApiError, errorMessage } from '../services/api';

type Signature = { uploadUrl: string; apiKey: string; folder: string; timestamp: number; allowed_formats: string; signature: string };
export type PickedImage = { url: string; publicId: string | null };

const MAX_MB = 10;

/**
 * Choix d'une image :
 * 1. envoi direct à Cloudinary (signé par le backend, comme VoirAuto)
 * 2. ou, si Cloudinary n'est pas configuré, une adresse (URL) collée
 */
export function ImagePicker({ folder, cloudinary, onPicked }: { folder: 'gallery' | 'site'; cloudinary: boolean; onPicked: (img: PickedImage) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url'>(cloudinary ? 'upload' : 'url');
  const [progress, setProgress] = useState<number | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const upload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) return setError('Choisissez une image (JPG, PNG, WebP).');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image trop lourde (${MAX_MB} Mo maximum).`);
    try {
      setProgress(0);
      const sig = await api.post<Signature>('/uploads/signature', { folder });
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('folder', sig.folder);
      form.append('allowed_formats', sig.allowed_formats);
      form.append('signature', sig.signature);
      // XMLHttpRequest pour afficher la progression de l'envoi
      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', sig.uploadUrl);
        xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(json);
            else reject(new Error(json?.error?.message ?? 'Envoi refusé par Cloudinary'));
          } catch {
            reject(new Error('Réponse invalide de Cloudinary'));
          }
        };
        xhr.onerror = () => reject(new Error('Connexion à Cloudinary impossible'));
        xhr.send(form);
      });
      onPicked({ url: result.secure_url, publicId: result.public_id });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'CLOUDINARY_DISABLED') setMode('url');
      setError(e instanceof ApiError ? errorMessage(e) : (e as Error).message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 12, display: 'inline-flex' }}>
        <button type="button" className={mode === 'upload' ? 'is-active' : ''} onClick={() => setMode('upload')}><UploadCloud size={14} /> Depuis l’ordinateur</button>
        <button type="button" className={mode === 'url' ? 'is-active' : ''} onClick={() => setMode('url')}><Link2 size={14} /> Adresse (URL)</button>
      </div>

      {mode === 'upload' ? (
        <>
          {!cloudinary && <div className="notice" style={{ marginBottom: 10 }}>Cloudinary n’est pas encore configuré sur le serveur : utilisez « Adresse (URL) » pour l’instant.</div>}
          <div
            className={`dropzone ${over ? 'is-over' : ''}`}
            onClick={() => progress === null && input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) void upload(f); }}
          >
            {progress !== null ? (
              <>
                <Loader2 className="spin" size={22} />
                <div>Envoi en cours… {progress} %</div>
                <div className="progress"><span style={{ width: `${progress}%` }} /></div>
              </>
            ) : (
              <>
                <ImagePlus size={26} />
                <div style={{ marginTop: 6, fontWeight: 600 }}>Cliquez ou déposez une photo ici</div>
                <div className="small">JPG, PNG ou WebP — {MAX_MB} Mo maximum</div>
              </>
            )}
            <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }} />
          </div>
        </>
      ) : (
        <div className="row" style={{ alignItems: 'stretch' }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/…  (ou images.pexels.com / images.unsplash.com)" />
          </div>
          <button type="button" className="btn btn-primary" disabled={!/^https?:\/\//.test(url.trim())} onClick={() => onPicked({ url: url.trim(), publicId: null })}>
            Utiliser
          </button>
        </div>
      )}
      {error && <div className="alert" style={{ marginTop: 10, marginBottom: 0 }}>{error}</div>}
    </div>
  );
}
