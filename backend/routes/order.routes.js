import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { createPaymentOrder, getOrderById, getOrders, verifyPayment } from "../controllers/order.controller.js";

const orderRoutes = express.Router();

orderRoutes.use(isAuthenticated);
orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", getOrders);
orderRoutes.get("/:id", getOrderById);

export default orderRoutes;
