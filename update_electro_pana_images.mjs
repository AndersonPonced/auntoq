import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Updating images for Electro Pana products...');
  
  // Batidora
  await supabase.from('productos').update({ foto_url: '/producto-1.jpg', fotos_urls: ['/producto-1.jpg'] }).eq('id', '5200fff5-b88e-4b69-bae7-7c2b94a10470');
  
  // Dispensador
  await supabase.from('productos').update({ foto_url: '/producto-2.jpg', fotos_urls: ['/producto-2.jpg'] }).eq('id', 'df8a1c51-f24a-4121-b499-fa4f3576bc8e');
  
  console.log('Done updating images.');
}
run();
