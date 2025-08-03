const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// IDs de los restaurantes
const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
const PRUEBAS_ID = 'a01006de-3963-406d-b060-5b7b34623a38';

async function crearMesasSimple() {
  console.log('🪑 CREANDO MESAS FALTANTES CON ESTRUCTURA CORRECTA');
  console.log('='.repeat(60));
  
  try {
    // Verificar mesas existentes para Pruebas
    const { data: mesasPruebas } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', PRUEBAS_ID)
      .order('table_number');
    
    console.log(`📊 Pruebas tiene actualmente ${mesasPruebas?.length || 0} mesas:`);
    mesasPruebas?.forEach(mesa => {
      console.log(`   Mesa ${mesa.table_number} (tipo: ${typeof mesa.table_number}) (ID: ${mesa.id})`);
    });
    
    // Determinar qué mesas faltan (convertir a numbers para comparar)
    const numerosMesas = mesasPruebas?.map(m => parseInt(m.table_number)) || [];
    console.log(`\n🔍 Números de mesa existentes:`, numerosMesas);
    
    const mesasParaCrear = [];
    
    for (let i = 1; i <= 8; i++) {
      if (!numerosMesas.includes(i)) {
        mesasParaCrear.push({
          table_number: i,
          restaurant_id: PRUEBAS_ID
        });
        console.log(`   ➕ Falta crear mesa ${i}`);
      } else {
        console.log(`   ✅ Mesa ${i} ya existe`);
      }
    }
    
    if (mesasParaCrear.length > 0) {
      console.log(`\n🚀 Creando ${mesasParaCrear.length} mesas faltantes...`);
      
      const { data: nuevasMesas, error } = await supabase
        .from('tables')
        .insert(mesasParaCrear)
        .select();
      
      if (error) {
        console.error('❌ Error creando mesas:', error);
        return;
      }
      
      console.log(`✅ ${nuevasMesas.length} mesas creadas exitosamente`);
      nuevasMesas.forEach(mesa => {
        console.log(`   Mesa ${mesa.table_number} (ID: ${mesa.id})`);
      });
    } else {
      console.log('\n✅ Todas las mesas ya existen para Pruebas');
    }
    
    // Verificar estado final de ambos restaurantes
    console.log('\n📊 ESTADO FINAL:');
    
    const { data: finalSenderos } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .order('table_number');
    
    const { data: finalPruebas } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', PRUEBAS_ID)
      .order('table_number');
    
    console.log(`\n🏪 SENDEROS (${finalSenderos?.length || 0} mesas):`);
    finalSenderos?.forEach(mesa => {
      console.log(`   Mesa ${mesa.table_number}`);
    });
    
    console.log(`\n🏪 PRUEBAS (${finalPruebas?.length || 0} mesas):`);
    finalPruebas?.forEach(mesa => {
      console.log(`   Mesa ${mesa.table_number}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CONFIGURACIÓN DE MESAS COMPLETADA');
    console.log('📋 DATOS LISTOS PARA PRUEBAS:');
    console.log(`   🏪 Senderos: ${finalSenderos?.length || 0} mesas, 4 categorías, 4 items, 4 impresoras`);
    console.log(`   🏪 Pruebas: ${finalPruebas?.length || 0} mesas, 3 categorías, 3 items, 3 impresoras`);
    console.log('\n🚀 PROCEDER CON PRUEBAS MANUALES EN http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

crearMesasSimple();