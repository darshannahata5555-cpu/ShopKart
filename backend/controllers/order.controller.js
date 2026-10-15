import crypto from "node:crypto";
import mongoose from "mongoose";
import { getRazorpayClient } from "../config/razorpay.js";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";

const requiredAddressFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

function validateShippingAddress(address = {}) {
    const missingField = requiredAddressFields.find(
        (field) => typeof address[field] !== "string" || !address[field].trim()
    );

    if (missingField) return "All shipping fields are required";
    if (!/^\d{10}$/.test(address.phone.trim())) return "Phone number must contain 10 digits";
    if (!/^\d{6}$/.test(address.pincode.trim())) return "Pincode must contain 6 digits";
    return "";
}

export const createPaymentOrder = async (req, res) => {
    try {
        const addressError = validateShippingAddress(req.body.shippingAddress);
        if (addressError) return res.status(400).json({ success: false, message: addressError });

        const customer = await Customer.findById(req.user._id).populate("cart.product");

        if (!customer.cart.length) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        const items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = cartItem.product;
            if (!product) {
                return res.status(400).json({ success: false, message: "A product in your cart no longer exists" });
            }
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });
            totalAmount += product.price * cartItem.quantity;
        }

        // Check configuration only after normal cart validation so an empty cart
        // still receives the required 400 response.
        const razorpay = getRazorpayClient();

        // Persist the pending ShopKart order before calling the payment provider.
        // Its id becomes the trusted receipt that links both systems.
        const shopKartOrder = await Order.create({
            customer: customer._id,
            items,
            shippingAddress: req.body.shippingAddress,
            totalAmount
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: shopKartOrder._id.toString()
        });

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        const configurationError = error.message === "Razorpay Test Mode keys are not configured";
        return res.status(configurationError ? 503 : 500).json({
            success: false,
            message: configurationError ? error.message : "Unable to start checkout. Please try again."
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification details are incomplete" });
        }
        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        const order = await Order.findOne({ _id: shopKartOrderId, customer: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Repeated verification is safe and does not reduce stock twice.
        if (order.paymentStatus === "PAID") return res.json({ success: true, order });
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Payment order does not match" });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ success: false, message: "Razorpay Test Mode keys are not configured" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "utf8");
        const receivedBuffer = Buffer.from(razorpay_signature, "utf8");
        const validSignature = expectedBuffer.length === receivedBuffer.length
            && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

        if (!validSignature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // A transaction ensures the paid order and cleared cart are committed together.
        const session = await mongoose.startSession();
        let confirmedOrder;
        try {
            await session.withTransaction(async () => {
                const freshOrder = await Order.findOne({ _id: order._id, customer: req.user._id }).session(session);
                if (freshOrder.paymentStatus === "PAID") {
                    confirmedOrder = freshOrder;
                    return;
                }

                freshOrder.paymentStatus = "PAID";
                freshOrder.status = "PLACED";
                freshOrder.razorpayPaymentId = razorpay_payment_id;
                await freshOrder.save({ session });
                await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } }, { session });
                confirmedOrder = freshOrder;
            });
        } finally {
            await session.endSession();
        }

        return res.json({ success: true, message: "Payment verified and order placed", order: confirmedOrder });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to verify payment" });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        return res.json({ success: true, orders });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load orders" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        // Including customer in the query prevents access to another user's order.
        const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        return res.json({ success: true, order });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to load order" });
    }
};
