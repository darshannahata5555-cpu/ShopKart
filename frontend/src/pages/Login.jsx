import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/authContext.js";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const response = await api.post("/customers/login", form);
            setUser(response.data.customer);
            navigate("/home", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to log in. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-layout">
            <section className="auth-story">
                <a className="brand brand-light" href="/login"><span className="brand-mark brand-mark-light">S</span><span>ShopKart</span></a>
                <div className="story-copy">
                    <p className="eyebrow">Everything you need</p>
                    <h1>Good finds.<br />Better days.</h1>
                    <p>Discover thoughtfully selected products for work, home and everything in between.</p>
                </div>
                <p className="story-footnote">Secure shopping, powered by MERN.</p>
            </section>

            <section className="auth-panel">
                <form className="auth-card" onSubmit={handleSubmit}>
                    <div className="form-heading">
                        <p className="eyebrow">Welcome back</p>
                        <h2>Sign in to ShopKart</h2>
                        <p>Enter your account details to continue.</p>
                    </div>
                    {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
                    {error && <div className="alert alert-error">{error}</div>}
                    <label>Email address
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
                    </label>
                    <label>Password
                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" required />
                    </label>
                    <button className="button button-primary button-full" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button>
                    <p className="form-switch">New to ShopKart? <Link to="/register">Create an account</Link></p>
                </form>
            </section>
        </main>
    );
}

export default Login;
