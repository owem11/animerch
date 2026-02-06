import {
    mysqlTable,
    serial,
    varchar,
    int,
    decimal,
    timestamp,
    text,
    bigint,
    json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    imageUrl: varchar("image_url", { length: 500 }),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    role: varchar("role", { length: 50 }).default("user"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const products = mysqlTable("products", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
    stock: int("stock").notNull().default(0),
    category: varchar("category", { length: 100 }),
    anime: varchar("anime", { length: 100 }),
    size: varchar("size", { length: 10 }),
    color: varchar("color", { length: 50 }),
    material: varchar("material", { length: 100 }),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    imageUrl: varchar("image_url", { length: 500 }),
    availableSizes: text("available_sizes"),
    availableColors: text("available_colors"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = mysqlTable("cart_items", {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
    productId: bigint("product_id", { mode: "number", unsigned: true }).references(() => products.id),
    quantity: int("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow(),
});

export const orders = mysqlTable("orders", {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
    status: varchar("status", { length: 50 }).default("pending"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = mysqlTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id),
    productId: bigint("product_id", { mode: "number", unsigned: true }).references(() => products.id),
    quantity: int("quantity").notNull().default(1),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price at the time of purchase
});

export const reviews = mysqlTable("reviews", {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id),
    productId: bigint("product_id", { mode: "number", unsigned: true }).references(() => products.id),
    rating: int("rating").notNull(), // 1-5
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
});
