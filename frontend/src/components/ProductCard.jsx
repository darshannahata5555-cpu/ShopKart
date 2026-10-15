import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api.js";
import { useCart } from "../context/cartContext.js";
import formatCurrency from "../utils/formatCurrency.js";

function ProductCard({ product, onWishlistRemoved, showRemove = false }) {
    const { addToCart, updatingId } = useCart();
    const [wishlistState, setWishlistState] = useState(showRemove ? "saved" : "idle");
    const [message, setMessage] = useState("");

    async function handleWishlist() {
        setWishlistState("saving");
        setMessage("");
        try {
            if (showRemove) {
                await api.delete(`/wishlist/${product._id}`);
                onWishlistRemoved(product._id);
            } else {
                await api.post(`/wishlist/${product._id}`);
                setWishlistState("saved");
            }
        } catch (error) {
            // A duplicate means the desired result (saved) is already true.
            if (!showRemove && error.response?.status === 409) {
                setWishlistState("saved");
                return;
            }
            setWishlistState(showRemove ? "saved" : "idle");
            setMessage(error.response?.data?.message || "Unable to update wishlist.");
        }
    }

    async function handleCart() {
        const result = await addToCart(product._id);
        setMessage(result.success ? "Added to cart." : result.message);
    }

    return (
        <article className="product-card">
            <Link to={`/products/${product._id}`} className="product-image-wrap">
                <img className="product-image" src={product.image} alt={product.name} />
            </Link>
            <div className="product-card-body">
                <div className="product-meta"><span>{product.category}</span><span>{product.stock > 0 ? `${product.stock} left` : "Out of stock"}</span></div>
                <h2>{product.name}</h2>
                <p className="product-price">{formatCurrency(product.price)}</p>
                <div className="card-actions">
                    <Link className="button button-secondary" to={`/products/${product._id}`}>Details</Link>
                    <button className="button button-primary" onClick={handleCart} disabled={product.stock === 0 || updatingId === product._id}>
                        {updatingId === product._id ? "Adding..." : "Add to cart"}
                    </button>
                </div>
                <button className="wishlist-button" onClick={handleWishlist} disabled={wishlistState === "saving"}>
                    {wishlistState === "saving" ? "Saving..." : showRemove ? "Remove from wishlist" : wishlistState === "saved" ? "♥ Saved" : "♡ Add to wishlist"}
                </button>
                {message && <p className="inline-message">{message}</p>}
            </div>
        </article>
    );
}

export default ProductCard;
