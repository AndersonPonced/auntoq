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
      {/* ── Hero header ── */}
      <header className="relative bg-gradient-to-br from-brand to-brand-dark text-white px-4 pt-12 pb-8 md:pt-16 md:pb-14">
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium opacity-90 hidden sm:inline-block">
                {user.nombre_completo || user.email}
              </span>
              <button
                onClick={() => { signOut(); setUser(null); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-red-500/80 backdrop-blur-sm transition-colors text-xs md:text-sm font-semibold"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors text-xs md:text-sm font-semibold">
              Iniciar Sesión
            </Link>
          )}
          <Link href="/perfil" aria-label="Mi tienda" className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors text-xs md:text-sm font-semibold">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi tienda
          </Link>
        </div>

        <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto">
          <h1 className="font-headline font-bold text-3xl md:text-5xl leading-tight mb-2">
            Auntoq'
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-6 md:mb-8">
            Descubre los negocios de tu comunidad
          </p>
          <SearchBar defaultValue={query} onSearch={setQuery} />
        </div>
      </header>

      {/* ── Categorías ── */}
      <div className="sticky top-0 z-10 bg-bg border-b border-border">
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 list-none p-0" role="list">
            {tiendadFiltradas.map((t, i) => (
              <li key={t.id}>
                <StoreCard tienda={t} index={i} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
