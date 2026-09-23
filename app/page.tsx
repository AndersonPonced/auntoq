'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Tienda, Producto } from '@/types';
import { getSession, signOut, type Usuario } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIAS, tiendaHref } from '@/lib/constants';
import HomeProductCard from '@/components/HomeProductCard';
import HeroBanner from '@/components/HeroBanner';
import InstallBanner from '@/components/InstallBanner';
import Footer from '@/components/Footer';
import StoreCard from '@/components/StoreCard';
import ProductModal from '@/components/ProductModal';
import PromoCarousel from '@/components/PromoCarousel';
import CategoryChips from '@/components/CategoryChips';

// ─── Auntokke WhatsApp number ─────────────────────────────────────────────────
const AUNTOKKE_WA = '584121234567'; // ← reemplaza con tu número real

// ─── Home category filter tabs ────────────────────────────────────────────────
const HOME_CATS = [
  { slug: 'todas', label: 'Todos', emoji: '🛍️' },
  { slug: 'cocina', label: 'Cocina', emoji: '🍳' },
  { slug: 'hogar', label: 'Hogar', emoji: '🏠' },
  { slug: 'iluminacion', label: 'Iluminación', emoji: '💡' },
  { slug: 'tecnologia', label: 'Tecnología', emoji: '📱' },
  { slug: 'otros', label: 'Otros', emoji: '📦' },
];

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const supabase = createClient();

  const [user, setUser] = useState<Usuario | null>(null);
  const [miLogoUrl, setMiLogoUrl] = useState<string | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [megaTienda, setMegaTienda] = useState<{ whatsapp: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('todas');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUser(session);

    supabase
      .from('tiendas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(async ({ data: tData }) => {
        const todas = tData ?? [];

        if (session) {
          const miT = todas.find((t: any) => t.owner_id === session.id);
          if (miT) setMiLogoUrl(miT.logo_url ?? null);
        }

        const megaRaw = todas[0];
        if (megaRaw) {
          setMegaTienda({ whatsapp: megaRaw.whatsapp ?? AUNTOKKE_WA });

          const { data: prods } = await supabase
            .from('productos')
            .select('*')
            .eq('tienda_id', megaRaw.id)
            .order('created_at', { ascending: true });

          setProductos((prods ?? []).map((p: any) => ({
            id: p.id,
            tiendaId: p.tienda_id,
            nombre: p.nombre,
            fotoUrl: p.foto_url ?? '',
            fotosUrls: p.fotos_urls ?? (p.foto_url ? [p.foto_url] : []),
            precio: p.precio,
            descripcion: p.descripcion,
            disponible: p.disponible,
          })));
        }

        setTiendas(todas.slice(1, 7).map((t: any) => ({
          id: t.id,
          nombre: t.nombre,
          categoria: t.categoria,
          descripcionCorta: t.descripcion_corta,
          ubicacion: t.ubicacion,
          horario: t.horario,
          fotoPortadaUrl: t.foto_portada_url ?? '',
          colorAcento: t.color_acento,
          activa: true,
          whatsapp: t.whatsapp ?? '',
        })));

        setLoading(false);
      });
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      return !query ||
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(query.toLowerCase());
    });
  }, [productos, query]);

  const whatsapp = megaTienda?.whatsapp ?? AUNTOKKE_WA;
  const acento = { base: '#1D5FCC', dark: '#0E2A52' };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">

      {/* ════════════════════════════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
      ════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col">

        {/* Mobile top header */}
        <header className="bg-white px-4 pt-5 pb-3 border-b border-[#A9CFEA]/20">
          <div className="flex items-center justify-between gap-4">
            {/* Brand / location */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#1D5FCC] uppercase tracking-wide">Productos de</span>
              <span className="font-headline font-black text-[#0E2A52] text-lg leading-tight">AUNTOKKE</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/perfil"
                aria-label="Mi perfil"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#A9CFEA]/30 shadow-sm text-[#0E2A52] hover:bg-[#D6EFFB] transition-all overflow-hidden"
              >
                {miLogoUrl ? (
                  <Image src={miLogoUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
              </Link>
              {user ? (
                <button
                  onClick={() => { signOut(); setUser(null); }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#A9CFEA]/30 shadow-sm text-red-400 hover:bg-red-50 transition-all"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              ) : (
                <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1D5FCC] text-white shadow-md hover:bg-[#0E2A52] transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Mobile search bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#A9CFEA]/20 px-4 py-3">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F0F4FF] border border-[#A9CFEA]/30 text-[#0E2A52] placeholder-[#4C6B8F]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5FCC]/30 transition"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4C6B8F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
          </div>
        </div>

        {/* Promo Carousel */}
        <div className="px-4 pt-4">
          <PromoCarousel />
        </div>

        {/* Category chips */}
        <div className="bg-white border-b border-[#A9CFEA]/20 mt-3">
          <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {HOME_CATS.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCatFilter(cat.slug)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  catFilter === cat.slug
                    ? 'bg-[#1D5FCC] text-white shadow-sm'
                    : 'bg-[#F0F4FF] text-[#4C6B8F] hover:bg-[#D6EFFB]'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Install banner */}
        <div className="px-4">
          <InstallBanner />
        </div>

        {/* Products grid (mobile) */}
        <div className="px-3 py-4">
          <h2 className="font-headline font-bold text-[#0E2A52] text-[17px] mb-3">
            {query ? `Resultados para "${query}"` : '🛍️ Nuestros Productos'}
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="text-5xl mb-3">🔍</span>
              <p className="text-[#4C6B8F] text-sm">
                {query ? `Sin resultados para "${query}"` : 'Próximamente agregaremos más productos.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {productosFiltrados.map((p, i) => (
                <HomeProductCard
                  key={p.id}
                  producto={p}
                  whatsapp={whatsapp}
                  index={i}
                  onClick={() => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stores CTA (mobile) */}
        <div className="mx-3 mb-4 bg-white rounded-3xl border border-[#A9CFEA]/30 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏪</span>
            <div>
              <h3 className="font-bold text-[#0E2A52] text-base">¿Tienes un negocio?</h3>
              <p className="text-[#4C6B8F] text-xs">Únete gratis a Auntokke</p>
            </div>
          </div>
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1D5FCC] hover:bg-[#0E2A52] text-white font-bold text-sm rounded-2xl transition-all"
          >
            Abrir mi tienda gratis →
          </Link>
        </div>

        <Footer />
      </div>

      {/* ════════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (hidden on mobile)
      ════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col flex-1">

        {/* Desktop header */}
        <header className="sticky top-0 z-40 bg-[#0E2A52] shadow-lg">
          <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center gap-4">
            <Link href="/" className="flex-shrink-0">
              <span className="font-bold text-xl text-white tracking-tight">Auntokke</span>
            </Link>

            {/* Search */}
            <div className="flex flex-1 max-w-2xl mx-auto">
              <div className="relative w-full">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white/20 transition"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {user ? (
                <>
                  <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition">
                    {miLogoUrl ? (
                      <Image src={miLogoUrl} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                    Mi tienda
                  </Link>
                  <button onClick={() => { signOut(); setUser(null); }} className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 text-red-300 hover:bg-red-500/20 transition">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex items-center px-4 py-2 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition">
                    Iniciar sesión
                  </Link>
                  <Link href="/signup" className="flex items-center px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-[#0E2A52] text-sm font-bold transition shadow">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Desktop category nav */}
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {HOME_CATS.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCatFilter(cat.slug)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    catFilter === cat.slug
                      ? 'bg-[#1D5FCC] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <HeroBanner whatsapp={whatsapp} />

        {/* Install banner */}
        <div className="max-w-[1440px] mx-auto w-full px-8 mt-4">
          <InstallBanner />
        </div>

        {/* Products */}
        <section id="productos" className="max-w-[1440px] mx-auto w-full px-8 py-10 flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-[#0E2A52] text-3xl">
                {query ? `Resultados para "${query}"` : 'Nuestros Productos'}
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">Calidad garantizada · Entrega a domicilio</p>
            </div>
            <span className="text-sm text-gray-400">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="font-bold text-xl text-gray-700 mb-2">Sin resultados</h3>
              <p className="text-gray-500 text-sm">{query ? `No encontramos "${query}".` : 'Próximamente agregaremos más productos.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 xl:grid-cols-5 gap-6">
              {productosFiltrados.map((p, i) => (
                <HomeProductCard
                  key={p.id}
                  producto={p}
                  whatsapp={whatsapp}
                  storeName="Auntokke"
                  index={i}
                  onClick={() => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Stores section */}
        <section className="bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-100 py-16">
          <div className="max-w-[1440px] mx-auto px-8">
            {tiendas.length > 0 && (
              <>
                <h2 className="font-bold text-[#0E2A52] text-3xl mb-8 text-center">Tiendas de la comunidad</h2>
                <div className="grid grid-cols-3 gap-6 mb-10">
                  {tiendas.map((t, i) => <StoreCard key={t.id} tienda={t} index={i} />)}
                </div>
              </>
            )}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl shadow-lg border border-blue-100 p-10 max-w-3xl mx-auto">
              <div className="text-center md:text-left flex-1">
                <div className="text-4xl mb-3">🏪</div>
                <h3 className="font-bold text-xl text-[#0E2A52] mb-2">¿Tienes un negocio?</h3>
                <p className="text-gray-500 text-sm">Crea tu tienda gratis, agrega tus productos y recibe pedidos por WhatsApp.</p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1D5FCC] hover:bg-[#0E2A52] text-white font-bold text-[15px] rounded-2xl shadow-lg transition-all">
                  Abrir mi tienda gratis →
                </Link>
                <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-2xl hover:bg-gray-50 transition-all">
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Product modal (shared) */}
      {selectedProduct && (
        <ProductModal
          producto={selectedProduct}
          storeName="Auntokke"
          acento={acento}
          whatsapp={whatsapp}
          tiendaId={selectedProduct.tiendaId}
          logoUrl={undefined}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
