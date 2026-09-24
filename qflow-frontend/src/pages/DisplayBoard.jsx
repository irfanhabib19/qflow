import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../services/api";
import { createWebSocketClient } from "../services/webSocket";

// ============================================================
// CONFIGURATION
// ============================================================

const QUEUE_ID = 1;

// ============================================================
// HELPERS
// ============================================================

/**
 * Convert different possible API response shapes into an array.
 *
 * Supports:
 *
 * [
 *     ...
 * ]
 *
 * {
 *     data: [...]
 * }
 *
 * {
 *     content: [...]
 * }
 */
function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.content)) {
        return value.content;
    }

    return [];
}

/**
 * Extract an ID from a counter object.
 */
function getCounterId(counter) {
    if (!counter) {
        return null;
    }

    if (typeof counter === "number") {
        return counter;
    }

    if (typeof counter === "string") {
        const parsed = Number(counter);

        return Number.isNaN(parsed)
            ? counter
            : parsed;
    }

    return (
        counter.id ??
        counter.counterId ??
        counter.counterNumber ??
        counter.number ??
        null
    );
}

/**
 * Extract counter ID from a ticket.
 *
 * Supports different possible backend DTO shapes:
 *
 * ticket.counterId
 * ticket.counter
 * ticket.counter.id
 * ticket.counter.number
 * ticket.counterNumber
 */
function getTicketCounterId(ticket) {
    if (!ticket) {
        return null;
    }

    // Direct counterId
    if (ticket.counterId != null) {
        return getCounterId(ticket.counterId);
    }

    // counterNumber
    if (ticket.counterNumber != null) {
        return getCounterId(ticket.counterNumber);
    }

    // counterId nested in another object
    if (ticket.counter?.id != null) {
        return getCounterId(ticket.counter.id);
    }

    // counter object
    if (ticket.counter != null) {
        return getCounterId(ticket.counter);
    }

    // counter number
    if (ticket.counter?.number != null) {
        return getCounterId(ticket.counter.number);
    }

    return null;
}

/**
 * Extract counter ID from a WebSocket event.
 */
function getEventCounterId(event) {
    if (!event) {
        return null;
    }

    if (event.counterId != null) {
        return getCounterId(event.counterId);
    }

    if (event.counterNumber != null) {
        return getCounterId(event.counterNumber);
    }

    if (event.counter?.id != null) {
        return getCounterId(event.counter.id);
    }

    if (event.counter != null) {
        return getCounterId(event.counter);
    }

    return null;
}

/**
 * Extract ticket number from an event.
 */
function getEventTicketNumber(event) {
    return (
        event?.ticketNumber ??
        event?.ticket?.ticketNumber ??
        event?.ticket?.number ??
        event?.number ??
        null
    );
}

/**
 * Extract ticket ID from an event.
 */
function getEventTicketId(event) {
    return (
        event?.ticketId ??
        event?.ticket?.id ??
        event?.id ??
        null
    );
}

/**
 * Determine whether a ticket is serving.
 */
function isServing(ticket) {
    return (
        String(ticket?.status ?? "").toUpperCase() ===
        "SERVING"
    );
}

/**
 * Determine whether a ticket is waiting.
 */
function isWaiting(ticket) {
    return (
        String(ticket?.status ?? "").toUpperCase() ===
        "WAITING"
    );
}

/**
 * Determine whether a counter is available.
 */
function isCounterAvailable(counter) {
    if (!counter) {
        return false;
    }

    // Explicit boolean
    if (typeof counter.available === "boolean") {
        return counter.available;
    }

    if (typeof counter.isAvailable === "boolean") {
        return counter.isAvailable;
    }

    // Status-based
    const status = String(
        counter.status ?? ""
    ).toUpperCase();

    if (
        status === "OFFLINE" ||
        status === "UNAVAILABLE" ||
        status === "INACTIVE"
    ) {
        return false;
    }

    return true;
}

// ============================================================
// COMPONENT
// ============================================================

export default function DisplayBoard() {

    // ========================================================
    // STATE
    // ========================================================

    const [queue, setQueue] = useState(null);

    const [counters, setCounters] = useState([]);

    const [tickets, setTickets] = useState([]);

    /**
     * Structure:
     *
     * {
     *     1: ticket,
     *     2: ticket,
     *     3: ticket
     * }
     */
    const [counterTickets, setCounterTickets] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [wsConnected, setWsConnected] =
        useState(false);

    const [lastEvent, setLastEvent] =
        useState(null);

    const [announcement, setAnnouncement] =
        useState(null);

    const [changingCounter, setChangingCounter] =
        useState(null);

    // ========================================================
    // FETCH QUEUE
    // ========================================================

    const fetchQueue = useCallback(async () => {

        try {

            const response = await api.get(
                `/queues/${QUEUE_ID}`
            );

            console.log(
                "📥 Queue:",
                response.data
            );

            setQueue(response.data);

        } catch (error) {

            console.error(
                "❌ Failed to fetch queue:",
                error
            );

        }

    }, []);

    // ========================================================
    // FETCH COUNTERS
    // ========================================================

    const fetchCounters = useCallback(async () => {

        try {

            const response = await api.get(
                `/queues/${QUEUE_ID}/counters`
            );

            const data = toArray(
                response.data
            );

            console.log(
                "📥 Counters:",
                data
            );

            setCounters(data);

        } catch (error) {

            console.error(
                "❌ Failed to fetch counters:",
                error
            );

        }

    }, []);

    // ========================================================
    // FETCH TICKETS
    // ========================================================

    const fetchTickets = useCallback(async () => {

        try {

            const response = await api.get(
                `/queues/${QUEUE_ID}/tickets`
            );

            const data = toArray(
                response.data
            );

            console.log(
                "📥 Tickets:",
                data
            );

            setTickets(data);

            // =================================================
            // BUILD COUNTER -> SERVING TICKET MAP
            // =================================================

            const newCounterTickets = {};

            data.forEach((ticket) => {

                if (!isServing(ticket)) {
                    return;
                }

                const counterId =
                    getTicketCounterId(ticket);

                if (counterId == null) {

                    console.warn(
                        "⚠️ SERVING ticket has no counter:",
                        ticket
                    );

                    return;
                }

                newCounterTickets[
                    String(counterId)
                    ] = ticket;

            });

            console.log(
                "📊 Counter -> Serving ticket:",
                newCounterTickets
            );

            setCounterTickets(
                newCounterTickets
            );

        } catch (error) {

            console.error(
                "❌ Failed to fetch tickets:",
                error
            );

        }

    }, []);

    // ========================================================
    // INITIAL DATA
    // ========================================================

    useEffect(() => {

        let mounted = true;

        const loadInitialData = async () => {

            setLoading(true);

            try {

                await Promise.all([
                    fetchQueue(),
                    fetchCounters(),
                    fetchTickets()
                ]);

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        };

        loadInitialData();

        return () => {
            mounted = false;
        };

    }, [
        fetchQueue,
        fetchCounters,
        fetchTickets
    ]);

    // ========================================================
    // WEBSOCKET
    // ========================================================

    useEffect(() => {

        console.log(
            "🚀 Starting Display Board WebSocket"
        );

        const client =
            createWebSocketClient(

                QUEUE_ID,

                // ============================================
                // EVENT RECEIVED
                // ============================================

                async (event) => {

                    console.log(
                        "🔥 DISPLAY BOARD EVENT:",
                        event
                    );

                    setLastEvent(event);

                    // ========================================
                    // TICKET CALLED
                    // ========================================

                    if (
                        event.eventType ===
                        "TICKET_CALLED"
                    ) {

                        const counterId =
                            getEventCounterId(
                                event
                            );

                        const ticketId =
                            getEventTicketId(
                                event
                            );

                        const ticketNumber =
                            getEventTicketNumber(
                                event
                            );

                        console.log(
                            "📢 TICKET CALLED",
                            {
                                counterId,
                                ticketId,
                                ticketNumber
                            }
                        );

                        // ====================================
                        // If backend event contains
                        // counter information
                        // ====================================

                        if (counterId != null) {

                            const counterKey =
                                String(
                                    counterId
                                );

                            // ------------------------------
                            // Animate this counter
                            // ------------------------------

                            setChangingCounter(
                                counterKey
                            );

                            // ------------------------------
                            // Update ONLY this counter
                            // ------------------------------

                            setCounterTickets(
                                (previous) => ({

                                    ...previous,

                                    [counterKey]: {

                                        id:
                                        ticketId,

                                        ticketNumber:
                                        ticketNumber,

                                        status:
                                            "SERVING",

                                        counterId:
                                        counterId

                                    }

                                })
                            );

                            // ------------------------------
                            // Announcement
                            // ------------------------------

                            setAnnouncement({

                                ticketNumber:
                                ticketNumber,

                                counterId:
                                counterId

                            });

                            // ------------------------------
                            // Stop animation
                            // ------------------------------

                            setTimeout(() => {

                                setChangingCounter(
                                    null
                                );

                            }, 700);

                            // ------------------------------
                            // Hide announcement
                            // ------------------------------

                            setTimeout(() => {

                                setAnnouncement(
                                    null
                                );

                            }, 3500);

                        }

                        // ====================================
                        // Synchronize with backend
                        // ====================================

                        await fetchTickets();

                        await fetchCounters();

                        await fetchQueue();

                    }

                    // ========================================
                    // TICKET SERVED
                    // ========================================

                    if (
                        event.eventType ===
                        "TICKET_SERVED"
                    ) {

                        const counterId =
                            getEventCounterId(
                                event
                            );

                        const ticketId =
                            getEventTicketId(
                                event
                            );

                        const ticketNumber =
                            getEventTicketNumber(
                                event
                            );

                        console.log(
                            "✅ TICKET SERVED",
                            {
                                counterId,
                                ticketId,
                                ticketNumber
                            }
                        );

                        // ====================================
                        // If event has counter ID,
                        // remove ONLY that counter's ticket
                        // ====================================

                        if (counterId != null) {

                            const counterKey =
                                String(
                                    counterId
                                );

                            setCounterTickets(
                                (previous) => {

                                    const updated = {
                                        ...previous
                                    };

                                    delete updated[
                                        counterKey
                                        ];

                                    return updated;

                                }
                            );

                        } else {

                            // =================================
                            // If event does not contain
                            // counter information, remove
                            // by ticket ID instead.
                            // =================================

                            setCounterTickets(
                                (previous) => {

                                    const updated = {};

                                    Object.entries(
                                        previous
                                    ).forEach(
                                        ([
                                             key,
                                             ticket
                                         ]) => {

                                            if (
                                                String(
                                                    ticket.id
                                                ) !==
                                                String(
                                                    ticketId
                                                )
                                            ) {

                                                updated[
                                                    key
                                                    ] =
                                                    ticket;

                                            }

                                        }
                                    );

                                    return updated;

                                }
                            );

                        }

                        // ====================================
                        // Refresh actual backend state
                        // ====================================

                        await fetchTickets();

                        await fetchCounters();

                        await fetchQueue();

                    }

                },

                // ============================================
                // CONNECTED
                // ============================================

                () => {

                    console.log(
                        "🟢 Display Board WebSocket connected"
                    );

                    setWsConnected(true);

                },

                // ============================================
                // ERROR
                // ============================================

                (error) => {

                    console.error(
                        "❌ Display Board WebSocket error:",
                        error
                    );

                    setWsConnected(false);

                }

            );

        // ====================================================
        // CLEANUP
        // ====================================================

        return () => {

            console.log(
                "🔴 Closing Display Board WebSocket"
            );

            client?.deactivate();

            setWsConnected(false);

        };

    }, [
        fetchQueue,
        fetchCounters,
        fetchTickets
    ]);

    // ========================================================
    // WAITING TICKETS
    // ========================================================

    const waitingTickets = useMemo(() => {

        return tickets
            .filter(isWaiting)
            .sort(
                (a, b) =>
                    Number(
                        a.ticketNumber ?? 0
                    ) -
                    Number(
                        b.ticketNumber ?? 0
                    )
            );

    }, [tickets]);

    // ========================================================
    // COUNTER DISPLAY DATA
    // ========================================================

    const displayCounters = useMemo(() => {

        return counters.map((counter) => {

            const counterId =
                getCounterId(counter);

            const key =
                String(counterId);

            const servingTicket =
                counterTickets[key] ??
                null;

            return {

                ...counter,

                counterId,

                servingTicket,

                available:
                    isCounterAvailable(
                        counter
                    )

            };

        });

    }, [
        counters,
        counterTickets
    ]);

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">

                <div className="text-center">

                    <div className="w-14 h-14 border-4 border-white/10 border-t-fuchsia-500 rounded-full animate-spin mx-auto mb-5" />

                    <p className="text-gray-400">
                        Loading QFlow...
                    </p>

                </div>

            </div>

        );

    }

    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="min-h-screen bg-[#050505] text-white overflow-hidden">

            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div className="fixed inset-0 pointer-events-none">

                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[140px]" />

                <div className="absolute top-[40%] -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />

            </div>

            {/* =================================================
                ANNOUNCEMENT
            ================================================= */}

            {announcement && (

                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">

                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    <div className="relative px-16 py-12 rounded-[2rem] bg-[#101010] border border-fuchsia-500/40 shadow-[0_0_100px_rgba(217,70,239,0.25)] text-center animate-pulse">

                        <p className="text-sm uppercase tracking-[0.4em] text-gray-500 mb-5">
                            Please Proceed To
                        </p>

                        <div className="text-8xl font-black text-white">
                            {announcement.ticketNumber}
                        </div>

                        <div className="mt-6 text-3xl font-bold text-fuchsia-400">
                            Counter{" "}
                            {announcement.counterId}
                        </div>

                    </div>

                </div>

            )}

            {/* =================================================
                MAIN
            ================================================= */}

            <div className="relative z-10 max-w-[1700px] mx-auto px-6 py-7">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="flex items-center justify-between mb-10">

                    {/* BRAND */}

                    <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">

                            <span className="text-xl font-black">
                                Q
                            </span>

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold tracking-tight">
                                QFlow
                            </h1>

                            <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                                Queue Management
                            </p>

                        </div>

                    </div>

                    {/* QUEUE INFO */}

                    <div className="flex items-center gap-5">

                        <div className="hidden sm:block text-right">

                            <p className="font-semibold">
                                {queue?.name ||
                                    "Main Branch"}
                            </p>

                            <p className="text-xs text-gray-500">
                                Live Queue Display
                            </p>

                        </div>

                        {/* LIVE */}

                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                                wsConnected
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                        >

                            <span
                                className={`w-2 h-2 rounded-full ${
                                    wsConnected
                                        ? "bg-emerald-400 animate-pulse"
                                        : "bg-red-400"
                                }`}
                            />

                            <span className="text-xs font-semibold">

                                {wsConnected
                                    ? "LIVE"
                                    : "OFFLINE"}

                            </span>

                        </div>

                    </div>

                </header>

                {/* =================================================
                    SECTION TITLE
                ================================================= */}

                <div className="flex items-center gap-3 mb-5">

                    <div className="w-1.5 h-7 rounded-full bg-fuchsia-500" />

                    <div>

                        <h2 className="text-2xl font-bold">
                            Now Serving
                        </h2>

                        <p className="text-sm text-gray-500">
                            Current tickets at each counter
                        </p>

                    </div>

                </div>

                {/* =================================================
                    COUNTERS
                ================================================= */}

                {displayCounters.length === 0 ? (

                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-16 text-center mb-8">

                        <p className="text-gray-500">
                            No counters configured
                        </p>

                    </div>

                ) : (

                    <div
                        className={`grid gap-5 mb-8 ${
                            displayCounters.length === 1
                                ? "grid-cols-1"
                                : displayCounters.length === 2
                                    ? "grid-cols-1 md:grid-cols-2"
                                    : displayCounters.length === 3
                                        ? "grid-cols-1 md:grid-cols-3"
                                        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
                        }`}
                    >

                        {displayCounters.map(
                            (counter) => {

                                const counterId =
                                    counter.counterId;

                                const ticket =
                                    counter.servingTicket;

                                const isChanging =
                                    String(
                                        changingCounter
                                    ) ===
                                    String(
                                        counterId
                                    );

                                return (

                                    <div
                                        key={String(
                                            counterId
                                        )}
                                        className={`relative overflow-hidden rounded-[2rem] border bg-white/[0.03] transition-all duration-500 ${
                                            isChanging
                                                ? "border-fuchsia-400 shadow-[0_0_55px_rgba(217,70,239,0.25)]"
                                                : "border-white/10"
                                        }`}
                                    >

                                        {/* TOP ACCENT */}

                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500" />

                                        <div className="p-7">

                                            {/* COUNTER HEADER */}

                                            <div className="flex items-start justify-between gap-3 mb-7">

                                                <div>

                                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                                                        Counter
                                                    </p>

                                                    <h3 className="text-2xl font-bold mt-1">
                                                        {counter.name ||
                                                            `Counter ${counterId}`}
                                                    </h3>

                                                </div>

                                                <div
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                                        ticket
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : counter.available
                                                                ? "bg-amber-500/10 text-amber-400"
                                                                : "bg-red-500/10 text-red-400"
                                                    }`}
                                                >

                                                    {ticket
                                                        ? "SERVING"
                                                        : counter.available
                                                            ? "AVAILABLE"
                                                            : "OFFLINE"}

                                                </div>

                                            </div>

                                            {/* TICKET */}

                                            <div
                                                className={`min-h-[190px] flex flex-col items-center justify-center transition-all duration-500 ${
                                                    isChanging
                                                        ? "scale-110"
                                                        : "scale-100"
                                                }`}
                                            >

                                                {ticket ? (

                                                    <>

                                                        <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-3">
                                                            Ticket
                                                        </p>

                                                        <div className="text-8xl font-black leading-none bg-gradient-to-br from-white via-fuchsia-100 to-fuchsia-400 bg-clip-text text-transparent">
                                                            {ticket.ticketNumber}
                                                        </div>

                                                        <div className="mt-5 flex items-center gap-2">

                                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />

                                                            <span className="text-xs uppercase tracking-wider text-emerald-400">
                                                                Serving now
                                                            </span>

                                                        </div>

                                                    </>

                                                ) : (

                                                    <>

                                                        <div className="text-7xl font-black text-white/[0.08]">
                                                            —
                                                        </div>

                                                        <p className="text-sm text-gray-500 mt-4">
                                                            Waiting for ticket
                                                        </p>

                                                    </>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

                {/* =================================================
                    WAITING QUEUE
                ================================================= */}

                <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7">

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h2 className="text-xl font-bold">
                                Waiting Queue
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Customers waiting for service
                            </p>

                        </div>

                        <div className="min-w-12 h-12 px-3 rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center font-bold text-lg">
                            {waitingTickets.length}
                        </div>

                    </div>

                    {waitingTickets.length === 0 ? (

                        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">

                            <div className="text-3xl mb-3">
                                ✓
                            </div>

                            <p className="text-gray-400 font-medium">
                                Queue is clear
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                                No customers are waiting
                            </p>

                        </div>

                    ) : (

                        <div className="flex flex-wrap gap-3">

                            {waitingTickets.map(
                                (ticket) => (

                                    <div
                                        key={ticket.id}
                                        className="min-w-[72px] px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.04] transition-all"
                                    >

                                        <div className="text-2xl font-bold">
                                            {ticket.ticketNumber}
                                        </div>

                                        <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">
                                            Waiting
                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="mt-6 flex items-center justify-between text-xs text-gray-600">

                    <span>
                        QFlow Real-Time Queue System
                    </span>

                    {lastEvent && (

                        <span>
                            Last event:{" "}
                            <span className="text-gray-400">
                                {lastEvent.eventType}
                            </span>
                        </span>

                    )}

                </footer>

            </div>

        </div>

    );
}