import { Router, Response } from "express";
import { db } from "../db";
import { users, orders, orderItems, products, cartItems } from "../db/schema";
import { eq, sql, desc, count } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";

const router = Router();




// Protect all admin routes
router.use(authenticateToken, requireAdmin);


// Dashboard Stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
    try {
        const totalUsers = await db.select({ count: count() }).from(users);
        const totalOrders = await db.select({ count: count() }).from(orders);
        const totalProducts = await db.select({ count: count() }).from(products);

        // Sum of total sales
        const salesResult = await db.select({
            totalSales: sql<number>`sum(${orders.total})`
        }).from(orders);

        // Inventory Status (low stock)
        const lowStock = await db.select().from(products).where(sql`${products.stock} < 10`).limit(5);

        // Sales by product (top 5)
        const topProducts = await db.select({
            id: products.id,
            title: products.title,
            sold: sql<number>`sum(${orderItems.quantity})`
        })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .groupBy(products.id)
            .orderBy(desc(sql`sum(${orderItems.quantity})`))
            .limit(5);

        // CHART: Sales History (Last 7 days) - JS Aggregation for easier DB compatibility
        const recentOrders = await db.select({
            createdAt: orders.createdAt,
            total: orders.total
        })
            .from(orders)
            .where(sql`${orders.createdAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`)
            .orderBy(orders.createdAt);

        const salesMap = new Map<string, number>();
        recentOrders.forEach(order => {
            if (!order.createdAt) return;
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit' }); // e.g., "Jan 01"
            salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + Number(order.total));
        });

        const salesHistory = Array.from(salesMap.entries()).map(([name, total]) => ({ name, total }));

        // Total Sales & Total Profit
        // Profit = Sum((ItemPrice - CostPrice) * Quantity)
        const profitResult = await db.select({
            totalProfit: sql<number>`sum((${products.sellingPrice} - COALESCE(${products.costPrice}, 0)) * ${orderItems.quantity})`
        })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id));

        // ... existing chart code ...

        // CHART: Profit History (Last 7 days)
        const recentProfitItems = await db.select({
            createdAt: orders.createdAt,
            price: orderItems.price,
            sellingPrice: products.sellingPrice, // Add current selling price
            costPrice: products.costPrice,
            quantity: orderItems.quantity
        })
            .from(orders)
            .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(sql`${orders.createdAt} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`)
            .orderBy(orders.createdAt);

        const profitMap = new Map<string, number>();
        recentProfitItems.forEach(item => {
            if (!item.createdAt) return;
            const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit' });
            // Use sellingPrice to ensure positive margin and consistency with Inventory table
            const profit = (Number(item.sellingPrice) - (item.costPrice ? Number(item.costPrice) : 0)) * item.quantity;
            profitMap.set(dateStr, (profitMap.get(dateStr) || 0) + profit);
        });

        const profitHistory = Array.from(profitMap.entries()).map(([name, total]) => ({ name, total }));

        // CHART: Profit by Category (replacing Sales by Category)
        const categoryProfit = await db.select({
            name: products.category,
            value: sql<number>`sum((${products.sellingPrice} - COALESCE(${products.costPrice}, 0)) * ${orderItems.quantity})`
        })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .groupBy(products.category);

        // ABANDONED CARTS (All active cart items)
        const abandonedCarts = await db
            .select({
                cartId: cartItems.id,
                username: users.username,
                productTitle: products.title,
                sellingPrice: products.sellingPrice,
                costPrice: products.costPrice,
                date: cartItems.createdAt,
            })
            .from(cartItems)
            .innerJoin(users, eq(cartItems.userId, users.id))
            .innerJoin(products, eq(cartItems.productId, products.id))
            .orderBy(desc(cartItems.createdAt))
            .limit(10); // Show recent 10

        res.json({
            users: totalUsers[0].count,
            orders: totalOrders[0].count,
            products: totalProducts[0].count,
            totalSales: salesResult[0].totalSales || 0,
            totalProfit: profitResult[0].totalProfit || 0,
            lowStock,
            topProducts,
            salesHistory,
            profitHistory,
            categoryDistribution: categoryProfit,
            abandonedCarts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Admin Products Management
router.get("/products", async (req: AuthRequest, res: Response) => {
    try {
        const allProducts = await db
            .select({
                id: products.id,
                title: products.title,
                category: products.category,
                sellingPrice: products.sellingPrice,
                costPrice: products.costPrice,
                stock: products.stock,
                anime: products.anime,
                imageUrl: products.imageUrl,
                description: products.description,
                availableSizes: products.availableSizes,
                availableColors: products.availableColors,
                createdAt: products.createdAt,
                sold: sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`,
                profit: sql<number>`COALESCE(sum((${products.sellingPrice} - COALESCE(${products.costPrice}, 0)) * ${orderItems.quantity}), 0)`,
            })
            .from(products)
            .leftJoin(orderItems, eq(products.id, orderItems.productId))
            .groupBy(products.id)
            .orderBy(products.id);

        res.json(allProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// Get Users List
router.get("/users", async (req: AuthRequest, res: Response) => {
    try {
        const userList = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            orderCount: sql<number>`(SELECT count(*) FROM ${orders} WHERE ${orders.userId} = ${users.id})`
        }).from(users);

        res.json(userList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Get Single User Details (with Cart and Orders)
router.get("/users/:id", async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.params.id);

        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));

        // Get user's current cart (abandoned items)
        const userCart = await db
            .select({
                id: cartItems.id,
                quantity: cartItems.quantity,
                product: products,
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.userId, userId));

        const { passwordHash, ...safeUser } = user[0];

        res.json({
            user: safeUser,
            orders: userOrders,
            cart: userCart
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user details" });
    }
});

// Update Product Prices and Stock
router.put("/products/:id", async (req: AuthRequest, res: Response) => {
    try {
        const productId = Number(req.params.id);
        const { sellingPrice, costPrice, stock, title, description, category, imageUrl, anime, availableSizes, availableColors } = req.body;

        await db.update(products)
            .set({
                title,
                description,
                category,
                sellingPrice: String(sellingPrice),
                costPrice: String(costPrice),
                stock: Number(stock),
                imageUrl,
                anime,
                availableSizes,
                availableColors
            })
            .where(eq(products.id, productId));

        res.json({ message: "Product updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// Create New Product
router.post("/products", async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, category, sellingPrice, costPrice, stock, imageUrl, anime, availableSizes, availableColors } = req.body;

        // Basic validation
        if (!title || !sellingPrice) {
            return res.status(400).json({ error: "Title and Selling Price are required" });
        }

        const result = await db.insert(products).values({
            title,
            description: description || "",
            category: category || "Uncategorized",
            sellingPrice: String(sellingPrice),
            costPrice: costPrice ? String(costPrice) : null,
            stock: Number(stock) || 0,
            imageUrl: imageUrl || null,
            rating: "0",
            anime: anime || "N/A",
            availableSizes: availableSizes || null,
            availableColors: availableColors || null,
        });

        res.status(201).json({ message: "Product created successfully", id: result[0].insertId });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
});

// Delete Product
router.delete("/products/:id", async (req: AuthRequest, res: Response) => {
    try {
        const productId = Number(req.params.id);
        await db.delete(products).where(eq(products.id, productId));
        res.json({ message: "Product deleted" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

import { generateImageFromDescription } from "../lib/gemini";

// Generate AI Image
router.post("/generate-image", async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const imageUrl = await generateImageFromDescription(title, description || "");
        res.json({ imageUrl });
    } catch (error) {
        console.error("Generate image error:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

export default router;

