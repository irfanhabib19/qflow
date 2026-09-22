import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const {
        user,
        isAuthenticated,
        isAdmin,
        logout
    } = useAuth();

    const navigate = useNavigate();

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        navigate("/login", { replace: true });
    };

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex h-16 items-center justify-between">

                    {/* ============================= */}
                    {/* LOGO */}
                    {/* ============================= */}

                    <Link
                        to="/"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600">
                            <span className="text-lg font-bold text-white">
                                Q
                            </span>
                        </div>

                        <span className="text-xl font-bold text-white">
                            QFlow
                        </span>
                    </Link>


                    {/* ============================= */}
                    {/* DESKTOP NAVIGATION */}
                    {/* ============================= */}

                    <div className="hidden md:flex items-center gap-6">

                        {/* Public links */}

                        <Link
                            to="/"
                            className="text-sm text-gray-300 hover:text-white transition"
                        >
                            Join Queue
                        </Link>

                        <Link
                            to="/display"
                            className="text-sm text-gray-300 hover:text-white transition"
                        >
                            Display Board
                        </Link>


                        {/* Authenticated USER */}

                        {isAuthenticated && !isAdmin && (
                            <>
                                <Link
                                    to="/my-tickets"
                                    className="text-sm text-gray-300 hover:text-white transition"
                                >
                                    My Tickets
                                </Link>

                                <Link
                                    to="/profile"
                                    className="text-sm text-gray-300 hover:text-white transition"
                                >
                                    Profile
                                </Link>
                            </>
                        )}


                        {/* ADMIN */}

                        {isAuthenticated && isAdmin && (
                            <Link
                                to="/admin"
                                className="text-sm text-purple-400 hover:text-purple-300 transition font-medium"
                            >
                                Admin Dashboard
                            </Link>
                        )}


                        {/* Logged out */}

                        {!isAuthenticated && (
                            <div className="flex items-center gap-3">

                                <Link
                                    to="/login"
                                    className="text-sm text-gray-300 hover:text-white transition"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
                                >
                                    Register
                                </Link>

                            </div>
                        )}


                        {/* Logged in user */}

                        {isAuthenticated && user && (
                            <div className="flex items-center gap-4">

                                <div className="hidden lg:block text-right">
                                    <p className="text-sm font-medium text-white">
                                        {user.name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {user.role}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
                                >
                                    Logout
                                </button>

                            </div>
                        )}

                    </div>


                    {/* ============================= */}
                    {/* MOBILE MENU BUTTON */}
                    {/* ============================= */}

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(!mobileOpen)
                        }
                        className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? (
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </button>

                </div>


                {/* ============================= */}
                {/* MOBILE NAVIGATION */}
                {/* ============================= */}

                {mobileOpen && (
                    <div className="md:hidden border-t border-gray-800 py-4">

                        <div className="flex flex-col gap-2">

                            {/* Public */}

                            <Link
                                to="/"
                                onClick={closeMobileMenu}
                                className="rounded-lg px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                                Join Queue
                            </Link>

                            <Link
                                to="/display"
                                onClick={closeMobileMenu}
                                className="rounded-lg px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                                Display Board
                            </Link>


                            {/* USER */}

                            {isAuthenticated && !isAdmin && (
                                <>
                                    <Link
                                        to="/my-tickets"
                                        onClick={closeMobileMenu}
                                        className="rounded-lg px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                                    >
                                        My Tickets
                                    </Link>

                                    <Link
                                        to="/profile"
                                        onClick={closeMobileMenu}
                                        className="rounded-lg px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                                    >
                                        Profile
                                    </Link>
                                </>
                            )}


                            {/* ADMIN */}

                            {isAuthenticated && isAdmin && (
                                <Link
                                    to="/admin"
                                    onClick={closeMobileMenu}
                                    className="rounded-lg px-3 py-3 text-purple-400 hover:bg-gray-800 hover:text-purple-300"
                                >
                                    Admin Dashboard
                                </Link>
                            )}


                            {/* Logged out */}

                            {!isAuthenticated && (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="rounded-lg px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/register"
                                        onClick={closeMobileMenu}
                                        className="rounded-lg bg-purple-600 px-3 py-3 text-center font-semibold text-white hover:bg-purple-700"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}


                            {/* Logged in */}

                            {isAuthenticated && user && (
                                <div className="mt-2 border-t border-gray-800 pt-4">

                                    <div className="px-3 mb-3">
                                        <p className="font-medium text-white">
                                            {user.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {user.email}
                                        </p>

                                        <p className="mt-1 text-xs text-purple-400">
                                            {user.role}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full rounded-lg px-3 py-3 text-left text-red-400 hover:bg-gray-800"
                                    >
                                        Logout
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>
                )}

            </div>

        </nav>
    );
}