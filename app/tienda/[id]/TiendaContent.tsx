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
      <div className="relative w-full aspect-[4/3] md:aspect-[21/9] max-w-5xl mx-auto bg-[#FFE4D6] md:rounded-b-[32px] overflow-hidden shadow-sm">
        <Image
          src={tienda.fotoPortadaUrl}
          alt={`Foto de portada de ${tienda.nombre}`}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
        {/* Gradient overlay for better text/button contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20" />

        {/* Top row: back button + share */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center max-w-5xl mx-auto">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="flex items-center justify-center w-10 h-10 bg-black/20 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-black/40 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <ShareButton
            title={tienda.nombre}
            text={`Mira el catálogo de ${tienda.nombre} en Auntoke`}
            url={tiendaHref(tienda.id)}
          />
        </div>
      </div>

      {/* ── Store info + catalog ── */}
      <div className="relative z-10 -mt-12 md:-mt-16 max-w-5xl mx-auto bg-white rounded-t-[32px] md:rounded-[32px] px-5 md:px-8 pt-6 md:pt-8 pb-5 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] md:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
        
        {/* Category chip */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="inline-flex items-center gap-1.5 text-[13px] font-bold px-3 py-1 rounded-full border"
            style={{ backgroundColor: `${acento.base}1A`, color: acento.dark, borderColor: `${acento.base}33` }}
          >
            <span aria-hidden="true" className="text-base">{cat.emoji}</span>
            {cat.label}
          </span>
        </div>

        {/* Name */}
        <h1 className="font-headline font-black text-[#4E211E] text-3xl md:text-4xl leading-tight tracking-tight mb-3">
          {tienda.nombre}
        </h1>

        {tienda.descripcionCorta && (
          <p className="text-[#834C48]/90 text-[15px] leading-relaxed mb-6">
            {tienda.descripcionCorta}
          </p>
        )}

        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 bg-[#FFF4F3] p-3 rounded-[16px] border border-[#E09C96]/30">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-brand">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#E09C96] uppercase tracking-wider">Horario</span>
              <span className="text-[13px] font-semibold text-[#4E211E]">{tienda.horario}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-[#FFF4F3] p-3 rounded-[16px] border border-[#E09C96]/30">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm text-brand">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#E09C96] uppercase tracking-wider">Ubicación</span>
              <span className="text-[13px] font-semibold text-[#4E211E]">{tienda.ubicacion}</span>
            </div>
          </div>
        </div>

        {/* Desktop-only inline CTA — mobile uses the sticky bar below */}
        <div className="hidden md:block mb-8">
          <WhatsAppButton whatsapp={tienda.whatsapp} storeName={tienda.nombre} />
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E09C96]/30 to-transparent mb-8" />

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5" role="list" aria-label="Productos">
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
