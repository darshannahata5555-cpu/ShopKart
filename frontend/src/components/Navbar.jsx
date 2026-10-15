import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.js";
import { useCart } from "../context/cartContext.js";

function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login", { replace: true });
    }

    return (
        <nav className="navbar">
            <Link className="brand" to="/home"><span className="brand-mark">S</span><span>ShopKart</span></Link>
            <div className="nav-links">
                <NavLink to="/products">Products</NavLink>
                <NavLink to="/wishlist">Wishlist</NavLink>
                <NavLink to="/cart">Cart <span className="cart-count">{totalItems}</span></NavLink>
                <NavLink to="/orders">Orders</NavLink>
            </div>
            <div className="nav-actions">
                <span className="nav-user">{user?.fullName}</span>
                <button className="button button-secondary" onClick={handleLogout}>Log out</button>
            </div>
        </nav>
    );
}

export default Navbar;
