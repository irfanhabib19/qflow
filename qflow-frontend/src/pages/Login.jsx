import { useState } from "react";
import {
    Navigate,
    useLocation,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
    const {
        login,
        isAuthenticated,
        isAdmin
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Complete route the user originally wanted to access
    const from = location.state?.from;

    const originalRoute = from
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : null;

    // Already logged in
    if (isAuthenticated) {
        return (
            <Navigate
                to={isAdmin ? "/admin" : "/"}
                replace
            />
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await login(
                email.trim(),
                password
            );

            /*
             * Redirect priority:
             *
             * 1. ADMIN → /admin
             * 2. USER + original route
             *      → pathname + query + hash
             * 3. USER → /
             */

            if (data.role === "ADMIN") {
                navigate("/admin", {
                    replace: true
                });
            } else if (originalRoute) {
                navigate(originalRoute, {
                    replace: true
                });
            } else {
                navigate("/", {
                    replace: true
                });
            }

        } catch (error) {
            if (error.response?.status === 401) {
                setError("Invalid email or password.");
            } else {
                setError(
                    error.response?.data?.message ||
                    "Login failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">

            <div className="w-full max-w-md">

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">

                    <h1 className="text-3xl font-bold text-white text-center mb-2">
                        Welcome Back
                    </h1>

                    <p className="text-gray-400 text-center mb-8">
                        Login to your QFlow account
                    </p>

                    {error && (
                        <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 transition"
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                            className="mt-1 text-purple-400 hover:text-purple-300 font-medium"
                        >
                            Create an account
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}