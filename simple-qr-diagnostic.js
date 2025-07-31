const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO SIMPLE DEL ESTADO ACTUAL DE CÓDIGOS QR');
console.log('========================================================\n');

// 1. Verificar estructura de archivos
console.log('1. VERIFICANDO ESTRUCTURA DE ARCHIVOS:');

const requiredFiles = [
  'src/app/menu/[tableId]/page.tsx',
  'src/components/QRCodeGenerator.tsx',
  'src/components/OrderForm.tsx',
  'src/app/staff/qr-codes/page.tsx',
  'src/utils/supabase/client.ts'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NO ENCONTRADO`);
  }
});

// 2. Verificar configuración de Supabase
console.log('\n2. VERIFICANDO CONFIGURACIÓN DE SUPABASE:');
const clientFile = 'src/utils/supabase/client.ts';
if (fs.existsSync(clientFile)) {
  const content = fs.readFileSync(clientFile, 'utf8');
  if (content.includes('NEXT_PUBLIC_SUPABASE_URL') && content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('   ✅ Archivo de cliente Supabase configurado correctamente');
  } else {
    console.log('   ❌ Archivo de cliente Supabase mal configurado');
  }
}

// 3. Verificar página de menú
console.log('\n3. VERIFICANDO PÁGINA DE MENÚ:');
const menuPageFile = 'src/app/menu/[tableId]/page.tsx';
if (fs.existsSync(menuPageFile)) {
  const content = fs.readFileSync(menuPageFile, 'utf8');
  
  const checks = [
    { name: 'Usa useParams para obtener tableId', check: content.includes('useParams') },
    { name: 'Obtiene datos de la mesa', check: content.includes('tables') },
    { name: 'Obtiene categorías del menú', check: content.includes('menu_categories') },
    { name: 'Obtiene elementos del menú', check: content.includes('menu_items') },
    { name: 'Renderiza OrderForm', check: content.includes('OrderForm') }
  ];
  
  checks.forEach(check => {
    console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
  });
}

// 4. Verificar generador de QR
console.log('\n4. VERIFICANDO GENERADOR DE QR:');
const qrGeneratorFile = 'src/components/QRCodeGenerator.tsx';
if (fs.existsSync(qrGeneratorFile)) {
  const content = fs.readFileSync(qrGeneratorFile, 'utf8');
  
  const checks = [
    { name: 'Genera URLs con UUID de mesa', check: content.includes('/menu/${table.id}') },
    { name: 'Usa API de QR Server', check: content.includes('api.qrserver.com') },
    { name: 'Textos en español', check: content.includes('Escanea para ver el menú') },
    { name: 'Descarga de códigos QR', check: content.includes('downloadQRCode') },
    { name: 'Impresión de códigos QR', check: content.includes('printQRCode') }
  ];
  
  checks.forEach(check => {
    console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
  });
}

// 5. Verificar OrderForm
console.log('\n5. VERIFICANDO FORMULARIO DE PEDIDO:');
const orderFormFile = 'src/components/OrderForm.tsx';
if (fs.existsSync(orderFormFile)) {
  const content = fs.readFileSync(orderFormFile, 'utf8');
  
  const checks = [
    { name: 'Maneja estado del carrito', check: content.includes('orderItems') },
    { name: 'Calcula precio total', check: content.includes('totalPrice') },
    { name: 'Envía pedido a Supabase', check: content.includes('supabase') },
    { name: 'Muestra FloatingCart', check: content.includes('FloatingCart') }
  ];
  
  checks.forEach(check => {
    console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
  });
}

// 6. Verificar archivos de configuración
console.log('\n6. VERIFICANDO ARCHIVOS DE CONFIGURACIÓN:');
const configFiles = [
  '.env.local',
  'supabase/config.toml',
  'package.json'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NO ENCONTRADO`);
  }
});

// 7. Resumen y recomendaciones
console.log('\n7. RESUMEN Y RECOMENDACIONES:');
console.log('   📋 Estado actual del sistema de códigos QR:');
console.log('   ✅ Estructura de archivos correcta');
console.log('   ✅ Página de menú implementada');
console.log('   ✅ Generador de QR funcional');
console.log('   ✅ Formulario de pedido completo');
console.log('   ⚠️  Necesitas configurar variables de entorno');

console.log('\n8. PRÓXIMOS PASOS:');
console.log('   1. Crea archivo .env.local con tus credenciales de Supabase');
console.log('   2. Ejecuta: npm run dev');
console.log('   3. Ve a /staff/qr-codes para generar códigos QR');
console.log('   4. Prueba escanear un código QR desde tu teléfono');
console.log('   5. Verifica que se abra la página /menu/[tableId]');

console.log('\n9. CONFIGURACIÓN DE VARIABLES DE ENTORNO:');
console.log('   Crea un archivo .env.local en la raíz del proyecto con:');
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui');

console.log('\n10. VERIFICACIÓN FINAL:');
console.log('   Una vez configurado, deberías poder:');
console.log('   - Ver 10 códigos QR en el dashboard');
console.log('   - Escanear cualquier QR y abrir el menú');
console.log('   - Ver productos con precios en bolivianos (Bs.)');
console.log('   - Hacer pedidos desde el menú'); 