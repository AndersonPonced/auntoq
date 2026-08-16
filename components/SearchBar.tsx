'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

interface SearchBarProps {
  defaultValue?: string;
  autoFocus?: boolean;
  /** If provided, fires on every keystroke (for live search). Otherwise navigates on Enter. */
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  defaultValue = '',
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleEnter(value: string) {
    if (onSearch) {
      onSearch(value);
    } else if (value.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <div className="relative">
      <span
        className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </span>
      <input
        ref={inputRef}
        id="search-input"
        type="search"
        role="searchbox"
        aria-label="Buscar tiendas y productos"
        placeholder="Buscar tiendas o productos…"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-4 py-3 rounded-[8px] bg-surface border border-border text-primary placeholder:text-muted text-sm outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
        onChange={(e) => {
          if (onSearch) onSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter')
            handleEnter((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  );
}
