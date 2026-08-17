'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

const PROMOS = [
  {
    id: 1,
    title: 'Apoya lo local 🤝',
    subtitle: 'Encuentra todo lo que necesitas sin salir de tu barrio',
    bgUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
    color: 'from-orange-500/90 to-orange-800/90',
    btnText: 'Explorar tiendas',
  },
  {
    id: 2,
    title: '¿Tienes un negocio? 🚀',
    subtitle: 'Regístralo gratis y llega a más vecinos hoy mismo',
    bgUrl: 'https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?q=80&w=800&auto=format&fit=crop',
    color: 'from-blue-500/90 to-indigo-800/90',
    btnText: 'Crear mi tienda',
  },
  {
    id: 3,
    title: '¡Corre la voz! 📣',
    subtitle: 'Comparte Auntokke con tus tiendas favoritas para que se unan a la comunidad.',
    bgUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    color: 'from-pink-500/90 to-rose-800/90',
    btnText: 'Compartir app',
  },
];

export default function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const itemWidth = scrollWidth / PROMOS.length;
      scrollRef.current.scrollTo({
        left: itemWidth * currentIndex,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  return (
    <div className="w-full overflow-hidden mt-2 mb-6">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 gap-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {PROMOS.map((promo, idx) => (
          <div
            key={promo.id}
            className={`relative flex-shrink-0 w-full sm:w-[85%] md:w-[70%] h-40 md:h-48 rounded-[24px] overflow-hidden snap-center shadow-lg transition-transform duration-500 ${
              currentIndex === idx ? 'scale-100' : 'scale-[0.97] opacity-80'
            }`}
          >
            <Image
              src={promo.bgUrl}
              alt={promo.title}
              fill
              className="object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${promo.color}`} />
            
            <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-center">
              <h3 className="text-white font-headline font-black text-2xl md:text-3xl leading-tight mb-1 animate-fade-up">
                {promo.title}
              </h3>
              <p className="text-white/90 text-sm md:text-base font-medium max-w-[80%] animate-fade-up" style={{ animationDelay: '0.1s' }}>
                {promo.subtitle}
              </p>
              <div className="mt-4">
                <span className="inline-block bg-white text-[#0E2A52] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm animate-fade-up" style={{ animationDelay: '0.2s' }}>
                  {promo.btnText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-[-10px]">
        {PROMOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx ? 'w-6 bg-[#1D5FCC]' : 'w-2 bg-[#A9CFEA]/50'
            }`}
            aria-label={`Ir a promoción ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
