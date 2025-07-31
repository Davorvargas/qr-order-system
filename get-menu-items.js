const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://osvgapxefsqqhltkabku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwMzEyNSwiZXhwIjoyMDY2Mzc5MTI1fQ.zKLPq_6X9gk1kA9W0l88XduIYtdx-OfqdR9O7uXPmyc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getMenuItems() {
  console.log('🍽️  Obteniendo items del menú...');
  
  try {
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .eq('is_available', true)
      .order('name');
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`✅ Encontrados ${menuItems.length} items del menú:`);
    
    // Look for specific items we need for testing
    const testItems = [
      'Pique a lo Macho',
      'Coca Cola', 
      'Sopa de Maní',
      'Pollo a la Plancha',
      'Agua',
      'Jugo Natural'
    ];
    
    console.log('\n📋 ITEMS PARA PRUEBAS:');
    const foundItems = {};
    
    testItems.forEach(itemName => {
      const found = menuItems.find(item => 
        item.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(item.name.toLowerCase())
      );
      
      if (found) {
        foundItems[itemName] = found;
        console.log(`✅ ${itemName}: ID ${found.id} - Bs ${found.price}`);
      } else {
        console.log(`❌ ${itemName}: No encontrado`);
      }
    });
    
    console.log('\n📝 Items disponibles (primeros 20):');
    menuItems.slice(0, 20).forEach(item => {
      console.log(`   ${item.id}: ${item.name} - Bs ${item.price}`);
    });
    
    return foundItems;
    
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

getMenuItems();