const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function createCategoriesTableAndData() {
  console.log('📋 CREANDO TABLA DE CATEGORÍAS Y DATOS');
  
  try {
    // 1. Crear la tabla categories si no existe
    console.log('Creando tabla categories...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        is_available BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        description TEXT
      );
      
      -- Crear RLS
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      
      -- Política para permitir acceso solo a categorías del mismo restaurante
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'categories' 
          AND policyname = 'Categories are viewable by same restaurant'
        ) THEN
          CREATE POLICY "Categories are viewable by same restaurant" ON categories
            FOR ALL USING (restaurant_id IN (
              SELECT restaurant_id FROM profiles WHERE id = auth.uid()
            ));
        END IF;
      END $$;
      
      -- Índices para mejor rendimiento
      CREATE INDEX IF NOT EXISTS categories_restaurant_id_idx ON categories(restaurant_id);
      CREATE INDEX IF NOT EXISTS categories_display_order_idx ON categories(display_order);
    `;
    
    // Ejecutar SQL a través de una función RPC
    await supabase.rpc('exec_sql', { sql: createTableSQL });
    console.log('✅ Tabla categories creada/verificada');
    
    // 2. Verificar si ya existen categorías
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID);
    
    if (existingCategories && existingCategories.length > 0) {
      console.log(`ℹ️ Ya existen ${existingCategories.length} categorías`);
      return;
    }
    
    // 3. Crear categorías iniciales
    const categories = [
      { name: 'Cafés en Máquina', display_order: 1, description: 'Cafés preparados con máquina espresso' },
      { name: 'Especialidad Métodos', display_order: 2, description: 'Métodos especiales de preparación de café' },
      { name: 'Bebidas Calientes', display_order: 3, description: 'Tés, mates y otras bebidas calientes' },
      { name: 'Bebidas Frías', display_order: 4, description: 'Bebidas frías y refrescantes' },
      { name: 'Jugos', display_order: 5, description: 'Jugos naturales y batidos' },
      { name: 'Pastelería', display_order: 6, description: 'Postres y productos de pastelería' },
      { name: 'Nuestros Especiales', display_order: 7, description: 'Sandwiches y platos especiales' }
    ];
    
    console.log('Insertando categorías...');
    
    const { data: insertedCategories, error } = await supabase
      .from('categories')
      .insert(
        categories.map(cat => ({
          ...cat,
          restaurant_id: SENDEROS_ID,
          is_available: true
        }))
      )
      .select();
    
    if (error) {
      console.error('❌ Error insertando categorías:', error);
      return;
    }
    
    console.log(`✅ ${insertedCategories.length} categorías creadas`);
    
    // 4. Mapear category_id de menu_items a los nuevos IDs
    console.log('Actualizando category_id en menu_items...');
    
    const categoryMapping = {
      41: insertedCategories.find(c => c.name === 'Cafés en Máquina')?.id,
      42: insertedCategories.find(c => c.name === 'Especialidad Métodos')?.id,
      43: insertedCategories.find(c => c.name === 'Bebidas Calientes')?.id,
      44: insertedCategories.find(c => c.name === 'Bebidas Frías')?.id,
      45: insertedCategories.find(c => c.name === 'Jugos')?.id,
      46: insertedCategories.find(c => c.name === 'Pastelería')?.id,
      47: insertedCategories.find(c => c.name === 'Nuestros Especiales')?.id
    };
    
    // Actualizar cada item con su nueva category_id
    for (const [oldId, newId] of Object.entries(categoryMapping)) {
      if (newId) {
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({ category_id: newId })
          .eq('restaurant_id', SENDEROS_ID)
          .eq('category_id', parseInt(oldId));
        
        if (updateError) {
          console.error(`❌ Error actualizando items de categoría ${oldId}:`, updateError);
        } else {
          console.log(`✅ Items actualizados: categoría ${oldId} → ${newId}`);
        }
      }
    }
    
    // 5. Verificar resultado final
    const { data: finalCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .order('display_order');
    
    const { data: finalItems } = await supabase
      .from('menu_items')
      .select('name, category_id')
      .eq('restaurant_id', SENDEROS_ID);
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`✅ ${finalCategories?.length || 0} categorías creadas`);
    console.log(`✅ ${finalItems?.length || 0} items actualizados`);
    
    if (finalCategories) {
      console.log('\n📋 CATEGORÍAS:');
      finalCategories.forEach(cat => {
        const itemCount = finalItems?.filter(item => item.category_id === cat.id).length || 0;
        console.log(`  ${cat.display_order}. ${cat.name} (${itemCount} items) - ${cat.is_available ? 'Activa' : 'Inactiva'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createCategoriesTableAndData();