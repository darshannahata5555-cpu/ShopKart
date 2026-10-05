import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const initialForm = { fullName: "", email: "", phone: "", password: "" };

function Register() {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/customers/register", form);
            navigate("/login", { replace: true, state: { message: "Account created. You can now sign in." } });
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to create your account.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-layout">
            <section className="auth-story register-story">
                <a className="brand brand-light" href="/register"><span className="brand-mark brand-mark-light">S</span><span>ShopKart</span></a>
                <div className="story-copy">
                    <p className="eyebrow">Join the community</p>
                    <h1>Your next favourite thing is waiting.</h1>
                    <p>Create an account to explore the catalogue and keep your shopping journey in one place.</p>
                </div>
                <p className="story-footnote">Simple. Secure. Built for you.</p>
            </section>

            <section className="auth-panel">
                <form className="auth-card" onSubmit={handleSubmit}>
                    <div className="form-heading">
                        <p className="eyebrow">Get started</p>
                        <h2>Create your account</h2>
                        <p>It only takes a minute.</p>
                    </div>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div className="field-row">
                        <label>Full name<input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required /></label>
                        <label>Phone number<input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required /></label>
                    </div>
                    <label>Email address<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required /></label>
                    <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" minLength="6" required /></label>
                    <button className="button button-primary button-full" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button>
                    <p className="form-switch">Already have an account? <Link to="/login">Sign in</Link></p>
                </form>
            </section>
        </main>
    );
}

export default Register;

