import express from 'express'
import dotenv from 'dotenv'
import mongoose from "mongoose";
import dns from "node:dns";
import customerRoutes from './routes/customer.routes.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config()

// Node's DNS resolver on this machine rejects SRV lookups from the default DNS server.
dns.setServers(["8.8.8.8", "1.1.1.1"])

const app = express()
const port = process.env.PORT || 8084

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser());

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)


app.get('/', (req,res) => {
    res.json({
        success:true,
        message:'ShopKart API is running'

    })
})

// Start accepting requests only after the database is ready.
async function startServer() {
    try {
        await mongoose.connect(process.env.DB_URL, { dbName: "shopkart" });
        console.log("DB Connected");
        app.listen(port, () => console.log(`Server started at ${port}`));
    } catch (error) {
        console.error("DB Connection failed:", error.message);
        process.exitCode = 1;
    }
}

startServer();
