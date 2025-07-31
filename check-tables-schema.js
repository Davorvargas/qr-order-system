// Script para verificar la estructura de la tabla tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTablesSchema() {
  console.log('🔍 Verificando estructura de la tabla tables...\n');
  
  try {
    // Obtener una mesa existente para ver su estructura
    const { data: sampleTable, error } = await supabase
      .from('tables')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('❌ Error obteniendo muestra:', error);
      return;
    }
    
    if (sampleTable) {
      console.log('📋 ESTRUCTURA DE LA TABLA TABLES:');
      console.log('==================================');
      
      Object.keys(sampleTable).forEach(column => {
        const value = sampleTable[column];
        const type = typeof value;
        console.log(`${column}: ${value} (${type})`);
      });
      
      console.log('\n✅ Columnas disponibles:');
      Object.keys(sampleTable).forEach(column => {
        console.log(`- ${column}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar verificación
checkTablesSchema();