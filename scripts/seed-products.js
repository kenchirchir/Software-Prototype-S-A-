const { pool } = require('../config/db');

async function seedProducts() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert categories if they don't exist
    await connection.query(`
      INSERT INTO product_category (name, description) VALUES
      ('Clothing', 'All types of clothes'),
      ('Accessories', 'Bags, hats, and jewelry')
      ON DUPLICATE KEY UPDATE name=name;
    `);

    // Get category IDs
    const [categories] = await connection.query('SELECT id, name FROM product_category');
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.name] = cat.id;
      return map;
    }, {});

    // Product data
    const products = [
      { name: 'Armed to Teeth Polo', description: 'Stylish polo shirt', price: 9500, SKU: 'POLO-001', category: 'Clothing', quantity: 50 },
      { name: 'Screenprint Sweatshirt', description: 'Comfortable sweatshirt', price: 5500, SKU: 'SWEAT-001', category: 'Clothing', quantity: 40 },
      { name: 'Cotton Maison Margela Shirt', description: 'Premium cotton shirt', price: 6500, SKU: 'SHIRT-001', category: 'Clothing', quantity: 30 },
      { name: 'ALU Tote Bag', description: 'Durable tote bag with ALU branding', price: 5000, SKU: 'BAG-001', category: 'Accessories', quantity: 60 },
      { name: 'Soft Leather Jacket', description: 'Premium leather jacket', price: 15000, SKU: 'JACKET-001', category: 'Clothing', quantity: 20 },
      { name: 'Classic ALU Hat', description: 'Classic hat with ALU logo', price: 4500, SKU: 'HAT-001', category: 'Accessories', quantity: 45 },
      { name: 'ALU Knit Sweater', description: 'Warm knit sweater', price: 8000, SKU: 'SWEATER-001', category: 'Clothing', quantity: 35 },
      { name: 'ALU Crop Top', description: 'Stylish crop top', price: 4000, SKU: 'CROP-001', category: 'Clothing', quantity: 25 }
    ];

    // Insert products
    for (const product of products) {
      // First create inventory record
      const [inventoryResult] = await connection.query(
        'INSERT INTO product_inventory (quantity) VALUES (?)',
        [product.quantity]
      );

      // Then insert or update product
      await connection.query(
        `INSERT INTO product (name, description, SKU, category_id, inventory_id, price) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         description = VALUES(description), 
         price = VALUES(price), 
         category_id = VALUES(category_id),
         inventory_id = VALUES(inventory_id);`,
        [
          product.name,
          product.description,
          product.SKU,
          categoryMap[product.category],
          inventoryResult.insertId,
          product.price
        ]
      );
    }

    await connection.commit();
    console.log(` Successfully added/updated ${products.length} products`);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(' Error seeding products:', err);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

seedProducts();


