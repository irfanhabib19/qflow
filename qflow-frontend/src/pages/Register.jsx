import { useState } from "react";
import {
    Navigate,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../services/authApi";

export default function Register() {
    const {
        isAuthenticated
    } = useAuth();

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Already logged in
    if (isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // -------------------------
        // Client-side validation
        // -------------------------

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            setError("Name is required.");
            return;
        }

        if (trimmedName.length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }

        if (!trimmedEmail) {
            setError("Email is required.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Password is required.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            /*
             * Backend:
             *
             * POST /api/auth/register
             *
             * {
             *   name,
             *   email,
             *   password
             * }
             */

            await registerApi(
                trimmedName,
                trimmedEmail,
                password
            );

            // Registration creates a USER account.
            navigate("/", {
                replace: true
            });

        } catch (error) {
            if (error.response?.status === 409) {
                setError(
                    "An account with this email already exists."
                );
            } else if (error.response?.status === 400) {
                setError(
                    error.response?.data?.message ||
                    "Please check your registration details."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                    "Registration failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">

            <div className="w-full max-w-md">

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">

                    {/* Header */}

                    <h1 className="text-3xl font-bold text-white text-center mb-2">
                        Create Account
                    </h1>

                    <p className="text-gray-400 text-center mb-8">
                        Join QFlow and manage your queues digitally
                    </p>

                    {/* Error */}

                    {error && (
                        <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Name */}

                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm text-gray-300 mb-2"
                            >
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Irfan Habib"
                                required
                                disabled={loading}
                                autoComplete="name"
                                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                            />
                        </div>

                        {/* Email */}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm text-gray-300 mb-2"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                                autoComplete="email"
                                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                            />
                        </div>

                        {/* Password */}

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm text-gray-300 mb-2"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                autoComplete="new-password"
                                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                            />

                            <p className="text-xs text-gray-500 mt-2">
                                Minimum 6 characters
                            </p>
                        </div>

                        {/* Confirm Password */}

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm text-gray-300 mb-2"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                autoComplete="new-password"
                                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                            />
                        </div>

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 transition"
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>

                    {/* Login */}

                    <div className="mt-6 text-center">

                        <p className="text-gray-400 text-sm">
                            Already have an account?
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                            className="mt-1 text-purple-400 hover:text-purple-300 font-medium"
                        >
                            Login
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}