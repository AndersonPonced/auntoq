'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import type { Producto } from '@/types';
import { formatPrice } from '@/lib/constants';

interface ProductModalProps {
  producto: Producto;
  storeName: string;
  acento: { base: string; dark: string };
  whatsapp: string;
  onClose: () => void;
}

export default function ProductModal({ producto, storeName, acento, whatsapp, onClose }: ProductModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const unavailable = !producto.disponible;

  const clean = whatsapp.replace(/[\s\-\(\)\+]/g, '');
  const number = clean.startsWith('58') ? clean : `58${clean}`;
  const msg = encodeURIComponent(
    `Hola, vi el catálogo de ${storeName} en Auntoke y quiero pedir:\n\n*${producto.nombre}* - ${formatPrice(producto.precio)}\n\n`
  );
  const waLink = `https://wa.me/${number}?text=${msg}`;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={producto.nombre}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full md:max-w-md bg-surface rounded-t-[24px] md:rounded-[24px] overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative w-full aspect-square bg-[#FFE4D6]">
          {producto.fotoUrl ? (
            <Image
              src={producto.fotoUrl}
              alt={producto.nombre}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
          )}
          {unavailable && (
            <span className="absolute top-3 left-3 bg-soldout text-white text-xs font-semibold px-3 py-1 rounded-full">
              Agotado
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-headline font-bold text-primary text-xl leading-tight flex-1">
              {producto.nombre}
            </h2>
            <span
              className="font-headline font-bold text-2xl flex-shrink-0"
              style={{ color: acento.dark }}
            >
              {formatPrice(producto.precio)}
            </span>
          </div>

          {producto.descripcion && (
            <p className="text-muted text-sm leading-relaxed">{producto.descripcion}</p>
          )}

          {/* CTA */}
          {!unavailable ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[14px] font-bold text-white text-[15px] transition-all active:scale-[0.98] shadow-lg"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Pedir por WhatsApp
            </a>
          ) : (
            <p className="text-center text-sm text-muted py-2">Este producto no está disponible actualmente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
