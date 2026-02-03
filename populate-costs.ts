
import { db } from './apps/api/src/db';
import { products } from './apps/api/src/db/schema';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function populateCosts() {
    console.log('Populating cost_price for existing products...');

    // Set cost_price = selling_price * 0.7 (30% margin)
    // SQL: UPDATE products SET cost_price = selling_price * 0.7 WHERE cost_price IS NULL
    await db.execute(sql`UPDATE products SET cost_price = selling_price * 0.70`);

    console.log('Cost prices updated.');
    process.exit(0);
}

populateCosts();
