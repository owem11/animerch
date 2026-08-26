import {
    pgTable,
    serial,
    varchar,
    integer,
    numeric,
    timestamp,
    text,
    uuid,
    boolean,
} from "drizzle-orm/pg-core";

// ... existing code ...

export const leads = pgTable("leads", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    fullName: varchar("full_name", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    lastInteraction: timestamp("last_interaction").defaultNow(),
});

export const supportEmails = pgTable("support_emails", {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: varchar("message_id", { length: 255 }).notNull().unique(),
    threadId: varchar("thread_id", { length: 255 }).notNull(),
    direction: varchar("direction", { length: 20 }).notNull(),
    sender: varchar("sender", { length: 255 }).notNull(),
    recipient: varchar("recipient", { length: 255 }).notNull(),
    subject: text("subject"),
    summarizedBody: text("summarized_body"),
    fullBody: text("full_body"),
    status: varchar("status", { length: 50 }).default("automated"),
    guardrailTriggered: boolean("guardrail_triggered").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
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

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
    costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull().default(0),
    category: varchar("category", { length: 100 }),
    anime: varchar("anime", { length: 100 }),
    size: varchar("size", { length: 10 }),
    color: varchar("color", { length: 50 }),
    material: varchar("material", { length: 100 }),
    rating: numeric("rating", { precision: 3, scale: 1 }),
    imageUrl: varchar("image_url", { length: 500 }),
    availableSizes: text("available_sizes"),
    availableColors: text("available_colors"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    status: varchar("status", { length: 50 }).default("pending"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    productId: integer("product_id").references(() => products.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
});
