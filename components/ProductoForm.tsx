'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { MAX_UPLOAD_BYTES } from '@/lib/image-utils';
import { uploadImage } from '@/lib/storage';
import type { ProductoInput } from '@/lib/owner-local';

interface ProductoFormProps {
  initialValues?: Partial<ProductoInput>;
  submitLabel: string;
  onSubmit: (values: ProductoInput) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-[8px] bg-bg border border-border text-primary placeholder:text-muted text-sm outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all';
const labelClass = 'block text-sm font-medium text-primary mb-1.5';

export default function ProductoForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductoFormProps) {
  const [nombre, setNombre] = useState(initialValues?.nombre ?? '');
  const [precio, setPrecio] = useState(initialValues?.precio?.toString() ?? '');
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion ?? '');
  const [disponible, setDisponible] = useState(initialValues?.disponible ?? true);
  
  // Use fotosUrls if available, otherwise fallback to fotoUrl, otherwise empty
  const [fotosUrls, setFotosUrls] = useState<string[]>(
    initialValues?.fotosUrls ?? (initialValues?.fotoUrl ? [initialValues.fotoUrl] : [])
  );
  
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [error, setError] = useState('');

  async function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('La foto es muy pesada (máx. 8MB).');
      return;
    }
    if (fotosUrls.length >= 4) {
      setError('Puedes subir máximo 4 fotos.');
      return;
    }
    setError('');
    setProcesandoFoto(true);
    try {
      const url = await uploadImage(file, 'productos');
      setFotosUrls((prev) => [...prev, url]);
    } catch {
      setError('No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setProcesandoFoto(false);
    }
  }

  function handleRemoveFoto(indexToRemove: number) {
    setFotosUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const precioNum = parseFloat(precio);
    if (!nombre.trim() || Number.isNaN(precioNum) || precioNum <= 0) {
      setError('Completa el nombre y un precio válido.');
      return;
    }
    setError('');
    try {
      onSubmit({ 
        nombre: nombre.trim(), 
        precio: precioNum, 
        descripcion: descripcion.trim() || undefined,
        disponible, 
        fotosUrls,
        fotoUrl: fotosUrls[0] // Main image fallback
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface border border-border rounded-[16px] p-4">
      <div>
        <div className="flex justify-between items-end mb-2">
          <label className="text-sm font-medium text-primary">Fotos ({fotosUrls.length}/4)</label>
          <span className="text-xs text-muted">La primera será la portada</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fotosUrls.map((url, idx) => (
            <div key={url} className="relative aspect-square rounded-[8px] overflow-hidden bg-[#FFE4D6] border border-border group">
              <Image src={url} alt={`Foto ${idx + 1}`} fill sizes="100px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveFoto(idx)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                aria-label="Eliminar foto"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {idx === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-brand/80 backdrop-blur-sm text-white text-[10px] font-bold text-center py-0.5">
                  PORTADA
                </div>
              )}
            </div>
          ))}
          
          {fotosUrls.length < 4 && (
            <div className={`relative aspect-square rounded-[8px] border-2 border-dashed border-border flex flex-col items-center justify-center bg-bg/50 ${procesandoFoto ? 'opacity-50' : ''}`}>
              {procesandoFoto ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand border-t-transparent"></div>
              ) : (
                <>
                  <svg className="w-6 h-6 text-brand mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-semibold text-primary">Añadir foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFotoChange}
                    disabled={procesandoFoto}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="p-nombre" className={labelClass}>
          Producto
        </label>
        <input
          id="p-nombre"
          className={inputClass}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Golfeados (6 unid.)"
        />
      </div>

      <div>
        <label htmlFor="p-precio" className={labelClass}>
          Precio (USD)
        </label>
        <input
          id="p-precio"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          className={inputClass}
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej. 4.50"
        />
      </div>

      <div>
        <label htmlFor="p-descripcion" className={labelClass}>
          Descripción (Opcional)
        </label>
        <textarea
          id="p-descripcion"
          className={`${inputClass} resize-none h-20`}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles sobre este producto..."
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          checked={disponible}
          onChange={(e) => setDisponible(e.target.checked)}
          className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
        />
        Disponible ahora
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-[8px] border border-border text-primary font-semibold text-sm hover:bg-bg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={procesandoFoto}
          className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-[8px] transition-colors text-sm disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
