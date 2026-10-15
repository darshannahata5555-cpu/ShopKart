import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "node:dns";
import Product from "./models/product.model.js";

dotenv.config();

// Match index.js because this computer's default DNS rejects MongoDB SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const sampleProducts = [
    { name: "Wireless Headphones", description: "Comfortable over-ear headphones with clear sound and long battery life.", price: 4999, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", stock: 12 },
    { name: "Mechanical Keyboard", description: "Compact mechanical keyboard with tactile switches and a durable frame.", price: 2999, category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", stock: 10 },
    { name: "Classic Backpack", description: "A practical everyday backpack with a padded laptop compartment.", price: 1899, category: "Fashion", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", stock: 18 },
    { name: "Everyday Sneakers", description: "Lightweight sneakers designed for comfortable all-day wear.", price: 2499, category: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", stock: 8 },
    { name: "The Creative Habit", description: "A thoughtful guide to building repeatable habits for creative work.", price: 599, category: "Books", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80", stock: 25 },
    { name: "Modern Web Development", description: "An approachable introduction to building modern web applications.", price: 799, category: "Books", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80", stock: 20 },
    { name: "Ceramic Table Lamp", description: "A warm bedside lamp with a simple ceramic base and fabric shade.", price: 1599, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", stock: 7 },
    { name: "Indoor Plant Pot", description: "Minimal ceramic planter suitable for desks, shelves, and windowsills.", price: 899, category: "Home", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80", stock: 15 }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.DB_URL, { dbName: "shopkart" });
        const existingCount = await Product.countDocuments();

        // Never delete existing work. Add samples only when the collection is empty.
        if (existingCount > 0) {
            console.log(`Products already exist (${existingCount}). Nothing was changed.`);
            return;
        }

        await Product.insertMany(sampleProducts);
        console.log(`Added ${sampleProducts.length} sample products.`);
    } catch (error) {
        console.error("Unable to seed products:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();
