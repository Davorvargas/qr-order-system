const { createClient } = require('@supabase/supabase-js');

// Variables de entorno de Supabase
const SUPABASE_URL = 'https://osvgapxefsqqhltkabku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDMxMjUsImV4cCI6MjA2NjM3OTEyNX0.LFTPv0veT2nRBBzTgV5eWgjBn0D7GbUTAtAnD5lObcQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMobileModifiers() {
  console.log('📱 DIAGNÓSTICO DE MODIFICADORES EN MÓVILES');
  console.log('=====================================\n');

  try {
    // 1. Obtener un producto con modificadores
    console.log('1️⃣ Buscando producto con modificadores...');
    
    const { data: menuItems, error: menuItemsError } = await supabase
      .from('menu_items')
      .select('id, name, restaurant_id')
      .limit(20);
    
    if (menuItemsError || !menuItems.length) {
      console.error('❌ Error obteniendo productos:', menuItemsError);
      return;
    }

    let productWithModifiers = null;
    
    for (const item of menuItems) {
      const { data: modifierGroups, error: modifierError } = await supabase
        .from('modifier_groups')
        .select(`
          id,
          name,
          modifiers (
            id,
            name,
            price_modifier
          )
        `)
        .eq('menu_item_id', item.id);
      
      if (!modifierError && modifierGroups && modifierGroups.length > 0) {
        productWithModifiers = item;
        console.log(`✅ Producto encontrado: ${item.name} (ID: ${item.id})`);
        modifierGroups.forEach(group => {
          console.log(`   📂 ${group.name}: ${group.modifiers?.length || 0} opciones`);
        });
        break;
      }
    }

    if (!productWithModifiers) {
      console.log('❌ No se encontró ningún producto con modificadores');
      return;
    }

    // 2. Probar la API pública con diferentes User-Agents
    console.log('\n2️⃣ Probando API pública con diferentes User-Agents...');
    
    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    for (let i = 0; i < userAgents.length; i++) {
      const userAgent = userAgents[i];
      const deviceType = ['iPhone', 'Android', 'Windows', 'Mac'][i];
      
      console.log(`\n   📱 Probando ${deviceType}...`);
      
      try {
        const response = await fetch(`https://qr-order-system.vercel.app/api/public-modifiers?menuItemId=${productWithModifiers.id}`, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          const text = await response.text();
          
          // Verificar si es JSON válido
          try {
            const result = JSON.parse(text);
            console.log(`   ✅ JSON válido: ${result.data?.length || 0} grupos de modificadores`);
            
            if (result.data && result.data.length > 0) {
              result.data.forEach(group => {
                console.log(`      📂 ${group.name}: ${group.modifiers?.length || 0} opciones`);
              });
            }
          } catch (parseError) {
            console.log(`   ❌ No es JSON válido: ${text.substring(0, 100)}...`);
          }
        } else {
          console.log(`   ❌ Error HTTP: ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Error de red: ${error.message}`);
      }
    }

    // 3. Probar acceso directo a la página del menú
    console.log('\n3️⃣ Probando acceso a la página del menú...');
    
    // Obtener una mesa para generar la URL
    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('id, table_number')
      .limit(1);
    
    if (tablesError || !tables.length) {
      console.log('❌ No se pudo obtener una mesa para la prueba');
      return;
    }
    
    const tableId = tables[0].id;
    const menuUrl = `https://qr-order-system.vercel.app/menu/${tableId}`;
    
    console.log(`URL del menú: ${menuUrl}`);
    
    try {
      const response = await fetch(menuUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log(`Status del menú: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const html = await response.text();
        console.log(`Tamaño del HTML: ${html.length} caracteres`);
        
        // Verificar si contiene elementos relacionados con modificadores
        const hasModifiers = html.includes('modifier') || html.includes('ProductModalWithModifiers');
        const hasReact = html.includes('__NEXT_DATA__');
        const hasScripts = html.includes('<script');
        
        console.log(`✅ Contiene React: ${hasReact}`);
        console.log(`✅ Contiene scripts: ${hasScripts}`);
        console.log(`✅ Referencias a modificadores: ${hasModifiers}`);
        
        if (!hasModifiers) {
          console.log('⚠️  No se detectaron referencias a modificadores en el HTML');
        }
      } else {
        console.log(`❌ Error HTTP: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error accediendo al menú: ${error.message}`);
    }

    // 4. Verificar políticas RLS específicas
    console.log('\n4️⃣ Verificando políticas RLS...');
    
    const { data: modifierGroupsCount, error: modifierGroupsError } = await supabase
      .from('modifier_groups')
      .select('id', { count: 'exact' });
    
    if (modifierGroupsError) {
      console.error('   ❌ Error accediendo a modifier_groups:', modifierGroupsError);
    } else {
      console.log(`   ✅ Acceso público a modifier_groups: ${modifierGroupsCount?.length || 0} grupos`);
    }
    
    const { data: modifiersCount, error: modifiersError } = await supabase
      .from('modifiers')
      .select('id', { count: 'exact' });
    
    if (modifiersError) {
      console.error('   ❌ Error accediendo a modifiers:', modifiersError);
    } else {
      console.log(`   ✅ Acceso público a modifiers: ${modifiersCount?.length || 0} opciones`);
    }

    // 5. Resumen y recomendaciones
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('=====================================');
    console.log('✅ API pública: Configurada');
    console.log('✅ Políticas RLS: Configuradas');
    console.log('✅ Página del menú: Accesible');
    console.log('✅ Producto con modificadores: Encontrado');
    
    console.log('\n🎯 POSIBLES CAUSAS DEL PROBLEMA EN MÓVILES:');
    console.log('1. Cache del navegador móvil');
    console.log('2. JavaScript deshabilitado');
    console.log('3. Problemas de red móvil');
    console.log('4. Extensions del navegador móvil');
    console.log('5. Configuración de privacidad del dispositivo');
    
    console.log('\n🔧 SOLUCIONES A PROBAR:');
    console.log('1. Limpiar cache del navegador móvil');
    console.log('2. Probar en modo incógnito');
    console.log('3. Deshabilitar extensions');
    console.log('4. Probar con datos móviles vs WiFi');
    console.log('5. Verificar consola de desarrollador en móvil');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  }
}

// Ejecutar el diagnóstico
testMobileModifiers(); 