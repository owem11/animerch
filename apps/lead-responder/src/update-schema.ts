import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load root .env to get direct DB URL
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function updateSchema() {
    const connectionString = process.env.DIRECT_URL;

    if (!connectionString) {
        console.error('DIRECT_URL not found in root .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        console.log('Ensuring full_body column exists...');
        await client.query('ALTER TABLE support_emails ADD COLUMN IF NOT EXISTS full_body TEXT;');

        console.log('Schema update completed successfully!');

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
