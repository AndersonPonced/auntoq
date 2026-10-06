'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import TiendaContent from '@/app/tienda/[id]/TiendaContent';

export default function NotFound() {
  const [handle, setHandle] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const path = window.location.pathname;
    if (path.startsWith('/@')) {
      const parts = path.split('/');
      const handlePart = parts.find(p => p.startsWith('@'));
      if (handlePart) {
        setHandle(handlePart.substring(1));
      }
    }
  }, []);

  if (!isClient) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 rounded-full bg-blue-100 animate-pulse" />
      </main>
    );
  }

  if (handle) {
    return (
      <Suspense fallback={<div className="min-h-screen animate-pulse bg-blue-50/50" />}>
        <TiendaContent
          tiendaSlug={handle}
          tiendaInicial={null}
          productosIniciales={[]}
        />
      </Suspense>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
      <span className="text-6xl" aria-hidden="true">😕</span>
      <h1 className="font-headline font-bold text-[#0E2A52] text-2xl">
        Página no encontrada
      </h1>
      <p className="text-gray-500 text-sm max-w-xs">
        La tienda o la página que buscas no existe o fue removida.
      </p>
      <Link
        href="/"
        className="mt-2 px-5 py-3 bg-[#1D5FCC] text-white rounded-[8px] font-semibold text-sm hover:bg-[#0E2A52] transition-colors"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
