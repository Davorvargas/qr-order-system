const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrintJobsTable() {
  console.log('🔍 Verificando existencia de tabla print_jobs...');
  
  try {
    // Intentar consultar la tabla
    const { data, error } = await supabase
      .from('print_jobs')
      .select('*')
      .limit(1);
      
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('❌ La tabla print_jobs NO existe');
        console.log('🔧 Para las pruebas, podemos continuar sin esta tabla');
        console.log('📝 La funcionalidad de print_jobs será limitada');
        return false;
      } else {
        console.error('❌ Error consultando tabla:', error);
        return false;
      }
    } else {
      console.log('✅ La tabla print_jobs existe y está accesible');
      console.log('📊 Registros encontrados:', data?.length || 0);
      return true;
    }
  } catch (err) {
    console.error('❌ Error general:', err);
    return false;
  }
}

async function checkPrintersColumns() {
  console.log('\n🔍 Verificando columnas en tabla printers...');
  
  try {
    const { data, error } = await supabase
      .from('printers')
      .select('id, name, type, is_active, last_seen, last_error, print_queue_count')
      .limit(1);
      
    if (error) {
      console.log('⚠️  Algunas columnas adicionales pueden no estar disponibles:', error.message);
      
      // Intentar consulta básica
      const { data: basicData, error: basicError } = await supabase
        .from('printers')
        .select('id, name, type, is_active')
        .limit(1);
        
      if (basicError) {
        console.error('❌ Error con tabla printers:', basicError);
        return false;
      } else {
        console.log('✅ Tabla printers básica funcional');
        return true;
      }
    } else {
      console.log('✅ Todas las columnas de printers están disponibles');
      if (data && data.length > 0) {
        console.log('📊 Printer de ejemplo:', {
          id: data[0].id,
          name: data[0].name,
          type: data[0].type,
          is_active: data[0].is_active
        });
      }
      return true;
    }
  } catch (err) {
    console.error('❌ Error verificando printers:', err);
    return false;
  }
}

async function main() {
  const printJobsExists = await checkPrintJobsTable();
  const printersOk = await checkPrintersColumns();
  
  console.log('\n📋 RESUMEN DE VERIFICACIÓN:');
  console.log(`Print Jobs tabla: ${printJobsExists ? '✅ Existe' : '❌ No existe'}`);
  console.log(`Printers tabla: ${printersOk ? '✅ Funcional' : '❌ Con problemas'}`);
  
  if (!printJobsExists) {
    console.log('\n💡 RECOMENDACIÓN:');
    console.log('Para las pruebas podemos continuar sin print_jobs.');
    console.log('El sistema de impresión funcionará con funcionalidad básica.');
  }
  
  console.log('\n🚀 ¡Listo para continuar con las pruebas!');
}

main().catch(console.error);