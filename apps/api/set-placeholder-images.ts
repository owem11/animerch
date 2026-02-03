// Script to set placeholder images for products with broken/missing images

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { products } from "./src/db/schema";
import { eq, isNull, or, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "animerch",
    });

    const db = drizzle(connection);

    const allProducts = await db.select().from(products);

    const productsDir = path.resolve(__dirname, "../web/public/products");

    // Filter products that need placeholder images
    const productsNeedingImages = allProducts.filter(p => {
        if (!p.imageUrl) return true;

        // Check if image file exists and is > 1KB
        const imagePath = path.join(productsDir, path.basename(p.imageUrl));
        if (fs.existsSync(imagePath)) {
            const stats = fs.statSync(imagePath);
            if (stats.size < 1000) {
                return true; // Broken image
            }
            return false; // Good image
        }
        return true; // Missing image
    });

    console.log(`Found ${productsNeedingImages.length} products needing placeholder images\n`);

    // Use a placeholder service that actually works
    for (const product of productsNeedingImages) {
        // Create a colorful placeholder based on category
        let bgColor = "1a1a2e"; // Default dark
        let textColor = "ffffff";

        if (product.category?.includes("T-Shirt")) {
            bgColor = "2d2d44";
        } else if (product.category?.includes("Figure")) {
            bgColor = "3d2d44";
        } else if (product.category?.includes("Accessor")) {
            bgColor = "2d3d44";
        }

        // Use placehold.co which is reliable
        const placeholderUrl = `https://placehold.co/400x400/${bgColor}/${textColor}?text=${encodeURIComponent(product.title.substring(0, 20))}`;

        console.log(`[${product.id}] ${product.title} -> placeholder`);

        await db.update(products)
            .set({ imageUrl: placeholderUrl })
            .where(eq(products.id, product.id));
    }

    await connection.end();
    console.log(`\nDone! Updated ${productsNeedingImages.length} products with placeholder images.`);
}

main().catch(console.error);
