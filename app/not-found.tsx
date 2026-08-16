import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
      <span className="text-6xl" aria-hidden="true">🏪</span>
      <h1 className="font-headline font-bold text-primary text-2xl">
        Página no encontrada
      </h1>
      <p className="text-muted text-sm max-w-xs">
        La tienda o la página que buscas no existe o fue removida.
      </p>
      <Link
        href="/"
        className="mt-2 px-5 py-3 bg-brand text-white rounded-[8px] font-semibold text-sm hover:bg-brand-dark transition-colors"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
