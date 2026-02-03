// Script to generate images for products without images
// Uses Pollinations.ai free API with proper redirect handling

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { products } from "./src/db/schema";
import { eq, isNull, or, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

async function downloadImage(url: string, filepath: string, retries = 0): Promise<boolean> {
    return new Promise((resolve) => {
        const protocol = url.startsWith("https") ? https : http;

        const request = protocol.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        }, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
                const redirectUrl = response.headers.location;
                if (redirectUrl) {
                    console.log(`  Following redirect to: ${redirectUrl.substring(0, 80)}...`);
                    downloadImage(redirectUrl, filepath, retries).then(resolve);
                    return;
                }
            }

            // Check for errors
            if (response.statusCode !== 200) {
                console.error(`  HTTP Error: ${response.statusCode}`);
                if (retries < MAX_RETRIES) {
                    console.log(`  Retrying in ${RETRY_DELAY / 1000}s... (attempt ${retries + 1}/${MAX_RETRIES})`);
                    setTimeout(() => {
                        downloadImage(url, filepath, retries + 1).then(resolve);
                    }, RETRY_DELAY);
                    return;
                }
                resolve(false);
                return;
            }

            // Check content type
            const contentType = response.headers["content-type"] || "";
            if (!contentType.includes("image")) {
                console.error(`  Invalid content type: ${contentType}`);
                if (retries < MAX_RETRIES) {
                    console.log(`  Retrying in ${RETRY_DELAY / 1000}s...`);
                    setTimeout(() => {
                        downloadImage(url, filepath, retries + 1).then(resolve);
                    }, RETRY_DELAY);
                    return;
                }
                resolve(false);
                return;
            }

            // Download the image
            const chunks: Buffer[] = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("end", () => {
                const buffer = Buffer.concat(chunks);
                if (buffer.length < 1000) {
                    console.error(`  Downloaded file too small: ${buffer.length} bytes`);
                    if (retries < MAX_RETRIES) {
                        console.log(`  Retrying in ${RETRY_DELAY / 1000}s...`);
                        setTimeout(() => {
                            downloadImage(url, filepath, retries + 1).then(resolve);
                        }, RETRY_DELAY);
                        return;
                    }
                    resolve(false);
                    return;
                }
                fs.writeFileSync(filepath, buffer);
                console.log(`  Success! Saved ${buffer.length} bytes`);
                resolve(true);
            });
        });

        request.on("error", (err) => {
            console.error(`  Request error: ${err.message}`);
            if (retries < MAX_RETRIES) {
                console.log(`  Retrying in ${RETRY_DELAY / 1000}s...`);
                setTimeout(() => {
                    downloadImage(url, filepath, retries + 1).then(resolve);
                }, RETRY_DELAY);
                return;
            }
            resolve(false);
        });

        request.setTimeout(30000, () => {
            request.destroy();
            console.error(`  Request timeout`);
            if (retries < MAX_RETRIES) {
                console.log(`  Retrying...`);
                downloadImage(url, filepath, retries + 1).then(resolve);
                return;
            }
            resolve(false);
        });
    });
}

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "animerch",
    });

    const db = drizzle(connection);

    // Get products with null imageUrl OR with tiny broken images (need to check file size)
    const allProducts = await db.select().from(products);

    const productsDir = path.resolve(__dirname, "../web/public/products");
    if (!fs.existsSync(productsDir)) {
        fs.mkdirSync(productsDir, { recursive: true });
    }

    // Filter products that need images
    const productsNeedingImages = allProducts.filter(p => {
        if (!p.imageUrl) return true;

        // Check if image file exists and is > 1KB
        const imagePath = path.join(productsDir, path.basename(p.imageUrl));
        if (fs.existsSync(imagePath)) {
            const stats = fs.statSync(imagePath);
            if (stats.size < 1000) {
                console.log(`Product ${p.id} (${p.title}) has broken image (${stats.size} bytes)`);
                return true;
            }
            return false;
        }
        return true;
    });

    console.log(`Found ${productsNeedingImages.length} products needing images`);

    let successCount = 0;
    let failCount = 0;

    for (const product of productsNeedingImages) {
        console.log(`\n[${successCount + failCount + 1}/${productsNeedingImages.length}] ${product.title} (ID: ${product.id})`);

        // Create prompt for Pollinations.ai
        const prompt = encodeURIComponent(
            `anime merchandise t-shirt flat lay product photo, ${product.title}, ${product.anime} anime, ${product.description || ""}, professional product photography, clean white background, high quality, centered`
        );

        const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=800&nologo=true&seed=${Date.now()}`;
        const timestamp = Date.now();
        const sanitizedTitle = product.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        const filename = `${sanitizedTitle}-${timestamp}.jpg`;
        const filepath = path.join(productsDir, filename);

        console.log(`  Downloading from Pollinations...`);
        const success = await downloadImage(imageUrl, filepath);

        if (success) {
            // Update database
            await db.update(products)
                .set({ imageUrl: `/products/${filename}` })
                .where(eq(products.id, product.id));
            console.log(`  Database updated`);
            successCount++;
        } else {
            console.error(`  FAILED to generate image`);
            failCount++;
        }

        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await connection.end();
    console.log(`\n=============================`);
    console.log(`Done! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
