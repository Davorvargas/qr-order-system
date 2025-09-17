// Script simple para verificar el usuario de Rosse Coffee
const { createClient } = require('@supabase/supabase-js');

// Usar las mismas variables que la app
const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdncHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxOTY2MTksImV4cCI6MjAzOTc3MjYxOX0.Wz_-Tl7kGnHfXyHUwb1GhHjJnmqJvKLXg8Jl7rQvvQM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRosseUser() {
  try {
    console.log('🔍 Verificando usuario de Rosse Coffee...');
    
    // Intentar login con contraseñas posibles
    const passwords = ['rosse123', 'admin123', 'rossecoffee', '123456', 'password'];
    
    for (const password of passwords) {
      console.log(`🔑 Probando contraseña: ${password}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@rossecoffee.com',
        password: password
      });
      
      if (!error && data.user) {
        console.log('✅ ¡CONTRASEÑA ENCONTRADA!');
        console.log('📧 Email: admin@rossecoffee.com');
        console.log(`🔒 Contraseña: ${password}`);
        console.log('👤 Usuario ID:', data.user.id);
        
        // Cerrar sesión
        await supabase.auth.signOut();
        return;
      }
    }
    
    console.log('❌ No se pudo encontrar la contraseña con las opciones probadas');
    console.log('💡 Opciones:');
    console.log('1. La contraseña podría ser diferente');
    console.log('2. Podemos resetearla desde el dashboard de Supabase');
    console.log('3. Podemos crear un nuevo usuario');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRosseUser();
