
import { db } from './apps/api/src/db';
import { products } from './apps/api/src/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function main() {
    console.log("Starting Legacy Options Migration...");

    try {
        const allProducts = await db.select().from(products);
        console.log(`Found ${allProducts.length} products to check.`);

        let updatedCount = 0;

        for (const p of allProducts) {
            // Check if we have legacy data to migrate
            const legacySize = p.size;
            const legacyColor = p.color;

            let newSizes: string[] = [];
            let newColors: string[] = [];

            // If legacy size exists and isn't just "N/A" or empty
            if (legacySize && legacySize !== "N/A" && legacySize !== "") {
                // If it looks like a list (unlikely based on varchar(10), but possible), split it
                if (legacySize.includes(",")) {
                    newSizes = legacySize.split(",").map(s => s.trim());
                } else {
                    newSizes = [legacySize];
                }
            } else {
                // Keep existing new fields or use defaults if totally empty?
                // User said "input the items that are already registered".
                // If there is no legacy item, we might leave it or fallback to the category default we set earlier.
                // To be safe, let's only overwrite if legacy exists, OR if we want to merge.
                // The prompt implies "transfer existing data".

                // If we already ran the previous script, p.availableSizes might be populated with category defaults.
                // We should probably prioritise existing legacy data if it exists.
                if (p.availableSizes && Array.isArray(p.availableSizes) && (p.availableSizes as string[]).length > 0) {
                    newSizes = p.availableSizes as string[];
                }
            }

            if (legacyColor && legacyColor !== "N/A" && legacyColor !== "") {
                if (legacyColor.includes(",")) {
                    newColors = legacyColor.split(",").map(s => s.trim());
                } else {
                    newColors = [legacyColor];
                }
            } else {
                if (p.availableColors && Array.isArray(p.availableColors) && (p.availableColors as string[]).length > 0) {
                    newColors = p.availableColors as string[];
                }
            }

            // Explicit override: If legacy exists, ensure it is in the list
            if (legacySize && !newSizes.includes(legacySize) && legacySize !== "N/A") {
                newSizes.unshift(legacySize); // Add to front
            }
            if (legacyColor && !newColors.includes(legacyColor) && legacyColor !== "N/A") {
                newColors.unshift(legacyColor);
            }

            // Update
            await db.update(products)
                .set({
                    availableSizes: newSizes,
                    availableColors: newColors
                })
                .where(eq(products.id, p.id));

            updatedCount++;
        }

        console.log(`Processed ${updatedCount} products.`);
        process.exit(0);

    } catch (e) {
        console.error("Error migrating legacy options:", e);
        process.exit(1);
    }
}

main();
