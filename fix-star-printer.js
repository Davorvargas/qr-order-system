const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🔧 CORRECCIÓN: Actualizando impresora Star con datos correctos\n');
    console.log('='.repeat(60));
    
    const senderos = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
    
    // Buscar la impresora Star incorrecta
    const { data: starPrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', senderos)
      .ilike('name', '%star%');
    
    if (starPrinters.length > 0) {
      const incorrectPrinter = starPrinters[0];
      
      console.log('🔍 Impresora Star encontrada (con datos incorrectos):');
      console.log(`   - ID: ${incorrectPrinter.id}`);
      console.log(`   - Nombre: ${incorrectPrinter.name}`);
      console.log(`   - Vendor ID: ${incorrectPrinter.vendor_id}`);
      console.log(`   - Product ID: ${incorrectPrinter.product_id}`);
      console.log(`   - Descripción: ${incorrectPrinter.description}`);
      
      // Actualizar con datos correctos del printer_service.py
      const { data: updatedPrinter, error: updateError } = await supabase
        .from('printers')
        .update({
          name: 'Impresora Star Micronics BSC10',
          vendor_id: 1305, // 0x0519 en decimal
          product_id: 11,  // 0x000b en decimal
          description: 'Star Micronics BSC10 para cocina - USB 0519:000b - Perfil TM-T88V',
          location: 'Estación de cocina principal'
        })
        .eq('id', incorrectPrinter.id)
        .eq('restaurant_id', senderos)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error actualizando impresora:', updateError.message);
      } else {
        console.log('\\n✅ Impresora Star actualizada con datos correctos:');
        console.log(`   - ID: ${updatedPrinter.id}`);
        console.log(`   - Nombre: ${updatedPrinter.name}`);
        console.log(`   - Vendor ID: ${updatedPrinter.vendor_id} (0x${updatedPrinter.vendor_id.toString(16).toUpperCase()})`);
        console.log(`   - Product ID: ${updatedPrinter.product_id} (0x${updatedPrinter.product_id.toString(16).toUpperCase().padStart(4, '0')})`);
        console.log(`   - Descripción: ${updatedPrinter.description}`);
        console.log(`   - Ubicación: ${updatedPrinter.location}`);
        console.log(`   - Tipo: ${updatedPrinter.type}`);
        console.log(`   - Activa: ${updatedPrinter.is_active}`);
      }
    } else {
      console.log('❌ No se encontró impresora Star para corregir');
      
      // Crear la impresora correcta si no existe
      console.log('\\n🎯 Creando impresora Star Micronics BSC10 correcta...');
      
      const { data: newPrinter, error: createError } = await supabase
        .from('printers')
        .insert({
          name: 'Impresora Star Micronics BSC10',
          type: 'kitchen',
          restaurant_id: senderos,
          vendor_id: 1305, // 0x0519
          product_id: 11,  // 0x000b
          is_active: true,
          description: 'Star Micronics BSC10 para cocina - USB 0519:000b - Perfil TM-T88V',
          location: 'Estación de cocina principal',
          status: 'unknown'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creando impresora:', createError.message);
      } else {
        console.log('✅ Impresora Star Micronics BSC10 creada:');
        console.log(`   - ID: ${newPrinter.id}`);
        console.log(`   - Nombre: ${newPrinter.name}`);
        console.log(`   - USB: ${newPrinter.vendor_id.toString(16).toUpperCase()}:${newPrinter.product_id.toString(16).toUpperCase().padStart(4, '0')}`);
      }
    }
    
    // Verificar todas las impresoras de Senderos
    console.log('\\n🖨️ Verificando todas las impresoras de Senderos:');
    
    const { data: allPrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('restaurant_id', senderos)
      .eq('is_active', true)
      .order('type');
    
    console.log(`\\n✅ Total de impresoras activas: ${allPrinters.length}`);
    allPrinters.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.name} (${p.type})`);
      if (p.vendor_id && p.product_id) {
        const vendorHex = p.vendor_id.toString(16).toUpperCase();
        const productHex = p.product_id.toString(16).toUpperCase().padStart(4, '0');
        console.log(`      USB: ${vendorHex}:${productHex}`);
      }
      console.log(`      Descripción: ${p.description || 'Sin descripción'}`);
      console.log(`      Ubicación: ${p.location || 'No especificada'}`);
    });
    
    console.log('\\n' + '='.repeat(60));
    console.log('✅ CORRECCIÓN COMPLETADA');
    console.log('🌟 Star Micronics BSC10 configurada según printer_service.py');
    console.log('📋 Datos correctos: USB 0519:000b, Perfil TM-T88V');
    
  } catch (error) {
    console.error('❌ Error en la corrección:', error.message);
  }
})();