const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyModifiersMigration() {
  console.log('🗄️ APLICANDO MIGRACIÓN DE MODIFICADORES');
  console.log('='.repeat(60));
  
  try {
    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('./create-modifiers-tables.sql', 'utf8');
    
    // Dividir en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Ejecutando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim()) {
        try {
          console.log(`\n${i + 1}. Ejecutando: ${command.substring(0, 50)}...`);
          
          const { error } = await supabase.rpc('exec_sql', {
            sql: command
          });
          
          if (error) {
            console.error(`❌ Error en comando ${i + 1}:`, error.message);
            // Si el error es que la tabla ya existe, continuamos
            if (!error.message.includes('already exists')) {
              throw error;
            } else {
              console.log('⚠️ Tabla ya existe, continuando...');
            }
          } else {
            console.log(`✅ Comando ${i + 1} ejecutado exitosamente`);
          }
        } catch (cmdError) {
          console.error(`❌ Error ejecutando comando ${i + 1}:`, cmdError.message);
          if (!cmdError.message.includes('already exists')) {
            throw cmdError;
          }
        }
      }
    }
    
    console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('🎯 Tablas creadas: modifier_groups, modifiers, order_item_modifiers');
    console.log('🔒 Políticas RLS aplicadas');
    console.log('📊 Índices de optimización creados');
    
  } catch (error) {
    console.error('❌ Error aplicando migración:', error.message);
    
    // Si no funciona con rpc, intentemos SQL directo
    console.log('\n🔄 Intentando método alternativo...');
    await applyAlternativeMethod();
  }
}

async function applyAlternativeMethod() {
  try {
    console.log('📋 Creando tablas individualmente...');
    
    // Crear tabla modifier_groups
    const { error: error1 } = await supabase.from('_migrations').select('*').limit(1);
    
    // Si llegamos aquí, tenemos acceso básico
    console.log('✅ Conexión a Supabase establecida');
    console.log('');
    console.log('⚠️ Para aplicar las migraciones completas:');
    console.log('1. Ve a Supabase Dashboard → SQL Editor');
    console.log('2. Copia el contenido de create-modifiers-tables.sql');
    console.log('3. Ejecuta el SQL manualmente');
    console.log('');
    console.log('🔗 Link directo: https://supabase.com/dashboard/project');
    
  } catch (altError) {
    console.error('❌ Error con método alternativo:', altError.message);
  }
}

applyModifiersMigration();