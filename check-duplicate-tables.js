const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function checkDuplicateTables() {
  console.log('🔍 VERIFICANDO MESAS DUPLICADAS EN SENDEROS');
  console.log('='.repeat(60));
  
  try {
    // Obtener todas las mesas de Senderos
    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .order('table_number');
    
    if (error) {
      console.error('❌ Error consultando mesas:', error);
      return;
    }
    
    console.log(`📊 Total de mesas encontradas: ${tables?.length || 0}`);
    console.log('');
    
    if (tables && tables.length > 0) {
      // Agrupar por número de mesa para detectar duplicados
      const mesasPorNumero = {};
      
      tables.forEach(table => {
        const numero = table.table_number;
        if (!mesasPorNumero[numero]) {
          mesasPorNumero[numero] = [];
        }
        mesasPorNumero[numero].push(table);
      });
      
      // Mostrar todas las mesas
      console.log('📋 LISTADO COMPLETO DE MESAS:');
      console.log('-'.repeat(60));
      tables.forEach((table, index) => {
        console.log(`${index + 1}. Mesa ${table.table_number}`);
        console.log(`   - ID: ${table.id}`);
        console.log(`   - Creada: ${new Date(table.created_at).toLocaleString()}`);
        console.log(`   - QR URL: /menu/${table.id}`);
        console.log('');
      });
      
      // Verificar duplicados
      console.log('🔍 VERIFICANDO DUPLICADOS:');
      console.log('-'.repeat(60));
      
      let hayDuplicados = false;
      Object.keys(mesasPorNumero).forEach(numero => {
        const mesas = mesasPorNumero[numero];
        if (mesas.length > 1) {
          hayDuplicados = true;
          console.log(`❌ DUPLICADO ENCONTRADO - Mesa ${numero}:`);
          mesas.forEach((mesa, index) => {
            console.log(`   ${index + 1}. ID: ${mesa.id} - Creada: ${new Date(mesa.created_at).toLocaleString()}`);
          });
          console.log('');
        }
      });
      
      if (!hayDuplicados) {
        console.log('✅ No se encontraron mesas duplicadas');
      }
      
      // Mostrar resumen por número
      console.log('📊 RESUMEN POR NÚMERO DE MESA:');
      console.log('-'.repeat(60));
      Object.keys(mesasPorNumero)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(numero => {
          const count = mesasPorNumero[numero].length;
          const status = count > 1 ? '❌ DUPLICADA' : '✅ OK';
          console.log(`Mesa ${numero}: ${count} entrada(s) ${status}`);
        });
      
    } else {
      console.log('⚠️ No se encontraron mesas para el restaurante Senderos');
    }
    
    // Verificar si hay mesas en otros restaurantes también
    console.log('\n🔍 VERIFICANDO OTRAS TABLAS DE RESTAURANTES:');
    console.log('-'.repeat(60));
    
    const { data: allTables } = await supabase
      .from('tables')
      .select('restaurant_id, table_number, id, created_at')
      .order('restaurant_id, table_number');
    
    const mesasPorRestaurante = {};
    allTables?.forEach(table => {
      if (!mesasPorRestaurante[table.restaurant_id]) {
        mesasPorRestaurante[table.restaurant_id] = [];
      }
      mesasPorRestaurante[table.restaurant_id].push(table);
    });
    
    Object.keys(mesasPorRestaurante).forEach(restaurantId => {
      const mesas = mesasPorRestaurante[restaurantId];
      const restaurantName = restaurantId === SENDEROS_ID ? 'Senderos' : 
                           restaurantId === 'a01006de-3963-406d-b060-5b7b34623a38' ? 'Pruebas' : 
                           'Desconocido';
      console.log(`🏪 ${restaurantName} (${restaurantId}): ${mesas.length} mesas`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkDuplicateTables();