const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImages() {
  console.log('🔍 Verificando imágenes en Supabase Storage...')
  
  try {
    // Listar archivos en el bucket
    const { data: files, error: listError } = await supabase.storage
      .from('restaurant-assets')
      .list('restaurants/1', {
        limit: 100,
        offset: 0
      })
    
    if (listError) {
      console.error('❌ Error listando archivos:', listError)
      return
    }
    
    console.log('📁 Archivos encontrados:', files)
    
    // Verificar URLs públicas
    for (const file of files) {
      const filePath = `restaurants/1/${file.name}`
      const { data: urlData } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(filePath)
      
      console.log(`🔗 ${file.name}: ${urlData.publicUrl}`)
    }
    
    // Verificar configuración del bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Error obteniendo buckets:', bucketError)
      return
    }
    
    const restaurantBucket = buckets.find(b => b.name === 'restaurant-assets')
    console.log('🪣 Configuración del bucket:', restaurantBucket)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testImages()