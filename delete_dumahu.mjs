import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Deleting Dumahu products...');
  await supabase.from('productos').delete().eq('tienda_id', '9251aa9a-343b-4583-be95-e3ad1d2907eb');
  console.log('Deleting Dumahu store...');
  await supabase.from('tiendas').delete().eq('id', '9251aa9a-343b-4583-be95-e3ad1d2907eb');
  console.log('Done.');
}
run();
