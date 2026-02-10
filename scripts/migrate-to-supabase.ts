/**
 * Script to export data from MySQL and import to Supabase PostgreSQL
 * Run with: npx tsx scripts/migrate-to-supabase.ts
 */

import mysql from "mysql2/promise";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

interface User {
    id: number;
    username: string | null;
    email: string;
    password_hash: string | null;
    image_url: string | null;
    address: string | null;
    phone: string | null;
    role: string;
    created_at: Date | null;
}

interface Product {
    id: number;
    title: string;
    description: string | null;
    selling_price: string;
    cost_price: string | null;
    stock: number;
    category: string | null;
    anime: string | null;
    size: string | null;
    color: string | null;
    material: string | null;
    rating: string | null;
    image_url: string | null;
    available_sizes: string | null;
    available_colors: string | null;
    created_at: Date | null;
}

interface Order {
    id: number;
    user_id: number | null;
    status: string;
    total: string;
    created_at: Date | null;
}

interface OrderItem {
    id: number;
    order_id: number | null;
    product_id: number | null;
    quantity: number;
    price: string;
}

interface CartItem {
    id: number;
    user_id: number | null;
    product_id: number | null;
    quantity: number;
    created_at: Date | null;
}

interface Review {
    id: number;
    user_id: number | null;
    product_id: number | null;
    rating: number;
    comment: string | null;
    created_at: Date | null;
}

async function main() {
    console.log("🚀 Starting MySQL to Supabase migration...\n");

    // MySQL connection
    const mysqlConn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
    });

    // PostgreSQL connection
    const pgConn = postgres(process.env.DATABASE_URL!, { max: 1 });

    try {
        // Export and import Users
        console.log("📦 Migrating users...");
        const [usersRows] = await mysqlConn.execute<mysql.RowDataPacket[]>(
            "SELECT id, username, email, password_hash, image_url, address, phone, role, created_at FROM users"
        );
        const users = usersRows as User[];
        console.log(`   Found ${users.length} users`);

        for (const user of users) {
            await pgConn`
                INSERT INTO users (id, username, email, password_hash, image_url, address, phone, role, created_at)
                VALUES (${user.id}, ${user.username}, ${user.email}, ${user.password_hash}, ${user.image_url}, ${user.address}, ${user.phone}, ${user.role}, ${user.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        // Reset sequence
        if (users.length > 0) {
            const maxUserId = Math.max(...users.map(u => u.id));
            await pgConn`SELECT setval('users_id_seq', ${maxUserId}, true)`;
        }
        console.log("   ✅ Users migrated\n");

        // Export and import Products
        console.log("📦 Migrating products...");
        const [productsRows] = await mysqlConn.execute<mysql.RowDataPacket[]>("SELECT * FROM products");
        const products = productsRows as Product[];
        console.log(`   Found ${products.length} products`);

        for (const product of products) {
            await pgConn`
                INSERT INTO products (id, title, description, selling_price, cost_price, stock, category, anime, size, color, material, rating, image_url, available_sizes, available_colors, created_at)
                VALUES (${product.id}, ${product.title}, ${product.description}, ${product.selling_price}, ${product.cost_price}, ${product.stock}, ${product.category}, ${product.anime}, ${product.size}, ${product.color}, ${product.material}, ${product.rating}, ${product.image_url}, ${product.available_sizes}, ${product.available_colors}, ${product.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        if (products.length > 0) {
            const maxProductId = Math.max(...products.map(p => p.id));
            await pgConn`SELECT setval('products_id_seq', ${maxProductId}, true)`;
        }
        console.log("   ✅ Products migrated\n");

        // Export and import Orders
        console.log("📦 Migrating orders...");
        const [ordersRows] = await mysqlConn.execute<mysql.RowDataPacket[]>("SELECT * FROM orders");
        const orders = ordersRows as Order[];
        console.log(`   Found ${orders.length} orders`);

        for (const order of orders) {
            await pgConn`
                INSERT INTO orders (id, user_id, status, total, created_at)
                VALUES (${order.id}, ${order.user_id}, ${order.status}, ${order.total}, ${order.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        if (orders.length > 0) {
            const maxOrderId = Math.max(...orders.map(o => o.id));
            await pgConn`SELECT setval('orders_id_seq', ${maxOrderId}, true)`;
        }
        console.log("   ✅ Orders migrated\n");

        // Export and import Order Items
        console.log("📦 Migrating order items...");
        const [orderItemsRows] = await mysqlConn.execute<mysql.RowDataPacket[]>("SELECT * FROM order_items");
        const orderItems = orderItemsRows as OrderItem[];
        console.log(`   Found ${orderItems.length} order items`);

        for (const item of orderItems) {
            await pgConn`
                INSERT INTO order_items (id, order_id, product_id, quantity, price)
                VALUES (${item.id}, ${item.order_id}, ${item.product_id}, ${item.quantity}, ${item.price})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        if (orderItems.length > 0) {
            const maxOrderItemId = Math.max(...orderItems.map(i => i.id));
            await pgConn`SELECT setval('order_items_id_seq', ${maxOrderItemId}, true)`;
        }
        console.log("   ✅ Order items migrated\n");

        // Export and import Cart Items
        console.log("📦 Migrating cart items...");
        const [cartItemsRows] = await mysqlConn.execute<mysql.RowDataPacket[]>("SELECT * FROM cart_items");
        const cartItems = cartItemsRows as CartItem[];
        console.log(`   Found ${cartItems.length} cart items`);

        for (const item of cartItems) {
            await pgConn`
                INSERT INTO cart_items (id, user_id, product_id, quantity, created_at)
                VALUES (${item.id}, ${item.user_id}, ${item.product_id}, ${item.quantity}, ${item.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        if (cartItems.length > 0) {
            const maxCartItemId = Math.max(...cartItems.map(i => i.id));
            await pgConn`SELECT setval('cart_items_id_seq', ${maxCartItemId}, true)`;
        }
        console.log("   ✅ Cart items migrated\n");

        // Export and import Reviews
        console.log("📦 Migrating reviews...");
        const [reviewsRows] = await mysqlConn.execute<mysql.RowDataPacket[]>("SELECT * FROM reviews");
        const reviews = reviewsRows as Review[];
        console.log(`   Found ${reviews.length} reviews`);

        for (const review of reviews) {
            await pgConn`
                INSERT INTO reviews (id, user_id, product_id, rating, comment, created_at)
                VALUES (${review.id}, ${review.user_id}, ${review.product_id}, ${review.rating}, ${review.comment}, ${review.created_at})
                ON CONFLICT (id) DO NOTHING
            `;
        }
        if (reviews.length > 0) {
            const maxReviewId = Math.max(...reviews.map(r => r.id));
            await pgConn`SELECT setval('reviews_id_seq', ${maxReviewId}, true)`;
        }
        console.log("   ✅ Reviews migrated\n");

        console.log("🎉 Migration completed successfully!");
        console.log("\nSummary:");
        console.log(`   Users: ${users.length}`);
        console.log(`   Products: ${products.length}`);
        console.log(`   Orders: ${orders.length}`);
        console.log(`   Order Items: ${orderItems.length}`);
        console.log(`   Cart Items: ${cartItems.length}`);
        console.log(`   Reviews: ${reviews.length}`);

    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    } finally {
        await mysqlConn.end();
        await pgConn.end();
    }
}

main().catch(console.error);
