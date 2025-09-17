// Script para resetear la contraseña de admin@rossecoffee.com
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitas la service role key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetRossePassword() {
  try {
    console.log('🔄 Reseteando contraseña para admin@rossecoffee.com...');
    
    // Resetear contraseña usando Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      'fc1fa905-6dc2-45bc-a1e1-e5171e9c3c95', // ID del usuario Rosse Coffee
      { password: 'rosse123' } // Nueva contraseña
    );

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('✅ Contraseña reseteada exitosamente!');
    console.log('📧 Email: admin@rossecoffee.com');
    console.log('🔒 Nueva contraseña: rosse123');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

resetRossePassword();
