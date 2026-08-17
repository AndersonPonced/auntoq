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
    <main>
      {/* ── App Header (Yummy style) ── */}
      <header className="bg-bg px-4 pt-6 pb-2">
        <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between gap-4">
          
          {/* Location mock */}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-wide">
              Entregar en
            </span>
            <button className="flex items-center gap-1.5 text-left group">
              <span className="font-headline font-black text-[#4E211E] text-base md:text-lg truncate group-hover:text-[#FF6B35] transition-colors">
                Altos de Copacabana
              </span>
              <svg className="h-4 w-4 text-[#FF6B35] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* User / Store Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link 
              href="/perfil" 
              aria-label="Mi tienda" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E09C96]/30 shadow-sm text-[#4E211E] hover:bg-[#FFF4F3] hover:text-[#FF6B35] transition-all"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {user ? (
              <button
                onClick={() => { signOut(); setUser(null); }}
                aria-label="Cerrar sesión"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E09C96]/30 shadow-sm text-red-500 hover:bg-red-50 transition-all"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <Link 
                href="/login" 
                aria-label="Iniciar Sesión"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6B35] text-white shadow-md hover:bg-[#A63300] transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Buscador Sticky ── */}
      <div className="sticky top-0 z-20 bg-bg shadow-sm border-b border-[#E09C96]/30">
        <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-3">
          <SearchBar defaultValue={query} onSearch={setQuery} />
        </div>
      </div>

      {/* ── Categorías ── */}
      <div className="bg-bg border-b border-border">
        <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-3">
          <CategoryChips selected={selected} onChange={setSelected} counts={counts} />
        </div>
      </div>

      {/* ── Instalar App ── */}
      <InstallBanner />

      {/* ── Tiendas ── */}
      <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-6 md:py-10">
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0" role="list">
            {tiendadFiltradas.map((t, i) => (
              <li key={t.id}>
                <StoreCard tienda={t} index={i} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer ── */}
      <Footer />
    </main>
  );
}
