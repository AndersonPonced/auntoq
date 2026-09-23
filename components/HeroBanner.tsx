'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeroBannerProps {
  whatsapp: string;
}

const FEATURES = [
  { icon: '🚚', label: 'Envío a domicilio' },
  { icon: '✅', label: 'Calidad garantizada' },
  { icon: '💬', label: 'Pedidos por WhatsApp' },
  { icon: '🔒', label: 'Compra segura' },
];

export default function HeroBanner({ whatsapp }: HeroBannerProps) {
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Quiero saber más sobre los productos de Auntokke.')}`;

  return (
    <div className="w-full">
      {/* ── Main Hero ─────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-br from-[#f0f4ff] via-white to-[#eaf6ff] border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-0 py-10 lg:py-0">

            {/* LEFT — Text & CTAs */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left py-0 lg:py-14 z-10">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 bg-[#1D5FCC]/10 text-[#1D5FCC] text-[11px] font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full" />
                Productos disponibles ahora
              </div>

              {/* Headline */}
              <h1 className="font-extrabold text-[#0E2A52] text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight mb-4">
                Todo lo que necesitas<br />
                <span className="text-[#1D5FCC]">para tu hogar,</span> aquí.
              </h1>

              {/* Subtitle */}
              <p className="text-gray-500 text-base lg:text-lg max-w-md mb-8 leading-relaxed">
                Batidoras, dispensadores, bombillos recargables y mucho más. Pide fácil por WhatsApp y recíbelo en casa.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href="#productos"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#1D5FCC] hover:bg-[#0E2A52] text-white font-bold text-[15px] rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Ver productos
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-[15px] rounded-full shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Escríbenos
                </a>
              </div>

              {/* Mini stats */}
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-extrabold text-[#0E2A52] text-xl">100%</span>
                  <span className="text-xs">Garantizado</span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-extrabold text-[#0E2A52] text-xl">+50</span>
                  <span className="text-xs">Productos</span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-extrabold text-[#0E2A52] text-xl">⭐ 4.9</span>
                  <span className="text-xs">Valoración</span>
                </div>
              </div>
            </div>

            {/* RIGHT — Product image */}
            <div className="flex-1 flex items-center justify-center lg:justify-end relative w-full max-w-lg lg:max-w-none">
              {/* Decorative circle behind */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#1D5FCC]/6 rounded-full -z-0 hidden lg:block" />

              <div className="relative w-full max-w-[480px] aspect-square lg:aspect-[4/3]">
                <Image
                  src="/banner-products.jpg"
                  alt="Productos Auntokke"
                  fill
                  priority
                  className="object-contain drop-shadow-xl"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Floating badge - Oferta */}
              <div className="absolute top-4 right-4 lg:top-8 lg:right-0 bg-[#FF6B35] text-white text-[11px] font-bold px-3 py-2 rounded-2xl shadow-lg rotate-3 hidden sm:block">
                🔥 ¡Nuevos productos!
              </div>

              {/* Floating card - WhatsApp */}
              <div className="absolute bottom-4 left-0 lg:-left-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 hidden md:flex">
                <div className="w-9 h-9 bg-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Pide ahora por</p>
                  <p className="text-[13px] text-[#0E2A52] font-bold">WhatsApp</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Feature bar ───────────────────────────────────────── */}
      <div className="bg-[#0E2A52]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 flex flex-wrap items-center justify-center gap-4 md:gap-10">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-white text-[13px] font-medium">
              <span className="text-base">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
