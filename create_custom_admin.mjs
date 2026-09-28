import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
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
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

async function run() {
  const userId = '5779f912-3027-4257-af34-567b6f77c639';
  const email = 'andersonponced@gmail.com';
  const pass = 'Playstation3._';

  const passwordHash = await hashPassword(pass);

  const { error } = await supabase.from('perfiles').insert({
    id: userId,
    email: email,
    nombre_completo: 'Auntokke Admin',
    telefono: '584241337562',
    password_hash: passwordHash
  });

  if (error) {
    console.error('Error inserting into perfiles:', error);
    if (error.code === '23505') { // unique violation
      console.log('Already exists, updating hash...');
      await supabase.from('perfiles').update({ password_hash: passwordHash }).eq('email', email);
    }
  } else {
    console.log('User profile created in custom auth system.');
  }
}
run();
