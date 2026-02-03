
import { Router, Request, Response } from "express";
import { db } from "../db";
import { products } from "../db/schema";
import { like, eq, and, desc, asc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const { search, category, sort, limit } = req.query;

        let query = db.select().from(products).$dynamic();
        const conditions = [];

        if (search) {
            conditions.push(like(products.title, `%${search}%`));
        }

        if (category) {
            conditions.push(eq(products.category, String(category)));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        if (sort === "price_desc") {
            query = query.orderBy(desc(products.sellingPrice));
        } else if (sort === "price_asc") {
            query = query.orderBy(asc(products.sellingPrice));
        } else if (sort === "rating") {
            query = query.orderBy(desc(products.rating));
        } else {
            // Default sort by creation
            query = query.orderBy(desc(products.createdAt));
        }

        if (limit) {
            query = query.limit(Number(limit));
        }

        const results = await query;
        const safeResults = results.map(p => {
            const { costPrice, ...rest } = p;
            return rest;
        });
        res.json({ count: safeResults.length, data: safeResults });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

router.get("/categories", async (req: Request, res: Response) => {
    try {
        const categories = await db
            .select({ category: products.category })
            .from(products)
            .groupBy(products.category);

        res.json(categories.map((c) => c.category).filter(Boolean));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const result = await db.select().from(products).where(eq(products.id, Number(req.params.id))).limit(1);
        if (result.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        const { costPrice, ...publicData } = result[0];
        res.json(publicData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

export default router;
