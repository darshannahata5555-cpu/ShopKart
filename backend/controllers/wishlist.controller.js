import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const customer = await Customer.findById(req.user._id);
        const alreadySaved = customer.wishlist.some((id) => id.equals(productId));
        if (alreadySaved) {
            return res.status(409).json({ success: false, message: "Product is already in your wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();
        return res.status(201).json({ success: true, message: "Product added to wishlist" });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to update wishlist" });
    }
};

export const getWishlist = async (req, res) => {
    try {
        // populate replaces stored Product IDs with the matching Product documents.
        const customer = await Customer.findById(req.user._id).populate("wishlist");
        return res.json({ success: true, count: customer.wishlist.length, wishlist: customer.wishlist });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load wishlist" });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        const saved = customer.wishlist.some((id) => id.equals(productId));
        if (!saved) return res.status(404).json({ success: false, message: "Product is not in your wishlist" });

        customer.wishlist = customer.wishlist.filter((id) => !id.equals(productId));
        await customer.save();
        return res.json({ success: true, message: "Product removed from wishlist" });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to update wishlist" });
    }
};
