import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PageState from "../components/PageState.jsx";
import api from "../services/api.js";
import formatCurrency from "../utils/formatCurrency.js";

function OrderDetails() {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        async function loadOrder() {
            try {
                const response = await api.get(`/orders/${id}`);
                if (active) setOrder(response.data.order);
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || "Unable to load order.");
            } finally {
                if (active) setLoading(false);
            }
        }
        loadOrder();
        return () => { active = false; };
    }, [id]);

    return (
        <div className="app-shell">
            <Navbar />
            <main className="catalog-content">
                {loading ? <PageState title="Loading order..." />
                    : error ? <PageState title="Order unavailable" message={error} action={<Link className="button button-secondary" to="/orders">Back to orders</Link>} />
                    : <>
                        {location.state?.orderPlaced && <section className="order-success"><span>✓</span><div><p className="eyebrow">Payment verified</p><h1>Order placed successfully</h1><p>Your cart has been cleared and your order is saved.</p></div></section>}
                        <section className="order-details panel-card">
                            <div className="order-details-heading"><div><p className="eyebrow">Order details</p><h2>#{order._id.slice(-8).toUpperCase()}</h2></div><span className={`status-pill ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus} · {order.status}</span></div>
                            <div className="ordered-items">{order.items.map((item) => (
                                <article key={item.product}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>{formatCurrency(item.price)} × {item.quantity}</span></div><b>{formatCurrency(item.price * item.quantity)}</b></article>
                            ))}</div>
                            <div className="order-information">
                                <div><p className="eyebrow">Delivery address</p><strong>{order.shippingAddress.fullName}</strong><p>{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}<br />{order.shippingAddress.phone}</p></div>
                                <div><p className="eyebrow">Payment</p><p>Razorpay Test Mode</p>{order.razorpayPaymentId && <small>Payment ID: {order.razorpayPaymentId}</small>}</div>
                            </div>
                            <div className="order-total"><span>Total paid</span><strong>{formatCurrency(order.totalAmount)}</strong></div>
                            <div className="details-actions"><Link className="button button-secondary" to="/orders">View all orders</Link><Link className="button button-primary" to="/products">Continue shopping</Link></div>
                        </section>
                    </>}
            </main>
        </div>
    );
}

export default OrderDetails;
