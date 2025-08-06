const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);
const senderosRestaurantId = 'b333ede7-f67e-43d6-8652-9a918737d6e3'; // Senderos

async function crearMesasSenderosSimple() {
  console.log('🏠 CREANDO MESAS PARA SENDEROS (SIN DISPLAY_NAME)');
  console.log('='.repeat(55));
  
  try {
    // Definir las mesas a crear (solo con table_number)
    const mesasACrear = [
      { table_number: '1' },
      { table_number: '2' },
      { table_number: '3' },
      { table_number: '4' },
      { table_number: '5' },
      { table_number: '6' },
      { table_number: '7' },
      { table_number: '8' }
    ];
    
    console.log('📝 CREANDO MESAS...');
    console.log('='.repeat(25));
    
    let mesasCreadas = 0;
    
    for (let i = 0; i < mesasACrear.length; i++) {
      const mesa = mesasACrear[i];
      
      console.log(`\n🏠 Creando mesa ${i + 1}/${mesasACrear.length}:`);
      console.log(`   Número: ${mesa.table_number}`);
      
      const { data, error } = await supabase
        .from('tables')
        .insert({
          restaurant_id: senderosRestaurantId,
          table_number: mesa.table_number,
          is_active: true
        })
        .select();
      
      if (error) {
        console.log(`   ❌ Error creando mesa: ${error.message}`);
      } else {
        console.log(`   ✅ Mesa creada: ${data[0].id}`);
        mesasCreadas++;
        
        // Esperar un poco entre creaciones
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log('\n🎯 RESUMEN DE CREACIÓN');
    console.log('='.repeat(30));
    console.log(`✅ Mesas creadas exitosamente: ${mesasCreadas}/${mesasACrear.length}`);
    
    // Verificar las mesas creadas
    const { data: mesasVerificadas } = await supabase
      .from('tables')
      .select('id, table_number')
      .eq('restaurant_id', senderosRestaurantId)
      .order('table_number');
    
    if (mesasVerificadas && mesasVerificadas.length > 0) {
      console.log('\n📊 MESAS DISPONIBLES EN SENDEROS:');
      mesasVerificadas.forEach((mesa, index) => {
        console.log(`   ${index + 1}. Mesa ${mesa.table_number} (${mesa.id})`);
      });
    } else {
      console.log('\n❌ No se encontraron mesas en Senderos');
    }
    
    console.log('\n🎉 ¡Mesas creadas exitosamente!');
    console.log('='.repeat(35));
    console.log('✅ Ahora puedes ejecutar el script de órdenes múltiples');
    console.log('✅ Las órdenes se distribuirán en diferentes mesas');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar creación de mesas
crearMesasSenderosSimple(); 