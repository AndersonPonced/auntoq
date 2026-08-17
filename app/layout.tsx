import type { Metadata, Viewport } from 'next';
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Auntokke — Altos de Copacabana",
    template: "%s | Auntokke",
  },
  description:
    "Descubre los vecinos de Altos de Copacabana que venden desde su casa. Comida, ropa, ferretería, repostería y más — todo en Auntokke de WhatsApp.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Auntokke",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: "Auntokke",
    title: "Auntokke — Altos de Copacabana",
    description:
      "Vecinos de Altos de Copacabana que venden desde su casa. Todo en Auntokke de WhatsApp.",
  },
};

export const viewport: Viewport = {
  themeColor: '#1D5FCC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sora.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
