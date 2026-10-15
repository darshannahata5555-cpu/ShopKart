import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const loadPopulatedCart = (customerId) => Customer.findById(customerId).populate("cart.product");

export const getCart = async (req, res) => {
    try {
        const customer = await loadPopulatedCart(req.user._id);
        return res.json({ success: true, cart: customer.cart });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load cart" });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        if (product.stock < 1) return res.status(400).json({ success: false, message: "Product is out of stock" });

        const customer = await Customer.findById(req.user._id);
        const item = customer.cart.find((entry) => entry.product.equals(productId));

        if (item) {
            if (item.quantity + 1 > product.stock) {
                return res.status(400).json({ success: false, message: "Cannot add more than available stock" });
            }
            item.quantity += 1;
        } else {
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();
        const updatedCustomer = await loadPopulatedCart(customer._id);
        return res.status(201).json({ success: true, message: "Cart updated", cart: updatedCustomer.cart });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to update cart" });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const quantity = Number(req.body.quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be a whole number of at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: "Quantity exceeds available stock" });
        }

        const customer = await Customer.findById(req.user._id);
        const item = customer.cart.find((entry) => entry.product.equals(productId));
        if (!item) return res.status(404).json({ success: false, message: "Product is not in your cart" });

        item.quantity = quantity;
        await customer.save();
        const updatedCustomer = await loadPopulatedCart(customer._id);
        return res.json({ success: true, cart: updatedCustomer.cart });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to update quantity" });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        const itemExists = customer.cart.some((entry) => entry.product.equals(productId));
        if (!itemExists) return res.status(404).json({ success: false, message: "Product is not in your cart" });

        customer.cart = customer.cart.filter((entry) => !entry.product.equals(productId));
        await customer.save();
        const updatedCustomer = await loadPopulatedCart(customer._id);
        return res.json({ success: true, cart: updatedCustomer.cart });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to remove product" });
    }
};
