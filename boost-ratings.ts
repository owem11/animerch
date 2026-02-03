import { db } from './apps/api/src/db';
import { products } from './apps/api/src/db/schema';
import { eq, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function boostRatings() {
    console.log('Boosting ratings for new products...');

    const titles = [
        'Berserk Brand of Sacrifice Ring',
        'Gojo Satoru Domain Expansion Figure'
    ];

    await db.update(products)
        .set({ rating: "5.0" })
        .where(inArray(products.title, titles));

    console.log('Ratings updated to 5.0');
    process.exit(0);
}

boostRatings();
