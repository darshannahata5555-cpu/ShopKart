import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext.js";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="page-loader"><div className="spinner" /><p>Checking your session...</p></div>;
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default ProtectedRoute;
