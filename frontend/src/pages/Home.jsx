import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/authContext.js";
import { Link } from "react-router-dom";

function Home() {
    const { user } = useAuth();
    const firstName = user.fullName.split(" ")[0];

    return (
        <div className="app-shell">
            <Navbar />
            <main className="home-content">
                <section className="welcome-card">
                    <div>
                        <p className="eyebrow">Your ShopKart account</p>
                        <h1>Welcome, {firstName}.</h1>
                        <p>Your account is ready. Browse the product catalogue, save favourites, or manage your cart.</p>
                        <Link className="button button-light home-cta" to="/products">Browse products</Link>
                    </div>
                    <div className="success-badge"><span>✓</span>Authenticated</div>
                </section>

                <section className="profile-section">
                    <div className="section-heading">
                        <div><p className="eyebrow">Profile</p><h2>Your details</h2></div>
                        <span className="secure-note">Protected by HttpOnly cookie</span>
                    </div>
                    <div className="profile-grid">
                        <article className="profile-item"><span>Full name</span><strong>{user.fullName}</strong></article>
                        <article className="profile-item"><span>Email address</span><strong>{user.email}</strong></article>
                        <article className="profile-item"><span>Phone number</span><strong>{user.phone}</strong></article>
                        <article className="profile-item"><span>Customer ID</span><strong className="customer-id">{user._id}</strong></article>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
