import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-950 text-white">

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold">
                        My Profile
                    </h1>

                    <p className="mt-2 text-gray-400">
                        Manage your QFlow account information.
                    </p>

                </div>


                {/* Profile Card */}

                <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

                    {/* Profile header */}

                    <div className="border-b border-gray-800 px-6 py-8">

                        <div className="flex flex-col items-center gap-4 sm:flex-row">

                            {/* Avatar */}

                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white">

                                {user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                            </div>


                            <div className="text-center sm:text-left">

                                <h2 className="text-2xl font-bold">
                                    {user?.name}
                                </h2>

                                <p className="mt-1 text-gray-400">
                                    {user?.email}
                                </p>

                                <span className="mt-3 inline-flex rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                                    {user?.role}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* Account information */}

                    <div className="p-6">

                        <h3 className="mb-5 text-lg font-semibold">
                            Account Information
                        </h3>


                        <div className="grid gap-5 sm:grid-cols-2">

                            {/* Name */}

                            <div>

                                <p className="text-sm text-gray-500">
                                    Full Name
                                </p>

                                <p className="mt-1 font-medium text-gray-200">
                                    {user?.name || "—"}
                                </p>

                            </div>


                            {/* Email */}

                            <div>

                                <p className="text-sm text-gray-500">
                                    Email Address
                                </p>

                                <p className="mt-1 break-all font-medium text-gray-200">
                                    {user?.email || "—"}
                                </p>

                            </div>


                            {/* Role */}

                            <div>

                                <p className="text-sm text-gray-500">
                                    Account Role
                                </p>

                                <p className="mt-1 font-medium text-gray-200">
                                    {user?.role || "—"}
                                </p>

                            </div>


                            {/* User ID */}

                            <div>

                                <p className="text-sm text-gray-500">
                                    User ID
                                </p>

                                <p className="mt-1 font-medium text-gray-200">
                                    {user?.userId ?? "—"}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Actions */}

                    <div className="border-t border-gray-800 px-6 py-5">

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/my-tickets"
                                className="rounded-lg bg-purple-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-purple-700"
                            >
                                My Tickets
                            </Link>

                            <Link
                                to="/join"
                                className="rounded-lg border border-gray-700 px-5 py-2.5 text-center text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
                            >
                                Join Queue
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}