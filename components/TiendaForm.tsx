'use client';

import { useState, type FormEvent } from 'react';
import { ACENTOS, CATEGORIAS } from '@/lib/constants';
import type { Categoria } from '@/types';
import type { TiendaInput } from '@/lib/owner-local';
import ImageCropper from '@/components/ImageCropper';

interface TiendaFormProps {
  initialValues?: Partial<TiendaInput> & { fotoOriginalUrl?: string };
  submitLabel: string;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
}

const CATEGORIAS_SELECCIONABLES = CATEGORIAS.filter((c) => c.slug !== 'todas');
const inputClass = 'w-full px-3.5 py-2.5 rounded-[8px] bg-surface border border-border text-primary placeholder:text-muted text-sm outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all';
const labelClass = 'block text-sm font-medium text-primary mb-1.5';

export default function TiendaForm({ initialValues, submitLabel, onSubmit, onCancel }: TiendaFormProps) {
  const [nombre, setNombre] = useState(initialValues?.nombre ?? '');
  const [categoria, setCategoria] = useState<Categoria>(initialValues?.categoria ?? 'comida');
  const [descripcionCorta, setDescripcionCorta] = useState(initialValues?.descripcionCorta ?? '');
  const [ubicacion, setUbicacion] = useState(initialValues?.ubicacion ?? '');
  const [horario, setHorario] = useState(initialValues?.horario ?? '');
  const [colorAcento, setColorAcento] = useState(initialValues?.colorAcento ?? 'naranja');
  const [fotoPortadaUrl, setFotoPortadaUrl] = useState<string | undefined>(initialValues?.fotoPortadaUrl);
  const [fotoOriginalUrl, setFotoOriginalUrl] = useState<string | undefined>(initialValues?.fotoOriginalUrl);
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !ubicacion.trim() || !horario.trim()) {
      setError('Completa nombre, ubicación y horario.');
      return;
    }
    setError('');
    try {
      onSubmit({ nombre: nombre.trim(), categoria, descripcionCorta: descripcionCorta.trim() || undefined, ubicacion: ubicacion.trim(), horario: horario.trim(), fotoPortadaUrl, fotoOriginalUrl, colorAcento });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Foto de portada ── */}
      <div>
        <label className={labelClass}>
          Foto de portada <span className="text-muted font-normal">(opcional)</span>
        </label>
        <div className="relative w-full aspect-[16/9] rounded-[16px] overflow-hidden bg-[#FFE4D6] border border-border">
          {fotoPortadaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoPortadaUrl} alt="Portada" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <ImageCropper
            folder="tiendas"
            aspect={16 / 9}
            currentUrl={fotoPortadaUrl ?? null}
            originalUrl={fotoOriginalUrl ?? null}
            onUploaded={(displayUrl, origUrl) => {
              setFotoPortadaUrl(displayUrl);
              setFotoOriginalUrl(origUrl);
            }}
          />
        </div>
        <p className="text-xs text-muted mt-1.5">
          {fotoPortadaUrl ? 'Toca la imagen para ajustar el encuadre.' : 'Sube una foto de portada para tu tienda.'}
        </p>
      </div>

      {/* ── Nombre ── */}
      <div>
        <label htmlFor="f-nombre" className={labelClass}>Nombre de la tienda</label>
        <input id="f-nombre" className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Panadería La Madrugada" />
      </div>

      {/* ── Categoría ── */}
      <div>
        <label htmlFor="f-categoria" className={labelClass}>Categoría</label>
        <select id="f-categoria" className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
          {CATEGORIAS_SELECCIONABLES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.emoji} {c.label}</option>
          ))}
        </select>
      </div>

      {/* ── Color de acento ── */}
      <div>
        <label className={labelClass}>Color de acento</label>
        <div className="flex gap-2.5 flex-wrap" role="radiogroup" aria-label="Color de acento">
          {ACENTOS.map((a) => {
            const selected = colorAcento === a.key;
            return (
              <button key={a.key} type="button" role="radio" aria-checked={selected} aria-label={a.label} onClick={() => setColorAcento(a.key)}
                className="h-9 w-9 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: a.base, boxShadow: selected ? `0 0 0 3px var(--color-surface), 0 0 0 5px ${a.dark}` : 'none' }}>
                {selected && (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-1.5">Se usa en tu perfil y en tu ficha pública para darle tu toque.</p>
      </div>

      {/* ── Descripción ── */}
      <div>
        <label htmlFor="f-descripcion" className={labelClass}>Descripción corta <span className="text-muted font-normal">(opcional)</span></label>
        <textarea id="f-descripcion" className={`${inputClass} resize-none`} rows={2} value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} placeholder="Ej. Pan artesanal y empanadas recién horneadas" />
      </div>

      {/* ── Ubicación ── */}
      <div>
        <label htmlFor="f-ubicacion" className={labelClass}>Ubicación</label>
        <input id="f-ubicacion" className={inputClass} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ej. Manzana 4, Casa 12" />
      </div>

      {/* ── Horario ── */}
      <div>
        <label htmlFor="f-horario" className={labelClass}>Horario</label>
        <input id="f-horario" className={inputClass} value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ej. Lun-Sáb 8am-6pm" />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 rounded-[16px] border border-border text-primary font-semibold text-sm hover:bg-surface transition-colors">
            Cancelar
          </button>
        )}
        <button type="submit" className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-[16px] transition-colors text-sm">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
