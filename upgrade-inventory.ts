
import { db } from './apps/api/src/db';
import { products } from './apps/api/src/db/schema';
import { sql, eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const SIZES_APPAREL = ["S", "M", "L", "XL", "XXL"];
const SIZES_SHOES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
const SIZES_RINGS = ["Free Size"]; // or Ring sizes if we had them, but Rings -> Accessories usually implies One Size or specific.
const SIZES_DEFAULT = ["One Size"];

const COLORS_DEFAULT = ["Black", "White", "Original"];

async function main() {
    console.log("Starting Inventory Upgrade...");

    try {
        // 1. Rename Rings -> Accessories
        console.log("Renaming 'Rings' category to 'Accessories'...");
        await db.update(products)
            .set({ category: "Accessories" })
            .where(eq(products.category, "Rings"));

        console.log("Renamed categories.");

        // 2. Populate Available Sizes and Colors
        const allProducts = await db.select().from(products);

        for (const p of allProducts) {
            let sizes: string[] = SIZES_DEFAULT;
            let colors: string[] = ["Standard"];

            const cat = p.category?.toLowerCase() || "";
            const title = p.title.toLowerCase();

            if (cat.includes("shirt") || cat.includes("hoodie") || cat.includes("clothing") || cat.includes("jacket")) {
                sizes = SIZES_APPAREL;
                colors = ["Black", "White", "Navy", "Red"];
            } else if (cat.includes("shoe") || cat.includes("sneaker")) {
                sizes = SIZES_SHOES;
                colors = ["Standard"];
            } else if (cat.includes("ring") || cat.includes("accessorie") || cat.includes("mug") || cat.includes("figure") || cat.includes("toy")) {
                sizes = ["One Size"];
                colors = ["Standard"];
            }

            // If product already has a specific color in title or 'color' col (old), we could preserve it, 
            // but user asked to Input existing items.
            // Let's basically default them so they have *something* to show in the new UI.

            await db.update(products)
                .set({
                    availableSizes: sizes, // Drizzle handles array -> json
                    availableColors: colors
                })
                .where(eq(products.id, p.id));
        }

        console.log(`Updated ${allProducts.length} products with new options.`);
        process.exit(0);

    } catch (e) {
        console.error("Error upgrading inventory:", e);
        process.exit(1);
    }
}

main();
