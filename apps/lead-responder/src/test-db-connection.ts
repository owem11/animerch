import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function run() {
    console.log('--- DB CONNECTION TEST ---');
    console.log('Connecting to:', process.env.DIRECT_URL?.split('@')[1]);

    const client = new Client({
        connectionString: process.env.DIRECT_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected successfully!');

        // 1. Check schemas
        const schemaRes = await client.query("SELECT schema_name FROM information_schema.schemata");
        console.log('Schemas:', schemaRes.rows.map(r => r.schema_name));

        // 2. Find where 'products' is
        const tableLocRes = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'products'");
        console.log('Products table location:', tableLocRes.rows);

        if (tableLocRes.rows.length > 0) {
            const schema = tableLocRes.rows[0].table_schema;
            const table = tableLocRes.rows[0].table_name;
            console.log(`\n--- SAMPLE DATA FROM ${schema}.${table} ---`);
            const sampleRes = await client.query(`SELECT id, title, category, selling_price FROM "${schema}"."${table}" LIMIT 3`);
            console.log(sampleRes.rows);
        } else {
            console.log('CRITICAL: "products" table NOT found in ANY schema.');
            // List all tables in public to be sure
            const allTablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            console.log('All public tables:', allTablesRes.rows.map(r => r.table_name));
        }

    } catch (error: any) {
        console.error('Connection Error:', error.message);
    } finally {
        await client.end();
    }
}

run();
