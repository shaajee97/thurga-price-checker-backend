const fs = require('fs');
const fetch = require('node-fetch');

const merchantId = process.env.CLOVER_MERCHANT_ID;
const accessToken = process.env.CLOVER_API_TOKEN;

async function fetchInventory() {
  const url = `https://api.clover.com/v3/merchants/${merchantId}/items`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch Clover inventory: ${response.statusText}`);
    process.exit(1);
  }

  const data = await response.json();

  const products = (data.elements || []).map(item => ({
    barcode: item.sku || '',
    name: item.name || '',
    price: item.price ? (item.price / 100).toFixed(2) : '0.00'
  })).filter(item => item.barcode !== '');

  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/products.json', JSON.stringify(products, null, 2));
  console.log('✅ products.json updated successfully');
}

fetchInventory();
