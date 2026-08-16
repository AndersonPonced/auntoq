import { createClient } from '@/lib/supabase/client';

/**
 * Sube un archivo al bucket `imagenes` de Supabase Storage.
 * @param file     Archivo a subir
 * @param folder   Carpeta principal: 'tiendas' | 'productos'
 * @param sub      Subcarpeta opcional: 'originals' | 'cropped'
 */
export async function uploadImage(
  file: File,
  folder: 'tiendas' | 'productos',
  sub?: 'originals' | 'cropped'
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const parts = [folder, sub, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`].filter(Boolean);
  const filename = parts.join('/');

  const { error } = await supabase.storage
    .from('imagenes')
    .upload(filename, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('imagenes').getPublicUrl(filename);
  return data.publicUrl;
}
