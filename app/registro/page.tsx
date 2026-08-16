'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/AppLogo';
import TiendaForm from '@/components/TiendaForm';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [miTienda, setMiTienda] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStore() {
      const session = getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data } = await supabase
        .from('tiendas')
        .select('*')
        .eq('owner_id', session.id)
        .maybeSingle();
        
      if (data) {
        setMiTienda({
          id: data.id,
          nombre: data.nombre,
          categoria: data.categoria,
          descripcionCorta: data.descripcion_corta,
          ubicacion: data.ubicacion,
          horario: data.horario,
          fotoPortadaUrl: data.foto_portada_url,
          fotoOriginalUrl: data.foto_original_url,
          colorAcento: data.color_acento,
        });
      } else {
        // Pre-llenar el whatsapp con el teléfono del registro
        setMiTienda({ whatsapp: session.telefono });
      }
      setLoading(false);
    }
    checkStore();
  }, [supabase, router]);

  const handleSubmit = async (values: any) => {
    setSaveError(null);
    const session = getSession();
    if (!session) { router.push('/login'); return; }

    const payload = {
      owner_id: session.id,
      nombre: values.nombre,
      categoria: values.categoria,
      descripcion_corta: values.descripcionCorta,
      ubicacion: values.ubicacion,
      horario: values.horario,
      foto_portada_url: values.fotoPortadaUrl || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=960&q=80',
      foto_original_url: values.fotoOriginalUrl || null,
      color_acento: values.colorAcento,
    };

    let error;
    if (miTienda?.id) {
      const res = await supabase.from('tiendas').update(payload).eq('id', miTienda.id);
      error = res.error;
    } else {
      const res = await supabase.from('tiendas').insert(payload);
      error = res.error;
    }

    if (error) {
      alert('Error de Supabase: ' + JSON.stringify(error, null, 2));
      setSaveError(`Error al guardar: ${error.message || JSON.stringify(error)}`);
      return;
    }

    // Limpiamos el localStorage viejo por si acaso
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('mi_tienda_v1');
    }

    router.push('/perfil');
  };

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-[#FFF4F3] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-[#FF6B35] rounded-full border-4 border-current border-t-transparent"></div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#FFF4F3] flex flex-col pb-20">
      <header className="w-full px-5 py-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-[#E09C96]/20">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="p-2 -ml-2 rounded-full hover:bg-[#FF6B35]/10 text-[#FF6B35] transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <AppLogo />
      </header>

      <div className="max-w-[600px] w-full mx-auto px-5 py-8 md:py-12 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#E09C96]/30 mb-5 text-3xl">
            🏪
          </div>
          <h1 className="font-headline font-bold text-[#4E211E] text-2xl md:text-3xl mb-3">
            {miTienda ? 'Configuración de tu tienda' : 'Crea tu vitrina digital'}
          </h1>
          <p className="text-[#834C48] text-sm md:text-base leading-relaxed max-w-md mx-auto">
            {miTienda 
              ? 'Actualiza la información de tu negocio para que tus clientes siempre tengan los datos correctos.'
              : 'Completa estos datos para que tus vecinos conozcan tu negocio y sepan qué ofreces.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-[#E09C96]/30">
          {saveError && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-2xl text-sm mb-6 flex items-start gap-2.5">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span>{saveError}</span>
            </div>
          )}
          <TiendaForm
            key={miTienda?.id ?? 'new'}
            initialValues={miTienda ?? undefined}
            submitLabel={miTienda ? 'Guardar cambios' : 'Publicar mi tienda'}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
