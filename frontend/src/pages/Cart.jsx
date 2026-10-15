import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import PageState from "../components/PageState.jsx";
import { useCart } from "../context/cartContext.js";
import formatCurrency from "../utils/formatCurrency.js";

function Cart() {
    const { cartItems, loading, error, updatingId, totalItems, subtotal, refreshCart, updateQuantity, removeFromCart } = useCart();

    if (loading) {
        return <div className="app-shell"><Navbar /><main className="catalog-content"><PageState title="Loading your cart..." /></main></div>;
    }

    return (
        <div className="app-shell">
            <Navbar />
            <main className="catalog-content">
                <header className="page-heading">
                    <div><p className="eyebrow">Ready when you are</p><h1>My cart</h1></div>
                    <p>{totalItems} {totalItems === 1 ? "item" : "items"}</p>
                </header>

                {error && <div className="alert alert-error cart-alert">{error} <button onClick={refreshCart}>Try again</button></div>}

                {cartItems.length === 0 ? <PageState title="Your cart is empty" message="Looks like you haven't added anything yet." action={<Link className="button button-primary" to="/products">Browse products</Link>} />
                    : <div className="cart-layout">
                        <section className="cart-list">
                            {cartItems.map((item) => (
                                <article className="cart-item" key={item.product._id}>
                                    <img src={item.product.image} alt={item.product.name} />
                                    <div className="cart-item-copy">
                                        <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                                        <span>{formatCurrency(item.product.price)} each</span>
                                        <div className="quantity-control">
                                            <button aria-label="Decrease quantity" disabled={item.quantity === 1 || updatingId === item.product._id} onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>−</button>
                                            <strong>{item.quantity}</strong>
                                            <button aria-label="Increase quantity" disabled={item.quantity >= item.product.stock || updatingId === item.product._id} onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                                        </div>
                                        <button className="remove-button" disabled={updatingId === item.product._id} onClick={() => removeFromCart(item.product._id)}>Remove</button>
                                    </div>
                                    <strong className="line-total">{formatCurrency(item.product.price * item.quantity)}</strong>
                                </article>
                            ))}
                        </section>
                        <aside className="order-summary">
                            <p className="eyebrow">Order summary</p>
                            <div><span>Total units</span><strong>{totalItems}</strong></div>
                            <div className="summary-total"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
                            <p>Shipping details and secure Test Mode payment are completed at checkout.</p>
                            <Link className="button button-light button-full checkout-link" to="/checkout">Proceed to checkout</Link>
                        </aside>
                    </div>}
            </main>
        </div>
    );
}

export default Cart;
