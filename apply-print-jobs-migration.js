const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyPrintJobsMigration() {
  console.log('🚀 Aplicando migración print_jobs...');
  
  // Leer el archivo de migración
  const migrationSQL = fs.readFileSync('./supabase/migrations/20250130_create_print_jobs.sql', 'utf8');
  
  console.log('📄 Ejecutando migración SQL...');
  
  try {
    // Ejecutar el SQL directamente
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      
      // Intentar método alternativo: dividir en comandos individuales
      console.log('🔄 Intentando método alternativo...');
      
      // Verificar si la tabla ya existe
      const { data: tableExists } = await supabase
        .from('print_jobs')
        .select('id')
        .limit(1);
        
      if (tableExists !== null) {
        console.log('✅ La tabla print_jobs ya existe');
        return;
      }
      
      // Si no existe, aplicar solo la creación de tabla básica
      const basicTableSQL = `
        CREATE TABLE IF NOT EXISTS print_jobs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id INTEGER NOT NULL,
          printer_id UUID NOT NULL,
          print_type TEXT NOT NULL CHECK (print_type IN ('kitchen', 'drink', 'receipt')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'completed', 'failed', 'cancelled')),
          requested_by UUID NOT NULL,
          requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          error_message TEXT,
          retry_count INTEGER NOT NULL DEFAULT 0,
          max_retries INTEGER NOT NULL DEFAULT 3,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `;
      
      const { error: basicError } = await supabase.rpc('exec_sql', { 
        sql: basicTableSQL 
      });
      
      if (basicError) {
        console.error('❌ Error creando tabla básica:', basicError);
        return;
      }
      
    } else {
      console.log('✅ Migración aplicada exitosamente');
    }
    
    // Verificar que la tabla existe
    console.log('🔍 Verificando tabla print_jobs...');
    const { data: verification, error: verifyError } = await supabase
      .from('print_jobs')
      .select('*')
      .limit(1);
      
    if (verifyError && verifyError.code !== 'PGRST116') {
      console.error('❌ Error verificando tabla:', verifyError);
    } else {
      console.log('✅ Tabla print_jobs existe y está accesible');
    }
    
    // También verificar que se agregaron las columnas a printers
    console.log('🔍 Verificando columnas adicionales en printers...');
    const { data: printers, error: printersError } = await supabase
      .from('printers')
      .select('last_seen, last_error, print_queue_count')
      .limit(1);
      
    if (printersError) {
      console.log('⚠️  Las columnas adicionales en printers pueden no estar disponibles');
    } else {
      console.log('✅ Columnas adicionales en printers están disponibles');
    }
    
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

applyPrintJobsMigration().catch(console.error);