import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function run() {
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
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log(tables);

        for (const table of tables) {
            console.log(`\n--- COLUMNS FOR ${table} ---`);
            const columnsRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(columnsRes.rows.map(r => `${r.column_name} (${r.data_type})`));

            try {
                const countRes = await client.query(`SELECT count(*) FROM "${table}"`);
                console.log(`Row count: ${countRes.rows[0].count}`);

                if (table === 'products') {
                    console.log(`\n--- SAMPLE PRODUCTS ---`);
                    const sampleRes = await client.query(`SELECT id, title, category, selling_price FROM products LIMIT 3`);
                    console.log(sampleRes.rows);
                }
            } catch (e) {
                console.log(`Could not get row count for ${table}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

run();
