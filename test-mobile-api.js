// Test script to verify the public modifiers API
const https = require('https');

async function testModifiersAPI() {
  console.log('Testing public modifiers API...');
  
  // Test with a known menu item ID
  const menuItemId = 175; // Use the same ID from your error logs
  const url = `https://qr-order-system.vercel.app/api/public-modifiers?menuItemId=${menuItemId}`;
  
  console.log(`Testing URL: ${url}`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (error) {
          console.log('Raw response:', data);
          console.error('Error parsing JSON:', error);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
  });
}

testModifiersAPI()
  .then(() => console.log('Test completed successfully'))
  .catch((error) => console.error('Test failed:', error)); 