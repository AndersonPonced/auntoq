import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Creando usuario admin...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'andersonponced@gmail.com',
    password: 'Playstation3._',
  });

  if (authError) {
    console.error('Error creando usuario:', authError.message);
    // Si ya existe, intentamos iniciar sesión para obtener el ID
    if (authError.message.includes('already registered')) {
        console.log('El usuario ya existe, iniciando sesión para obtener su ID...');
        const { data: loginData } = await supabase.auth.signInWithPassword({
            email: 'andersonponced@gmail.com',
            password: 'Playstation3._',
        });
        if (loginData?.user) {
            await linkStore(loginData.user.id);
        }
    }
    return;
  }

  if (authData?.user) {
    console.log('Usuario creado con éxito. ID:', authData.user.id);
    await linkStore(authData.user.id);
  }
}

async function linkStore(userId) {
  console.log('Vinculando tienda "Electro Pana" (ahora "Auntokke") al usuario...');
  
  // 1. Cambiamos el nombre de la tienda a Auntokke y le asignamos el owner_id
  const { error: updateError } = await supabase
    .from('tiendas')
    .update({ 
        nombre: 'Auntokke',
        owner_id: userId
    })
    .eq('id', '0b4906c2-9abb-407f-b58f-6d8f453bca28');

  if (updateError) {
    console.error('Error actualizando la tienda:', updateError);
  } else {
    console.log('¡Tienda actualizada y vinculada correctamente!');
  }
}

run();
