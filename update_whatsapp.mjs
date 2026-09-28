import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Updating tienda WhatsApp...');
  await supabase.from('tiendas').update({ whatsapp: '584241337562' }).eq('id', '0b4906c2-9abb-407f-b58f-6d8f453bca28');
  console.log('Done.');
}
run();
