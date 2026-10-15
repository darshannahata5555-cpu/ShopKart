import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PageState from "../components/PageState.jsx";
import ProductCard from "../components/ProductCard.jsx";
import api from "../services/api.js";

function Wishlist() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadWishlist() {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/wishlist");
            setProducts(response.data.wishlist);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load your wishlist.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let active = true;

        async function loadInitialWishlist() {
            try {
                const response = await api.get("/wishlist");
                if (active) setProducts(response.data.wishlist);
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || "Unable to load your wishlist.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadInitialWishlist();
        return () => { active = false; };
    }, []);

    function handleRemoved(productId) {
        // Update local UI immediately after the backend confirms removal.
        setProducts((current) => current.filter((product) => product._id !== productId));
    }

    return (
        <div className="app-shell">
            <Navbar />
            <main className="catalog-content">
                <header className="page-heading">
                    <div><p className="eyebrow">Saved for later</p><h1>My wishlist</h1></div>
                    <p>{products.length} {products.length === 1 ? "product" : "products"} saved</p>
                </header>

                {loading ? <PageState title="Loading your wishlist..." />
                    : error ? <PageState title="Unable to load wishlist" message={error} action={<button className="button button-secondary" onClick={loadWishlist}>Try again</button>} />
                    : products.length === 0 ? <PageState title="Your wishlist is empty" message="Start saving products you love." action={<Link className="button button-primary" to="/products">Browse products</Link>} />
                    : <section className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} showRemove onWishlistRemoved={handleRemoved} />)}</section>}
            </main>
        </div>
    );
}

export default Wishlist;
