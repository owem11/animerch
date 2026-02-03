
import { db } from './apps/api/src/db';
import { products } from './apps/api/src/db/schema';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkDuplicates() {
    console.log('Checking for duplicates...');

    // Count total
    const total = await db.select({ count: sql<number>`count(*)` }).from(products);
    console.log(`Total Products: ${total[0].count}`);

    // Find duplicates by title
    const duplicates = await db.select({
        title: products.title,
        count: sql<number>`count(*)`
    })
        .from(products)
        .groupBy(products.title)
        .having(sql`count(*) > 1`);

    console.log(`Found ${duplicates.length} titles with duplicates.`);

    if (duplicates.length > 0) {
        console.log('Sample duplicates:', duplicates.slice(0, 3));
    }

    process.exit(0);
}

checkDuplicates();
