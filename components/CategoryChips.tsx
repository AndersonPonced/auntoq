'use client';

import Link from 'next/link';
import { CATEGORIAS } from '@/lib/constants';
import type { Categoria } from '@/types';

interface CategoryChipsProps {
  selected: Categoria | 'todas';
  /** Inline filter — chips call onChange instead of navigating */
  onChange?: (value: Categoria | 'todas') => void;
  /** Optional map of slug → store count to display inside each chip */
  counts?: Record<string, number>;
}

export default function CategoryChips({
  selected,
  onChange,
  counts,
}: CategoryChipsProps) {
  return (
    <div className="relative -mx-4 px-4 overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-6 before:bg-gradient-to-r before:from-[#D6EFFB] before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-l after:from-[#D6EFFB] after:to-transparent after:z-10">
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x snap-mandatory touch-pan-x px-2"
      >
        {CATEGORIAS.map((cat) => {
          const isSelected = cat.slug === selected;
          const count = counts?.[cat.slug];
          
          const base =
            'relative flex-shrink-0 flex flex-col items-center justify-center gap-2 w-[84px] h-[94px] rounded-[28px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer select-none';
          
          const active = 
            'bg-white shadow-[0_8px_20px_rgb(0,0,0,0.08)] scale-[1.05] z-10 ring-1 ring-[#A9CFEA]/30';
          
          const inactive =
            'bg-transparent hover:bg-white/60 active:scale-95';

          const label = (
            <>
              {/* Emoji Container */}
              <div 
                className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl transition-all duration-500 ${
                  isSelected 
                    ? 'bg-[#1D5FCC]/10 scale-110 shadow-inner' 
                    : 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] grayscale-[20%]'
                }`}
                aria-hidden="true"
              >
                <span className={`transform transition-transform duration-500 ${isSelected ? 'scale-110 -translate-y-0.5' : ''}`}>
                  {cat.emoji}
                </span>
              </div>
              
              {/* Text */}
              <span className={`text-[12px] font-bold tracking-tight transition-colors duration-500 ${isSelected ? 'text-[#0E2A52]' : 'text-[#4C6B8F]/70'}`}>
                {cat.label}
              </span>

              {/* Badge */}
              {count !== undefined && count > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-sm transition-all duration-500 ${
                    isSelected
                      ? 'bg-[#1D5FCC] text-white scale-100'
                      : 'bg-white text-[#4C6B8F] border border-[#A9CFEA]/30 scale-90'
                  }`}
                >
                  {count}
                </span>
              )}
            </>
          );

          if (onChange) {
            return (
              <button
                key={cat.slug}
                type="button"
                id={`chip-${cat.slug}`}
                role="radio"
                aria-checked={isSelected}
                className={`${base} ${isSelected ? active : inactive} snap-start`}
                onClick={() => onChange(cat.slug as Categoria | 'todas')}
              >
                {label}
              </button>
            );
          }

          const href =
            cat.slug === 'todas' ? '/' : `/categoria/${cat.slug}`;
          return (
            <Link
              key={cat.slug}
              href={href}
              id={`chip-link-${cat.slug}`}
              aria-current={isSelected ? 'page' : undefined}
              className={`${base} ${isSelected ? active : inactive} snap-start`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
