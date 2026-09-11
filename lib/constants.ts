import type { Categoria } from '@/types';

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------
export interface CategoryMeta {
  slug: Categoria | 'todas';
  label: string;
  emoji: string;
}

export const CATEGORIAS: CategoryMeta[] = [
  { slug: 'todas', label: 'Todas', emoji: '🏪' },
  { slug: 'comida', label: 'Comida', emoji: '🍞' },
  { slug: 'ropa', label: 'Ropa', emoji: '👗' },
  { slug: 'ferreteria', label: 'Ferretería', emoji: '🔧' },
  { slug: 'reposteria', label: 'Repostería', emoji: '🎂' },
  { slug: 'belleza', label: 'Belleza', emoji: '💅' },
  { slug: 'transporte', label: 'Transporte', emoji: '🚕' },
  { slug: 'servicios', label: 'Servicios', emoji: '🛠️' },
  { slug: 'variedades', label: 'Variedades', emoji: '🏷️' },
  { slug: 'otros', label: 'Otros', emoji: '📦' },
];

export function getCategoryMeta(slug: string): CategoryMeta {
  return (
    CATEGORIAS.find((c) => c.slug === slug) ?? {
      slug: 'otros' as const,
      label: slug,
      emoji: '📦',
    }
  );
}

// ---------------------------------------------------------------------------
// Accent colors — curated palette owners can pick for their own profile/ficha.
// Kept off the catalog grid (StoreCard) on purpose so the public listing
// stays visually consistent; only shows in the owner's own spaces.
// ---------------------------------------------------------------------------
export interface AcentoMeta {
  key: string;
  label: string;
  /** Solid color — used for borders/accents */
  base: string;
  /** Darker variant — used as text color over a light tint of `base` */
  dark: string;
}

export const ACENTOS: AcentoMeta[] = [
  { key: 'azul', label: 'Azul', base: '#1D5FCC', dark: '#0E2A52' },
  { key: 'naranja', label: 'Naranja', base: '#F3781E', dark: '#B85A12' },
  { key: 'rosa', label: 'Rosa', base: '#E0527B', dark: '#99235A' },
  { key: 'salvia', label: 'Salvia', base: '#4B8B6F', dark: '#2F5C48' },
  { key: 'morado', label: 'Morado', base: '#8859A3', dark: '#5A3971' },
  { key: 'mostaza', label: 'Mostaza', base: '#C98A1D', dark: '#7A5310' },
];

export function getAcentoMeta(key?: string): AcentoMeta {
  return ACENTOS.find((a) => a.key === key) ?? ACENTOS[0];
}

// ---------------------------------------------------------------------------
// Store link helper — locally-registered stores (no backend yet) don't have
// a stable id known at build time, so `output: 'export'` can't statically
// generate /tienda/[id] for them. They're served from the static
// /tienda/mi-tienda route instead, which resolves the store from
// localStorage rather than a route param.
// ---------------------------------------------------------------------------
/** Returns the URL for a store's public page — works in static hosting */
export function tiendaHref(id: string): string {
  return `/tienda/ver?id=${id}`;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function buildWhatsAppLink(whatsapp: string, storeName: string): string {
  if (!whatsapp) return '#';
  // Limpiar el número: quitar espacios, guiones, paréntesis y el símbolo +
  const clean = whatsapp.replace(/[\s\-\(\)\+]/g, '');
  // Si no empieza con el código de Venezuela (58), lo agregamos automáticamente
  const number = clean.startsWith('58') ? clean : `58${clean}`;
  const text = encodeURIComponent(
    `Hola, vi el catálogo de ${storeName} en Auntokke y quiero pedir: `,
  );
  return `https://wa.me/${number}?text=${text}`;
}

// ---------------------------------------------------------------------------
// Social links — owners can type either a bare username or a full URL;
// this normalizes either into a clickable link per platform.
// ---------------------------------------------------------------------------
export type RedSocial = 'instagram' | 'facebook' | 'linktree' | 'paginaWeb';

const SOCIAL_BASE_URL: Record<Exclude<RedSocial, 'paginaWeb'>, string> = {
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  linktree: 'https://linktr.ee/',
};

export function buildSocialUrl(red: RedSocial, value: string): string {
  const trimmed = value.trim();
  // Website URLs are stored as-is (always full URL)
  if (red === 'paginaWeb') {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${SOCIAL_BASE_URL[red]}${trimmed.replace(/^@/, '')}`;
}
