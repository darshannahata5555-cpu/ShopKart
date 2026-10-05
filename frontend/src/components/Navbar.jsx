import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.js";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login", { replace: true });
    }

    return (
        <nav className="navbar">
            <a className="brand" href="/home"><span className="brand-mark">S</span><span>ShopKart</span></a>
            <div className="nav-actions">
                <span className="nav-user">{user?.fullName}</span>
                <button className="button button-secondary" onClick={handleLogout}>Log out</button>
            </div>
        </nav>
    );
}

export default Navbar;
