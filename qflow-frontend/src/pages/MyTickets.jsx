import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getMyTickets,
    cancelTicket
} from "../services/userApi";


export default function MyTickets() {

    const { user } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);


    // ==========================================
    // LOAD TICKETS
    // ==========================================

    const loadTickets = useCallback(async (showLoading = false) => {

        try {

            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const data = await getMyTickets();

            setTickets(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load tickets:",
                err
            );

            /*
             * Don't replace existing ticket data during
             * a background refresh if the refresh fails.
             */

            if (!tickets.length || showLoading) {

                setError(
                    err.response?.data?.message ||
                    "Unable to load your tickets."
                );

            }

        } finally {

            if (showLoading) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }

        }

    }, [tickets.length]);


    // ==========================================
    // INITIAL LOAD + AUTO REFRESH
    // ==========================================

    useEffect(() => {

        let cancelled = false;

        const load = async () => {

            if (cancelled) {
                return;
            }

            try {

                setLoading(true);
                setError("");

                const data = await getMyTickets();

                if (!cancelled) {

                    setTickets(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                }

            } catch (err) {

                if (!cancelled) {

                    console.error(
                        "Failed to load tickets:",
                        err
                    );

                    setError(
                        err.response?.data?.message ||
                        "Unable to load your tickets."
                    );

                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        };


        // Load immediately

        load();


        // Refresh every 5 seconds

        const intervalId = setInterval(
            async () => {

                if (cancelled) {
                    return;
                }

                try {

                    setRefreshing(true);

                    const data =
                        await getMyTickets();

                    if (!cancelled) {

                        setTickets(
                            Array.isArray(data)
                                ? data
                                : []
                        );

                    }

                } catch (err) {

                    /*
                     * Background refresh failure should
                     * not destroy the currently displayed data.
                     */

                    console.error(
                        "Background ticket refresh failed:",
                        err
                    );

                } finally {

                    if (!cancelled) {
                        setRefreshing(false);
                    }

                }

            },
            5000
        );


        // Cleanup

        return () => {

            cancelled = true;

            clearInterval(intervalId);

        };

    }, []);


    // ==========================================
    // CANCEL TICKET
    // ==========================================

    const handleCancel = async (ticket) => {

        const confirmed = window.confirm(
            `Cancel ticket #${ticket.ticketNumber}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setCancellingId(ticket.id);

            await cancelTicket(
                ticket.queueId,
                ticket.id
            );

            /*
             * Immediately update the UI.
             * The next polling cycle will confirm
             * the server state.
             */

            setTickets((currentTickets) =>
                currentTickets.map((item) =>
                    item.id === ticket.id
                        ? {
                            ...item,
                            status: "CANCELLED"
                        }
                        : item
                )
            );

        } catch (err) {

            console.error(
                "Failed to cancel ticket:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Unable to cancel the ticket."
            );

        } finally {

            setCancellingId(null);

        }

    };


    // ==========================================
    // INITIAL LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-950 text-white">

                <div className="mx-auto max-w-6xl px-4 py-10">

                    <div className="animate-pulse">

                        <div className="h-8 w-48 rounded bg-gray-800" />

                        <div className="mt-3 h-4 w-72 rounded bg-gray-800" />

                        <div className="mt-8 grid gap-4 md:grid-cols-2">

                            <div className="h-48 rounded-2xl bg-gray-900" />

                            <div className="h-48 rounded-2xl bg-gray-900" />

                        </div>

                    </div>

                </div>

            </div>
        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (
            <div className="min-h-screen bg-gray-950 text-white">

                <div className="mx-auto max-w-3xl px-4 py-16">

                    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">

                        <h2 className="text-xl font-semibold">
                            Unable to load tickets
                        </h2>

                        <p className="mt-2 text-gray-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-700"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );

    }


    // ==========================================
    // EMPTY
    // ==========================================

    if (tickets.length === 0) {

        return (
            <div className="min-h-screen bg-gray-950 text-white">

                <div className="mx-auto max-w-4xl px-4 py-16">

                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">

                        <h1 className="text-2xl font-bold">
                            No tickets yet
                        </h1>

                        <p className="mt-2 text-gray-400">
                            You haven't joined any queues yet.
                        </p>

                        <Link
                            to="/join"
                            className="mt-6 inline-flex rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold hover:bg-purple-700"
                        >
                            Join a Queue
                        </Link>

                    </div>

                </div>

            </div>
        );

    }


    // ==========================================
    // TICKET LIST
    // ==========================================

    return (
        <div className="min-h-screen bg-gray-950 text-white">

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                {/* HEADER */}

                <div className="mb-8 flex items-center justify-between">

                    <div>

                        <h1 className="text-3xl font-bold">
                            My Tickets
                        </h1>

                        <p className="mt-2 text-gray-400">
                            Welcome back, {user?.name}.
                        </p>

                    </div>


                    {/* Refresh indicator */}

                    {refreshing && (

                        <div className="flex items-center gap-2 text-sm text-gray-500">

                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-t-purple-400" />

                            Updating...

                        </div>

                    )}

                </div>


                {/* TICKETS */}

                <div className="grid gap-5 md:grid-cols-2">

                    {tickets.map((ticket) => (

                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            cancelling={
                                cancellingId === ticket.id
                            }
                            onCancel={handleCancel}
                        />

                    ))}

                </div>

            </div>

        </div>
    );

}


// ==========================================
// TICKET CARD
// ==========================================

function TicketCard({
                        ticket,
                        cancelling,
                        onCancel
                    }) {

    const status = ticket.status || "UNKNOWN";

    const statusStyles = {

        WAITING:
            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

        SERVING:
            "bg-green-500/10 text-green-400 border-green-500/20",

        SERVED:
            "bg-blue-500/10 text-blue-400 border-blue-500/20",

        CANCELLED:
            "bg-red-500/10 text-red-400 border-red-500/20"

    };


    return (

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

            <div className="flex items-start justify-between gap-4">

                <div>

                    <p className="text-sm text-gray-500">
                        Queue
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                        {ticket.queueName ||
                            `Queue #${ticket.queueId}`}
                    </h2>

                </div>


                <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        statusStyles[status] ||
                        "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                >
                    {status}
                </span>

            </div>


            <div className="my-6 rounded-xl bg-gray-950 p-5 text-center">

                <p className="text-sm text-gray-500">
                    Ticket Number
                </p>

                <p className="mt-1 text-4xl font-bold text-purple-400">
                    #{ticket.ticketNumber}
                </p>

            </div>


            <div className="space-y-3">

                <div className="flex justify-between">

                    <span className="text-sm text-gray-500">
                        Ticket ID
                    </span>

                    <span className="text-sm text-gray-300">
                        {ticket.id}
                    </span>

                </div>


                {ticket.position != null && (

                    <div className="flex justify-between">

                        <span className="text-sm text-gray-500">
                            Position
                        </span>

                        <span className="text-sm font-semibold text-white">
                            {ticket.position}
                        </span>

                    </div>

                )}

            </div>


            <div className="mt-6 flex gap-3">

                <Link
                    to={`/queue/${ticket.queueId}/ticket/${ticket.id}`}
                    className="flex-1 rounded-lg border border-gray-700 px-4 py-2.5 text-center text-sm font-medium text-gray-300 hover:bg-gray-800"
                >
                    View Status
                </Link>


                {status === "WAITING" && (

                    <button
                        type="button"
                        disabled={cancelling}
                        onClick={() => onCancel(ticket)}
                        className="rounded-lg border border-red-900/50 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 disabled:opacity-50"
                    >
                        {cancelling
                            ? "Cancelling..."
                            : "Cancel"}
                    </button>

                )}

            </div>

        </div>

    );

}