const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createStoragePolicy() {
  console.log('🔒 Creando política de acceso público para Storage...')
  
  try {
    // Crear política RLS para permitir acceso público de lectura
    const { data, error } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'restaurant-assets',
      policy_name: 'Public Access',
      definition: 'true'
    })
    
    if (error) {
      console.log('ℹ️ RPC no disponible, intentando SQL directo...')
      
      // Ejecutar SQL directo para crear la política
      const { data: policyData, error: policyError } = await supabase
        .from('storage')
        .select('*')
        .limit(1) // Solo para verificar conexión
      
      console.log('📝 Nota: Necesitas crear la política manualmente en Supabase Dashboard:')
      console.log('   1. Ve a Storage > Policies')
      console.log('   2. Crea una nueva política para el bucket "restaurant-assets"')
      console.log('   3. Permite SELECT para todos los usuarios (true)')
      console.log('   4. Nombre: "Public read access"')
      
    } else {
      console.log('✅ Política creada exitosamente')
    }
    
  } catch (error) {
    console.log('📝 Para solucionar manualmente:')
    console.log('   1. Ve a tu Dashboard de Supabase')
    console.log('   2. Storage > restaurant-assets > Settings')
    console.log('   3. Asegúrate que "Public" esté habilitado')
    console.log('   4. O ve a Policies y crea una política pública')
  }
}

createStoragePolicy()