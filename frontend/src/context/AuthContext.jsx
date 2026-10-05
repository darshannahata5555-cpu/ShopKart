import { useEffect, useState } from "react";
import api from "../services/api.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function checkAuthentication() {
            try {
                const response = await api.get("/customers/me");
                if (active) setUser(response.data.customer);
            } catch {
                if (active) setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        }

        checkAuthentication();
        return () => { active = false; };
    }, []);

    async function logout() {
        try {
            await api.post("/customers/logout");
        } finally {
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
