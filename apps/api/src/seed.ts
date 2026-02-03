import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from './db';
import { products, users } from './db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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

        for (const record of records as any[]) {
            const existing = await db.select().from(products).where(eq(products.title, record.name)).limit(1);
            if (existing.length === 0) {
                await db.insert(products).values({
                    title: record.name, // Mapping 'name' to 'title'
                    anime: record.anime,
                    category: record.category,
                    sellingPrice: record.price,
                    costPrice: (Number(record.price) * 0.7).toFixed(2), // Initial dummy cost
                    stock: parseInt(record.stock),
                    size: record.size,
                    color: record.color,
                    material: record.material,
                    rating: record.rating,
                    description: `${record.anime} - ${record.name}`, // Auto-generating description
                });
            }
        }

        // Seed Admin User
        const adminEmail = "admin@animerch.com";
        const adminExists = await db.select().from(users).where(eq(users.email, adminEmail));

        if (adminExists.length === 0) {
            // Hash password "admin"
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin", salt);

            await db.insert(users).values({
                username: "Admin User",
                email: adminEmail,
                passwordHash: hashedPassword,
                role: "admin",
                phone: "123-456-7890",
            });
            console.log("Admin user seeded.");
        } else {
            // Reset password to "admin" if user exists
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin", salt);

            await db.update(users)
                .set({ passwordHash: hashedPassword, role: "admin" }) // Ensure role is admin too
                .where(eq(users.email, adminEmail));

            console.log("Admin user exists. Password reset to 'admin'.");
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
