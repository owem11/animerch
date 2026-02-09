import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import path from "path";
import dns from "dns";

// Force IPv4 for Supabase connectivity
dns.setDefaultResultOrder('ipv4first');

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString, {
    ssl: { rejectUnauthorized: false }
});

export const db = drizzle(client, { schema });
