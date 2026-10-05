import express from 'express'
import {
    registerCustomer,
    loginCustomer,
    getMe,
    logoutCustomer
} from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router()

customerRoutes.post("/login", loginCustomer);
customerRoutes.post('/register', registerCustomer)
customerRoutes.get("/me", isAuthenticated, getMe);
customerRoutes.post("/logout",isAuthenticated,logoutCustomer);

export default customerRoutes