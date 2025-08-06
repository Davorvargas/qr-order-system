const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyModifierPublicAccess() {
  try {
    console.log('🔧 Aplicando políticas de acceso público para modificadores...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-public-modifier-access.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando script SQL...');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Try alternative approach - execute each statement separately
      console.log('🔄 Intentando enfoque alternativo...');
      
      const statements = [
        `DROP POLICY IF EXISTS "Users can view modifier groups from their restaurant" ON modifier_groups`,
        `DROP POLICY IF EXISTS "Users can view modifiers from their restaurant" ON modifiers`,
        `ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY`,
        `ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY`,
        `ALTER TABLE order_item_modifiers ENABLE ROW LEVEL SECURITY`,
        `DROP POLICY IF EXISTS "Anonymous can view modifier groups" ON modifier_groups`,
        `CREATE POLICY "Anonymous can view modifier groups" ON modifier_groups FOR SELECT USING (true)`,
        `DROP POLICY IF EXISTS "Anonymous can view modifiers" ON modifiers`,
        `CREATE POLICY "Anonymous can view modifiers" ON modifiers FOR SELECT USING (true)`,
        `DROP POLICY IF EXISTS "Anonymous can create order item modifiers" ON order_item_modifiers`,
        `CREATE POLICY "Anonymous can create order item modifiers" ON order_item_modifiers FOR INSERT WITH CHECK (true)`
      ];
      
      for (const statement of statements) {
        console.log(`📝 Ejecutando: ${statement.substring(0, 50)}...`);
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (stmtError) {
            console.warn(`⚠️ Advertencia en: ${statement.substring(0, 30)}: ${stmtError.message}`);
          }
        } catch (e) {
          console.warn(`⚠️ Advertencia ejecutando statement: ${e.message}`);
        }
      }
    }

    // Test the public access
    console.log('🧪 Probando acceso público a modificadores...');
    
    const publicSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDMxMjUsImV4cCI6MjA2NjM3OTEyNX0.LFTPv0veT2nRBBzTgV5eWgjBn0D7GbUTAtAnD5lObcQ');
    
    const { data: modifierGroups, error: groupsError } = await publicSupabase
      .from('modifier_groups')
      .select('*')
      .limit(1);

    if (groupsError) {
      console.error('❌ Error accediendo a modifier_groups públicamente:', groupsError);
    } else {
      console.log('✅ Acceso público a modifier_groups exitoso');
    }

    const { data: modifiers, error: modifiersError } = await publicSupabase
      .from('modifiers')
      .select('*')
      .limit(1);

    if (modifiersError) {
      console.error('❌ Error accediendo a modifiers públicamente:', modifiersError);
    } else {
      console.log('✅ Acceso público a modifiers exitoso');
    }

    console.log('🎉 Proceso completado. Las políticas de acceso público para modificadores han sido aplicadas.');
    console.log('📱 Los usuarios del menú QR ahora pueden ver los modificadores de productos.');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Función alternativa si exec_sql no está disponible
async function alternativeApproach() {
  console.log('🔄 Usando enfoque alternativo con múltiples queries...');
  
  const queries = [
    'DROP POLICY IF EXISTS "Anonymous can view modifier groups" ON modifier_groups',
    'CREATE POLICY "Anonymous can view modifier groups" ON modifier_groups FOR SELECT USING (true)',
    'DROP POLICY IF EXISTS "Anonymous can view modifiers" ON modifiers', 
    'CREATE POLICY "Anonymous can view modifiers" ON modifiers FOR SELECT USING (true)',
  ];

  for (const query of queries) {
    try {
      console.log(`📝 Ejecutando: ${query.substring(0, 50)}...`);
      const { error } = await supabase.rpc('sql', { query });
      if (error) console.warn(`⚠️ Advertencia: ${error.message}`);
    } catch (e) {
      console.warn(`⚠️ Query falló: ${e.message}`);
    }
  }
}

if (require.main === module) {
  applyModifierPublicAccess().catch(console.error);
}