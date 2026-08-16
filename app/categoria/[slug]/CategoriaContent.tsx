'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import CategoryChips from '@/components/CategoryChips';
import StoreCard from '@/components/StoreCard';
import EmptyState from '@/components/EmptyState';
import AppLogo from '@/components/AppLogo';
import { useMiTienda } from '@/lib/owner-local';
import type { CategoryMeta } from '@/lib/constants';
import type { Categoria, Tienda } from '@/types';

interface CategoriaContentProps {
  slug: Categoria;
  cat: CategoryMeta;
  tiendasIniciales: Tienda[];
  countsIniciales: Record<string, number>;
}

export default function CategoriaContent({
  slug,
  cat,
  tiendasIniciales,
  countsIniciales,
}: CategoriaContentProps) {
  const miTiendaRaw = useMiTienda();
  const miTienda = miTiendaRaw?.activa ? miTiendaRaw : null;

  const tiendas = useMemo(() => {
    if (miTienda?.categoria === slug) return [miTienda, ...tiendasIniciales];
    return tiendasIniciales;
  }, [miTienda, tiendasIniciales, slug]);

  const counts = useMemo(() => {
    if (!miTienda) return countsIniciales;
    return {
      ...countsIniciales,
      todas: (countsIniciales.todas ?? 0) + 1,
      [miTienda.categoria]: (countsIniciales[miTienda.categoria] ?? 0) + 1,
    };
  }, [miTienda, countsIniciales]);

  return (
    <main>
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="app-header">
        <div className="max-w-[480px] md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="p-2 -ml-2 rounded-full hover:bg-brand/10 transition-colors"
          >
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <AppLogo />
          <Link
            href="/perfil"
            aria-label="Mi tienda"
            className="ml-auto p-2 rounded-full hover:bg-brand/10 transition-colors"
          >
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>

        {/* Category chips with counts */}
        <div className="max-w-[480px] md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-6 pb-3">
          <CategoryChips selected={slug} counts={counts} />
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-[480px] md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8 space-y-4 md:space-y-6">
        <p className="text-sm text-muted font-medium">
          <span className="font-semibold text-primary">{tiendas.length}</span>{' '}
          tienda{tiendas.length !== 1 ? 's' : ''}{' '}
          en {cat.emoji} {cat.label}
        </p>

        {tiendas.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="Sin tiendas aún"
            description={`No hay tiendas activas en la categoría ${cat.label} todavía.`}
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 list-none p-0">
            {tiendas.map((tienda, i) => (
              <li key={tienda.id}>
                <StoreCard tienda={tienda} index={i} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
