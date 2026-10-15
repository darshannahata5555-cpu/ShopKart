import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import PageState from "../components/PageState.jsx";
import ProductCard from "../components/ProductCard.jsx";
import api from "../services/api.js";

const categories = ["", "Electronics", "Fashion", "Books", "Home"];

function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        // A short delay avoids sending an API request after every single keystroke.
        const timer = setTimeout(async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get("/products", { params: { search, category, sort } });
                if (active) setProducts(response.data.products);
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || "Unable to load products.");
            } finally {
                if (active) setLoading(false);
            }
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [search, category, sort]);

    return (
        <div className="app-shell">
            <Navbar />
            <main className="catalog-content">
                <header className="page-heading">
                    <div><p className="eyebrow">ShopKart collection</p><h1>Find something useful.</h1></div>
                    <p>Browse products stored in MongoDB. Search and filters are handled by the backend.</p>
                </header>

                <section className="catalog-controls">
                    <input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." />
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                        {categories.map((item) => <option key={item || "all"} value={item}>{item || "All categories"}</option>)}
                    </select>
                    <select value={sort} onChange={(event) => setSort(event.target.value)}>
                        <option value="">Newest first</option>
                        <option value="price_asc">Price: low to high</option>
                        <option value="price_desc">Price: high to low</option>
                    </select>
                </section>

                {loading ? <PageState title="Loading products..." />
                    : error ? <PageState title="Something went wrong" message={error} />
                    : products.length === 0 ? <PageState title="No products found" message="Try changing your search or category." />
                    : <section className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</section>}
            </main>
        </div>
    );
}

export default Products;
