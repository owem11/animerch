
import { db } from './apps/api/src/db';
import { products } from './apps/api/src/db/schema';
import { sql, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function deduplicate() {
    console.log('Starting deduplication...');

    // Get all products with id and title
    const allProducts = await db.select({
        id: products.id,
        title: products.title
    }).from(products);

    const titleMap = new Map<string, number[]>();

    // Group IDs by title
    for (const p of allProducts) {
        if (!titleMap.has(p.title)) {
            titleMap.set(p.title, []);
        }
        titleMap.get(p.title)?.push(p.id);
    }

    const idsToDelete: number[] = [];

    titleMap.forEach((ids, title) => {
        if (ids.length > 1) {
            // Sort IDs ascending
            ids.sort((a, b) => a - b);
            // Keep the first (oldest), delete the rest
            const toDelete = ids.slice(1);
            idsToDelete.push(...toDelete);
            // console.log(`Title "${title}": Keeping ${ids[0]}, Deleting ${toDelete.join(', ')}`);
        }
    });

    console.log(`Found ${idsToDelete.length} duplicate items to delete.`);

    if (idsToDelete.length > 0) {
        await db.delete(products).where(inArray(products.id, idsToDelete));
        console.log('Successfully deleted duplicates.');
    } else {
        console.log('No duplicates found/deleted.');
    }

    process.exit(0);
}

deduplicate();
