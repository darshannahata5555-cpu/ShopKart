import axios from "axios";

const api = axios.create({
    // Vite exposes browser environment variables through import.meta.env.
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8084",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;
