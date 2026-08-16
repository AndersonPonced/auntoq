import Link from 'next/link';
import Image from 'next/image';
import type { Tienda } from '@/types';
import { getCategoryMeta, tiendaHref } from '@/lib/constants';

interface StoreCardProps {
  tienda: Tienda;
  /** Index in list — used for staggered fade-up animation delay */
  index?: number;
  /** When false, renders as a static (non-clickable) preview — used in the owner's profile */
  interactive?: boolean;
}

export default function StoreCard({ tienda, index = 0, interactive = true }: StoreCardProps) {
  const cat = getCategoryMeta(tienda.categoria);

  // Fallback description if the store didn't provide one
  const description =
    tienda.descripcionCorta ??
    `Tienda de ${cat.label.toLowerCase()} en ${tienda.ubicacion.split(',')[0]}`;

  const content = (
    <>
      {/* Cover photo — warm bg shows while image loads */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden bg-[#FFE4D6]">
        <Image
          src={tienda.fotoPortadaUrl}
          alt={`Foto de portada de ${tienda.nombre}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-300 ${interactive ? 'group-hover:scale-105' : ''}`}
          priority={index < 2}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Category chip */}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark bg-brand/10 px-2.5 py-0.5 rounded-full">
          <span aria-hidden="true">{cat.emoji}</span>
          {cat.label}
        </span>

        {/* Store name */}
        <h2 className="font-headline font-semibold text-primary text-base leading-tight line-clamp-1">
          {tienda.nombre}
        </h2>

        <p className="text-sm text-muted line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted pt-1">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tienda.horario}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {tienda.ubicacion}
          </span>
        </div>
      </div>
    </>
  );

  if (!interactive) {
    return (
      <div
        className="block bg-surface rounded-[16px] border border-border shadow-sm overflow-hidden"
        aria-label={`Vista previa de tienda: ${tienda.nombre}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={tiendaHref(tienda.id)}
      id={`store-card-${tienda.id}`}
      className="group block bg-surface rounded-[16px] border border-border shadow-sm overflow-hidden hover:shadow-md active:scale-[0.98] active:shadow-none transition-all animate-fade-up"
      style={{ animationDelay: `${index * 0.07}s` }}
      aria-label={`Ver tienda: ${tienda.nombre}`}
    >
      {content}
    </Link>
  );
}
