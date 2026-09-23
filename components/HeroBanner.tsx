'use client';

import Image from 'next/image';

interface HeroBannerProps {
  whatsapp: string;
}

export default function HeroBanner({ whatsapp }: HeroBannerProps) {
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Quiero ver sus productos disponibles en Auntokke.')}`;

  return (
    <section className="w-full relative overflow-hidden bg-white" style={{ minHeight: 320 }}>
      {/* Banner image */}
      <div className="relative w-full" style={{ aspectRatio: '16/6' }}>
        <Image
          src="/banner-hero.jpg"
          alt="Calidad para tu hogar - Auntokke"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Overlay gradient so we can put a CTA on top if needed on mobile */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent md:hidden" />

        {/* Mobile CTA overlay */}
        <div className="absolute bottom-4 left-4 md:hidden flex gap-2">
          <a
            href="#productos"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] text-white font-bold text-[13px] rounded-full shadow-lg"
          >
            Ver productos ↓
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0E2A52] text-white font-bold text-[13px] rounded-full shadow-lg"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Trust badges row */}
      <div className="bg-[#0E2A52] py-2.5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { icon: '🚚', text: 'Entrega a domicilio' },
            { icon: '✅', text: 'Garantía de calidad' },
            { icon: '💬', text: 'Atención por WhatsApp' },
            { icon: '🔒', text: 'Compra segura' },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-white text-[13px] font-medium">
              <span className="text-base">{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
