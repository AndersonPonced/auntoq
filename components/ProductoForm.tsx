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
  const [fotoUrl, setFotoUrl] = useState(initialValues?.fotoUrl);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [error, setError] = useState('');

  async function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('La foto es muy pesada (máx. 8MB).');
      return;
    }
    setError('');
    setProcesandoFoto(true);
    try {
      const url = await uploadImage(file, 'productos');
      setFotoUrl(url);
    } catch {
      setError('No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setProcesandoFoto(false);
    }
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
        fotoUrl 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-surface border border-border rounded-[16px] p-4">
      <div>
        <label className={labelClass}>Foto</label>
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-[8px] overflow-hidden bg-[#FFE4D6] border border-border">
            {fotoUrl && (
              <Image src={fotoUrl} alt="" fill sizes="64px" className="object-cover" />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            {procesandoFoto ? (
              <div className="w-full text-center px-3 py-2.5 rounded-[8px] border border-border text-sm font-semibold text-muted">
                Procesando…
              </div>
            ) : (
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-[8px] bg-brand/10 text-brand text-xs font-bold hover:bg-brand/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Tomar foto
                  <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFotoChange} />
                </label>
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-[8px] border border-border text-primary text-xs font-bold hover:bg-bg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Galería
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFotoChange} />
                </label>
              </div>
            )}
          </div>
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
