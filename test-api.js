// Test simple de l'API d'accès
const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjY0NjBjNzRhYjQ5NmMxODg1ZTM5NSIsImlhdCI6MTc2MDk3MDI1MiwiZXhwIjoxNzYwOTczODUyfQ.7hMUbzqlLQ2KKc3MDokm41-VcVNJc6SCbkVCs42F2Z4';
const userId = '68f6460c74ab496c1885e395';
const pathId = '68f258d68ffd13c2ba35e4b2';
const levelId = '68f258d68ffd13c2ba35e4d9';

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\n${description}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', (err) => {
      console.log(`\n${description} - ERROR: ${err.message}`);
      resolve({ status: 0, body: err.message });
    });
    req.end();
  });
}

async function main() {
  console.log('Testing API endpoints...');
  console.log(`Token: ${token.substring(0, 50)}...`);
  console.log(`User ID: ${userId}`);
  
  await testEndpoint(`/api/course-access/check/path/${pathId}`, 'Path Access Check');
  await testEndpoint(`/api/course-access/check/path/${pathId}/level/${levelId}`, 'Level Access Check');
  await testEndpoint('/api/health', 'Health Check');
}

main().catch(console.error);
