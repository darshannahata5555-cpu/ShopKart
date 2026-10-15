import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PageState from "../components/PageState.jsx";
import { useAuth } from "../context/authContext.js";
import { useCart } from "../context/cartContext.js";
import api from "../services/api.js";
import formatCurrency from "../utils/formatCurrency.js";
import loadRazorpay from "../utils/loadRazorpay.js";

function Checkout() {
    const { user } = useAuth();
    const { cartItems, subtotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: ""
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    }

    function validateForm() {
        if (Object.values(form).some((value) => !value.trim())) return "All shipping fields are required.";
        if (!/^\d{10}$/.test(form.phone.trim())) return "Phone number must contain 10 digits.";
        if (!/^\d{6}$/.test(form.pincode.trim())) return "Pincode must contain 6 digits.";
        return "";
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);
        setError("");

        const scriptLoaded = await loadRazorpay();
        if (!scriptLoaded) {
            setError("Unable to load Razorpay Checkout. Check your internet connection.");
            setSubmitting(false);
            return;
        }

        try {
            // Only the address is sent. The backend rebuilds items and total from the cart.
            const response = await api.post("/orders/create-payment-order", { shippingAddress: form });
            const checkoutData = response.data;

            const paymentObject = new window.Razorpay({
                key: checkoutData.key,
                amount: checkoutData.amount,
                currency: checkoutData.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: checkoutData.razorpayOrderId,
                prefill: { name: form.fullName, contact: form.phone, email: user?.email },
                theme: { color: "#1f6049" },
                modal: {
                    ondismiss: () => setSubmitting(false)
                },
                handler: async (paymentResponse) => {
                    try {
                        const verification = await api.post("/orders/verify-payment", {
                            shopKartOrderId: checkoutData.shopKartOrderId,
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        });
                        clearCart();
                        navigate(`/orders/${verification.data.order._id}`, {
                            replace: true,
                            state: { orderPlaced: true }
                        });
                    } catch (requestError) {
                        setError(requestError.response?.data?.message || "Payment could not be verified. Your cart was not cleared.");
                        setSubmitting(false);
                    }
                }
            });

            paymentObject.on("payment.failed", (paymentResponse) => {
                setError(paymentResponse.error?.description || "Payment failed. Your cart has not been cleared.");
                setSubmitting(false);
            });
            paymentObject.open();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to start checkout.");
            setSubmitting(false);
        }
    }

    if (cartItems.length === 0) {
        return <div className="app-shell"><Navbar /><main className="catalog-content"><PageState title="Your cart is empty" message="Add products before opening checkout." action={<Link className="button button-primary" to="/products">Browse products</Link>} /></main></div>;
    }

    return (
        <div className="app-shell">
            <Navbar />
            <main className="catalog-content">
                <header className="page-heading"><div><p className="eyebrow">Final step</p><h1>Checkout</h1></div><p>Enter the delivery address, review your cart, and complete a Test Mode payment.</p></header>
                <form className="checkout-layout" onSubmit={handleSubmit}>
                    <section className="checkout-form panel-card">
                        <div><p className="eyebrow">Shipping details</p><h2>Where should we deliver?</h2></div>
                        {error && <div className="alert alert-error">{error}</div>}
                        <div className="field-row">
                            <label>Full name<input name="fullName" value={form.fullName} onChange={handleChange} required /></label>
                            <label>Phone number<input name="phone" value={form.phone} onChange={handleChange} inputMode="numeric" maxLength="10" required /></label>
                        </div>
                        <label>Address line<input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="House number and street" required /></label>
                        <div className="field-row">
                            <label>City<input name="city" value={form.city} onChange={handleChange} required /></label>
                            <label>State<input name="state" value={form.state} onChange={handleChange} required /></label>
                        </div>
                        <label>Pincode<input name="pincode" value={form.pincode} onChange={handleChange} inputMode="numeric" maxLength="6" required /></label>
                    </section>

                    <aside className="checkout-summary order-summary">
                        <p className="eyebrow">Order summary</p>
                        <div className="checkout-items">
                            {cartItems.map((item) => <p key={item.product._id}><span>{item.product.name} × {item.quantity}</span><strong>{formatCurrency(item.product.price * item.quantity)}</strong></p>)}
                        </div>
                        <div className="summary-total"><span>Total</span><strong>{formatCurrency(subtotal)}</strong></div>
                        <button className="button button-light button-full" disabled={submitting}>{submitting ? "Opening payment..." : "Pay with Razorpay"}</button>
                        <small>Test Mode only. The backend verifies prices, stock, and payment.</small>
                    </aside>
                </form>
            </main>
        </div>
    );
}

export default Checkout;
