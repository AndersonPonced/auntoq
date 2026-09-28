'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Producto } from '@/types';

interface AnalyticsDashboardProps {
  tiendaId: string;
  productos: Producto[];
}

export default function AnalyticsDashboard({ tiendaId, productos }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      
      // Obtener todos los IDs relacionados a esta tienda (el ID de la tienda + los IDs de sus productos)
      const allIds = [tiendaId, ...productos.map(p => p.id)];

      // Traer todos los eventos donde el ID de la entidad coincida con la tienda o sus productos
      const { data } = await supabase
        .from('estadisticas')
        .select('*')
        .in('entidad_id', allIds);

      if (data) {
        setEventos(data);
      }
      setLoading(false);
    }
    
    fetchStats();
  }, [tiendaId, productos]);

  // Procesar los datos
  const stats = useMemo(() => {
    let totalVistas = 0;
    let totalWhatsapp = 0;
    let totalCompartidos = 0;
    let totalRedes = 0;
    
    // Diccionario para contar eventos por producto
    const productStats: Record<string, { vistas: number; whatsapp: number }> = {};
    productos.forEach(p => {
      productStats[p.id] = { vistas: 0, whatsapp: 0 };
    });

    eventos.forEach(ev => {
      if (ev.evento === 'vista_producto') {
        totalVistas++;
        if (productStats[ev.entidad_id]) productStats[ev.entidad_id].vistas++;
      } else if (ev.evento === 'click_whatsapp') {
        totalWhatsapp++;
        if (ev.entidad_tipo === 'producto' && productStats[ev.entidad_id]) {
          productStats[ev.entidad_id].whatsapp++;
        }
      } else if (ev.evento === 'compartir_producto') {
        totalCompartidos++;
      } else if (ev.evento === 'click_instagram' || ev.evento === 'click_web') {
        totalRedes++;
      }
    });

    // Ordenar productos por vistas
    const topProducts = productos
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        vistas: productStats[p.id]?.vistas || 0,
        whatsapp: productStats[p.id]?.whatsapp || 0,
        fotoUrl: p.fotosUrls?.[0] || p.fotoUrl || null,
      }))
      .sort((a, b) => b.vistas - a.vistas);

    return { totalVistas, totalWhatsapp, totalCompartidos, totalRedes, topProducts };
  }, [eventos, productos]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-[#4C6B8F]">
        <div className="w-8 h-8 rounded-full border-4 border-[#1D5FCC] border-t-transparent animate-spin mb-4" />
        <p>Cargando analíticas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="font-headline font-black text-[#0E2A52] text-2xl mb-1">Analíticas de tu Tienda</h2>
        <p className="text-[#4C6B8F] text-sm">Resumen de actividad de todos los visitantes (tus clics no se cuentan).</p>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#F8FBFF] border border-[#E5F0FF] p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="text-3xl mb-2">👀</span>
          <span className="font-black text-2xl text-[#0E2A52]">{stats.totalVistas}</span>
          <span className="text-xs font-semibold text-[#4C6B8F] uppercase tracking-wider mt-1">Vistas de productos</span>
        </div>
        <div className="bg-[#F2FBF5] border border-[#Dcf2e4] p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="text-3xl mb-2">📲</span>
          <span className="font-black text-2xl text-[#0E2A52]">{stats.totalWhatsapp}</span>
          <span className="text-xs font-semibold text-[#4C6B8F] uppercase tracking-wider mt-1">Clics en Comprar</span>
        </div>
        <div className="bg-[#FFF9F0] border border-[#FDEBCE] p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="text-3xl mb-2">📤</span>
          <span className="font-black text-2xl text-[#0E2A52]">{stats.totalCompartidos}</span>
          <span className="text-xs font-semibold text-[#4C6B8F] uppercase tracking-wider mt-1">Veces compartido</span>
        </div>
        <div className="bg-[#F8F5FF] border border-[#E9E0FF] p-5 rounded-2xl flex flex-col items-center text-center">
          <span className="text-3xl mb-2">🔗</span>
          <span className="font-black text-2xl text-[#0E2A52]">{stats.totalRedes}</span>
          <span className="text-xs font-semibold text-[#4C6B8F] uppercase tracking-wider mt-1">Visitas a Redes</span>
        </div>
      </div>

      {/* Lista de productos más vistos */}
      <div>
        <h3 className="font-bold text-[#0E2A52] text-lg mb-4 border-b pb-2">Rendimiento por producto</h3>
        
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-gray-400">No hay productos en tu tienda todavía.</p>
        ) : stats.topProducts.every(p => p.vistas === 0) ? (
          <p className="text-sm text-gray-500 py-4">Aún no hay vistas registradas en tus productos. ¡Comparte el enlace de tu tienda para empezar a recibir visitas!</p>
        ) : (
          <div className="space-y-4">
            {stats.topProducts.filter(p => p.vistas > 0).map((prod, index) => (
              <div key={prod.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-10 text-center font-bold text-gray-400 text-sm">
                  #{index + 1}
                </div>
                {prod.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={prod.fotoUrl} alt={prod.nombre} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-lg">🛍️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0E2A52] text-sm truncate">{prod.nombre}</p>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium mr-2">
                  <div className="flex flex-col items-center text-gray-500">
                    <span className="text-xs text-gray-400 uppercase">Vistas</span>
                    <span>{prod.vistas}</span>
                  </div>
                  <div className="flex flex-col items-center text-[#25D366]">
                    <span className="text-xs text-[#25D366]/70 uppercase">Clics WA</span>
                    <span>{prod.whatsapp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
