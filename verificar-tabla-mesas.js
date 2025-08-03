const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarTablaMesas() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA MESAS');
  console.log('='.repeat(60));
  
  try {
    // Obtener algunas mesas para ver la estructura
    const { data: mesas, error } = await supabase
      .from('tables')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('Error consultando mesas:', error);
      return;
    }
    
    if (mesas && mesas.length > 0) {
      console.log('📊 Estructura de la tabla "tables":');
      console.log('Columnas disponibles:');
      Object.keys(mesas[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
      
      console.log('\n📋 Ejemplos de registros:');
      mesas.forEach((mesa, index) => {
        console.log(`\n   ${index + 1}. Mesa:`);
        Object.entries(mesa).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`);
        });
      });
    } else {
      console.log('No hay mesas en la tabla');
    }
    
    // Crear mesas sin la columna capacity
    console.log('\n🪑 CREANDO MESAS FALTANTES...');
    
    const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
    const PRUEBAS_ID = 'a01006de-3963-406d-b060-5b7b34623a38';
    
    // Verificar qué mesas faltan para Pruebas
    const { data: mesasPruebas } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', PRUEBAS_ID);
    
    console.log(`Pruebas tiene ${mesasPruebas?.length || 0} mesas`);
    
    const mesasParaCrear = [];
    for (let i = 1; i <= 8; i++) {
      const mesaExiste = mesasPruebas?.find(m => m.table_number === i);
      if (!mesaExiste) {
        mesasParaCrear.push({
          table_number: i,
          restaurant_id: PRUEBAS_ID,
          qr_code: null
        });
      }
    }
    
    if (mesasParaCrear.length > 0) {
      console.log(`Creando ${mesasParaCrear.length} mesas para Pruebas...`);
      
      const { data: nuevasMesas, error: errorCrear } = await supabase
        .from('tables')
        .insert(mesasParaCrear)
        .select();
      
      if (errorCrear) {
        console.error('Error creando mesas:', errorCrear);
      } else {
        console.log(`✅ ${nuevasMesas.length} mesas creadas para Pruebas`);
      }
    } else {
      console.log('✅ Todas las mesas ya existen para Pruebas');
    }
    
    // Estado final
    const { data: estadoFinal } = await supabase
      .from('tables')
      .select('*')
      .in('restaurant_id', [SENDEROS_ID, PRUEBAS_ID])
      .order('restaurant_id')
      .order('table_number');
    
    const senderos = estadoFinal?.filter(m => m.restaurant_id === SENDEROS_ID) || [];
    const pruebas = estadoFinal?.filter(m => m.restaurant_id === PRUEBAS_ID) || [];
    
    console.log('\n📊 ESTADO FINAL:');
    console.log(`🏪 SENDEROS: ${senderos.length} mesas`);
    console.log(`🏪 PRUEBAS: ${pruebas.length} mesas`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarTablaMesas();