import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "./apps/api/src/db/schema";
import { eq, like, or } from "drizzle-orm";

dotenv.config({ path: path.join(__dirname, ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const databaseUrl = process.env.DATABASE_URL || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const client = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });
const db = drizzle(client);

// Paths to check for local files
const productDir = path.resolve(__dirname, "apps/web/public/products");
const uploadsDir = path.resolve(__dirname, "apps/api/public/uploads");

async function migrateImages() {
    console.log("Starting product image migration to Supabase...");

    // Find all products
    const allProducts = await db.select().from(products);
    console.log(`Checking ${allProducts.length} products...`);

    const bucketName = "products";

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucketName)) {
        await supabase.storage.createBucket(bucketName, { public: true });
        console.log(`Created bucket: ${bucketName}`);
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of allProducts) {
        try {
            if (!product.imageUrl) {
                skippedCount++;
                continue;
            }

            // Skip if already a Supabase URL or external URL
            if (product.imageUrl.includes("supabase.co") || product.imageUrl.startsWith("http") && !product.imageUrl.includes("localhost")) {
                skippedCount++;
                continue;
            }

            console.log(`Found local image for: ${product.title} -> ${product.imageUrl}`);

            let filePath = "";
            let fileName = "";

            if (product.imageUrl.startsWith("/products/")) {
                fileName = product.imageUrl.replace("/products/", "");
                filePath = path.join(productDir, fileName);
            } else if (product.imageUrl.startsWith("/uploads/")) {
                fileName = product.imageUrl.replace("/uploads/", "");
                filePath = path.join(uploadsDir, fileName);
            } else if (product.imageUrl.includes("localhost:4001/uploads/")) {
                fileName = product.imageUrl.split("/uploads/")[1];
                filePath = path.join(uploadsDir, fileName);
            }

            if (!filePath || !fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath} for product ${product.title}`);
                skippedCount++;
                continue;
            }

            console.log(`Uploading ${filePath}...`);
            const buffer = fs.readFileSync(filePath);
            const supabaseFileName = `${product.id}-${path.basename(filePath)}`;

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(supabaseFileName, buffer, {
                    contentType: "image/jpeg", // or use mime-types lib if available, but jpeg/png is safe mostly
                    upsert: true
                });

            if (error) {
                console.error(`Upload failed for ${product.title}:`, error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(supabaseFileName);

            // Update DB
            await db.update(products)
                .set({ imageUrl: publicUrl })
                .where(eq(products.id, product.id));

            console.log(`Successfully migrated ${product.title} to ${publicUrl}`);
            migratedCount++;
        } catch (err) {
            console.error(`Error migrating ${product.title}:`, err);
        }
    }

    console.log(`Migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    process.exit(0);
}

migrateImages();
