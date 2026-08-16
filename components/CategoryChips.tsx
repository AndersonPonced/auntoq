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
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory touch-pan-x"
    >
      {CATEGORIAS.map((cat) => {
        const isSelected = cat.slug === selected;
        const count = counts?.[cat.slug];
        const base =
          'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all whitespace-nowrap border cursor-pointer select-none';
        const active = 'bg-brand text-white border-brand shadow-sm';
        const inactive =
          'bg-surface text-primary border-border hover:border-brand hover:text-brand';

        const label = (
          <>
            <span aria-hidden="true">{cat.emoji}</span>
            {cat.label}
            {count !== undefined && (
              <span
                className={`text-xs font-semibold rounded-full px-1.5 py-0.5 leading-none ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-brand/10 text-brand'
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
              className={`${base} ${isSelected ? active : inactive} snap-start active:scale-95`}
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
            className={`${base} ${isSelected ? active : inactive} snap-start active:scale-95`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
