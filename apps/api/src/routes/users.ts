
import { Router, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
    username: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    address: z.string().optional(),
    phone: z.string().optional(),
});

router.put("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { username, imageUrl, address, phone } = updateProfileSchema.parse(req.body);

        await db
            .update(users)
            .set({
                username,
                imageUrl,
                address,
                phone,
            })
            .where(eq(users.id, req.user.id));

        const updatedUser = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
        const { passwordHash, ...safeUser } = updatedUser[0];

        res.json(safeUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: "Failed to update profile" });
    }
});

export default router;
