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
      onSubmit({ nombre: nombre.trim(), precio: precioNum, disponible, fotoUrl });
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
          <label className="flex-1 cursor-pointer text-center px-3 py-2.5 rounded-[8px] border border-border text-sm font-semibold text-primary hover:bg-bg transition-colors">
            {procesandoFoto ? 'Procesando…' : fotoUrl ? 'Cambiar foto' : 'Subir foto'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFotoChange}
              disabled={procesandoFoto}
            />
          </label>
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
