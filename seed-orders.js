
const { db } = require('./apps/api/src/db');
const { users, products, orders, orderItems } = require('./apps/api/src/db/schema');
const { eq } = require('drizzle-orm');

async function seedOrders() {
    try {
        console.log("Seeding dummy orders...");

        // 1. Get a user
        const allUsers = await db.select().from(users).limit(1);
        if (allUsers.length === 0) {
            console.log("No users found. Create a user first.");
            return;
        }
        const userId = allUsers[0].id;
        console.log("Using User ID:", userId);

        // 2. Get some products
        const allProducts = await db.select().from(products).limit(5);
        if (allProducts.length === 0) {
            console.log("No products found.");
            return;
        }

        // 3. Delete existing orders for this user (optional, based on request "remove dummy")
        // But user said "just make two to three", implying REPLACE.
        // Let's delete strictly if we want to clean slate, but maybe just add?
        // "remove the dummy orders" -> Clear them.

        // Note: cascading delete might not be set up in Drizzle schema definitions unless in DB.
        // We delete items first. 
        // For simplicity, let's just ADD new ones. 
        // Or if we want to "remove", we should delete all orders for this user.
        // Let's delete all orders for this user to be safe.
        const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
        for (const o of userOrders) {
            await db.delete(orderItems).where(eq(orderItems.orderId, o.id));
            await db.delete(orders).where(eq(orders.id, o.id));
        }
        console.log("Cleared existing orders for user.");

        // 4. Create 3 Dummy Orders
        const statuses = ['delivered', 'processing', 'shipped'];

        for (let i = 0; i < 3; i++) {
            const product = allProducts[i % allProducts.length];
            const qty = i + 1;
            const price = product.sellingPrice;
            const total = (Number(price) * qty).toFixed(2);

            // Create Order
            const res = await db.insert(orders).values({
                userId,
                status: statuses[i],
                total: total,
                createdAt: new Date(Date.now() - i * 86400000) // Past dates
            });
            const orderId = res[0].insertId;

            // Create Order Item
            await db.insert(orderItems).values({
                orderId,
                productId: product.id,
                quantity: qty,
                price: price
            });

            console.log(`Created Order #${orderId} for ${product.title}`);
        }

        console.log("Done seeding.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedOrders();
