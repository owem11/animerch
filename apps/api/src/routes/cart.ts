
import { Router, Response } from "express";
import { db } from "../db";
import { cartItems, products } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Get Cart
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        const items = await db
            .select({
                id: cartItems.id,
                quantity: cartItems.quantity,
                product: products,
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.userId, req.user.id));

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});

// Add to Cart
const addToCartSchema = z.object({
    productId: z.number(),
    quantity: z.number().min(1).default(1),
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { productId, quantity } = addToCartSchema.parse(req.body);

        // Check availability
        const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        if (product.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if exists in cart
        const existingItem = await db
            .select()
            .from(cartItems)
            .where(and(eq(cartItems.userId, req.user.id), eq(cartItems.productId, productId)))
            .limit(1);

        if (existingItem.length > 0) {
            // Update quantity
            await db
                .update(cartItems)
                .set({ quantity: sql`${cartItems.quantity} + ${quantity}` })
                .where(eq(cartItems.id, existingItem[0].id));
        } else {
            // Insert new
            await db.insert(cartItems).values({
                userId: req.user.id,
                productId,
                quantity,
            });
        }

        res.json({ message: "Item added to cart" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add to cart" });
    }
});

// Remove from Cart
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        await db
            .delete(cartItems)
            .where(and(eq(cartItems.id, Number(req.params.id)), eq(cartItems.userId, req.user.id)));

        res.json({ message: "Item removed" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove item" });
    }
});

export default router;
