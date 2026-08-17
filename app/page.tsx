'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import StoreCard from '@/components/StoreCard';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import type { Categoria } from '@/types';
import { getSession, signOut, type Usuario } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import InstallBanner from '@/components/InstallBanner';
import Footer from '@/components/Footer';
import PromoCarousel from '@/components/PromoCarousel';
import { getCategoryMeta } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [selected, setSelected] = useState<Categoria | 'todas'>('todas');
  const [user, setUser] = useState<Usuario | null>(null);
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const session = getSession();
    setUser(session);

    // Si hay sesión pero no tiene tienda, lo llevamos a crearla
    if (session) {
      supabase
        .from('tiendas')
        .select('id')
        .eq('owner_id', session.id)
        .maybeSingle()
        .then(({ data }) => { if (!data) router.push('/registro'); });
    }

    // Cargar todas las tiendas desde Supabase
    supabase
      .from('tiendas')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTiendas((data ?? []).map((t: any) => ({
          id: t.id,
          nombre: t.nombre,
          categoria: t.categoria,
          descripcionCorta: t.descripcion_corta,
          ubicacion: t.ubicacion,
          horario: t.horario,
          fotoPortadaUrl: t.foto_portada_url,
          colorAcento: t.color_acento,
          activa: true,
        })));
        setLoading(false);
      });
  }, []);

  // Filtrar por categoría y búsqueda
  const tiendadFiltradas = tiendas.filter((t) => {
    const matchCategoria = selected === 'todas' || t.categoria === selected;
    const matchQuery = !query || t.nombre.toLowerCase().includes(query.toLowerCase()) || t.descripcionCorta?.toLowerCase().includes(query.toLowerCase());
    return matchCategoria && matchQuery;
  });

  // Contar por categoría
  const counts = tiendas.reduce<Record<string, number>>((acc, t) => {
    acc['todas'] = (acc['todas'] ?? 0) + 1;
    acc[t.categoria] = (acc[t.categoria] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col lg:flex-row max-w-[1600px] mx-auto">
      
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 sticky top-0 h-screen bg-white border-r border-[#E09C96]/30 px-6 py-8">
        <div className="mb-8">
          <h1 className="font-headline font-black text-[#FF6B35] text-3xl tracking-tighter">Auntokke</h1>
          <p className="text-[#834C48] text-sm mt-1">Altos de Copacabana</p>
        </div>

        {/* Location selector */}
        <div className="mb-8 p-4 bg-[#FFF4F3] rounded-2xl border border-[#E09C96]/20">
          <span className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-wide">
            Entregar en
          </span>
          <button className="flex items-center gap-1.5 text-left group w-full mt-1">
            <span className="font-headline font-black text-[#4E211E] text-base truncate group-hover:text-[#FF6B35] transition-colors">
              Altos de Copacabana
            </span>
            <svg className="h-4 w-4 text-[#FF6B35] flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Vertical Categories */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
          <h2 className="font-headline font-bold text-[#4E211E] text-lg mb-4">Categorías</h2>
          <div className="flex flex-col gap-2">
            {['todas', ...Array.from(new Set(tiendas.map((t) => t.categoria)))].map((catId) => {
              const meta = catId === 'todas' ? { label: 'Todas', emoji: '✨' } : getCategoryMeta(catId);
              const count = counts[catId] || 0;
              const isSelected = selected === catId;
              
              return (
                <button
                  key={catId}
                  onClick={() => setSelected(catId as Categoria | 'todas')}
                  className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-[#FF6B35] text-white shadow-md' 
                      : 'hover:bg-[#FFF4F3] text-[#4E211E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.emoji}</span>
                    <span className="font-semibold text-sm">{meta.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E09C96]/20 text-[#834C48]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] lg:bg-white">
        
        {/* ── Mobile Header ── */}
        <header className="lg:hidden bg-white px-4 pt-6 pb-2 border-b border-[#E09C96]/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-wide">
                Entregar en
              </span>
              <button className="flex items-center gap-1.5 text-left group">
                <span className="font-headline font-black text-[#4E211E] text-base truncate group-hover:text-[#FF6B35] transition-colors">
                  Altos de Copacabana
                </span>
                <svg className="h-4 w-4 text-[#FF6B35] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {/* User / Store Actions (Mobile) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/perfil" className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E09C96]/30 shadow-sm text-[#4E211E] hover:bg-[#FFF4F3] transition-all">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </Link>
              {user ? (
                <button onClick={() => { signOut(); setUser(null); }} className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E09C96]/30 shadow-sm text-red-500 hover:bg-red-50 transition-all">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              ) : (
                <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6B35] text-white shadow-md hover:bg-[#A63300] transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ── Top Bar (Desktop & Mobile) ── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E09C96]/20">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8 lg:py-4">
            <div className="flex-1 max-w-2xl">
              <SearchBar defaultValue={query} onSearch={setQuery} />
            </div>
            
            {/* User / Store Actions (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0 ml-4">
              <Link href="/perfil" className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E09C96]/30 shadow-sm text-[#4E211E] hover:bg-[#FFF4F3] font-bold text-sm transition-all">
                <svg className="h-5 w-5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Mi Tienda
              </Link>
              {user ? (
                <button onClick={() => { signOut(); setUser(null); }} className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#E09C96]/30 shadow-sm text-red-500 hover:bg-red-50 transition-all">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-sm shadow-md hover:bg-[#A63300] transition-colors">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* ── Carrusel de Promociones ── */}
          <div className="w-full pt-4 lg:pt-6 lg:px-8">
            <PromoCarousel />
          </div>

          {/* ── Categorías (Mobile Only) ── */}
          <div className="lg:hidden bg-white border-b border-border mt-2">
            <div className="px-4 py-3">
              <CategoryChips selected={selected} onChange={setSelected} counts={counts} />
            </div>
          </div>

          {/* ── Instalar App ── */}
          <div className="lg:px-8">
            <InstallBanner />
          </div>

          {/* ── Tiendas ── */}
          <div className="px-4 py-6 md:py-8 lg:px-8 flex-1">
            <h2 className="font-headline font-bold text-[#4E211E] text-2xl mb-6 hidden lg:block">
              {query ? `Resultados para "${query}"` : selected === 'todas' ? 'Todas las tiendas' : `Tiendas de ${getCategoryMeta(selected as string).label}`}
            </h2>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-8 w-8 text-brand rounded-full border-4 border-current border-t-transparent" />
              </div>
            ) : tiendadFiltradas.length === 0 ? (
              <EmptyState
                icon="🏪"
                title={query ? 'Sin resultados' : 'Aún no hay tiendas'}
                description={query ? `No encontramos tiendas con "${query}".` : 'Sé el primero en registrar tu negocio.'}
              />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 list-none p-0" role="list">
                {tiendadFiltradas.map((t, i) => (
                  <li key={t.id}>
                    <StoreCard tienda={t} index={i} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <Footer />
      </main>
    </div>
  );
}
