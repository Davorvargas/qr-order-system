const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTables() {
  console.log('🚀 Iniciando proceso para agregar mesas...');
  
  const restaurantId = 'd4503f1b-9fc5-48aa-ada6-354775e57a67';
  
  // Verificar estado actual
  console.log('\n📊 Verificando estado actual...');
  const { data: currentTables, error: currentError } = await supabase
    .from('tables')
    .select('table_number')
    .eq('restaurant_id', restaurantId)
    .order('table_number');
    
  if (currentError) {
    console.error('❌ Error al verificar mesas actuales:', currentError);
    return;
  }
  
  console.log('✅ Mesas actuales:', currentTables.map(t => t.table_number).join(', '));
  
  // Agregar mesas 2-10 (generar UUIDs válidos)
  const baseIds = [
    'd4503f1b-9fc5-48aa-ada6-354775e57a68',
    'd4503f1b-9fc5-48aa-ada6-354775e57a69',
    'd4503f1b-9fc5-48aa-ada6-354775e57a70',
    'd4503f1b-9fc5-48aa-ada6-354775e57a71',
    'd4503f1b-9fc5-48aa-ada6-354775e57a72',
    'd4503f1b-9fc5-48aa-ada6-354775e57a73',
    'd4503f1b-9fc5-48aa-ada6-354775e57a74',
    'd4503f1b-9fc5-48aa-ada6-354775e57a75',
    'd4503f1b-9fc5-48aa-ada6-354775e57a76'
  ];
  
  const newTables = [];
  for (let i = 0; i < 9; i++) {
    newTables.push({
      id: baseIds[i],
      restaurant_id: restaurantId,
      table_number: (i + 2).toString(),
      created_at: new Date().toISOString()
    });
  }
  
  console.log('\n➕ Agregando mesas 2-10...');
  const { data: insertData, error: insertError } = await supabase
    .from('tables')
    .insert(newTables)
    .select();
    
  if (insertError) {
    console.error('❌ Error al insertar mesas:', insertError);
    return;
  }
  
  console.log('✅ Mesas agregadas exitosamente:', insertData.length);
  
  // Verificación final
  console.log('\n🔍 Verificación final...');
  const { data: finalTables, error: finalError } = await supabase
    .from('tables')
    .select('table_number, id, created_at')
    .eq('restaurant_id', restaurantId)
    .order('table_number');
    
  if (finalError) {
    console.error('❌ Error en verificación final:', finalError);
    return;
  }
  
  console.log('✅ Total de mesas:', finalTables.length);
  console.log('📋 Mesas disponibles:');
  finalTables.forEach(table => {
    console.log(`   Mesa ${table.table_number} - ID: ${table.id}`);
  });
  
  if (finalTables.length === 10) {
    console.log('\n🎉 ¡ÉXITO! Restaurante ahora tiene 10 mesas (1-10)');
  } else {
    console.log(`\n⚠️  Advertencia: Se esperaban 10 mesas, pero hay ${finalTables.length}`);
  }
}

addTables().catch(console.error);