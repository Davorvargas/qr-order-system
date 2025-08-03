const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function cleanDuplicateTables() {
  console.log('🧹 LIMPIANDO POSIBLES MESAS DUPLICADAS EN SENDEROS');
  console.log('='.repeat(60));
  
  try {
    // Obtener todas las mesas de Senderos ordenadas por fecha de creación
    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .order('table_number, created_at');
    
    if (error) {
      console.error('❌ Error consultando mesas:', error);
      return;
    }
    
    console.log(`📊 Total de mesas encontradas: ${tables?.length || 0}`);
    
    if (!tables || tables.length === 0) {
      console.log('⚠️ No se encontraron mesas para limpiar');
      return;
    }
    
    // Detectar duplicados por número de mesa
    const mesasPorNumero = {};
    const duplicadosParaEliminar = [];
    
    tables.forEach(table => {
      const numero = table.table_number;
      if (!mesasPorNumero[numero]) {
        mesasPorNumero[numero] = [];
      }
      mesasPorNumero[numero].push(table);
    });
    
    // Identificar duplicados (mantener solo el primero por fecha)
    Object.keys(mesasPorNumero).forEach(numero => {
      const mesas = mesasPorNumero[numero];
      if (mesas.length > 1) {
        console.log(`🔍 Encontrado ${mesas.length} duplicados para Mesa ${numero}:`);
        // Ordenar por fecha de creación, mantener el más antiguo
        mesas.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        // El primer elemento se mantiene, el resto se marca para eliminar
        for (let i = 1; i < mesas.length; i++) {
          duplicadosParaEliminar.push(mesas[i]);
          console.log(`   ❌ Marcando para eliminar: ${mesas[i].id} (creada: ${new Date(mesas[i].created_at).toLocaleString()})`);
        }
        console.log(`   ✅ Manteniendo: ${mesas[0].id} (creada: ${new Date(mesas[0].created_at).toLocaleString()})`);
      }
    });
    
    if (duplicadosParaEliminar.length === 0) {
      console.log('✅ No se encontraron duplicados para eliminar');
      
      // Mostrar estado actual ordenado
      console.log('\n📋 ESTADO ACTUAL DE MESAS (ordenadas):');
      const mesasOrdenadas = Object.keys(mesasPorNumero)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(numero => mesasPorNumero[numero][0]);
      
      mesasOrdenadas.forEach((mesa, index) => {
        console.log(`${index + 1}. Mesa ${mesa.table_number} - ID: ${mesa.id}`);
      });
      
      return;
    }
    
    console.log(`\n🗑️ ELIMINANDO ${duplicadosParaEliminar.length} MESAS DUPLICADAS...`);
    
    // Eliminar duplicados
    const idsParaEliminar = duplicadosParaEliminar.map(mesa => mesa.id);
    
    const { error: deleteError } = await supabase
      .from('tables')
      .delete()
      .in('id', idsParaEliminar);
    
    if (deleteError) {
      console.error('❌ Error eliminando duplicados:', deleteError);
      return;
    }
    
    console.log(`✅ ${duplicadosParaEliminar.length} mesas duplicadas eliminadas exitosamente`);
    
    // Verificar estado final
    const { data: finalTables } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .order('table_number');
    
    console.log('\n📊 ESTADO FINAL:');
    console.log(`Total de mesas: ${finalTables?.length || 0}`);
    
    if (finalTables) {
      finalTables.forEach((mesa, index) => {
        console.log(`${index + 1}. Mesa ${mesa.table_number} - ID: ${mesa.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// También función para recrear mesas limpias si es necesario
async function recreateCleanTables() {
  console.log('\n🔄 ¿RECREAR MESAS LIMPIAS? (SOLO SI ES NECESARIO)');
  console.log('Esta función eliminaría TODAS las mesas y crearía 10 nuevas (1-10)');
  console.log('Usa esto solo si hay problemas graves de duplicación');
  
  // No ejecutar automáticamente, solo mostrar opción
  console.log('Para ejecutar, llama a recreateCleanTables() manualmente');
}

cleanDuplicateTables();