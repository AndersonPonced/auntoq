import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TiendaContent from './TiendaContent';
import { createClient } from '@/lib/supabase/client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();

  const { data: tienda } = await supabase
    .from('tiendas')
    .select('nombre, descripcion_corta')
    .eq('id', id)
    .maybeSingle();

  if (!tienda) return { title: 'Tienda no encontrada' };

  return {
    title: tienda.nombre,
    description:
      tienda.descripcion_corta ??
      `Catálogo de ${tienda.nombre} en Auntoke — Altos de Copacabana`,
  };
}

export default async function TiendaPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();

  const { data: tiendaData, error } = await supabase
    .from('tiendas')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching tienda:', error);
  }

  if (!tiendaData) notFound();

  let whatsapp = '';
  if (tiendaData.owner_id) {
    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('telefono')
      .eq('id', tiendaData.owner_id)
      .maybeSingle();
    if (perfilData?.telefono) {
      whatsapp = perfilData.telefono;
    }
  }

  // Mapear de snake_case a camelCase para el componente
  const tienda = {
    id: tiendaData.id,
    nombre: tiendaData.nombre,
    categoria: tiendaData.categoria,
    descripcionCorta: tiendaData.descripcion_corta,
    ubicacion: tiendaData.ubicacion,
    horario: tiendaData.horario,
    whatsapp,
    fotoPortadaUrl: tiendaData.foto_portada_url,
    colorAcento: tiendaData.color_acento,
    activa: true,
  };

  const { data: productosData } = await supabase
    .from('productos')
    .select('*')
    .eq('tienda_id', id)
    .order('created_at', { ascending: true });

  const productos = (productosData ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    disponible: p.disponible,
    fotoUrl: p.foto_url,
    descripcion: p.descripcion,
    tiendaId: p.tienda_id,
  }));

  return (
    <TiendaContent tiendaInicial={tienda} productosIniciales={productos} />
  );
}
