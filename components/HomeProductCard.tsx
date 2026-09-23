'use client';

import Image from 'next/image';
import type { Producto } from '@/types';
import { formatPrice } from '@/lib/constants';

interface HomeProductCardProps {
  producto: Producto;
  whatsapp: string;
  storeName?: string;
  index?: number;
  onClick?: () => void;
}

function StarRating({ score = 4.5 }: { score?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.floor(score) ? 'text-yellow-400' : star - 0.5 <= score ? 'text-yellow-300' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[11px] text-gray-500 ml-0.5">(4.{Math.floor(score * 10) % 10})</span>
    </div>
  );
}

export default function HomeProductCard({
  producto,
  whatsapp,
  storeName,
  index = 0,
  onClick,
}: HomeProductCardProps) {
  const unavailable = !producto.disponible;
  const number = whatsapp.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Hola! Vi "${producto.nombre}" (${formatPrice(producto.precio)}) en Auntokke y me interesa. ¿Está disponible?`,
  );
  const waLink = `https://wa.me/${number}?text=${msg}`;

  return (
    <article
      id={`home-product-${producto.id}`}
      onClick={onClick}
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#A9CFEA]/60 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(29,95,204,0.12)] transition-all duration-300 cursor-pointer animate-fade-up flex flex-col ${unavailable ? 'opacity-70' : ''}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        {producto.fotoUrl ? (
          <Image
            src={producto.fotoUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {!unavailable && (
            <span className="bg-[#1D5FCC] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shadow">
              Disponible
            </span>
          )}
          {unavailable && (
            <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shadow">
              Agotado
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 md:p-4 flex flex-col flex-grow">
        <h3 className="text-[12px] md:text-[14px] font-semibold text-gray-800 leading-snug mb-1 line-clamp-2 group-hover:text-[#1D5FCC] transition-colors">
          {producto.nombre}
        </h3>

        {storeName && (
          <p className="text-[10px] md:text-[11px] text-gray-400 mb-1 truncate">por {storeName}</p>
        )}

        <div className="my-1 hidden md:block">
          <StarRating score={4.5} />
        </div>

        {producto.descripcion && (
          <p className="hidden md:block text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2 flex-grow">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto pt-1.5 md:pt-2 md:border-t md:border-gray-50">
          <p className="font-bold text-[15px] md:text-[18px] text-[#0E2A52] mb-1.5 md:mb-2">
            {formatPrice(producto.precio)}
          </p>

          {!unavailable ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 md:gap-2 w-full py-2 md:py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold text-[11px] md:text-[13px] transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden sm:inline">Pedir por </span>WhatsApp
            </a>
          ) : (
            <p className="text-center text-xs text-gray-400 py-1">No disponible</p>
          )}
        </div>
      </div>
    </article>
  );
}
