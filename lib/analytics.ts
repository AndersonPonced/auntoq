import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';

type EventoAnalitica = 
  | 'vista_producto'
  | 'compartir_producto'
  | 'click_whatsapp'
  | 'click_instagram'
  | 'click_web';

type EntidadTipo = 'producto' | 'tienda';

/**
 * Registra un evento en la base de datos de Supabase.
 * Ignora el evento si el usuario actual tiene la sesión iniciada (para no contar las pruebas del dueño).
 */
export async function trackEvent(
  evento: EventoAnalitica,
  entidadId: string,
  entidadTipo: EntidadTipo
) {
  try {
    // Si hay una sesión activa (es decir, eres tú administrando), no contamos el evento
    const session = getSession();
    if (session) {
      return; // Ignorar silenciosamente
    }

    const supabase = createClient();
    
    // Insertamos el evento de forma asíncrona (no bloquea la UI)
    await supabase.from('estadisticas').insert({
      evento,
      entidad_id: entidadId,
      entidad_tipo: entidadTipo
    });
    
  } catch (error) {
    // Silenciamos los errores de analíticas para que no afecten la experiencia del usuario
    console.error('Error tracking event:', error);
  }
}
