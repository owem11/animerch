
import { db } from "./src/db";
import { products } from "./src/db/schema";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function checkProducts() {
    try {
        console.log("Connecting to DB...");
        const allProducts = await db.select().from(products);
        console.log(`Found ${allProducts.length} products:`);
        allProducts.forEach(p => {
            console.log(`- [${p.id}] ${p.title} ($${p.sellingPrice}) [img: ${p.imageUrl}]`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Error fetching products:", error);
        process.exit(1);
    }
}

checkProducts();
