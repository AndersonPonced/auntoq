/**
 * lib/owner-local.ts
 *
 * Self-service local storage for a store owner's own listing.
 * There is no backend yet, so "registering" a store just means saving a
 * Tienda object (same shape as the core model — see types/index.ts) in this
 * browser's localStorage. Client-only: every export is a no-op on the server.
 *
 * getMiTienda()/getMisProductos() cache their parsed result and only
 * re-parse when the underlying localStorage value actually changed, so they
 * return a stable reference — required for useSyncExternalStore below.
 *
 * When a real backend lands, this file is what gets replaced — components
 * that use it (app/registro, app/perfil, etc.) won't need to change beyond
 * swapping these hooks for a data-fetching equivalent.
 */
import { useSyncExternalStore } from 'react';
import type { Tienda, Producto, Categoria } from '@/types';

const STORAGE_KEY = 'auntoque_mi_tienda';
const PRODUCTOS_KEY = 'auntoque_mis_productos';

export interface TiendaInput {
  nombre: string;
  categoria: Categoria;
  descripcionCorta?: string;
  ubicacion: string;
  horario: string;
  whatsapp: string;
  /** Data URL from a photo the owner uploaded. Falls back to the existing/placeholder photo when omitted. */
  fotoPortadaUrl?: string;
  /** Key from lib/constants.ts#ACENTOS. Falls back to 'naranja' when omitted. */
  colorAcento?: string;
}

export interface ProductoInput {
  nombre: string;
  precio: number;
  descripcion?: string | null;
  disponible: boolean;
  /** Data URL from a photo the owner uploaded. Falls back to a placeholder when omitted. */
  fotoUrl?: string;
  /** Array of up to 4 data URLs. */
  fotosUrls?: string[];
}

// ---------------------------------------------------------------------------
// Change notifications — same-tab writes don't fire the native 'storage'
// event, so mutators below call emitChange() themselves. Cross-tab changes
// are picked up via 'storage'.
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();

/**
 * localStorage.setItem that surfaces quota errors as a friendly Spanish
 * message instead of letting QuotaExceededError bubble up raw — product
 * photos are stored as data URLs and can fill the ~5-10MB browser quota.
 */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    throw new Error(
      'No hay espacio suficiente en este dispositivo para guardar los cambios. Elimina alguna foto o producto e intenta de nuevo.',
    );
  }
}

function emitChange(): void {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === PRODUCTOS_KEY) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let cachedTiendaRaw: string | null = null;
let cachedTienda: Tienda | null = null;

export function getMiTienda(): Tienda | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedTiendaRaw) {
    cachedTiendaRaw = raw;
    try {
      cachedTienda = raw ? (JSON.parse(raw) as Tienda) : null;
    } catch {
      cachedTienda = null;
    }
  }
  return cachedTienda;
}

/** Reactive read of the owner's own store — re-renders on any local change. */
export function useMiTienda(): Tienda | null {
  return useSyncExternalStore(subscribe, getMiTienda, getMiTienda);
}

export function saveMiTienda(input: TiendaInput): Tienda {
  const existing = getMiTienda();
  const tienda: Tienda = {
    id: existing?.id ?? `local-${Date.now()}`,
    nombre: input.nombre,
    categoria: input.categoria,
    descripcionCorta: input.descripcionCorta,
    fotoPortadaUrl:
      input.fotoPortadaUrl ??
      existing?.fotoPortadaUrl ??
      `https://picsum.photos/seed/${encodeURIComponent(input.nombre)}/600/400`,
    ubicacion: input.ubicacion,
    horario: input.horario,
    whatsapp: input.whatsapp,
    activa: true,
    colorAcento: input.colorAcento ?? existing?.colorAcento ?? 'naranja',
  };
  safeSetItem(STORAGE_KEY, JSON.stringify(tienda));
  emitChange();
  return tienda;
}

export function clearMiTienda(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PRODUCTOS_KEY);
  emitChange();
}

// ---------------------------------------------------------------------------
// Products for the owner's own store
// ---------------------------------------------------------------------------

const EMPTY_PRODUCTOS: Producto[] = [];
let cachedProductosRaw: string | null = null;
let cachedProductos: Producto[] = EMPTY_PRODUCTOS;

export function getMisProductos(): Producto[] {
  if (typeof window === 'undefined') return EMPTY_PRODUCTOS;
  const raw = localStorage.getItem(PRODUCTOS_KEY);
  if (raw !== cachedProductosRaw) {
    cachedProductosRaw = raw;
    try {
      cachedProductos = raw ? (JSON.parse(raw) as Producto[]) : EMPTY_PRODUCTOS;
    } catch {
      cachedProductos = EMPTY_PRODUCTOS;
    }
  }
  return cachedProductos;
}

/** Reactive read of the owner's own products — re-renders on any local change. */
export function useMisProductos(): Producto[] {
  return useSyncExternalStore(subscribe, getMisProductos, getMisProductos);
}

function setMisProductos(productos: Producto[]): void {
  safeSetItem(PRODUCTOS_KEY, JSON.stringify(productos));
  emitChange();
}

export function addMiProducto(tiendaId: string, input: ProductoInput): Producto {
  const fotosUrls = input.fotosUrls ?? (input.fotoUrl ? [input.fotoUrl] : []);
  const mainFotoUrl = fotosUrls[0] ?? `https://picsum.photos/seed/${encodeURIComponent(input.nombre)}-${Date.now()}/400/400`;
  
  const nuevo: Producto = {
    id: `local-prod-${Date.now()}`,
    tiendaId,
    nombre: input.nombre,
    fotoUrl: mainFotoUrl,
    fotosUrls,
    precio: input.precio,
    descripcion: input.descripcion,
    disponible: input.disponible,
  };
  setMisProductos([...getMisProductos(), nuevo]);
  return nuevo;
}

export function updateMiProducto(id: string, input: ProductoInput): void {
  setMisProductos(
    getMisProductos().map((p) => {
      if (p.id !== id) return p;
      const fotosUrls = input.fotosUrls ?? p.fotosUrls ?? (input.fotoUrl ? [input.fotoUrl] : (p.fotoUrl ? [p.fotoUrl] : []));
      const mainFotoUrl = fotosUrls[0] ?? p.fotoUrl;
      return {
        ...p,
        nombre: input.nombre,
        precio: input.precio,
        descripcion: input.descripcion,
        disponible: input.disponible,
        fotoUrl: mainFotoUrl,
        fotosUrls,
      };
    }),
  );
}

export function deleteMiProducto(id: string): void {
  setMisProductos(getMisProductos().filter((p) => p.id !== id));
}
