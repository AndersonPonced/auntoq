import Link from 'next/link';

export default function AppLogo() {
  return (
    <Link href="/" aria-label="Auntoq' - Inicio" className="flex items-center gap-2 group">
      {/* Orange dot / brand mark */}
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white text-xs font-black leading-none select-none shadow-sm group-hover:scale-105 transition-transform"
        aria-hidden="true"
      >
        👆
      </span>
      <span className="font-headline font-bold text-primary text-base leading-none">
        Auntoq'
      </span>
    </Link>
  );
}
