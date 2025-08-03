const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SENDEROS_ID = 'b333ede7-f67e-43d6-8652-9a918737d6e3';

async function fixCategoriesAndCheckStructure() {
  console.log('🔧 ARREGLANDO CATEGORÍAS Y VERIFICANDO ESTRUCTURA');
  
  // Verificar si hay categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', SENDEROS_ID);
  
  console.log('Categorías existentes:', categories?.length || 0);
  
  if (!categories || categories.length === 0) {
    console.log('Creando categorías básicas...');
    
    const basicCategories = [
      { name: 'Cafés en Máquina', display_order: 1 },
      { name: 'Especialidad Métodos', display_order: 2 },
      { name: 'Bebidas Calientes', display_order: 3 },
      { name: 'Bebidas Frías', display_order: 4 },
      { name: 'Jugos', display_order: 5 },
      { name: 'Pastelería', display_order: 6 },
      { name: 'Nuestros Especiales', display_order: 7 }
    ];
    
    const { data: newCategories, error } = await supabase
      .from('categories')
      .insert(
        basicCategories.map(cat => ({
          ...cat,
          restaurant_id: SENDEROS_ID,
          available: true
        }))
      )
      .select();
    
    if (error) {
      console.error('Error creando categorías:', error);
    } else {
      console.log('✅ Categorías creadas:', newCategories.length);
    }
  }
  
  // Verificar estructura de order_items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .limit(1);
  
  console.log('Estructura order_items:', orderItems ? Object.keys(orderItems[0] || {}) : 'Sin datos');
  
  // Verificar estructura de tables
  const { data: tables } = await supabase
    .from('tables')
    .select('*')
    .eq('restaurant_id', SENDEROS_ID)
    .limit(1);
  
  console.log('Estructura tables:', tables ? Object.keys(tables[0] || {}) : 'Sin datos');
  console.log('Mesas disponibles:', tables?.length || 0);
}

fixCategoriesAndCheckStructure();