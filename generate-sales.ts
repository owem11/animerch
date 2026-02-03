
import { db } from './apps/api/src/db';
import { users, products, orders, orderItems } from './apps/api/src/db/schema';
import { eq, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function generateSales() {
    console.log("Generating dummy sales data...");

    const allUsers = await db.select().from(users);
    const allProducts = await db.select().from(products);

    if (allUsers.length === 0 || allProducts.length === 0) {
        console.error("No users or products found. Seed validation failed.");
        process.exit(1);
    }

    // Generate 50 random orders over the last 30 days
    const NUM_ORDERS = 50;
    const DAYS_RANGE = 30;

    for (let i = 0; i < NUM_ORDERS; i++) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * DAYS_RANGE));

        const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items per order
        let orderTotal = 0;
        const itemsToInsert = [];

        for (let j = 0; j < numItems; j++) {
            const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 qty per item
            const price = Number(randomProduct.sellingPrice);

            itemsToInsert.push({
                productId: randomProduct.id,
                quantity,
                price: randomProduct.sellingPrice, // Record snapshot price
            });

            orderTotal += price * quantity;
        }

        // Insert Order
        const [insertResult] = await db.insert(orders).values({
            userId: randomUser.id,
            total: orderTotal.toFixed(2),
            status: "completed",
            createdAt: orderDate,
        });

        const orderId = insertResult.insertId;

        // Insert Order Items and Update Stock
        for (const item of itemsToInsert) {
            await db.insert(orderItems).values({
                orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            });

            // Decrement stock
            await db.update(products)
                .set({ stock: sql`${products.stock} - ${item.quantity}` })
                .where(eq(products.id, item.productId));
        }

        console.log(`Created Order #${orderId} for User ${randomUser.username}: $${orderTotal.toFixed(2)} (${orderDate.toISOString().split('T')[0]})`);
    }

    console.log("Sales generation complete.");
    process.exit(0);
}

generateSales();
