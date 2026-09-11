'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Producto } from '@/types';
import { formatPrice, tiendaHref } from '@/lib/constants';
import { generateStoryImage } from '@/lib/image-utils';

interface ProductModalProps {
  producto: Producto;
  storeName: string;
  acento: { base: string; dark: string };
  whatsapp: string;
  /** Store id — used to build the shareable link back to this product. */
  tiendaId: string;
  /** Store category — shown as a badge on the generated Story/Status image. */
  categoriaEmoji?: string;
  categoriaLabel?: string;
  /** Optional store logo — shown next to the store name on the generated image. */
  logoUrl?: string;
  /** True only when the store's own owner is viewing (e.g. from "Mi tienda") — gates the "add your logo" tip below the share buttons, since a visitor can't act on it. */
  esPropietario?: boolean;
  onClose: () => void;
}

export default function ProductModal({ producto, storeName, acento, whatsapp, tiendaId, categoriaEmoji, categoriaLabel, logoUrl, esPropietario = false, onClose }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [compartiendo, setCompartiendo] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const fotos = producto.fotosUrls?.length ? producto.fotosUrls : (producto.fotoUrl ? [producto.fotoUrl] : []);

  // ── Touch swipe para el carrusel de fotos en móvil ───────────────────────
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || fotos.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setCurrentImageIndex(i =>
        diff > 0
          ? (i === fotos.length - 1 ? 0 : i + 1)  // swipe izquierda → siguiente
          : (i === 0 ? fotos.length - 1 : i - 1)   // swipe derecha → anterior
      );
    }
    touchStartX.current = null;
  };

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
    `Hola, vi el catálogo de ${storeName} en Auntokke y quiero pedir:\n\n*${producto.nombre}* - ${formatPrice(producto.precio)}\n\n`
  );
  const waLink = `https://wa.me/${number}?text=${msg}`;

  // Link back to this exact product — TiendaContent reads `?producto=` on
  // load and opens this same modal for whoever clicks it.
  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${tiendaHref(tiendaId)}?producto=${producto.id}`
    : '';
  const groupCaption = `Mira "${producto.nombre}" (${formatPrice(producto.precio)}) de ${storeName} en Auntokke:\n${productUrl}`;
  // Text-only fallback for browsers that can't share files (mainly desktop) —
  // at least the link goes through even without the image attached.
  const groupTextOnlyLink = `https://wa.me/?text=${encodeURIComponent(groupCaption)}`;

  /**
   * Generates the Story/Status image and hands it to the OS share sheet
   * together with `caption` — WhatsApp receives both the file and the text
   * when the user picks it (and their chat/group/status of choice) there.
   * Falls back to just downloading the image (plus opening `fallbackLink`,
   * if given) when file sharing isn't supported or the share attempt fails.
   */
  async function shareProductImage(caption: string, fallbackLink?: string) {
    setShareError(null);
    setCompartiendo(true);
    try {
      const dataUrl = await generateStoryImage({
        fotoUrl: fotos[0],
        nombre: producto.nombre,
        precioTexto: formatPrice(producto.precio),
        storeName,
        acentoBase: acento.base,
        acentoDark: acento.dark,
        categoriaEmoji,
        categoriaLabel,
        logoUrl,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${producto.nombre}.png`, { type: 'image/png' });
      const shareData = { files: [file], title: producto.nombre, text: caption };

      let shared = false;
      if (navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          shared = true;
        } catch (shareErr) {
          // User cancelled the native share sheet — leave it at that.
          if (shareErr instanceof DOMException && shareErr.name === 'AbortError') return;
          // Any other failure (e.g. the browser refused because the gesture
          // had gone stale by the time the image finished generating) falls
          // through to the fallback below instead of dead-ending.
        }
      }

      if (!shared) {
        // Desktop / unsupported browser / share() failed — download the
        // image so it can be attached by hand, and still open the WhatsApp
        // link (if any) so the text/link isn't lost either.
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${producto.nombre}.png`;
        a.click();
        if (fallbackLink) window.open(fallbackLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error(err);
      setShareError('No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      setCompartiendo(false);
    }
  }

  const handleShareStory = () =>
    shareProductImage(`${producto.nombre} - ${formatPrice(producto.precio)} en ${storeName}`);

  const handleShareGroup = () => shareProductImage(groupCaption, groupTextOnlyLink);

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
        className="relative w-full md:max-w-md bg-surface rounded-t-[24px] md:rounded-[24px] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Carousel — soporta swipe táctil en móvil */}
        <div
          className="relative w-full aspect-square bg-[#C7E7F7] flex-shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {fotos.length > 0 ? (
            <>
              <Image
                src={fotos[currentImageIndex]}
                alt={`${producto.nombre} - Foto ${currentImageIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover"
                priority
              />
              {fotos.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center px-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i === 0 ? fotos.length - 1 : i - 1); }}
                      className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i === fotos.length - 1 ? 0 : i + 1); }}
                      className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                    {fotos.map((_, idx) => (
                      <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
          )}
          {unavailable && (
            <span className="absolute top-3 left-3 z-10 bg-soldout text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              Agotado
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5 pb-8 space-y-4 flex-1 overflow-y-auto overscroll-contain">
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

          {/* ── Compartir producto ── */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 pt-2">
              Compartir producto
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareStory}
                disabled={compartiendo}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-[14px] border border-border text-primary text-xs font-semibold hover:bg-bg transition-colors disabled:opacity-60"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="7" y="2" width="10" height="20" rx="3" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                {compartiendo ? 'Generando…' : 'Estado / Stories'}
              </button>
              <button
                type="button"
                onClick={handleShareGroup}
                disabled={compartiendo}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-[14px] border border-border text-primary text-xs font-semibold hover:bg-bg transition-colors disabled:opacity-60"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4a4 4 0 100-8 4 4 0 000 8zm7 4a4 4 0 10-8 0" />
                </svg>
                {compartiendo ? 'Generando…' : 'Grupo de WhatsApp'}
              </button>
            </div>
            {shareError && (
              <p role="alert" className="text-xs text-red-600 mt-2">{shareError}</p>
            )}
            {esPropietario && !logoUrl && (
              <p className="text-[11px] text-muted mt-2 leading-relaxed">
                💡 Agrega el logo de tu tienda en <span className="font-semibold">Editar</span> para que aparezca en la imagen que compartes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
