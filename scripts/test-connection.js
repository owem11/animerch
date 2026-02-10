const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Force Node.js to prefer IPv4
dns.setDefaultResultOrder('ipv4first');

const connectionUrl = process.env.DATABASE_URL;
console.log('Testing connection with pg (node-postgres)...');
console.log('URL:', connectionUrl?.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
    connectionString: connectionUrl,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000
});

pool.query('SELECT current_database() as db, current_user as "user", version() as version')
    .then(result => {
        console.log('✅ Connected successfully!');
        console.log('Database:', result.rows[0].db);
        console.log('User:', result.rows[0].user);
        console.log('Version:', result.rows[0].version);
        pool.end();
        process.exit(0);
    })
    .catch(e => {
        console.error('❌ Connection failed:', e.message);
        console.error('Error code:', e.code);
        pool.end();
        process.exit(1);
    });
