import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function listTables() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('--- TABLES ---');
        const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(tablesRes.rows.map(r => r.table_name));

        console.log('\n--- DESCRIBING PRODUCTS TABLE (if exists) ---');
        const columnsRes = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
        console.log(columnsRes.rows);

        console.log('\n--- SAMPLE PRODUCT ---');
        const sampleRes = await client.query("SELECT * FROM products LIMIT 1");
        console.log(sampleRes.rows[0]);

        console.log('\n--- CATEGORIES ---');
        const catRes = await client.query("SELECT id, name FROM categories LIMIT 10");
        console.log(catRes.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

listTables();
