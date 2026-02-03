
import { db } from "../src/db";
import { products } from "../src/db/schema";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function updatePrices() {
    console.log("Updating product prices...");
    try {
        // Increase all prices by 200
        const result = await db.update(products)
            .set({
                sellingPrice: sql`${products.sellingPrice} + 200`
            });

        console.log("Prices updated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating prices:", error);
        process.exit(1);
    }
}

updatePrices();
