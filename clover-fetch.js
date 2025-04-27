const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const CLOVER_API_URL = "https://api.clover.com/v3/merchants";
const MERCHANT_ID = process.env.MERCHANT_ID;    // fixed env var name
const API_TOKEN = process.env.API_TOKEN;        // fixed env var name

async function fetchInventory() {
  try {
    const response = await axios.get(
      `${CLOVER_API_URL}/${MERCHANT_ID}/items?expand=categories`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    const items = response.data.elements.map((item) => ({
      name: item.name,
      price: (item.price || 0) / 100,
      code: item.code || "",
      inventory: item.stockCount || null,
    }));

    fs.writeFileSync("public/products.json", JSON.stringify(items, null, 2));
    console.log("✅ Inventory successfully written to public/products.json");
  } catch (error) {
    console.error("❌ Failed to fetch Clover inventory:", error.message);
    process.exit(1);
  }
}

fetchInventory();
