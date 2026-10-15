import mongoose from "mongoose";
import Product from "../models/product.model.js";

// User input is escaped before using it in a regular expression.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ success: false, message: "All product fields are required" });
        }

        if (Number(price) <= 0 || Number(stock) < 0) {
            return res.status(400).json({ success: false, message: "Price and stock values are invalid" });
        }

        const product = await Product.create({ name, description, price, category, image, stock });
        return res.status(201).json({ success: true, product });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Unable to create product" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search = "", category = "", sort = "" } = req.query;
        const filter = {};

        // Build one query from whichever filters the client supplied.
        if (search.trim()) {
            filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
        }
        if (category.trim()) {
            filter.category = category.trim();
        }

        let query = Product.find(filter).sort({ createdAt: -1 });
        if (sort === "price_asc") query = query.sort({ price: 1 });
        if (sort === "price_desc") query = query.sort({ price: -1 });

        const products = await query;
        return res.json({ success: true, count: products.length, products });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load products" });
    }
};

export const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, product });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load product" });
    }
};
