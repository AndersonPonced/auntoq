import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Fetching mega tienda...');
  const { data: tiendas } = await supabase.from('tiendas').select('*').order('created_at', { ascending: false }).limit(1);
  const mega = tiendas[0];
  
  if (!mega) return console.log('No mega tienda found');

  console.log('Fetching products for tienda:', mega.nombre);
  const { data: prods } = await supabase.from('productos').select('*').eq('tienda_id', mega.id).order('created_at', { ascending: true }).limit(2);
  
  if (prods.length > 0) {
    await supabase.from('productos').update({ foto_url: '/producto-1.jpg', fotos_urls: ['/producto-1.jpg'] }).eq('id', prods[0].id);
    console.log('Updated product 1:', prods[0].nombre, 'to /producto-1.jpg');
  }
  if (prods.length > 1) {
    await supabase.from('productos').update({ foto_url: '/producto-2.jpg', fotos_urls: ['/producto-2.jpg'] }).eq('id', prods[1].id);
    console.log('Updated product 2:', prods[1].nombre, 'to /producto-2.jpg');
  }
  console.log('Done.');
}
run();
