'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import StoreCard from '@/components/StoreCard';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import AppLogo from '@/components/AppLogo';
import { search } from '@/lib/queries';
import { useMiTienda, useMisProductos } from '@/lib/owner-local';

const STORAGE_KEY = 'auntoque_recent_searches';
const MAX_RECENT = 5;

function getStoredSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const prev = getStoredSearches().filter((s) => s !== trimmed);
  const next = [trimmed, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const miTiendaRaw = useMiTienda();
  const miTienda = miTiendaRaw?.activa ? miTiendaRaw : null;
  const misProductos = useMisProductos();

  // Load recent searches on mount (client only)
  useEffect(() => {
    setRecentSearches(getStoredSearches());
  }, []);

  // Sync query from URL param
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(q);
    if (q) {
      saveSearch(q);
      setRecentSearches(getStoredSearches());
    }
  }, [searchParams]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      saveSearch(value.trim());
      setRecentSearches(getStoredSearches());
    }
  }, []);

  const baseResults = search(query);
  const q = query.toLowerCase().trim();
  const results = {
    tiendas:
      miTienda && miTienda.nombre.toLowerCase().includes(q)
        ? [miTienda, ...baseResults.tiendas]
        : baseResults.tiendas,
    productos: [
      ...baseResults.productos,
      ...misProductos
        .filter((p) => q && p.nombre.toLowerCase().includes(q))
        .map((p) => ({ ...p, tiendaNombre: miTienda?.nombre ?? '' })),
    ],
  };
  const hasResults = results.tiendas.length > 0 || results.productos.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="max-w-[480px] md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8 space-y-6 md:space-y-8">
      <div className="md:max-w-xl">
        <SearchBar defaultValue={initialQuery} autoFocus onSearch={handleSearch} />
      </div>

      {/* ── No query: recent searches ───────────────────────── */}
      {!hasQuery && (
        <section aria-label="Búsquedas recientes">
          <p className="text-sm font-semibold text-primary mb-3">
            Búsquedas recientes
          </p>
          {recentSearches.length === 0 ? (
            <p className="text-sm text-muted">
              Tus búsquedas aparecerán aquí 👆
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  id={`recent-${term.replace(/\s+/g, '-')}`}
                  onClick={() => handleSearch(term)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-[8px] text-sm text-muted hover:border-brand hover:text-brand transition-colors"
                >
                  🕐 {term}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setRecentSearches([]);
                }}
                className="px-3 py-1.5 text-xs text-muted hover:text-brand transition-colors"
              >
                Borrar
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Has query, no results ────────────────────────────── */}
      {hasQuery && !hasResults && (
        <EmptyState
          icon="😔"
          title="Sin resultados"
          description={`No encontramos nada para "${query}". Intenta con otra palabra.`}
        />
      )}

      {/* ── Store results ────────────────────────────────────── */}
      {results.tiendas.length > 0 && (
        <section aria-label="Tiendas encontradas">
          <h2 className="font-headline font-semibold text-primary text-base mb-3">
            Tiendas
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 list-none p-0">
            {results.tiendas.map((tienda, i) => (
              <li key={tienda.id}>
                <StoreCard tienda={tienda} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Product results ──────────────────────────────────── */}
      {results.productos.length > 0 && (
        <section aria-label="Productos encontrados">
          <h2 className="font-headline font-semibold text-primary text-base mb-3">
            Productos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {results.productos.map((producto, i) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                tiendaNombre={producto.tiendaNombre}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <main>
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
      </header>

      <Suspense fallback={
        <div className="max-w-[480px] md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-6 py-5">
          <div className="skeleton h-12 w-full md:max-w-xl rounded-[8px]" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </main>
  );
}
