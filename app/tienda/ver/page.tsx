'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TiendaContent from '../[id]/TiendaContent';

// Static page — reads store ID from ?id= query param.
// This avoids dynamic route segments which are incompatible with
// Next.js static export (output: 'export') on shared hosting.

function TiendaVerInner() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';

  return (
    <TiendaContent
      tiendaId={id}
      tiendaInicial={null}
      productosIniciales={[]}
    />
  );
}

export default function TiendaVerPage() {
  return (
    <Suspense fallback={
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-brand/20 animate-pulse" />
        <p className="text-muted text-sm">Cargando tienda...</p>
      </main>
    }>
      <TiendaVerInner />
    </Suspense>
  );
}
