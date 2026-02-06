
import { Router, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

router.post("/google", async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: "Missing credential" });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: "Invalid token" });
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ error: "Email not provided by Google" });
        }

        // Check if user exists by googleId or email
        let user = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);

        if (user.length === 0) {
            // Check by email in case they previously signed up with email/password
            user = await db.select().from(users).where(eq(users.email, email)).limit(1);

            if (user.length > 0) {
                // Link Google ID to existing account
                await db.update(users)
                    .set({ googleId, imageUrl: user[0].imageUrl || picture })
                    .where(eq(users.id, user[0].id));

                // Refresh user data after update
                user = await db.select().from(users).where(eq(users.id, user[0].id)).limit(1);
            } else {
                // Create new user
                await db.insert(users).values({
                    email,
                    googleId,
                    username: name || email.split("@")[0],
                    imageUrl: picture,
                    role: "user",
                });
                user = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
            }
        }

        const token = jwt.sign(
            { id: user[0].id, email: user[0].email, role: user[0].role },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        const { passwordHash, ...safeUser } = user[0];
        res.json({ token, user: safeUser });
    } catch (error) {
        console.error("Google auth error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});

export default router;
