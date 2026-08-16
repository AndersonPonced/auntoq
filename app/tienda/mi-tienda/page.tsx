import type { Metadata } from 'next';
import TiendaContent from '../[id]/TiendaContent';

export const metadata: Metadata = {
  title: 'Mi tienda',
};

/**
 * Static (non-dynamic) route for the owner's own store — resolved from
 * localStorage client-side inside TiendaContent. Exists because locally
 * registered stores don't have an id known at build time, so they can't be
 * served through /tienda/[id] under `output: 'export'`.
 */
export default function MiTiendaPage() {
  return <TiendaContent tiendaInicial={null} productosIniciales={[]} />;
}
