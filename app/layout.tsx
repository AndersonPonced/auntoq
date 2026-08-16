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
    default: "Auntoq' — Altos de Copacabana",
    template: "%s | Auntoq'",
  },
  description:
    "Descubre los vecinos de Altos de Copacabana que venden desde su casa. Comida, ropa, ferretería, repostería y más — todo en Auntoq' de WhatsApp.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Auntoq'",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: "Auntoq'",
    title: "Auntoq' — Altos de Copacabana",
    description:
      "Vecinos de Altos de Copacabana que venden desde su casa. Todo en Auntoq' de WhatsApp.",
  },
};

export const viewport: Viewport = {
  themeColor: '#FF6B35',
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
