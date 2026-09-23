'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Tienda, Producto, Categoria } from '@/types';
import { getSession, signOut, type Usuario } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIAS, tiendaHref, getCategoryMeta } from '@/lib/constants';
import HomeProductCard from '@/components/HomeProductCard';
import HeroBanner from '@/components/HeroBanner';
import InstallBanner from '@/components/InstallBanner';
import Footer from '@/components/Footer';
import StoreCard from '@/components/StoreCard';
import ProductModal from '@/components/ProductModal';
import SearchBar from '@/components/SearchBar';

// ─── Auntokke WhatsApp number (acts as the mega-store) ───────────────────────
const AUNTOKKE_WA = '584121234567'; // ← reemplaza con tu número real

// ─── Product category filters for the home catalog ───────────────────────────
const HOME_CATS = [
  { slug: 'todas', label: 'Todos', emoji: '🛍️' },
  { slug: 'cocina', label: 'Cocina', emoji: '🍳' },
  { slug: 'hogar', label: 'Hogar', emoji: '🏠' },
  { slug: 'iluminacion', label: 'Iluminación', emoji: '💡' },
  { slug: 'tecnologia', label: 'Tecnología', emoji: '📱' },
  { slug: 'otros', label: 'Otros', emoji: '📦' },
];

// ─── Skeleton loader for product grid ────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-100 rounded w-1/3 mt-2" />
        <div className="h-9 bg-gray-100 rounded-xl mt-2" />
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
  const [megaTienda, setMegaTienda] = useState<{ whatsapp: string; acento: { base: string; dark: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('todas');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUser(session);

    // 1. Buscar la tienda de Auntokke (owner "mega-store") y sus productos
    supabase
      .from('tiendas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(async ({ data: tData }) => {
        const todas = tData ?? [];

        // Detectar logo del usuario logueado
        if (session) {
          const miT = todas.find((t: any) => t.owner_id === session.id);
          if (miT) setMiLogoUrl(miT.logo_url ?? null);
        }

        // Para el home: la "mega tienda" es la primera tienda activa que
        // encontramos (o puedes poner un ID fijo tuyo aquí)
        const megaRaw = todas[0];
        if (megaRaw) {
          setMegaTienda({
            whatsapp: megaRaw.whatsapp ?? AUNTOKKE_WA,
            acento: { base: '#1D5FCC', dark: '#0E2A52' },
          });

          // Traer productos de la mega-tienda
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

        // Otras tiendas para la sección de "comunidad"
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

  // Filter products by search + category
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchQuery = !query ||
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(query.toLowerCase());
      // Category filter is cosmetic for now (products don't have categories yet)
      return matchQuery;
    });
  }, [productos, query, catFilter]);

  const whatsapp = megaTienda?.whatsapp ?? AUNTOKKE_WA;
  const acento = megaTienda?.acento ?? { base: '#1D5FCC', dark: '#0E2A52' };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ─── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0E2A52] shadow-lg">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-bold text-xl text-white tracking-tight">Auntokke</span>
          </Link>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
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
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {user ? (
              <>
                <Link
                  href="/perfil"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition"
                >
                  {miLogoUrl ? (
                    <Image src={miLogoUrl} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )}
                  Mi tienda
                </Link>
                <button
                  onClick={() => { signOut(); setUser(null); }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 text-red-300 hover:bg-red-500/20 transition"
                  aria-label="Cerrar sesión"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden md:flex items-center px-4 py-2 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition">
                  Iniciar sesión
                </Link>
                <Link href="/signup" className="flex items-center px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-[#0E2A52] text-sm font-bold transition shadow">
                  Registrarse
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a1f3d] border-t border-white/10 px-4 py-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/perfil" className="text-white text-sm font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>👤 Mi tienda</Link>
                <button onClick={() => { signOut(); setUser(null); setMobileMenuOpen(false); }} className="text-red-300 text-sm font-semibold py-2 text-left">🚪 Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white text-sm font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Iniciar sesión</Link>
                <Link href="/signup" className="text-yellow-400 text-sm font-bold py-2" onClick={() => setMobileMenuOpen(false)}>Registrarse →</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* ─── CATEGORY NAV ────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
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

      {/* ─── HERO (desktop only) ─────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <HeroBanner whatsapp={whatsapp} />
      </div>

      {/* ─── MOBILE PROMO STRIP ──────────────────────────────────────────────── */}
      <div className="md:hidden bg-gradient-to-r from-[#0E2A52] to-[#1D5FCC] px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-white font-bold text-[15px] leading-tight">Auntokke</span>
          <span className="text-blue-200 text-[12px]">Productos para tu hogar 🏠</span>
        </div>
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Quiero más información sobre sus productos.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white font-bold text-[12px] rounded-full flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
          Escríbenos
        </a>
      </div>

      {/* ─── INSTALL BANNER ──────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-8 mt-4">
        <InstallBanner />
      </div>

      {/* ─── PRODUCTS SECTION ────────────────────────────────────────────────── */}
      <section id="productos" className="max-w-[1440px] mx-auto w-full px-3 md:px-4 lg:px-8 py-4 md:py-10 flex-1">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div>
            <h2 className="font-bold text-[#0E2A52] text-lg md:text-2xl lg:text-3xl">
              {query ? `Resultados para "${query}"` : '🛍️ Nuestros Productos'}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">Calidad garantizada · Entrega a domicilio</p>
          </div>
          {!query && (
            <span className="text-sm text-gray-400 hidden md:block">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="font-bold text-xl text-gray-700 mb-2">Sin resultados</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              {query ? `No encontramos productos con "${query}". Prueba con otro término.` : 'Pronto agregaremos más productos.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-6">
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

      {/* ─── STORES SECTION ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-100 py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-bold text-[#0E2A52] text-2xl lg:text-3xl mb-2">
              Tiendas de la comunidad
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Negocios de vecinos que venden desde su casa
            </p>
          </div>

          {tiendas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {tiendas.map((t, i) => (
                <StoreCard key={t.id} tienda={t} index={i} />
              ))}
            </div>
          ) : null}

          {/* CTA to open a store */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl shadow-[0_4px_24px_rgba(29,95,204,0.10)] border border-blue-100 p-8 lg:p-12 max-w-3xl mx-auto">
            <div className="text-center md:text-left flex-1">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="font-bold text-xl text-[#0E2A52] mb-2">¿Tienes un negocio?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sé el primero en unirte a nuestra comunidad. Crea tu tienda gratis, agrega tus productos y recibe pedidos por WhatsApp desde hoy.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1D5FCC] hover:bg-[#0E2A52] text-white font-bold text-[15px] rounded-2xl shadow-lg transition-all active:scale-95 whitespace-nowrap"
              >
                Abrir mi tienda gratis →
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 text-gray-600 font-semibold text-[14px] rounded-2xl hover:bg-gray-50 transition-all whitespace-nowrap"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT MODAL ───────────────────────────────────────────────────── */}
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

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
