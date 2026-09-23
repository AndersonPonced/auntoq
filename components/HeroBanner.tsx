'use client';

import Link from 'next/link';

interface HeroBannerProps {
  whatsapp: string;
}

export default function HeroBanner({ whatsapp }: HeroBannerProps) {
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Quiero ver sus productos disponibles en Auntokke.')}`;

  return (
    <section className="w-full bg-gradient-to-br from-[#0E2A52] via-[#1D5FCC] to-[#0E4A9C] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#25D366]/10 rounded-full blur-2xl" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10 lg:py-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left: Text */}
        <div className="flex-1 text-white text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
            Productos disponibles
          </div>

          <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
            Los mejores productos<br />
            <span className="text-yellow-300">directo a tu puerta</span>
          </h1>

          <p className="text-blue-100 text-base lg:text-lg mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Batidoras, dispensadores, bombillos recargables y más. Pídelos fácil por WhatsApp y recíbelos donde estés.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a
              href="#productos"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-[#0E2A52] font-bold text-[15px] rounded-full shadow-lg transition-all active:scale-95"
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
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold text-[15px] rounded-full shadow-lg transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Escríbenos
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-8">
            {[
              { icon: '🚚', text: 'Entrega rápida' },
              { icon: '✅', text: 'Garantía de calidad' },
              { icon: '💬', text: 'Atención por WhatsApp' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 text-blue-100 text-[13px]">
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Floating product icons */}
        <div className="hidden lg:flex flex-shrink-0 items-center justify-center relative w-80 h-64">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl" />
          <div className="relative z-10 flex flex-col items-center gap-3 text-white text-center p-6">
            <div className="flex gap-4">
              {['🔌', '🪔', '🧴'].map((emoji) => (
                <div key={emoji} className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  {emoji}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-1">
              {['💡', '🔋', '🛁'].map((emoji) => (
                <div key={emoji} className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-200 mt-2 font-medium">Productos para el hogar</p>
          </div>
        </div>
      </div>
    </section>
  );
}
