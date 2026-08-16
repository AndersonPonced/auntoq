/**
 * auth.ts — Sistema de autenticación propio
 * Guarda los datos del usuario en la tabla `perfiles` de Supabase.
 * No usa el sistema de correos de Supabase Auth.
 * La sesión se guarda en localStorage.
 */
import { createClient } from '@/lib/supabase/client';

const SESSION_KEY = 'auntoque_session_v1';

export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  telefono: string;
}

/** Devuelve el usuario de la sesión actual o null si no hay sesión */
export function getSession(): Usuario | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

/** Guarda la sesión del usuario en localStorage */
function saveSession(user: Usuario) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/** Elimina la sesión */
export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/** Registra un nuevo usuario en la tabla `perfiles` */
export async function signUp(data: {
  email: string;
  password: string;
  nombre_completo: string;
  telefono: string;
}): Promise<{ user: Usuario | null; error: string | null }> {
  const supabase = createClient();

  // 1. Verificar si el correo ya existe
  const { data: existing } = await supabase
    .from('perfiles')
    .select('id')
    .eq('email', data.email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    return { user: null, error: 'Este correo ya está registrado. Intenta iniciar sesión.' };
  }

  // 2. Hash de la contraseña (usando Web Crypto API, nativa en el navegador)
  const passwordHash = await hashPassword(data.password);

  // 3. Generar un UUID único para el usuario
  const id = crypto.randomUUID();

  // 4. Insertar en la tabla perfiles
  const { error: insertError } = await supabase.from('perfiles').insert({
    id,
    email: data.email.toLowerCase().trim(),
    nombre_completo: data.nombre_completo.trim(),
    telefono: data.telefono.trim(),
    password_hash: passwordHash,
  });

  if (insertError) {
    return { user: null, error: 'No se pudo crear la cuenta. Intenta de nuevo.' };
  }

  const user: Usuario = {
    id,
    email: data.email.toLowerCase().trim(),
    nombre_completo: data.nombre_completo.trim(),
    telefono: data.telefono.trim(),
  };

  saveSession(user);
  return { user, error: null };
}

/** Inicia sesión verificando el correo y contraseña contra la tabla `perfiles` */
export async function signIn(data: {
  email: string;
  password: string;
}): Promise<{ user: Usuario | null; error: string | null }> {
  const supabase = createClient();

  // 1. Buscar el usuario por correo
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id, email, nombre_completo, telefono, password_hash')
    .eq('email', data.email.toLowerCase().trim())
    .maybeSingle();

  if (!perfil) {
    return { user: null, error: 'No encontramos una cuenta con ese correo.' };
  }

  // 2. Verificar la contraseña
  const match = await verifyPassword(data.password, perfil.password_hash);
  if (!match) {
    return { user: null, error: 'La contraseña es incorrecta.' };
  }

  const user: Usuario = {
    id: perfil.id,
    email: perfil.email,
    nombre_completo: perfil.nombre_completo,
    telefono: perfil.telefono,
  };

  saveSession(user);
  return { user, error: null };
}

// ─── Utilidades de hashing con Web Crypto API (nativa, sin librerías) ──────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(bits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = stored.split(':');
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const hashArray = new Uint8Array(bits);
    const newHashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    return newHashHex === hashHex;
  } catch {
    return false;
  }
}
