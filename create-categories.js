const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function createCategoriesTable() {
  console.log('📋 CREANDO TABLA DE CATEGORÍAS Y CATEGORÍAS NECESARIAS');
  
  try {
    // Crear la tabla categories si no existe
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
      CREATE POLICY IF NOT EXISTS "Categories are viewable by same restaurant" ON categories
        FOR ALL USING (restaurant_id IN (
          SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        ));
      
      -- Índices para mejor rendimiento
      CREATE INDEX IF NOT EXISTS categories_restaurant_id_idx ON categories(restaurant_id);
      CREATE INDEX IF NOT EXISTS categories_display_order_idx ON categories(display_order);
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.log('Tabla categories probablemente ya existe o se creó correctamente');
    } else {
      console.log('✅ Tabla categories creada exitosamente');
    }
    
    // Crear categorías básicas
    const basicCategories = [
      { name: 'Cafés en Máquina', display_order: 1, description: 'Cafés preparados con máquina espresso' },
      { name: 'Especialidad Métodos', display_order: 2, description: 'Métodos especiales de preparación de café' },
      { name: 'Bebidas Calientes', display_order: 3, description: 'Tés, mates y otras bebidas calientes' },
      { name: 'Bebidas Frías', display_order: 4, description: 'Bebidas frías y refrescantes' },
      { name: 'Jugos', display_order: 5, description: 'Jugos naturales y batidos' },
      { name: 'Pastelería', display_order: 6, description: 'Postres y productos de pastelería' },
      { name: 'Nuestros Especiales', display_order: 7, description: 'Sandwiches y platos especiales' }
    ];
    
    console.log('Creando categorías...');
    
    for (const category of basicCategories) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          restaurant_id: SENDEROS_ID,
          is_available: true
        })
        .select()
        .single();
      
      if (error) {
        console.log(`⚠️ Error o categoría ya existe: ${category.name}`);
      } else {
        console.log(`✅ Categoría creada: ${category.name} (ID: ${data.id})`);
      }
    }
    
    // Mostrar todas las categorías
    const { data: allCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', SENDEROS_ID)
      .order('display_order');
    
    if (allCategories) {
      console.log('\n📋 CATEGORÍAS DISPONIBLES:');
      allCategories.forEach(cat => {
        console.log(`  ${cat.display_order}. ${cat.name} (ID: ${cat.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createCategoriesTable();