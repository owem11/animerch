import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from './db';
import { products } from './db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const CSV_PATH = path.resolve(__dirname, '../../../data/anime_tshirts.csv');

async function seed() {
    console.log('Seeding database...');
    try {
        const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        console.log(`Found ${records.length} records.`);

        for (const record of records) {
            await db.insert(products).values({
                title: record.name, // Mapping 'name' to 'title'
                anime: record.anime,
                category: record.category,
                price: record.price,
                stock: parseInt(record.stock),
                size: record.size,
                color: record.color,
                material: record.material,
                rating: record.rating,
                description: `${record.anime} - ${record.name}`, // Auto-generating description
            });
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
