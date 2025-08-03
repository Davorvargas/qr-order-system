const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';
const IMAGES_PATH = 'c:\\Users\\davor\\Documents\\Projects\\Intentos-del-proyecto\\Menus restaurantes\\menu senderos';

// Mapeo de imágenes a productos basado en análisis visual y menú PDF
const IMAGE_TO_PRODUCT_MAPPING = {
  // CAFÉS EN MÁQUINA - IDENTIFICADOS CON CERTEZA
  '1.png': 'Espresso',           // Café oscuro en taza pequeña
  '2.png': 'Capuccino',          // Latte art hoja 
  '3.png': 'Mocaccino',          // Con espuma y cacao en polvo
  '4.png': 'Latte',              // Latte art corazón, taza grande
  '5.png': 'Flat White',         // Latte art roseta, taza ancha
  '6.png': 'Americano',          // Café negro en taza grande
  '7.png': 'Tinto Campesino',    // Café con miel visible (frasco de miel)
  '8.png': 'Espresso Honey',     // Café con espuma cremosa
  
  // ESPECIALIDAD MÉTODOS - IDENTIFICADOS CON CERTEZA
  '9.png': 'Chemex',              // Cafetera Chemex clásica con filtro
  '10.png': 'Prensa Francesa',    // French Press con café preparado
  '11.png': 'V60',                // Dripper V60 con base y café
  '12.png': 'Aeropress',          // Cafetera Aeropress cilíndrica
  
  // BEBIDAS CALIENTES - IDENTIFICADAS CON CERTEZA
  '13.png': 'Té',                 // Tetera de vidrio con té naranja
  '14.png': 'Té de la Abuela',    // Tetera con té y taza elegante
  '15.png': 'Mystic Chai',        // Taza con café/chai y leche vertida
  '16.png': 'Mates: Coca - Manzanilla - Anís', // Taza transparente con té amarillo y menta
  '17.png': 'Mímate',             // Tetera con té herbal rosado/púrpura
  '18.png': 'After Eigth',        // Tetera de vidrio con té herbal
  '19.png': 'Espejito Espejito',  // Tetera con té herbal dorado
  '20.png': 'Tía Coco',           // Tetera con té herbal colorido
  '21.png': 'Mystic Chai',        // Tetera con té herbal oscuro
  
  // JUGOS - IDENTIFICADOS POR COLOR Y TIPO
  '22.png': 'Frutas Exóticas',       // Varios jugos coloridos (verde, rosa, naranja, amarillo)
  '23.png': 'Frutas de Temporada',   // Batidos/Smoothies con frutos rojos - para 3 tipos de jugos
  '25.png': 'Frutas de Temporada',   // Líquido beige/cremoso
  '26.png': 'Pulpas Açaí y Copoazú', // Líquido violeta/morado (açaí)
  
  // PASTELERÍA - IDENTIFICADOS VISUALMENTE  
  '27.png': 'Cuñapes',            // Bollitos de queso bolivianos típicos
  '29.png': 'Torta especial',     // Trozo de torta con capas y frosting
  '30.png': 'Queque de zanahoria', // Cupcake con frosting
  
  // NUESTROS ESPECIALES - IDENTIFICADOS CON CERTEZA
  '31.png': 'Sandwich Senderos - El Ahumadito', // Pan baguette con jamón
  '32.png': 'Clásico',                          // Sandwich grillado clásico
};

// Productos que requieren confirmación manual (NO ASIGNAR AUTOMÁTICAMENTE)
const UNCERTAIN_MAPPINGS = [
  '24.png', // Vaso de leche - no hay producto 'Leche' en base de datos
  '28.png', // Canasta de panes - no hay producto específico de pan/panadería
  // Productos restantes sin imagen asignada:
  // - After Eigth, Cheescake, Empanadas de queso, Empanaditas especiales
  // - Pastel del día, Requesón y Miel, Sultana
];

async function assignImagesToProducts() {
  console.log('🖼️ ASIGNANDO IMÁGENES A PRODUCTOS DE SENDEROS');
  console.log('='.repeat(70));
  
  try {
    // 1. Obtener productos existentes
    const { data: products } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('restaurant_id', SENDEROS_ID);
    
    if (!products) {
      console.error('❌ No se pudieron obtener los productos');
      return;
    }
    
    console.log(`📋 ${products.length} productos encontrados en Senderos`);
    
    // 2. Procesar cada imagen
    let successCount = 0;
    let uncertainCount = 0;
    let errorCount = 0;
    
    for (const [imageName, productName] of Object.entries(IMAGE_TO_PRODUCT_MAPPING)) {
      const imagePath = path.join(IMAGES_PATH, imageName);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️ Imagen no encontrada: ${imageName}`);
        errorCount++;
        continue;
      }
      
      // Buscar el producto correspondiente
      const product = products.find(p => p.name === productName);
      if (!product) {
        console.log(`⚠️ Producto no encontrado: ${productName} para ${imageName}`);
        errorCount++;
        continue;
      }
      
      // Verificar si es un mapeo incierto
      if (UNCERTAIN_MAPPINGS.includes(imageName)) {
        console.log(`🤔 REQUIERE CONFIRMACIÓN: ${imageName} → ${productName}`);
        uncertainCount++;
        continue;
      }
      
      try {
        // Subir imagen a Supabase Storage
        const fileBuffer = fs.readFileSync(imagePath);
        const fileName = `senderos_${product.id}_${imageName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });
        
        if (uploadError) {
          console.log(`❌ Error subiendo ${imageName}: ${uploadError.message}`);
          errorCount++;
          continue;
        }
        
        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName);
        
        // Actualizar producto con la imagen
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({ image_url: publicUrl })
          .eq('id', product.id)
          .eq('restaurant_id', SENDEROS_ID);
        
        if (updateError) {
          console.log(`❌ Error actualizando ${productName}: ${updateError.message}`);
          errorCount++;
          continue;
        }
        
        console.log(`✅ ${imageName} → ${productName}`);
        successCount++;
        
      } catch (error) {
        console.log(`❌ Error procesando ${imageName}: ${error.message}`);
        errorCount++;
      }
    }
    
    // 3. Mostrar resumen
    console.log('\n📊 RESUMEN DE ASIGNACIÓN:');
    console.log(`✅ Asignadas exitosamente: ${successCount}`);
    console.log(`🤔 Requieren confirmación: ${uncertainCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    
    if (uncertainCount > 0) {
      console.log('\n🤔 IMÁGENES QUE REQUIEREN CONFIRMACIÓN:');
      UNCERTAIN_MAPPINGS.forEach(imageName => {
        if (IMAGE_TO_PRODUCT_MAPPING[imageName]) {
          console.log(`  - ${imageName} → ${IMAGE_TO_PRODUCT_MAPPING[imageName]}`);
        }
      });
      console.log('\n¿Deseas que proceda con estas asignaciones o prefieres revisarlas manualmente?');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

assignImagesToProducts();