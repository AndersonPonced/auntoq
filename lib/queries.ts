/**
 * lib/queries.ts
 *
 * Thin data-access layer between the UI and the data source.
 * Currently backed by local mock data.
 * To switch to a real backend (Supabase, etc.) replace ONLY the internals
 * of these functions — the signatures stay the same so components need zero changes.
 */
import { tiendas, productos } from './mock-data';
import type { Tienda, Producto, Categoria } from '@/types';

// ---------------------------------------------------------------------------
// Store queries
// ---------------------------------------------------------------------------

/** Return all active stores, optionally filtered by category */
export function getTiendas(categoria?: Categoria | 'todas'): Tienda[] {
  const activas = tiendas.filter((t) => t.activa);
  if (!categoria || categoria === 'todas') return activas;
  return activas.filter((t) => t.categoria === categoria);
}

/** Return a single store by id, or undefined if not found */
export function getTiendaById(id: string): Tienda | undefined {
  return tiendas.find((t) => t.id === id);
}

// ---------------------------------------------------------------------------
// Product queries
// ---------------------------------------------------------------------------

/** Return all products belonging to a store */
export function getProductosByTienda(tiendaId: string): Producto[] {
  return productos.filter((p) => p.tiendaId === tiendaId);
}

// ---------------------------------------------------------------------------
// Category counts
// ---------------------------------------------------------------------------

/** Return a map of category → active store count (plus 'todas') */
export function getCategoryCounts(): Record<string, number> {
  const activas = tiendas.filter((t) => t.activa);
  const counts: Record<string, number> = { todas: activas.length };
  for (const t of activas) {
    counts[t.categoria] = (counts[t.categoria] ?? 0) + 1;
  }
  return counts;
}


// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResults {
  tiendas: Tienda[];
  productos: Array<Producto & { tiendaNombre: string }>;
}

/**
 * Full-text search across store names and product names.
 * Returns an empty result when query is blank.
 */
export function search(query: string): SearchResults {
  const q = query.toLowerCase().trim();
  if (!q) return { tiendas: [], productos: [] };

  const matchedTiendas = tiendas.filter(
    (t) => t.activa && t.nombre.toLowerCase().includes(q),
  );

  const matchedProductos = productos
    .filter((p) => p.nombre.toLowerCase().includes(q))
    .map((p) => ({
      ...p,
      tiendaNombre: tiendas.find((t) => t.id === p.tiendaId)?.nombre ?? '',
    }));

  return { tiendas: matchedTiendas, productos: matchedProductos };
}
