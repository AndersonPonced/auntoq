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
      className={`bg-surface rounded-[16px] border border-border overflow-hidden transition-opacity animate-fade-up ${
        unavailable ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 0.06}s` }}
      aria-label={`${producto.nombre}${unavailable ? ' — Agotado' : ''}`}
    >
      <div className="relative aspect-square w-full bg-[#FFE4D6] overflow-hidden">
        {producto.fotoUrl ? (
          <Image
            src={producto.fotoUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            🛍️
          </div>
        )}
        {unavailable && (
          <span className="absolute top-2 right-2 bg-soldout text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Agotado
          </span>
        )}
        {manageable && (
          <div className="absolute top-2 left-2 flex gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Editar ${producto.nombre}`}
                className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-primary hover:bg-white transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Eliminar ${producto.nombre}`}
                className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-red-600 hover:bg-white transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-0.5">
        <p
          className={`text-sm font-medium leading-snug line-clamp-2 ${
            unavailable ? 'line-through text-muted' : 'text-primary'
          }`}
        >
          {producto.nombre}
        </p>
        <p
          className={`font-headline font-bold text-lg ${
            unavailable ? 'text-muted' : 'text-brand'
          }`}
        >
          {formatPrice(producto.precio)}
        </p>
        {tiendaNombre && (
          <p className="text-xs text-muted truncate pt-0.5">{tiendaNombre}</p>
        )}
      </div>
    </article>
  );
}
