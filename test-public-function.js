// Test script to directly test the public Edge Function
const https = require('https');

async function testPublicEdgeFunction() {
  console.log('🧪 Testing public Edge Function directly...');
  
  const testPayload = {
    table_id: "fb206025-7666-4408-aa69-7c87a225ef72",
    customer_name: "Test Customer",
    total_price: 25.50,
    notes: "Test order from public function",
    order_items: [
      {
        menu_item_id: 175,
        quantity: 2,
        price_at_order: 12.75,
        notes: "Test item"
      }
    ]
  };
  
  const postData = JSON.stringify(testPayload);
  
  const options = {
    hostname: 'osvgapxefsqqhltkabku.supabase.co',
    port: 443,
    path: '/functions/v1/place-order-public',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdmdhcHhlZnNxcWhsdGthYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTQyMzQsImV4cCI6MjA2OTkzMDIzNH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8' // Anonymous key
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📡 Status: ${res.statusCode}`);
      console.log(`📡 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Response:', JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (error) {
          console.log('❌ Raw response:', data);
          console.error('Error parsing JSON:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

testPublicEdgeFunction()
  .then(() => {
    console.log('\n🎉 Public Edge Function test completed!');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
  }); 