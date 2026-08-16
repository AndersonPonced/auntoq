import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoriaContent from './CategoriaContent';
import { getTiendas, getCategoryCounts } from '@/lib/queries';
import { getCategoryMeta, CATEGORIAS } from '@/lib/constants';
import type { Categoria } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIAS.filter((c) => c.slug !== 'todas').map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryMeta(slug);
  return {
    title: `${cat.label} — Tiendas`,
    description: `Tiendas de ${cat.label.toLowerCase()} en tu urbanización`,
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;

  const validSlugs = CATEGORIAS.filter((c) => c.slug !== 'todas').map(
    (c) => c.slug,
  );
  if (!validSlugs.includes(slug as Categoria)) notFound();

  const cat = getCategoryMeta(slug);
  const tiendas = getTiendas(slug as Categoria);
  const counts = getCategoryCounts();

  return (
    <CategoriaContent
      slug={slug as Categoria}
      cat={cat}
      tiendasIniciales={tiendas}
      countsIniciales={counts}
    />
  );
}
