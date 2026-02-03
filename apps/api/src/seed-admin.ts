import { db } from './db';
import { users } from './db/schema';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';
import { eq } from 'drizzle-orm';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seedAdmin() {
    console.log('Seeding admin user...');
    try {
        const adminEmail = 'admin@animerch.com';
        const hashedPassword = await bcrypt.hash('AdminSecurePassword123!', 10);

        const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));

        if (existingAdmin.length === 0) {
            await db.insert(users).values({
                email: adminEmail,
                passwordHash: hashedPassword,
                username: 'Admin',
                role: 'admin',
            });
            console.log('Admin user created successfully.');
            console.log('Email: admin@animerch.com');
            console.log('Password: AdminSecurePassword123!');
        } else {
            console.log('Admin user already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
