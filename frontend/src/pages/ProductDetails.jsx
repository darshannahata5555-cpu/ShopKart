import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PageState from "../components/PageState.jsx";
import { useCart } from "../context/cartContext.js";
import api from "../services/api.js";
import formatCurrency from "../utils/formatCurrency.js";

function ProductDetails() {
    const { id } = useParams();
    const { addToCart, updatingId } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;
        async function loadProduct() {
            try {
                const response = await api.get(`/products/${id}`);
                if (active) setProduct(response.data.product);
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || "Unable to load product.");
            } finally {
                if (active) setLoading(false);
            }
        }
        loadProduct();
        return () => { active = false; };
    }, [id]);

    async function handleCart() {
        const result = await addToCart(product._id);
        setMessage(result.success ? "Product added to your cart." : result.message);
    }

    async function handleWishlist() {
        try {
            await api.post(`/wishlist/${product._id}`);
            setMessage("Product saved to your wishlist.");
        } catch (requestError) {
            setMessage(requestError.response?.status === 409 ? "This product is already saved." : requestError.response?.data?.message || "Unable to save product.");
        }
    }

    return (
        <div className="app-shell">
            <Navbar />
            <main className="catalog-content">
                {loading ? <PageState title="Loading product..." />
                    : error ? <PageState title="Product unavailable" message={error} action={<Link className="button button-secondary" to="/products">Back to products</Link>} />
                    : <section className="product-details">
                        <div className="details-image-wrap"><img src={product.image} alt={product.name} /></div>
                        <div className="details-copy">
                            <Link className="back-link" to="/products">← Back to products</Link>
                            <p className="eyebrow">{product.category}</p>
                            <h1>{product.name}</h1>
                            <p className="details-description">{product.description}</p>
                            <p className="details-price">{formatCurrency(product.price)}</p>
                            <p className={product.stock ? "stock-note" : "stock-note out"}>{product.stock ? `${product.stock} units available` : "Currently out of stock"}</p>
                            <div className="details-actions">
                                <button className="button button-primary" disabled={!product.stock || updatingId === product._id} onClick={handleCart}>{updatingId === product._id ? "Adding..." : "Add to cart"}</button>
                                <button className="button button-secondary" onClick={handleWishlist}>♡ Add to wishlist</button>
                            </div>
                            {message && <div className="alert alert-success">{message}</div>}
                        </div>
                    </section>}
            </main>
        </div>
    );
}

export default ProductDetails;
