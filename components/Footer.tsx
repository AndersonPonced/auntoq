import Link from 'next/link';
import AppLogo from '@/components/AppLogo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#A9CFEA]/30 mt-auto">
      <div className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="grayscale opacity-90 transition-all hover:grayscale-0 hover:opacity-100">
              <AppLogo />
            </div>
            <p className="text-[#4C6B8F] text-[13px] md:text-sm text-center md:text-left max-w-xs leading-relaxed">
              Conectando los negocios y vecinos de Altos de Copacabana.
            </p>
          </div>
          
          <div className="flex items-center gap-5 text-[13px] md:text-sm font-bold text-[#1D5FCC]">
            <Link href="/login" className="hover:text-[#0E2A52] transition-colors py-1">
              Soy Vendedor
            </Link>
            <span className="w-1 h-1 rounded-full bg-[#A9CFEA]/50"></span>
            <Link href="/signup" className="hover:text-[#0E2A52] transition-colors py-1">
              Crear mi Tienda
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#A9CFEA]/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#4C6B8F]/70 text-[11px] md:text-xs font-medium">
            © {new Date().getFullYear()} Auntokke. Todos los derechos reservados.
          </p>
          
          <div className="flex items-center gap-5 text-[11px] md:text-xs font-semibold text-[#4C6B8F]/70">
            <Link href="#" className="hover:text-[#1D5FCC] transition-colors">
              Términos
            </Link>
            <Link href="#" className="hover:text-[#1D5FCC] transition-colors">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
