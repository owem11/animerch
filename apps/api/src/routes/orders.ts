
import { Router, Response } from "express";
import { db } from "../db";
import { orders, orderItems, cartItems, products } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Get Order History
router.get("/history", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        const userOrders = await db
            .select()
            .from(orders)
            .where(eq(orders.userId, req.user.id))
            .orderBy(sql`${orders.createdAt} DESC`);

        const ordersWithItems = await Promise.all(userOrders.map(async (order) => {
            const items = await db
                .select({
                    id: orderItems.id,
                    productId: orderItems.productId,
                    quantity: orderItems.quantity,
                    price: orderItems.price,
                    productTitle: products.title,
                    productImage: products.imageUrl,
                    rating: products.rating // Include generic rating, or we might want to check if user reviewed it
                })
                .from(orderItems)
                .innerJoin(products, eq(orderItems.productId, products.id))
                .where(eq(orderItems.orderId, order.id));

            return {
                ...order,
                items
            };
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error("Order history error:", error);
        res.status(500).json({ error: "Failed to fetch order history" });
    }
});

// Create Order (Checkout)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        // 1. Get Cart Items
        const userCartItems = await db
            .select({
                cartId: cartItems.id,
                productId: cartItems.productId,
                quantity: cartItems.quantity,
                price: products.sellingPrice, // Use current selling price
                stock: products.stock,
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.userId, req.user.id));

        if (userCartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // 2. Check Stock & Calculate Total
        let totalAmount = 0;
        for (const item of userCartItems) {
            if (item.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for product ID ${item.productId}` });
            }
            totalAmount += Number(item.price) * item.quantity;
        }

        // 3. Create Order
        const newOrderObj = await db.insert(orders).values({
            userId: req.user.id,
            total: String(totalAmount),
            status: "completed", // Auto-complete for now as there's no payment gateway
        });

        const newOrderId = newOrderObj[0].insertId;

        // 4. Create Order Items & Update Stock
        for (const item of userCartItems) {
            if (!item.productId) continue; // Skip invalid items

            await db.insert(orderItems).values({
                orderId: newOrderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            });

            // Decrement Stock
            await db
                .update(products)
                .set({ stock: sql`${products.stock} - ${item.quantity}` })
                .where(eq(products.id, item.productId));
        }

        // 5. Clear Cart
        await db.delete(cartItems).where(eq(cartItems.userId, req.user.id));

        res.status(201).json({ message: "Order placed successfully", orderId: newOrderId });

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ error: "Failed to place order" });
    }
});

export default router;
