'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/AppLogo';
import ProductCard from '@/components/ProductCard';
import ShareButton from '@/components/ShareButton';
import TiendaForm from '@/components/TiendaForm';
import ProductoForm from '@/components/ProductoForm';
import EmptyState from '@/components/EmptyState';
import { getAcentoMeta, getCategoryMeta, tiendaHref } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tienda, setTienda] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [agregandoProducto, setAgregandoProducto] = useState(false);
  const [editandoProductoId, setEditandoProductoId] = useState<string | null>(null);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<string | null>(null);
  const [confirmandoEliminarTienda, setConfirmandoEliminarTienda] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Cargar tienda desde Supabase
  useEffect(() => {
    async function load() {
      const session = getSession();
      if (!session) { router.push('/login'); return; }

      const { data } = await supabase
        .from('tiendas')
        .select('*')
        .eq('owner_id', session.id)
        .maybeSingle();

      if (data) {
        setTienda({
          id: data.id,
          nombre: data.nombre,
          categoria: data.categoria,
          descripcionCorta: data.descripcion_corta,
          ubicacion: data.ubicacion,
          horario: data.horario,
          fotoPortadaUrl: data.foto_portada_url,
          colorAcento: data.color_acento,
          activa: true,
        });

        // Cargar productos de esta tienda
        const { data: prods } = await supabase
          .from('productos')
          .select('*')
          .eq('tienda_id', data.id)
          .order('created_at', { ascending: true });

        setProductos((prods ?? []).map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          disponible: p.disponible,
          fotoUrl: p.foto_url ?? null,
          fotosUrls: p.fotos_urls ?? (p.foto_url ? [p.foto_url] : []),
          descripcion: p.descripcion,
          tienda_id: p.tienda_id,
        })));
      }
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const cat = tienda ? getCategoryMeta(tienda.categoria) : null;
  const acento = tienda ? getAcentoMeta(tienda.colorAcento) : null;

  async function handleUpdate(values: any) {
    if (!tienda?.id) return;
    const { error } = await supabase.from('tiendas').update({
      nombre: values.nombre,
      categoria: values.categoria,
      descripcion_corta: values.descripcionCorta,
      ubicacion: values.ubicacion,
      horario: values.horario,
      foto_portada_url: values.fotoPortadaUrl,
      color_acento: values.colorAcento,
    }).eq('id', tienda.id);

    if (!error) {
      setTienda({ ...tienda, ...values });
      setEditando(false);
      setToast('Tienda actualizada ✓');
    }
  }

  async function handleEliminar() {
    if (!tienda?.id) return;
    await supabase.from('productos').delete().eq('tienda_id', tienda.id);
    await supabase.from('tiendas').delete().eq('id', tienda.id);
    setTienda(null);
    setProductos([]);
    setConfirmandoEliminarTienda(false);
  }

  async function handleAgregarProducto(values: any) {
    if (!tienda?.id) return;
    const { data, error } = await supabase.from('productos').insert({
      tienda_id: tienda.id,
      nombre: values.nombre,
      precio: values.precio,
      descripcion: values.descripcion,
      foto_url: values.fotoUrl,
      fotos_urls: values.fotosUrls,
      disponible: values.disponible ?? true,
    }).select().single();

    if (!error && data) {
      setProductos(prev => [...prev, data]);
      setAgregandoProducto(false);
      setToast('Producto agregado ✓');
    } else {
      console.error(error);
      setToast('Error al guardar producto');
    }
  }

  async function handleActualizarProducto(id: string, values: any) {
    const { error } = await supabase.from('productos').update({
      nombre: values.nombre,
      precio: values.precio,
      descripcion: values.descripcion,
      foto_url: values.fotoUrl,
      fotos_urls: values.fotosUrls,
      disponible: values.disponible ?? true,
    }).eq('id', id);

    if (!error) {
      setProductos(prev => prev.map(p => p.id === id ? { ...p, ...values } : p));
      setEditandoProductoId(null);
      setToast('Producto actualizado ✓');
    } else {
      console.error(error);
      setToast('Error al actualizar producto');
    }
  }

  async function handleEliminarProducto(id: string) {
    await supabase.from('productos').delete().eq('id', id);
    setProductos(prev => prev.filter(p => p.id !== id));
    setConfirmandoEliminarId(null);
    setToast('Producto eliminado');
  }

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-[#FFF4F3] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-[#FF6B35] rounded-full border-4 border-current border-t-transparent"></div>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <header className="app-header">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <Link href="/" aria-label="Volver al inicio" className="p-2 -ml-2 rounded-full hover:bg-brand/10 transition-colors">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <AppLogo />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        {!tienda ? (
          <div className="flex flex-col items-center text-center px-4 py-16 mt-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E09C96]/30">
            <div className="w-20 h-20 bg-[#FFF4F3] text-[#FF6B35] rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            </div>
            <h1 className="font-headline font-bold text-[#4E211E] text-2xl md:text-3xl mb-3">¡Abre tu tienda hoy!</h1>
            <p className="text-[#834C48] text-sm md:text-base leading-relaxed mb-8 max-w-sm">
              Tu cuenta está lista. El siguiente paso es configurar el perfil de tu negocio.
            </p>
            <Link href="/registro" className="w-full sm:w-auto px-8 py-3.5 bg-[#FF6B35] hover:bg-[#A63300] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(255,107,53,0.25)] transition-all active:scale-[0.98]">
              Crear perfil de mi tienda
            </Link>
          </div>
        ) : editando ? (
          <>
            <h1 className="font-headline font-bold text-primary text-2xl">Editar mi tienda</h1>
            <TiendaForm
              initialValues={tienda}
              submitLabel="Guardar cambios"
              onCancel={() => setEditando(false)}
              onSubmit={handleUpdate}
            />
          </>
        ) : (
          <>
            {/* ── Hero portada ── */}
            <div className="relative w-full aspect-[16/9] rounded-[16px] overflow-hidden bg-[#FFE4D6] border-2" style={{ borderColor: acento?.base }}>
              <Image
                src={tienda.fotoPortadaUrl}
                alt={`Foto de portada de ${tienda.nombre}`}
                fill sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover" priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute top-3 right-3">
                <ShareButton title={tienda.nombre} text={`Mira el catálogo de ${tienda.nombre} en Auntoke`} url={tiendaHref(tienda.id)} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  {cat && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white backdrop-blur-sm px-2.5 py-0.5 rounded-full mb-1.5" style={{ backgroundColor: `${acento?.base}CC` }}>
                      <span aria-hidden="true">{cat.emoji}</span>{cat.label}
                    </span>
                  )}
                  <h1 className="font-headline font-bold text-white text-xl md:text-2xl leading-tight truncate">{tienda.nombre}</h1>
                </div>
                <button type="button" onClick={() => setEditando(true)} className="flex-shrink-0 bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold px-3.5 py-2 rounded-full shadow-md hover:bg-white transition-colors">
                  Editar
                </button>
              </div>
            </div>

            {/* ── Info ── */}
            <div className="space-y-2">
              {tienda.descripcionCorta && <p className="text-muted text-sm leading-relaxed">{tienda.descripcionCorta}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 flex-shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {tienda.horario}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 flex-shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {tienda.ubicacion}
                </span>
              </div>
            </div>

            <hr className="border-border" />

            {/* ── Productos ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-semibold text-primary text-lg">Mis productos</h2>
                {productos.length > 0 && !agregandoProducto && (
                  <span className="text-xs text-muted">{productos.length} {productos.length === 1 ? 'producto' : 'productos'}</span>
                )}
              </div>

              {agregandoProducto && (
                <ProductoForm submitLabel="Agregar" onCancel={() => setAgregandoProducto(false)} onSubmit={handleAgregarProducto} />
              )}

              {!agregandoProducto && productos.length === 0 && (
                <>
                  <EmptyState icon="📦" title="Aún no tienes productos" description="Tus vecinos no verán nada en tu catálogo hasta que agregues al menos uno." />
                  <button type="button" onClick={() => setAgregandoProducto(true)} className="block w-full text-center bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-[16px] transition-colors text-sm">
                    + Agregar producto
                  </button>
                </>
              )}

              {!agregandoProducto && productos.length > 0 && (
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 list-none p-0" role="list">
                  {productos.map((p, i) =>
                    editandoProductoId === p.id ? (
                      <li key={p.id} className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
                        <ProductoForm initialValues={p} submitLabel="Guardar" onCancel={() => setEditandoProductoId(null)} onSubmit={(values) => handleActualizarProducto(p.id, values)} />
                      </li>
                    ) : confirmandoEliminarId === p.id ? (
                      <li key={p.id} className="flex flex-col items-center justify-center gap-2 text-center bg-red-50 border border-red-200 rounded-[16px] p-3 min-h-[152px]">
                        <p className="text-xs text-red-700 leading-snug">¿Eliminar &ldquo;{p.nombre}&rdquo;?</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEliminarProducto(p.id)} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full transition-colors">Sí, eliminar</button>
                          <button type="button" onClick={() => setConfirmandoEliminarId(null)} className="text-xs font-semibold text-muted hover:text-primary px-3 py-1.5 rounded-full border border-border transition-colors">Cancelar</button>
                        </div>
                      </li>
                    ) : (
                      <li key={p.id}>
                        <ProductCard producto={p} index={i} onEdit={() => setEditandoProductoId(p.id)} onDelete={() => setConfirmandoEliminarId(p.id)} />
                      </li>
                    )
                  )}
                  <li>
                    <button type="button" onClick={() => setAgregandoProducto(true)} className="flex flex-col items-center justify-center gap-1.5 w-full h-full min-h-[152px] rounded-[16px] border-2 border-dashed border-border text-muted hover:border-brand hover:text-brand transition-colors">
                      <span className="text-2xl leading-none" aria-hidden="true">+</span>
                      <span className="text-xs font-semibold">Agregar producto</span>
                    </button>
                  </li>
                </ul>
              )}
            </section>

            {/* ── Zona de peligro ── */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 pt-4">Zona de peligro</p>
              {confirmandoEliminarTienda ? (
                <div className="flex flex-wrap items-center gap-3 bg-red-50 border border-red-200 rounded-[8px] px-3.5 py-3">
                  <p className="text-sm text-red-700 flex-1 min-w-[180px]">Se eliminará tu tienda y todos tus productos permanentemente.</p>
                  <div className="flex gap-3 flex-shrink-0">
                    <button type="button" onClick={() => setConfirmandoEliminarTienda(false)} className="text-sm font-semibold text-muted hover:text-primary transition-colors">Cancelar</button>
                    <button type="button" onClick={handleEliminar} className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">Sí, eliminar</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmandoEliminarTienda(true)} className="text-sm text-red-600 hover:text-red-700 transition-colors">
                  Eliminar mi tienda
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg animate-fade-up">
          {toast}
        </div>
      )}
    </main>
  );
}
