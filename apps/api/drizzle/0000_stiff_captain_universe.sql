CREATE TABLE `cart_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`product_id` bigint unsigned,
	`quantity` int NOT NULL DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned,
	`product_id` bigint unsigned,
	`quantity` int NOT NULL DEFAULT 1,
	`price` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`status` varchar(50) DEFAULT 'pending',
	`total` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`selling_price` decimal(10,2) NOT NULL,
	`cost_price` decimal(10,2),
	`stock` int NOT NULL DEFAULT 0,
	`category` varchar(100),
	`anime` varchar(100),
	`size` varchar(10),
	`color` varchar(50),
	`material` varchar(100),
	`rating` decimal(3,1),
	`image_url` varchar(500),
	`available_sizes` text,
	`available_colors` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`product_id` bigint unsigned,
	`rating` int NOT NULL,
	`comment` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(255),
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`google_id` varchar(255),
	`image_url` varchar(500),
	`address` text,
	`phone` varchar(20),
	`role` varchar(50) DEFAULT 'user',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_google_id_unique` UNIQUE(`google_id`)
);
--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;