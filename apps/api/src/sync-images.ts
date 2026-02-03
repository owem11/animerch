import fs from 'fs';
import path from 'path';
import { db } from './db';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const IMAGES_DIR = path.resolve(__dirname, '../../../apps/web/public/products');

async function syncImages() {
    console.log('Syncing images to products...');

    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`Directory not found: ${IMAGES_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(IMAGES_DIR);
    console.log(`Found ${files.length} images.`);

    for (const file of files) {
        if (file === '.gitkeep') continue;

        const ext = path.extname(file);
        const name = path.basename(file, ext); // Filename without extension is the product title
        const imageUrl = `/products/${file}`;

        // Try to find existing product
        const existing = await db.select().from(products).where(eq(products.title, name));

        if (existing.length > 0) {
            console.log(`Updating image for: ${name}`);
            await db.update(products)
                .set({ imageUrl: imageUrl })
                .where(eq(products.id, existing[0].id));
        } else {
            console.log(`Creating new product for: ${name}`);

            // Infer category from name
            let category = "Merch";
            if (name.toLowerCase().includes("ring") || name.toLowerCase().includes("necklace")) category = "Accessories";
            if (name.toLowerCase().includes("figure") || name.toLowerCase().includes("statue")) category = "Figures";
            if (name.toLowerCase().includes("tee") || name.toLowerCase().includes("shirt")) category = "Anime T-Shirt";

            // Infer anime (simple heuristic: first word)
            const anime = name.split(' ')[0];

            await db.insert(products).values({
                title: name,
                description: `${name} - ${category}`,
                sellingPrice: "1499.00", // Default price
                stock: 20,
                category: category,
                anime: anime,
                rating: "4.5",
                imageUrl: imageUrl,
                size: "One Size",
                color: "Standard",
                material: "Mixed"
            });
        }
    }

    console.log('Sync complete!');
    process.exit(0);
}

syncImages();
