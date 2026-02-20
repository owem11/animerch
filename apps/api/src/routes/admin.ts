import { Router, Response } from "express";
import { db } from "../db";
import { users, orders, orderItems, products, cartItems } from "../db/schema";
import { eq, sql, desc, count } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { generateImageFromDescription } from "../lib/leonardo";
import fs from "fs";
import path from "path";

const router = Router();

// Helper to save base64 image to file system
const saveGeneratedImage = (base64Data: string, title: string): string => {
    try {
        const base64Content = base64Data.split(';base64,').pop();
        if (!base64Content) throw new Error("Invalid base64 data");

        const timestamp = Date.now();
        const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const fileName = `${sanitizedTitle}-${timestamp}.jpg`;

        const webPublicPath = path.resolve(__dirname, "../../../web/public/products", fileName);
        const dataImgPath = path.resolve(__dirname, "../../../../../data/img", fileName);

        [path.dirname(webPublicPath), path.dirname(dataImgPath)].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        const buffer = Buffer.from(base64Content, 'base64');
        fs.writeFileSync(webPublicPath, buffer);
        fs.writeFileSync(dataImgPath, buffer);

        console.log(`Image saved to ${webPublicPath} and ${dataImgPath}`);
        return `/products/${fileName}`;
    } catch (error) {
        console.error("Error saving generated image:", error);
        throw error;
    }
};

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// Dashboard Stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
    try {
        const totalUsers = await db.select({ count: count() }).from(users);
        const totalOrders = await db.select({ count: count() }).from(orders);
        const totalProducts = await db.select({ count: count() }).from(products);

        const salesResult = await db.select({
            totalSales: sql<number>`sum(${orders.total})`
        }).from(orders);

        const lowStock = await db.select().from(products).where(sql`${products.stock} < 10`).limit(5);

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

        const recentOrders = await db.select({
            createdAt: orders.createdAt,
            total: orders.total
        })
            .from(orders)
            .where(sql`${orders.createdAt} >= NOW() - INTERVAL '7 days'`)
            .orderBy(orders.createdAt);

        const salesMap = new Map<string, number>();
        recentOrders.forEach(order => {
            if (!order.createdAt) return;
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit' });
            salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + Number(order.total));
        });

        const salesHistory = Array.from(salesMap.entries()).map(([name, total]) => ({ name, total }));

        const profitResult = await db.select({
            totalProfit: sql<number>`sum((${products.sellingPrice} - COALESCE(${products.costPrice}, 0)) * ${orderItems.quantity})`
        })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id));

        const recentProfitItems = await db.select({
            createdAt: orders.createdAt,
            price: orderItems.price,
            sellingPrice: products.sellingPrice,
            costPrice: products.costPrice,
            quantity: orderItems.quantity
        })
            .from(orders)
            .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(sql`${orders.createdAt} >= NOW() - INTERVAL '7 days'`)
            .orderBy(orders.createdAt);

        const profitMap = new Map<string, number>();
        recentProfitItems.forEach(item => {
            if (!item.createdAt) return;
            const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", { month: 'short', day: '2-digit' });
            const profit = (Number(item.sellingPrice) - (item.costPrice ? Number(item.costPrice) : 0)) * item.quantity;
            profitMap.set(dateStr, (profitMap.get(dateStr) || 0) + profit);
        });

        const profitHistory = Array.from(profitMap.entries()).map(([name, total]) => ({ name, total }));

        const categoryProfit = await db.select({
            name: products.category,
            value: sql<number>`sum((${products.sellingPrice} - COALESCE(${products.costPrice}, 0)) * ${orderItems.quantity})`
        })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .groupBy(products.category);

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
            .limit(10);

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

// Get Single User Details
router.get("/users/:id", async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length === 0) return res.status(404).json({ error: "User not found" });

        const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
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
        res.json({ user: safeUser, orders: userOrders, cart: userCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user details" });
    }
});

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

// Update Product
router.put("/products/:id", async (req: AuthRequest, res: Response) => {
    try {
        const productId = Number(req.params.id);
        let { sellingPrice, costPrice, stock, title, description, category, imageUrl, anime, availableSizes, availableColors } = req.body;

        console.log(`Updating product ${productId}. Image URL length: ${imageUrl?.length || 0}`);

        // If imageUrl is base64, save it to file system
        if (imageUrl && imageUrl.startsWith('data:image/')) {
            console.log("Detected base64 image, saving to file system...");
            imageUrl = saveGeneratedImage(imageUrl, title);
            console.log(`Image saved. New path: ${imageUrl}`);
        }

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

        res.json({ message: "Product updated", imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// Create New Product
router.post("/products", async (req: AuthRequest, res: Response) => {
    try {
        let { title, description, category, sellingPrice, costPrice, stock, imageUrl, anime, availableSizes, availableColors } = req.body;
        if (!title || !sellingPrice) return res.status(400).json({ error: "Title and Selling Price are required" });

        console.log(`Creating new product. Image URL length: ${imageUrl?.length || 0}`);

        if (imageUrl && imageUrl.startsWith('data:image/')) {
            console.log("Detected base64 image, saving to file system...");
            imageUrl = saveGeneratedImage(imageUrl, title);
            console.log(`Image saved. New path: ${imageUrl}`);
        }

        // Check for duplicate product title
        const existing = await db.select().from(products).where(eq(products.title, title)).limit(1);
        if (existing.length > 0) {
            return res.status(400).json({ error: "A product with this title already exists. Please use a unique title." });
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
        }).returning({ id: products.id });

        res.status(201).json({ message: "Product created successfully", id: result[0].id, imageUrl });
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

export default router;

