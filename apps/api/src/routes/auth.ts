
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Validation Schemas
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

router.post("/signup", async (req: Request, res: Response) => {
    try {
        const { email, password, username } = signupSchema.parse(req.body);

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            email,
            passwordHash: hashedPassword,
            username: username || email.split("@")[0],
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (user.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user[0].passwordHash);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user[0].id, email: user[0].email, role: user[0].role },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        const { passwordHash, ...safeUser } = user[0];

        res.json({ token, user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
        if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const { passwordHash, ...safeUser } = user[0];
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
