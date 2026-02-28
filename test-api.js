const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/api/companies');
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
}
test();
