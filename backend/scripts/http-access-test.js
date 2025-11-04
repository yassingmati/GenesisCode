// Quick HTTP test for course-access endpoints
require('dotenv').config();
const jwt = require('jsonwebtoken');
const http = require('http');

function request(method, path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const userId = process.env.TEST_USER_ID || '000000000000000000000000';
  const pathId = process.env.TEST_PATH_ID || '000000000000000000000000';
  const levelId = process.env.TEST_LEVEL_ID || '000000000000000000000000';
  const secret = process.env.JWT_SECRET || 'devsecret';
  const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });

  console.log('GET /api/course-access/check/path/:pathId');
  const r1 = await request('GET', `/api/course-access/check/path/${pathId}`, token);
  console.log('Status:', r1.status);
  console.log(r1.body);

  console.log('\nGET /api/course-access/check/path/:pathId/level/:levelId');
  const r2 = await request('GET', `/api/course-access/check/path/${pathId}/level/${levelId}`, token);
  console.log('Status:', r2.status);
  console.log(r2.body);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});









