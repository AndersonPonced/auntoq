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
    <div className="relative -mx-4 px-4 overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-4 before:bg-gradient-to-r before:from-[#FFF4F3] before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-4 after:bg-gradient-to-l after:from-[#FFF4F3] after:to-transparent after:z-10">
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-hide snap-x snap-mandatory touch-pan-x px-1"
      >
        {CATEGORIAS.map((cat) => {
          const isSelected = cat.slug === selected;
          const count = counts?.[cat.slug];
          
          const base =
            'flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-[20px] text-[14px] font-bold transition-all duration-300 ease-out whitespace-nowrap cursor-pointer select-none border border-transparent';
          
          const active = 
            'bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white shadow-[0_6px_16px_rgba(255,107,53,0.35)] scale-[1.02] border-[#FF6B35]/20';
          
          const inactive =
            'bg-white text-[#4E211E]/80 border-[#E09C96]/30 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)] hover:border-[#FF6B35]/30 hover:text-[#FF6B35] active:scale-95';

          const label = (
            <>
              <span 
                className={`flex items-center justify-center w-7 h-7 rounded-full text-sm transition-colors duration-300 ${
                  isSelected ? 'bg-white/20' : 'bg-[#FFF4F3]'
                }`}
                aria-hidden="true"
              >
                {cat.emoji}
              </span>
              <span className="tracking-tight">{cat.label}</span>
              {count !== undefined && (
                <span
                  className={`text-[11px] font-extrabold rounded-full px-2 py-0.5 leading-none transition-colors duration-300 ${
                    isSelected
                      ? 'bg-white text-[#FF6B35]'
                      : 'bg-[#FF6B35]/10 text-[#FF6B35]'
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
