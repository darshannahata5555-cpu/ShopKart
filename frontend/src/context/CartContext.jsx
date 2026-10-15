import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "./authContext.js";
import { CartContext } from "./cartContext.js";

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

    const refreshCart = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await api.get("/cart");
            setCartItems(response.data.cart);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        let active = true;

        async function loadInitialCart() {
            // Waiting one microtask keeps all effect updates asynchronous.
            await Promise.resolve();
            if (!active) return;

            if (!user) {
                setCartItems([]);
                return;
            }

            setLoading(true);
            setError("");
            try {
                const response = await api.get("/cart");
                if (active) setCartItems(response.data.cart);
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || "Unable to load your cart.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadInitialCart();
        return () => { active = false; };
    }, [user]);

    async function runCartMutation(productId, request) {
        setUpdatingId(productId);
        setError("");
        try {
            const response = await request();
            setCartItems(response.data.cart);
            return { success: true };
        } catch (requestError) {
            const message = requestError.response?.data?.message || "Unable to update your cart.";
            setError(message);
            return { success: false, message };
        } finally {
            setUpdatingId("");
        }
    }

    const addToCart = (productId) => runCartMutation(productId, () => api.post(`/cart/${productId}`));
    const updateQuantity = (productId, quantity) => runCartMutation(
        productId,
        () => api.patch(`/cart/${productId}`, { quantity })
    );
    const removeFromCart = (productId) => runCartMutation(productId, () => api.delete(`/cart/${productId}`));
    const clearCart = () => setCartItems([]);

    // Counts and totals are derived from cart items instead of stored separately.
    const totalItems = useMemo(
        () => cartItems.reduce((total, item) => total + item.quantity, 0),
        [cartItems]
    );
    const subtotal = useMemo(
        () => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
        [cartItems]
    );

    const value = {
        cartItems,
        loading,
        error,
        updatingId,
        totalItems,
        subtotal,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
