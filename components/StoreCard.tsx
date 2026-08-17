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
    `Tienda de ${cat.label.toLowerCase()}`;

  const content = (
    <>
      {/* Cover photo */}
      <div className="relative h-44 md:h-52 w-full overflow-hidden rounded-[20px] shadow-[0_2px_12px_rgb(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgb(0,0,0,0.12)] transition-shadow duration-300 bg-[#D6EFFB]">
        <Image
          src={tienda.fotoPortadaUrl}
          alt={`Foto de portada de ${tienda.nombre}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-out ${interactive ? 'group-hover:scale-105' : ''}`}
          priority={index < 2}
        />
        {/* Subtle dark gradient overlay at top for badge contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
        
        {/* Category badge floating */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span aria-hidden="true" className="text-sm">{cat.emoji}</span>
          <span className="text-[11px] font-extrabold text-[#0E2A52] tracking-tight uppercase">{cat.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-3 px-1">
        <h2 className="font-headline font-black text-[#0E2A52] text-[17px] md:text-[19px] leading-tight mb-0.5 truncate">
          {tienda.nombre}
        </h2>
        
        <p className="text-[13px] text-[#4C6B8F]/80 line-clamp-1 mb-2">
          {description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold text-[#4C6B8F]/90">
          <span className="flex items-center gap-1 bg-[#D6EFFB] px-2 py-1 rounded-md text-[#1D5FCC]">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[#0E2A52]">{tienda.horario}</span>
          </span>
        </div>
      </div>
    </>
  );

  if (!interactive) {
    return (
      <div
        className="block bg-transparent"
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
      className="group block bg-transparent active:scale-[0.98] transition-transform duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-label={`Ver tienda: ${tienda.nombre}`}
    >
      {content}
    </Link>
  );
}
