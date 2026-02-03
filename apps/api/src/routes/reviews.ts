
import { Router, Response } from "express";
import { db } from "../db";
import { reviews, products } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const reviewSchema = z.object({
    productId: z.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

// Create Review
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { productId, rating, comment } = reviewSchema.parse(req.body);

        // Check if already reviewed (optional but good practice)
        const existingReview = await db.select().from(reviews).where(and(
            eq(reviews.userId, req.user.id),
            eq(reviews.productId, productId)
        )).limit(1);

        if (existingReview.length > 0) {
            // Update
            await db.update(reviews)
                .set({ rating, comment, createdAt: new Date() })
                .where(eq(reviews.id, existingReview[0].id));
        } else {
            // Insert
            await db.insert(reviews).values({
                userId: req.user.id,
                productId,
                rating,
                comment,
            });
        }

        // Recalculate average rating
        const allReviews = await db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.productId, productId));
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : "0.0";

        await db.update(products).set({ rating: avgRating }).where(eq(products.id, productId));

        res.status(201).json({ message: "Review submitted" });

    } catch (error) {
        console.error("Review error:", error);
        res.status(500).json({ error: "Failed to submit review" });
    }
});

export default router;
