'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import WhatsAppButton from '@/components/WhatsAppButton';
import ShareButton from '@/components/ShareButton';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import { useMiTienda, useMisProductos } from '@/lib/owner-local';
import { getAcentoMeta, getCategoryMeta, tiendaHref } from '@/lib/constants';
import type { Tienda, Producto } from '@/types';

interface TiendaContentProps {
  tiendaInicial: Tienda | null;
  productosIniciales: Producto[];
}

export default function TiendaContent({
  tiendaInicial,
  productosIniciales,
}: TiendaContentProps) {
  // Mock stores are resolved server-side already (tiendaInicial). The
  // owner's own store only exists in this browser's localStorage, so when
  // there's no server-resolved store this renders whatever is registered
  // locally instead — used by the static /tienda/mi-tienda route.
  const miTiendaLocal = useMiTienda();
  const misProductosLocal = useMisProductos();
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const tienda = tiendaInicial ?? miTiendaLocal;
  const productos = tiendaInicial
    ? productosIniciales
    : tienda
      ? misProductosLocal.filter((p) => p.tiendaId === tienda.id)
      : [];

  if (!tienda) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <span className="text-6xl" aria-hidden="true">🏪</span>
        <h1 className="font-headline font-bold text-primary text-2xl">
          Tienda no encontrada
        </h1>
        <p className="text-muted text-sm max-w-xs">
          Esta tienda no existe o fue removida.
        </p>
        <Link
          href="/"
          className="mt-2 px-5 py-3 bg-brand text-white rounded-[8px] font-semibold text-sm hover:bg-brand-dark transition-colors"
        >
          Volver al inicio
        </Link>
      </main>
    );
  }

  const cat = getCategoryMeta(tienda.categoria);
  const acento = getAcentoMeta(tienda.colorAcento);

  return (
    <>
    <main className="pb-28 md:pb-16">
      {/* ── Hero banner ───────────────────────────────────────── */}
      <div
        className="relative w-full aspect-[16/9] max-w-[480px] md:max-w-2xl mx-auto bg-[#FFE4D6] md:rounded-[16px] overflow-hidden md:border-2 md:mt-6"
        style={{ borderColor: acento.base }}
      >
        <Image
          src={tienda.fotoPortadaUrl}
          alt={`Foto de portada de ${tienda.nombre}`}
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Top row: back button + share */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
          >
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <ShareButton
            title={tienda.nombre}
            text={`Mira el catálogo de ${tienda.nombre} en Auntoke (Altos de Copacabana)`}
            url={tiendaHref(tienda.id)}
          />
        </div>
      </div>

      {/* ── Store info + catalog, single column below the hero ── */}
      <div className="max-w-[480px] md:max-w-2xl mx-auto px-4 md:px-0 py-5 space-y-4">
        {/* Category chip */}
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${acento.base}1A`, color: acento.dark }}
        >
          <span aria-hidden="true">{cat.emoji}</span>
          {cat.label}
        </span>

        {/* Name */}
        <h1 className="font-headline font-bold text-primary text-2xl md:text-3xl leading-tight">
          {tienda.nombre}
        </h1>

        {tienda.descripcionCorta && (
          <p className="text-muted text-sm md:text-base leading-relaxed">
            {tienda.descripcionCorta}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-2 text-sm text-muted">
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tienda.horario}
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {tienda.ubicacion}
          </span>
        </div>

        {/* Desktop-only inline CTA — mobile uses the sticky bar below */}
        <div className="hidden md:block">
          <WhatsAppButton whatsapp={tienda.whatsapp} storeName={tienda.nombre} />
        </div>

        <hr className="border-border" />

        {/* ── Catalog ─────────────────────────────────────────── */}
        <section aria-label="Catálogo de productos">
          <h2 className="font-headline font-semibold text-primary text-lg mb-4">
            Catálogo
          </h2>
          {productos.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Catálogo vacío"
              description="Esta tienda aún no ha añadido productos."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" role="list" aria-label="Productos">
              {productos.map((producto, i) => (
                <div key={producto.id} role="listitem">
                  <button
                    type="button"
                    className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-[16px]"
                    onClick={() => setSelectedProduct(producto)}
                    aria-label={`Ver detalle de ${producto.nombre}`}
                  >
                    <ProductCard producto={producto} index={i} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-t border-border md:hidden">
        <div className="max-w-[480px] mx-auto px-4 py-3">
          <WhatsAppButton whatsapp={tienda.whatsapp} storeName={tienda.nombre} />
        </div>
      </div>

      <Footer />
    </main>

    {/* ── Product detail modal ── */}
    {selectedProduct && (
      <ProductModal
        producto={selectedProduct}
        storeName={tienda.nombre}
        acento={acento}
        whatsapp={tienda.whatsapp}
        onClose={() => setSelectedProduct(null)}
      />
    )}
  </>
  );
}
