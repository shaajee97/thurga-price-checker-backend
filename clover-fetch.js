const fs = require('fs');
const fetch = require('node-fetch');

const merchantId = process.env.CLOVER_MERCHANT_ID;
const accessToken = process.env.CLOVER_API_TOKEN;

async function fetchInventory() {
  const itemsUrl = `https://api.clover.com/v3/merchants/${merchantId}/items?limit=1000`;
  const stockUrl = `https://api.clover.com/v3/merchants/${merchantId}/item_stocks?limit=1000`;

  // Fetch items
  const itemsRes = await fetch(itemsUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!itemsRes.ok) {
    console.error(`Failed to fetch items: ${itemsRes.statusText}`);
    process.exit(1);
  }
  const itemsData = await itemsRes.json();
  const items = itemsData.elements || [];

  // Fetch inventory levels
  const stockRes = await fetch(stockUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!stockRes.ok) {
    console.error(`Failed to fetch inventory: ${stockRes.statusText}`);
    process.exit(1);
  }
  const stockData = await stockRes.json();
  const stockMap = {};
  for (const s of stockData.elements || []) {
    stockMap[s.item.id] = s.quantity;
  }

  // Merge data
  const products = items.map(item => ({
    barcode: item.code || '',
    name: item.name || '',
    price: item.price ? (item.price / 100).toFixed(2) : '0.00',
    quantity: stockMap[item.id] ?? 0
  })).filter(p => p.barcode !== '');

  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/products.json', JSON.stringify(products, null, 2));
  console.log('✅ products.json with inventory updated successfully');
}

fetchInventory();
