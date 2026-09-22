import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const {
        isAuthenticated,
        isAdmin,
        loading
    } = useAuth();

    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{
                    from: {
                        pathname: location.pathname,
                        search: location.search,
                        hash: location.hash
                    }
                }}
                replace
            />
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}