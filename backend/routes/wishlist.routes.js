import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";

const wishlistRoutes = express.Router();

// Every wishlist belongs to the authenticated customer, so every route is protected.
wishlistRoutes.use(isAuthenticated);
wishlistRoutes.get("/", getWishlist);
wishlistRoutes.post("/:productId", addToWishlist);
wishlistRoutes.delete("/:productId", removeFromWishlist);

export default wishlistRoutes;
