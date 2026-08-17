import Link from 'next/link';
import Image from 'next/image';

export default function AppLogo() {
  return (
    <Link href="/" aria-label="Auntokke - Inicio" className="flex items-center gap-2 group">
      <Image 
        src="/logo.png" 
        alt="Auntokke" 
        width={100} 
        height={32} 
        className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
        priority
      />
    </Link>
  );
}
