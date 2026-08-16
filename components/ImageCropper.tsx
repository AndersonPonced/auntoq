'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { uploadImage } from '@/lib/storage';

interface ImageCropperProps {
  folder: 'tiendas' | 'productos';
  aspect?: number;
  /** URL de la imagen que se MUESTRA actualmente (versión recortada) */
  currentUrl?: string | null;
  /** URL de la imagen ORIGINAL sin recortar — siempre se recorta desde aquí */
  originalUrl?: string | null;
  /** Se llama con (displayUrl, originalUrl) cuando se confirma el recorte */
  onUploaded: (displayUrl: string, originalUrl: string) => void;
}

async function getCroppedBlob(
  imageSrc: string,
  croppedArea: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = croppedArea.width;
  canvas.height = croppedArea.height;
  ctx.drawImage(image, croppedArea.x, croppedArea.y, croppedArea.width, croppedArea.height, 0, 0, croppedArea.width, croppedArea.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas vacío')), 'image/jpeg', 0.9);
  });
}

export default function ImageCropper({ folder, aspect = 16 / 9, currentUrl, originalUrl, onUploaded }: ImageCropperProps) {
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [pendingOriginalUrl, setPendingOriginalUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ajustar: siempre usa la imagen ORIGINAL para recortar.
   * Si no hay original guardada, usa la actual como fallback.
   */
  async function handleAjustar() {
    const srcToLoad = originalUrl || currentUrl;
    if (!srcToLoad) return;
    setError(null);
    try {
      const res = await fetch(srcToLoad);
      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      setRawSrc(localUrl);
      // Guardamos la URL original para pasarla de vuelta en onUploaded
      setPendingOriginalUrl(originalUrl || currentUrl || null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch {
      setError('No se pudo cargar la imagen. Intenta con "Cambiar".');
    }
  }

  /** Cambiar: sube una nueva imagen original y abre el recortador */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError('La foto es muy pesada (máx. 8MB).'); return; }
    setError(null);

    // Subir la imagen ORIGINAL primero (sin recortar)
    try {
      const origUrl = await uploadImage(file, folder, 'originals');
      setPendingOriginalUrl(origUrl);

      // Abrir el recortador con el archivo local
      const reader = new FileReader();
      reader.onload = () => { setRawSrc(reader.result as string); setCrop({ x: 0, y: 0 }); setZoom(1); };
      reader.readAsDataURL(file);
    } catch {
      setError('No se pudo subir la imagen. Intenta de nuevo.');
    }
    e.target.value = '';
  }

  const onCropComplete = useCallback((_: any, pixels: any) => setCroppedAreaPixels(pixels), []);

  async function handleConfirm() {
    if (!rawSrc || !croppedAreaPixels) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(rawSrc, croppedAreaPixels);
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const displayUrl = await uploadImage(file, folder, 'cropped');
      const origUrl = pendingOriginalUrl || displayUrl;
      onUploaded(displayUrl, origUrl);
      if (rawSrc.startsWith('blob:')) URL.revokeObjectURL(rawSrc);
      setRawSrc(null);
    } catch {
      setError('No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    if (rawSrc?.startsWith('blob:')) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
    setZoom(1);
  }

  // ─── Sin imagen: zona de upload ───────────────────────────────────────────
  if (!currentUrl) {
    return (
      <>
        <label className="cursor-pointer block w-full h-full absolute inset-0 z-10">
          <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-black/5 transition-colors">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-semibold text-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Subir foto
            </div>
          </div>
        </label>
        {error && <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-red-500 bg-white/80 py-0.5">{error}</p>}

        {/* Modal recortador */}
        {rawSrc && <CropperModal rawSrc={rawSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} onConfirm={handleConfirm} onCancel={handleCancel} uploading={uploading} error={error} />}
      </>
    );
  }

  // ─── Con imagen: botones Ajustar / Cambiar ────────────────────────────────
  return (
    <>
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/0 hover:bg-black/40 transition-colors group">
        <button
          type="button"
          onClick={handleAjustar}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-primary text-xs font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:bg-white"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Ajustar
        </button>
        <label className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-primary text-xs font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:bg-white cursor-pointer">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Cambiar
          <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        </label>
      </div>
      {error && <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-red-500 bg-white/80 py-0.5 z-20">{error}</p>}

      {rawSrc && <CropperModal rawSrc={rawSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} onConfirm={handleConfirm} onCancel={handleCancel} uploading={uploading} error={error} />}
    </>
  );
}

// ─── Modal del recortador (componente separado para reutilizar) ────────────
function CropperModal({ rawSrc, crop, zoom, aspect, onCropChange, onZoomChange, onCropComplete, onConfirm, onCancel, uploading, error }: any) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-5 py-4 bg-black/80 backdrop-blur-sm shrink-0">
        <button type="button" onClick={onCancel} className="text-white/70 hover:text-white text-sm font-medium transition-colors">
          Cancelar
        </button>
        <span className="text-white font-semibold text-sm">Ajustar imagen</span>
        <button type="button" onClick={onConfirm} disabled={uploading} className="text-[#FF6B35] hover:text-[#FF8C55] font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5">
          {uploading
            ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Subiendo...</>
            : 'Usar foto'}
        </button>
      </div>
      <div className="relative flex-1">
        <Cropper image={rawSrc} crop={crop} zoom={zoom} aspect={aspect} onCropChange={onCropChange} onZoomChange={onZoomChange} onCropComplete={onCropComplete} showGrid style={{ containerStyle: { background: '#000' }, cropAreaStyle: { borderColor: '#FF6B35', borderWidth: 2 } }} />
      </div>
      <div className="px-6 py-5 bg-black/80 backdrop-blur-sm shrink-0">
        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <svg className="w-4 h-4 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => onZoomChange(Number(e.target.value))} className="flex-1 accent-[#FF6B35]" aria-label="Zoom"/>
          <svg className="w-5 h-5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6"/></svg>
        </div>
        <p className="text-center text-white/40 text-xs mt-2">Arrastra para encuadrar · Desliza para hacer zoom</p>
      </div>
    </div>
  );
}
