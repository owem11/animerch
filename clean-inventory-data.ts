
import { db } from './apps/api/src/db';
import { products } from './apps/api/src/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function main() {
    console.log("Cleaning up data format (Post Schema Change)...");

    try {
        const allProducts = await db.select().from(products);

        for (const p of allProducts) {
            let updateNeeded = false;
            // safely handle if property is null/undefined
            let newSizes = p.availableSizes || "";
            let newColors = p.availableColors || "";

            // Check sizes
            if (newSizes && (newSizes.trim().startsWith('[') || newSizes.includes('"'))) {
                try {
                    const parsed = JSON.parse(newSizes);
                    if (Array.isArray(parsed)) {
                        newSizes = parsed.join(", ");
                        updateNeeded = true;
                    }
                } catch (e) {
                    let cleaned = newSizes.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
                    cleaned = cleaned.replace(/\s+/g, ' ').trim();
                    if (cleaned !== newSizes) {
                        newSizes = cleaned;
                        updateNeeded = true;
                    }
                }
            }

            // Check colors
            if (newColors && (newColors.trim().startsWith('[') || newColors.includes('"'))) {
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
        console.error("Error cleaning data:", e);
        process.exit(1);
    }
}

main();
