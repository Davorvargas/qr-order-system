// Script para probar la creación de mesas
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateTables() {
  console.log('🧪 Probando creación de nuevas mesas...\n');
  
  try {
    // 1. Obtener el restaurant_id
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(1);
    
    if (!restaurants || restaurants.length === 0) {
      console.error('❌ No hay restaurantes configurados');
      return;
    }
    
    const restaurantId = restaurants[0].id;
    console.log(`🏢 Usando restaurante: ${restaurants[0].name} (${restaurantId})`);
    
    // 2. Ver mesas actuales
    const { data: currentTables } = await supabase
      .from('tables')
      .select('table_number')
      .eq('restaurant_id', restaurantId)
      .order('table_number');
    
    console.log(`\n📋 Mesas actuales: ${currentTables?.length || 0}`);
    if (currentTables && currentTables.length > 0) {
      console.log('Números:', currentTables.map(t => t.table_number).join(', '));
    }
    
    // 3. Calcular próximo número
    const currentNumbers = currentTables?.map(t => parseInt(t.table_number)).filter(n => !isNaN(n)) || [];
    const nextNumber = currentNumbers.length > 0 ? Math.max(...currentNumbers) + 1 : 1;
    
    console.log(`\n➡️ Próximo número disponible: ${nextNumber}`);
    
    // 4. Crear 3 mesas de prueba
    const tablesToCreate = [];
    const count = 3;
    const prefix = "Mesa";
    
    for (let i = 0; i < count; i++) {
      const tableNumber = (nextNumber + i).toString();
      tablesToCreate.push({
        table_number: tableNumber,
        restaurant_id: restaurantId
      });
    }
    
    console.log('\n🔨 Creando mesas de prueba...');
    tablesToCreate.forEach((table, i) => {
      console.log(`${i + 1}. ${prefix} ${table.table_number}`);
    });
    
    const { data: createdTables, error: createError } = await supabase
      .from('tables')
      .insert(tablesToCreate)
      .select('id, table_number');
    
    if (createError) {
      console.error('❌ Error creando mesas:', createError);
      return;
    }
    
    if (createdTables) {
      console.log('\n✅ MESAS CREADAS EXITOSAMENTE:');
      createdTables.forEach(table => {
        console.log(`- Mesa ${table.table_number}: ${table.id}`);
      });
      
      // 5. Verificar las URLs que se generarían
      console.log('\n🔗 URLs QR GENERADAS:');
      const baseUrl = 'http://localhost:3000';
      
      createdTables.forEach(table => {
        const qrUrl = `${baseUrl}/menu/${table.id}`;
        console.log(`Mesa ${table.table_number}: ${qrUrl}`);
      });
      
      // 6. Verificar el total final
      const { data: finalTables } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number');
      
      console.log(`\n📊 RESULTADO FINAL:`);
      console.log(`Total mesas ahora: ${finalTables?.length || 0}`);
      console.log('✅ Funcionalidad de creación de mesas funciona correctamente');
      
      // 7. Limpiar mesas de prueba (opcional)
      const cleanup = false; // Cambiar a true si quieres limpiar
      if (cleanup) {
        console.log('\n🧹 Limpiando mesas de prueba...');
        const { error: deleteError } = await supabase
          .from('tables')
          .delete()
          .in('id', createdTables.map(t => t.id));
        
        if (deleteError) {
          console.error('❌ Error limpiando:', deleteError);
        } else {
          console.log('✅ Mesas de prueba eliminadas');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar prueba
testCreateTables();