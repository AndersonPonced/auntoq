import { buildWhatsAppLink } from '@/lib/constants';

interface WhatsAppButtonProps {
  whatsapp: string;
  storeName: string;
  className?: string;
}

export default function WhatsAppButton({
  whatsapp,
  storeName,
  className = '',
}: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(whatsapp, storeName);

  return (
    <a
      id="whatsapp-cta"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Pedir por WhatsApp a ${storeName}`}
      className={`flex items-center justify-center gap-2.5 w-full bg-whatsapp hover:bg-[#1ebe5b] active:scale-[0.98] text-white font-semibold py-4 rounded-[16px] transition-all text-base shadow-lg shadow-[#25D366]/30 ${className}`}
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5 flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M12.002 2C6.477 2 2 6.48 2 12.004c0 1.775.462 3.44 1.27 4.892L2.05 22l5.237-1.375A9.953 9.953 0 0 0 12 21.999c5.523 0 10-4.479 10-10.002C22 6.48 17.525 2 12.002 2zm.004 18.22a8.274 8.274 0 0 1-4.236-1.16l-.303-.18-3.108.817.83-3.03-.198-.31A8.234 8.234 0 0 1 3.75 12.006C3.75 7.4 7.4 3.75 12.006 3.75c4.607 0 8.25 3.648 8.25 8.252 0 4.607-3.647 8.218-8.25 8.218zm4.516-6.16c-.248-.125-1.466-.724-1.694-.806-.228-.083-.394-.124-.56.124-.165.248-.64.806-.784.971-.144.165-.29.186-.537.062-.248-.124-1.046-.386-1.993-1.23-.736-.657-1.234-1.468-1.379-1.717-.145-.248-.015-.382.11-.505.11-.11.248-.29.372-.434.123-.144.165-.248.248-.413.083-.166.041-.31-.021-.434-.062-.124-.56-1.352-.767-1.85-.201-.487-.407-.42-.56-.428l-.476-.008c-.165 0-.434.062-.66.31-.228.248-.868.847-.868 2.065 0 1.217.888 2.394 1.012 2.559.124.165 1.748 2.665 4.235 3.738.592.257 1.054.41 1.414.524.594.19 1.136.163 1.563.099.477-.072 1.466-.6 1.673-1.178.207-.579.207-1.075.145-1.178-.062-.103-.228-.165-.476-.29z" />
      </svg>
      Pedir por WhatsApp
    </a>
  );
}
