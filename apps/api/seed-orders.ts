
import { db } from './src/db';
import { users, products, orders, orderItems } from './src/db/schema';
import { eq } from 'drizzle-orm';

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

        // 3. Clear existing orders for this user
        console.log("Clearing existing orders...");
        const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
        for (const o of userOrders) {
            await db.delete(orderItems).where(eq(orderItems.orderId, o.id));
            await db.delete(orders).where(eq(orders.id, o.id));
        }

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
            }).returning({ id: orders.id });
            const orderId = res[0].id;

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
