// Test de l'endpoint de login
const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\nLogin Test - Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });
    
    req.on('error', (err) => {
      console.log(`\nLogin Test - ERROR: ${err.message}`);
      resolve({ status: 0, body: err.message });
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Testing login endpoint...');
  
  // Test avec l'utilisateur existant
  const result = await testLogin('test+1760970252689@example.com', 'anypassword');
  
  if (result.status === 200 && result.body.token) {
    console.log('\n✅ Login successful!');
    console.log(`Token: ${result.body.token.substring(0, 50)}...`);
    console.log(`User: ${JSON.stringify(result.body.user, null, 2)}`);
  } else {
    console.log('\n❌ Login failed');
  }
}

main().catch(console.error);
