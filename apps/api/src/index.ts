import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { db } from "./db";
import { products } from "./db/schema";
import * as dotenv from "dotenv";

import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

console.log("CWD:", process.cwd());
console.log("DB_USER:", process.env.DB_USER);
console.log("Env Path:", path.resolve(__dirname, "../../../.env"));

const app: Express = express();
const port = process.env.PORT || 4001;

import authRoutes from "./routes/auth";

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/auth", authRoutes);

app.get("/health", async (req: Request, res: Response) => {
    try {
        // Simple DB check
        await db.select().from(products).limit(1);
        res.json({ ok: true, db: "connected" });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({ ok: false, db: "disconnected", error: String(error) });
    }
});

import productRoutes from "./routes/products";

import cartRoutes from "./routes/cart";

import userRoutes from "./routes/users";
import adminRoutes from "./routes/admin";
import orderRoutes from "./routes/orders";

// ... middleware ...

app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
import uploadRoutes from "./routes/upload";
app.use("/api/upload", uploadRoutes);
import reviewRoutes from "./routes/reviews";
app.use("/api/reviews", reviewRoutes);

// Serve static files from public/uploads
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Health check remains...

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
