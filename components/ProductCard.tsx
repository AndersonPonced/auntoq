import Image from 'next/image';
import type { Producto } from '@/types';
import { formatPrice } from '@/lib/constants';

interface ProductCardProps {
  producto: Producto;
  /** When shown in search results, display the parent store name */
  tiendaNombre?: string;
  index?: number;
  /** When provided (owner's profile), shows a management overlay instead of being a plain display card */
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductCard({
  producto,
  tiendaNombre,
  index = 0,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const unavailable = !producto.disponible;
  const manageable = Boolean(onEdit || onDelete);

  return (
    <article
      id={`product-card-${producto.id}`}
      className={`bg-white rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.1)] transition-all duration-300 transform active:scale-95 animate-fade-up ${
        unavailable ? 'opacity-60 grayscale-[30%]' : ''
      } flex flex-col h-full`}
      style={{ animationDelay: `${index * 0.06}s` }}
      aria-label={`${producto.nombre}${unavailable ? ' — Agotado' : ''}`}
    >
      <div className="relative aspect-square w-full bg-[#FFF4F3] overflow-hidden group">
        {producto.fotoUrl ? (
          <Image
            src={producto.fotoUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🛍️
          </div>
        )}
        
        {/* Gradients to ensure text/badges are visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />

        {unavailable && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-[#4E211E] text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Agotado
            </span>
          </div>
        )}

        {manageable && (
          <div className="absolute top-2 left-2 flex gap-1.5 z-20">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                aria-label={`Editar ${producto.nombre}`}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-[#4E211E] hover:bg-white hover:scale-110 transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                aria-label={`Eliminar ${producto.nombre}`}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-[#FF6B35] hover:bg-white hover:scale-110 transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-grow bg-white">
        <h3
          className={`text-[14px] md:text-[15px] font-bold leading-tight mb-1 line-clamp-2 ${
            unavailable ? 'line-through text-[#834C48]/60' : 'text-[#4E211E]'
          }`}
        >
          {producto.nombre}
        </h3>
        
        {producto.descripcion && (
          <p className="text-[12px] text-[#834C48]/80 line-clamp-2 leading-relaxed mb-2 flex-grow">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto pt-1">
          <p
            className={`font-headline font-black text-[15px] md:text-[17px] ${
              unavailable ? 'text-[#834C48]/50' : 'text-[#FF6B35]'
            }`}
          >
            {formatPrice(producto.precio)}
          </p>
          {tiendaNombre && (
            <p className="text-[11px] font-medium text-[#834C48]/60 truncate mt-0.5">{tiendaNombre}</p>
          )}
        </div>
      </div>
    </article>
  );
}
