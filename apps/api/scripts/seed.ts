
import { db } from "../src/db";
import { products } from "../src/db/schema";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const sampleProducts = [
    {
        title: "Naruto Uzumaki Sage Mode Tee",
        description: "Premium cotton t-shirt featuring Naruto in Sage Mode. Minimalist black and white design.",
        price: "29.99",
        category: "Apparel",
        anime: "Naruto",
        size: "L",
        color: "Black",
        material: "100% Cotton",
        rating: "4.8",
        imageUrl: "https://placehold.co/600x600/1a1a1a/ffffff?text=Naruto+Sage+Tee",
        stock: 50,
    },
    {
        title: "Luffy Gear 5 Hoodie",
        description: "Oversized hoodie with embroidered Gear 5 motif. Ultra-soft interior.",
        price: "59.99",
        category: "Apparel",
        anime: "One Piece",
        size: "XL",
        color: "White",
        material: "Fleece Blend",
        rating: "4.9",
        imageUrl: "https://placehold.co/600x600/ffffff/000000?text=Gear+5+Hoodie",
        stock: 30,
    },
    {
        title: "Tanjiro Hanafuda Earrings",
        description: "High-quality replica of Tanjiro's earrings. Hypoallergenic materials.",
        price: "15.99",
        category: "Accessories",
        anime: "Demon Slayer",
        size: "One Size",
        color: "Multi",
        material: "Acrylic/Silver",
        rating: "4.7",
        imageUrl: "https://placehold.co/600x600/e6e6e6/1a1a1a?text=Hanafuda+Earrings",
        stock: 100,
    },
    {
        title: "Gojo Satoru Domain Expansion Figure",
        description: "Detaled PVC figure of Gojo Satoru using Unlimited Void. 1/7 Scale.",
        price: "129.99",
        category: "Figures",
        anime: "Jujutsu Kaisen",
        size: "25cm",
        color: "N/A",
        material: "PVC",
        rating: "5.0",
        imageUrl: "https://placehold.co/600x600/1a1a1a/ffffff?text=Gojo+Figure",
        stock: 10,
    },
    {
        title: "Attack on Titan Scout Regiment Cloak",
        description: "Official replica cloak with embroidered Wings of Freedom.",
        price: "45.00",
        category: "Apparel",
        anime: "Attack on Titan",
        size: "M",
        color: "Green",
        material: "Polyester",
        rating: "4.6",
        imageUrl: "https://placehold.co/600x600/333333/ffffff?text=Scout+Cloak",
        stock: 25,
    },
    {
        title: "Pochita Plushie",
        description: "Life-sized squishy Pochita plush from Chainsaw Man.",
        price: "35.00",
        category: "Toys",
        anime: "Chainsaw Man",
        size: "30cm",
        color: "Orange",
        material: "Plush",
        rating: "4.9",
        imageUrl: "https://placehold.co/600x600/ff9900/000000?text=Pochita",
        stock: 40,
    },
    {
        title: "Berserk Brand of Sacrifice Ring",
        description: "Sterling silver ring featuring the Brand of Sacrifice.",
        price: "89.99",
        category: "Accessories",
        anime: "Berserk",
        size: "9",
        color: "Silver",
        material: "Silver",
        rating: "5.0",
        imageUrl: "https://placehold.co/600x600/000000/cc0000?text=Brand+Ring",
        stock: 15,
    },
    {
        title: "Eva Unit 01 Graphic Tee",
        description: "Vintage washed tee with Neon Genesis Evangelion Unit 01 print.",
        price: "32.50",
        category: "Apparel",
        anime: "Evangelion",
        size: "L",
        color: "Charcoal",
        material: "Cotton",
        rating: "4.7",
        imageUrl: "https://placehold.co/600x600/333333/9933cc?text=Eva+01+Tee",
        stock: 60,
    },
];

async function seed() {
    console.log("Seeding products...");
    try {
        await db.insert(products).values(sampleProducts);
        console.log("Seeding complete!");
    } catch (error) {
        console.error("Seeding failed:", error);
    }
    process.exit(0);
}

seed();
