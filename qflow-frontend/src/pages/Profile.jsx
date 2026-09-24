import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-2xl font-bold">Q</span>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">
                        Login Required
                    </h1>

                    <p className="text-gray-400 mb-6">
                        Please login to view your profile.
                    </p>

                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold hover:scale-[1.02] transition-all"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const initials = user.name
        ? user.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U";

    const isAdmin = user.role === "ADMIN";

    return (
        <div className="min-h-screen bg-[#07070a] text-white overflow-hidden relative">

            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[140px]" />

                <div className="absolute top-[20%] right-[-180px] w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[140px]" />

                <div className="absolute bottom-[-200px] left-[30%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px]" />
            </div>

            {/* Navbar */}
            <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                            <span className="text-lg font-black">
                                Q
                            </span>
                        </div>

                        <div>
                            <h1 className="font-bold text-lg tracking-tight">
                                QFlow
                            </h1>

                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                                Queue Management
                            </p>
                        </div>
                    </Link>

                    {/* Back */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-gray-300 hover:bg-white/[0.07] hover:text-white transition"
                    >
                        <span>←</span>
                        <span>Home</span>
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">

                {/* Page heading */}
                <div className="mb-8">
                    <p className="text-sm text-purple-400 font-medium mb-2">
                        ACCOUNT
                    </p>

                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        My Profile
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage your QFlow account and access your queue activity.
                    </p>
                </div>

                {/* Profile Hero */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl">

                    {/* Hero glow */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative p-6 md:p-8">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                            {/* User */}
                            <div className="flex items-center gap-5">

                                {/* Avatar */}
                                <div className="relative">

                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 p-[2px] shadow-2xl shadow-purple-500/20">

                                        <div className="w-full h-full rounded-[22px] bg-[#111116] flex items-center justify-center">

                                            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                                                {initials}
                                            </span>

                                        </div>
                                    </div>

                                    {/* Online indicator */}
                                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-[#111116]" />
                                </div>

                                {/* User info */}
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">

                                        <h2 className="text-2xl font-bold">
                                            {user.name || "User"}
                                        </h2>

                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                                isAdmin
                                                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                                                    : "bg-pink-500/10 text-pink-300 border border-pink-500/20"
                                            }`}
                                        >
                                            {isAdmin ? "ADMIN" : "USER"}
                                        </span>

                                    </div>

                                    <p className="text-gray-400">
                                        {user.email}
                                    </p>

                                    <div className="flex items-center gap-2 mt-3">

                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />

                                        <span className="text-xs text-gray-500">
                                            Account active
                                        </span>

                                    </div>
                                </div>

                            </div>

                            {/* Account badge */}
                            <div className="flex items-center gap-3 self-start md:self-center px-4 py-3 rounded-2xl border border-white/10 bg-black/20">

                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-emerald-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.8"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Account status
                                    </p>

                                    <p className="text-sm font-semibold text-emerald-400">
                                        Active
                                    </p>
                                </div>

                            </div>

                        </div>
                    </div>
                </section>

                {/* Account Information */}
                <section className="mt-6">

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold">
                                Account Information
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Your registered QFlow account details.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">

                        <InfoCard
                            label="Full Name"
                            value={user.name || "Not available"}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                                    />
                                </svg>
                            }
                        />

                        <InfoCard
                            label="Email Address"
                            value={user.email || "Not available"}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M4 7l8 6 8-6"
                                    />
                                </svg>
                            }
                        />

                        <InfoCard
                            label="Account Role"
                            value={isAdmin ? "Administrator" : "Queue User"}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M9.5 12l1.7 1.7L14.8 10"
                                    />
                                </svg>
                            }
                        />

                        <InfoCard
                            label="User ID"
                            value={String(user.userId ?? "Not available")}
                            icon={
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.7"
                                        d="M4 7h16M4 12h16M4 17h10"
                                    />
                                </svg>
                            }
                        />

                    </div>
                </section>

                {/* Quick Actions */}
                <section className="mt-10">

                    <div className="mb-4">
                        <h2 className="text-xl font-bold">
                            Quick Actions
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Quickly access your queue features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">

                        {/* My Tickets */}
                        <Link
                            to="/my-tickets"
                            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 hover:bg-white/[0.06] hover:border-purple-500/30 transition-all duration-300"
                        >

                            <div className="absolute -right-16 -top-16 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition" />

                            <div className="relative flex items-start justify-between">

                                <div>

                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">

                                        <svg
                                            className="w-6 h-6 text-purple-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.7"
                                                d="M8 7h8M8 11h8M8 15h5"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.7"
                                                d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"
                                            />
                                        </svg>

                                    </div>

                                    <h3 className="text-lg font-bold">
                                        My Tickets
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-2 max-w-sm">
                                        View your active and previous queue
                                        tickets in one place.
                                    </p>

                                </div>

                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-purple-500/40 group-hover:translate-x-1 transition-all">
                                    →
                                </div>

                            </div>

                        </Link>

                        {/* Join Queue */}
                        <Link
                            to="/join"
                            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 hover:bg-white/[0.06] hover:border-pink-500/30 transition-all duration-300"
                        >

                            <div className="absolute -right-16 -top-16 w-40 h-40 bg-pink-600/10 rounded-full blur-3xl group-hover:bg-pink-600/20 transition" />

                            <div className="relative flex items-start justify-between">

                                <div>

                                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-5">

                                        <svg
                                            className="w-6 h-6 text-pink-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.7"
                                                d="M12 5v14M5 12h14"
                                            />
                                        </svg>

                                    </div>

                                    <h3 className="text-lg font-bold">
                                        Join a Queue
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-2 max-w-sm">
                                        Find an available queue and get your
                                        digital ticket instantly.
                                    </p>

                                </div>

                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-pink-500/40 group-hover:translate-x-1 transition-all">
                                    →
                                </div>

                            </div>

                        </Link>

                    </div>
                </section>

                {/* Security / Status */}
                <section className="mt-6">

                    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">

                                    <svg
                                        className="w-5 h-5 text-emerald-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.7"
                                            d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                                        />
                                    </svg>

                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Your account is secure
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Authentication is protected by QFlow
                                        security.
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-2 text-xs text-emerald-400">

                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                                Online

                            </div>

                        </div>

                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-12 pb-6 text-center">

                    <p className="text-xs text-gray-600">
                        QFlow • Real-Time Queue Management
                    </p>

                </footer>

            </main>
        </div>
    );
}


/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({ label, value, icon }) {
    return (
        <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.055] hover:border-white/15 transition-all duration-300">

            <div className="flex items-start gap-4">

                <div className="w-11 h-11 shrink-0 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-purple-300 group-hover:border-purple-500/20 transition">

                    {icon}

                </div>

                <div className="min-w-0 flex-1">

                    <p className="text-xs uppercase tracking-wider text-gray-500">
                        {label}
                    </p>

                    <p className="mt-2 text-sm md:text-base font-medium text-gray-200 break-all">
                        {value}
                    </p>

                </div>

            </div>
        </div>
    );
}