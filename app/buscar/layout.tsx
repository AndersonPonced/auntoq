import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar tiendas y productos',
  description: 'Busca tiendas y productos disponibles en tu urbanización.',
};

export default function BuscarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
