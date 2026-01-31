import {
    mysqlTable,
    serial,
    varchar,
    int,
    decimal,
    timestamp,
    text,
    bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
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
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stock: int("stock").notNull().default(0),
    category: varchar("category", { length: 100 }),
    anime: varchar("anime", { length: 100 }),
    size: varchar("size", { length: 10 }),
    color: varchar("color", { length: 50 }),
    material: varchar("material", { length: 100 }),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    imageUrl: varchar("image_url", { length: 500 }),
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
