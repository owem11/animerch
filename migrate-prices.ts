
import { db } from './apps/api/src/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function migrate() {
    console.log('Starting price migration...');
    try {
        // Rename price to selling_price
        // MySQL syntax: ALTER TABLE products CHANGE old_name new_name data_type;
        console.log('Renaming price -> selling_price...');
        await db.execute(sql`ALTER TABLE products CHANGE price selling_price DECIMAL(10, 2) NOT NULL`);

        // Add cost_price
        console.log('Adding cost_price column...');
        await db.execute(sql`ALTER TABLE products ADD COLUMN cost_price DECIMAL(10, 2)`);

        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
