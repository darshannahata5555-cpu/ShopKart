import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PageState from "../components/PageState.jsx";
import api from "../services/api.js";
import formatCurrency from "../utils/formatCurrency.js";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        async function loadOrders() {
            try {
                const response = await api.get("/orders");
                if (active) setOrders(response.data.orders);
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || "Unable to load orders.");
            } finally {
                if (active) setLoading(false);
            }
        }
        loadOrders();
        return () => { active = false; };
    }, []);

    return (
        <div className="app-shell">
            <Navbar />
            <main className="catalog-content">
                <header className="page-heading"><div><p className="eyebrow">Purchase history</p><h1>My orders</h1></div><p>Orders keep a snapshot of product names and prices from the time of purchase.</p></header>
                {loading ? <PageState title="Loading your orders..." />
                    : error ? <PageState title="Unable to load orders" message={error} />
                    : orders.length === 0 ? <PageState title="You have not placed any orders yet" action={<Link className="button button-primary" to="/products">Start shopping</Link>} />
                    : <section className="orders-list">{orders.map((order) => (
                        <article className="order-card" key={order._id}>
                            <div><span>Order #{order._id.slice(-8).toUpperCase()}</span><strong>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</strong></div>
                            <div className="order-card-items">{order.items.map((item) => <p key={item.product}>{item.name} × {item.quantity}</p>)}</div>
                            <div><span className={`status-pill ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span><strong>{formatCurrency(order.totalAmount)}</strong></div>
                            <Link className="button button-secondary" to={`/orders/${order._id}`}>View details</Link>
                        </article>
                    ))}</section>}
            </main>
        </div>
    );
}

export default Orders;
