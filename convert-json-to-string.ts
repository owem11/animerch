
import { db } from './apps/api/src/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function main() {
    console.log("Starting Manual Schema Migration (JSON -> TEXT)...");

    try {
        // 1. Alter available_sizes
        console.log("Altering available_sizes to TEXT...");
        await db.execute(sql`ALTER TABLE products MODIFY COLUMN available_sizes TEXT`);

        // 2. Alter available_colors
        console.log("Altering available_colors to TEXT...");
        await db.execute(sql`ALTER TABLE products MODIFY COLUMN available_colors TEXT`);

        console.log("Schema altered successfully.");

        // 3. Clean up the data (Remove JSON brackets/quotes if present)
        // Since we blindly converted JSON to TEXT, it likely looks like '["S","M"]'.
        // We want 'S, M'.
        // We can do this with a script loop.

        console.log("Cleaning up data format...");
        const { products } = await import('./apps/api/src/db/schema');
        const { eq } = await import('drizzle-orm');

        const allProducts = await db.select().from(products);

        for (const p of allProducts) {
            let updateNeeded = false;
            let newSizes = p.availableSizes;
            let newColors = p.availableColors;

            // Check sizes
            if (typeof newSizes === 'string' && (newSizes.trim().startsWith('[') || newSizes.includes('"'))) {
                try {
                    // Parse JSON if it's valid JSON string
                    const parsed = JSON.parse(newSizes);
                    if (Array.isArray(parsed)) {
                        newSizes = parsed.join(", ");
                        updateNeeded = true;
                    }
                } catch (e) {
                    // Maybe it's just a string with quotes?
                    // Just remove [" and "] and "
                    let cleaned = newSizes.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
                    // Fix double spaces
                    cleaned = cleaned.replace(/\s+/g, ' ').trim();
                    if (cleaned !== newSizes) {
                        newSizes = cleaned;
                        updateNeeded = true;
                    }
                }
            }

            // Check colors
            if (typeof newColors === 'string' && (newColors.trim().startsWith('[') || newColors.includes('"'))) {
                try {
                    const parsed = JSON.parse(newColors);
                    if (Array.isArray(parsed)) {
                        newColors = parsed.join(", ");
                        updateNeeded = true;
                    }
                } catch (e) {
                    let cleaned = newColors.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
                    cleaned = cleaned.replace(/\s+/g, ' ').trim();
                    if (cleaned !== newColors) {
                        newColors = cleaned;
                        updateNeeded = true;
                    }
                }
            }

            if (updateNeeded) {
                await db.update(products)
                    .set({ availableSizes: newSizes, availableColors: newColors })
                    .where(eq(products.id, p.id));
            }
        }

        console.log("Data cleanup complete.");
        process.exit(0);

    } catch (e) {
        console.error("Error migrating schema/data:", e);
        process.exit(1);
    }
}

main();
