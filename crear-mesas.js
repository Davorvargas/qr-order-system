const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// IDs de los restaurantes
const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
const PRUEBAS_ID = 'a01006de-3963-406d-b060-5b7b34623a38';

async function crearMesas() {
  console.log('🪑 CREANDO MESAS PARA AMBOS RESTAURANTES');
  console.log('='.repeat(60));
  
  try {
    // Verificar mesas existentes
    const { data: mesasExistentes } = await supabase
      .from('tables')
      .select('*')
      .in('restaurant_id', [SENDEROS_ID, PRUEBAS_ID]);
    
    const mesasSenderos = mesasExistentes?.filter(m => m.restaurant_id === SENDEROS_ID) || [];
    const mesasPruebas = mesasExistentes?.filter(m => m.restaurant_id === PRUEBAS_ID) || [];
    
    console.log(`📊 Estado actual:`);
    console.log(`   - Senderos: ${mesasSenderos.length} mesas`);
    console.log(`   - Pruebas: ${mesasPruebas.length} mesas`);
    
    const mesasParaCrear = [];
    
    // Crear mesas para Senderos (si no tiene suficientes)
    if (mesasSenderos.length < 10) {
      console.log(`\n🏪 Creando mesas para Senderos...`);
      
      for (let i = 1; i <= 10; i++) {
        const mesaExiste = mesasSenderos.find(m => m.table_number === i);
        if (!mesaExiste) {
          mesasParaCrear.push({
            table_number: i,
            restaurant_id: SENDEROS_ID,
            capacity: 4,
            qr_code: null
          });
        }
      }
    }
    
    // Crear mesas para Pruebas (si no tiene suficientes)
    if (mesasPruebas.length < 8) {
      console.log(`\n🏪 Creando mesas para Pruebas...`);
      
      for (let i = 1; i <= 8; i++) {
        const mesaExiste = mesasPruebas.find(m => m.table_number === i);
        if (!mesaExiste) {
          mesasParaCrear.push({
            table_number: i,
            restaurant_id: PRUEBAS_ID,
            capacity: 4,
            qr_code: null
          });
        }
      }
    }
    
    // Insertar mesas nuevas
    if (mesasParaCrear.length > 0) {
      console.log(`\n🚀 Creando ${mesasParaCrear.length} mesas nuevas...`);
      
      const { data: mesasCreadas, error } = await supabase
        .from('tables')
        .insert(mesasParaCrear)
        .select();
      
      if (error) {
        console.error('❌ Error creando mesas:', error);
        return;
      }
      
      console.log(`✅ ${mesasCreadas.length} mesas creadas exitosamente`);
      
      // Separar por restaurante
      const nuevasSenderos = mesasCreadas.filter(m => m.restaurant_id === SENDEROS_ID);
      const nuevasPruebas = mesasCreadas.filter(m => m.restaurant_id === PRUEBAS_ID);
      
      console.log(`   - Senderos: +${nuevasSenderos.length} mesas`);
      console.log(`   - Pruebas: +${nuevasPruebas.length} mesas`);
    } else {
      console.log(`✅ Todas las mesas ya existen`);
    }
    
    // Verificar estado final
    const { data: mesasFinales } = await supabase
      .from('tables')
      .select('*')
      .in('restaurant_id', [SENDEROS_ID, PRUEBAS_ID])
      .order('restaurant_id')
      .order('table_number');
    
    const finalSenderos = mesasFinales?.filter(m => m.restaurant_id === SENDEROS_ID) || [];
    const finalPruebas = mesasFinales?.filter(m => m.restaurant_id === PRUEBAS_ID) || [];
    
    console.log('\n📊 ESTADO FINAL:');
    console.log(`🏪 SENDEROS (${finalSenderos.length} mesas):`);
    finalSenderos.forEach(mesa => {
      console.log(`   Mesa ${mesa.table_number} - Capacidad: ${mesa.capacity} - QR: ${mesa.qr_code ? 'Generado' : 'Pendiente'}`);
    });
    
    console.log(`\n🏪 PRUEBAS (${finalPruebas.length} mesas):`);
    finalPruebas.forEach(mesa => {
      console.log(`   Mesa ${mesa.table_number} - Capacidad: ${mesa.capacity} - QR: ${mesa.qr_code ? 'Generado' : 'Pendiente'}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ MESAS CONFIGURADAS CORRECTAMENTE');
    console.log('📋 NEXT STEPS:');
    console.log('1. Login manual en http://localhost:3000');
    console.log('2. Ir a "Códigos QR" para generar los códigos');
    console.log('3. Proceder con las pruebas manuales');
    
  } catch (error) {
    console.error('❌ Error creando mesas:', error.message);
  }
}

crearMesas();