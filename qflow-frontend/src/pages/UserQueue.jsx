import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getQueueById,
    getAllTickets
} from "../services/queueApi.jsx";

import {
    joinQueue,
    cancelTicket
} from "../services/userApi";

import {
    createWebSocketClient
} from "../services/webSocket.js";

import {
    useAuth
} from "../context/AuthContext";


function UserQueue() {

    const { queueId } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();


    // =====================================================
    // USER-SPECIFIC TICKET KEY
    // =====================================================

    const ticketStorageKey =
        user?.userId
            ? `qflow-ticket-${user.userId}-${queueId}`
            : null;


    // =====================================================
    // STATE
    // =====================================================

    const [queue, setQueue] =
        useState(null);

    const [tickets, setTickets] =
        useState([]);

    const [myTicket, setMyTicket] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [joining, setJoining] =
        useState(false);

    const [cancelling, setCancelling] =
        useState(false);

    const [connected, setConnected] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showCancelConfirm, setShowCancelConfirm] =
        useState(false);


    // =====================================================
    // LOAD QUEUE
    // =====================================================

    async function loadQueue() {

        try {

            const data =
                await getQueueById(queueId);

            setQueue(data);

        } catch (err) {

            console.error(
                "Failed to load queue:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load queue"
            );
        }
    }


    // =====================================================
    // LOAD TICKETS
    // =====================================================

    async function loadTickets() {

        try {

            const data =
                await getAllTickets(queueId);

            const ticketList =
                Array.isArray(data)
                    ? data
                    : [];

            setTickets(ticketList);


            // ==========================================
            // GUEST
            // ==========================================

            if (!user?.userId) {

                setMyTicket(null);

                return;
            }


            // ==========================================
            // USER STORAGE KEY
            // ==========================================

            if (!ticketStorageKey) {

                setMyTicket(null);

                return;
            }


            const savedTicketId =
                localStorage.getItem(
                    ticketStorageKey
                );


            // ==========================================
            // NO TICKET FOR THIS USER
            // ==========================================

            if (!savedTicketId) {

                setMyTicket(null);

                return;
            }


            // ==========================================
            // FIND THIS USER'S TICKET
            // ==========================================

            const savedTicket =
                ticketList.find(
                    ticket =>
                        String(ticket.id) ===
                        String(savedTicketId)
                );


            if (savedTicket) {

                setMyTicket(
                    savedTicket
                );

            } else {

                localStorage.removeItem(
                    ticketStorageKey
                );

                setMyTicket(null);
            }

        } catch (err) {

            console.error(
                "Failed to load tickets:",
                err
            );
        }
    }


    // =====================================================
    // LOAD DATA
    // =====================================================

    async function loadData() {

        await Promise.all([
            loadQueue(),
            loadTickets()
        ]);
    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        let mounted = true;


        async function load() {

            if (!queueId) {

                setError(
                    "Invalid queue ID."
                );

                setLoading(false);

                return;
            }


            try {

                setLoading(true);

                setError("");

                await loadData();

            } catch (err) {

                console.error(
                    "Failed to load queue:",
                    err
                );

            } finally {

                if (mounted) {

                    setLoading(false);
                }
            }
        }


        load();


        return () => {

            mounted = false;
        };

    }, [
        queueId,
        user?.userId
    ]);


    // =====================================================
    // WEBSOCKET
    // =====================================================

    useEffect(() => {

        if (!queueId) {
            return;
        }


        const client =
            createWebSocketClient(

                queueId,

                event => {

                    console.log(
                        "Queue event:",
                        event
                    );

                    loadData();
                },

                () => {

                    console.log(
                        "WebSocket connected"
                    );

                    setConnected(true);
                },

                err => {

                    console.error(
                        "WebSocket error:",
                        err
                    );

                    setConnected(false);
                }
            );


        return () => {

            setConnected(false);

            if (client) {

                client.deactivate();
            }
        };

    }, [
        queueId,
        user?.userId
    ]);


    // =====================================================
    // WAITING
    // =====================================================

    const waitingTickets =
        useMemo(() => {

            return tickets.filter(
                ticket =>
                    String(
                        ticket.status || ""
                    ).toUpperCase() ===
                    "WAITING"
            );

        }, [tickets]);


    // =====================================================
    // SERVING
    // =====================================================

    const servingTickets =
        useMemo(() => {

            return tickets.filter(
                ticket =>
                    String(
                        ticket.status || ""
                    ).toUpperCase() ===
                    "SERVING"
            );

        }, [tickets]);


    // =====================================================
    // PEOPLE AHEAD
    // =====================================================

    const peopleAhead =
        useMemo(() => {

            if (!myTicket) {
                return 0;
            }


            return waitingTickets.filter(
                ticket =>
                    Number(ticket.ticketNumber) <
                    Number(myTicket.ticketNumber)
            ).length;

        }, [
            waitingTickets,
            myTicket
        ]);


    // =====================================================
    // WAIT TIME
    // =====================================================

    const estimatedWait =
        myTicket
            ? peopleAhead * 3
            : 0;


    // =====================================================
    // CURRENT SERVING
    // =====================================================

    const currentServing =
        useMemo(() => {

            if (
                queue?.currentNumber !== null &&
                queue?.currentNumber !== undefined
            ) {

                return queue.currentNumber;
            }


            if (servingTickets.length > 0) {

                return servingTickets[0]
                    .ticketNumber;
            }


            return null;

        }, [
            queue,
            servingTickets
        ]);


    // =====================================================
    // QUEUE STATUS
    // =====================================================

    const queueStatus =
        String(
            queue?.status || ""
        ).toUpperCase();


    const isOpen =
        queueStatus === "OPEN";

    const isPaused =
        queueStatus === "PAUSED";

    const isClosed =
        queueStatus === "CLOSED";


    // =====================================================
    // JOIN QUEUE
    // =====================================================

    async function handleJoinQueue() {

        // ==========================================
        // GUEST PROTECTION
        // ==========================================

        if (!user?.userId) {

            navigate(
                "/login",
                {
                    state: {
                        from: {
                            pathname:
                                `/queue/${queueId}`
                        }
                    }
                }
            );

            return;
        }


        try {

            setJoining(true);

            setError("");


            const ticket =
                await joinQueue(queueId);


            console.log(
                "QFlow ticket:",
                ticket
            );


            setMyTicket(ticket);


            // ==========================================
            // SAVE AGAINST CURRENT USER
            // ==========================================

            localStorage.setItem(
                ticketStorageKey,
                String(ticket.id)
            );


            await loadData();

        } catch (err) {

            console.error(
                "Join queue error:",
                err
            );


            if (
                err.response?.status === 401
            ) {

                setError(
                    "Please login to join the queue."
                );

            } else {

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to join queue"
                );
            }

        } finally {

            setJoining(false);
        }
    }


    // =====================================================
    // CANCEL
    // =====================================================

    async function handleCancelTicket() {

        if (!myTicket) {
            return;
        }


        try {

            setCancelling(true);

            setError("");


            await cancelTicket(
                queueId,
                myTicket.id
            );


            if (ticketStorageKey) {

                localStorage.removeItem(
                    ticketStorageKey
                );
            }


            setMyTicket(null);

            setShowCancelConfirm(false);


            await loadData();

        } catch (err) {

            console.error(
                "Cancel ticket error:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to cancel ticket"
            );

        } finally {

            setCancelling(false);
        }
    }


    // =====================================================
    // OPEN TICKET
    // =====================================================

    function openTicket() {

        if (!myTicket) {
            return;
        }


        navigate(
            `/queue/${queueId}/ticket/${myTicket.id}`
        );
    }


    // =====================================================
    // DISPLAY BOARD
    // =====================================================

    function openDisplayBoard() {

        window.open(
            `/display/${queueId}`,
            "_blank",
            "noopener,noreferrer"
        );
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="
                min-h-screen
                bg-[#07090d]
                text-white
                flex
                items-center
                justify-center
            ">

                <div className="
                    text-center
                ">

                    <div className="
                        mx-auto
                        h-12
                        w-12
                        animate-spin
                        rounded-full
                        border-2
                        border-zinc-800
                        border-t-cyan-400
                    " />

                    <p className="
                        mt-5
                        text-sm
                        text-zinc-500
                    ">
                        Loading queue...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // NOT FOUND
    // =====================================================

    if (!queue) {

        return (
            <div className="
                min-h-screen
                bg-[#07090d]
                text-white
                flex
                items-center
                justify-center
            ">

                <div className="
                    text-center
                ">

                    <div className="text-5xl">
                        🔎
                    </div>

                    <h1 className="
                        mt-5
                        text-2xl
                        font-black
                    ">
                        Queue not found
                    </h1>

                    <button
                        onClick={() =>
                            navigate("/join")
                        }
                        className="
                            mt-6
                            rounded-xl
                            bg-cyan-600
                            px-6
                            py-3
                            font-bold
                        "
                    >
                        Back to Queues
                    </button>

                </div>

            </div>
        );
    }


    // =====================================================
    // MAIN
    // =====================================================

    return (

        <div className="
            min-h-screen
            bg-[#07090d]
            text-white
        ">

            {/* HEADER */}

            <header className="
                border-b
                border-zinc-800
                bg-[#07090d]
            ">

                <div className="
                    mx-auto
                    max-w-5xl
                    px-5
                    py-4
                    flex
                    items-center
                    justify-between
                ">

                    <button
                        onClick={() =>
                            navigate("/join")
                        }
                        className="
                            text-cyan-400
                            font-black
                        "
                    >
                        ⚡ QFlow
                    </button>


                    <div className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        bg-emerald-500/10
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-emerald-400
                    ">

                        <span className={`
                            h-2
                            w-2
                            rounded-full
                            ${
                            connected
                                ? "bg-emerald-400"
                                : "bg-red-400"
                        }
                        `} />

                        {connected
                            ? "LIVE"
                            : "OFFLINE"
                        }

                    </div>

                </div>

            </header>


            <main className="
                mx-auto
                max-w-5xl
                px-5
                py-8
            ">

                <button
                    onClick={() =>
                        navigate("/join")
                    }
                    className="
                        mb-5
                        text-sm
                        text-zinc-500
                    "
                >
                    ← All queues
                </button>


                {/* QUEUE HEADER */}

                <section className="
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-6
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                        gap-4
                    ">

                        <div>

                            <h1 className="
                                text-3xl
                                font-black
                            ">
                                {queue.name}
                            </h1>

                            <p className="
                                mt-2
                                text-xs
                                text-zinc-600
                            ">
                                Queue #{queue.id}
                            </p>

                        </div>


                        {isOpen && (
                            <span className="
                                rounded-full
                                bg-emerald-500/10
                                px-3
                                py-2
                                text-[9px]
                                font-black
                                text-emerald-400
                            ">
                                ● QUEUE OPEN
                            </span>
                        )}

                        {isPaused && (
                            <span className="
                                rounded-full
                                bg-yellow-500/10
                                px-3
                                py-2
                                text-[9px]
                                font-black
                                text-yellow-400
                            ">
                                ● QUEUE PAUSED
                            </span>
                        )}

                        {isClosed && (
                            <span className="
                                rounded-full
                                bg-red-500/10
                                px-3
                                py-2
                                text-[9px]
                                font-black
                                text-red-400
                            ">
                                ● QUEUE CLOSED
                            </span>
                        )}

                    </div>


                    <p className="
                        mt-5
                        text-sm
                        text-zinc-500
                    ">
                        {queue.description ||
                            "Join this queue digitally and track your position in real time."
                        }
                    </p>

                </section>


                {/* ERROR */}

                {error && (

                    <div className="
                        mt-5
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        p-4
                        text-sm
                        text-red-400
                    ">
                        {error}
                    </div>
                )}


                {/* STATS */}

                <section className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-4
                ">

                    <Stat
                        label="Waiting"
                        value={
                            waitingTickets.length
                        }
                    />

                    <Stat
                        label="Now Serving"
                        value={
                            currentServing ?? "--"
                        }
                    />

                    <Stat
                        label="Tickets"
                        value={
                            queue.lastNumber ?? 0
                        }
                    />

                    <Stat
                        label="Estimated"
                        value={
                            myTicket
                                ? `${estimatedWait} min`
                                : `${waitingTickets.length * 3} min`
                        }
                    />

                </section>


                {/* =================================================
                    USER TICKET
                ================================================= */}

                {myTicket && (

                    <section className="
                        mt-5
                        overflow-hidden
                        rounded-3xl
                        border
                        border-cyan-500/20
                        bg-zinc-900
                    ">

                        <div className="p-6">

                            <div className="
                                flex
                                items-center
                                justify-between
                            ">

                                <div>

                                    <p className="
                                        text-xs
                                        font-black
                                        uppercase
                                        text-cyan-400
                                    ">
                                        Your Ticket
                                    </p>

                                    <p className="
                                        mt-1
                                        text-xs
                                        text-zinc-600
                                    ">
                                        Keep this page open
                                    </p>

                                </div>


                                <span className="
                                    rounded-full
                                    bg-emerald-500/10
                                    px-3
                                    py-2
                                    text-[9px]
                                    font-black
                                    text-emerald-400
                                ">
                                    {String(
                                        myTicket.status
                                    ).toUpperCase()}
                                </span>

                            </div>


                            <div className="
                                py-10
                                text-center
                            ">

                                <p className="
                                    text-xs
                                    uppercase
                                    tracking-[0.3em]
                                    text-zinc-600
                                ">
                                    Ticket Number
                                </p>

                                <p className="
                                    mt-3
                                    text-7xl
                                    font-black
                                    text-cyan-400
                                ">
                                    {myTicket.ticketNumber}
                                </p>

                            </div>


                            <div className="
                                grid
                                grid-cols-2
                                gap-5
                                border-t
                                border-dashed
                                border-zinc-700
                                pt-6
                                sm:grid-cols-4
                            ">

                                <TicketInfo
                                    label="Position"
                                    value={
                                        myTicket.status ===
                                        "SERVING"
                                            ? "Now"
                                            : `#${peopleAhead + 1}`
                                    }
                                />

                                <TicketInfo
                                    label="Ahead"
                                    value={
                                        myTicket.status ===
                                        "SERVING"
                                            ? 0
                                            : peopleAhead
                                    }
                                />

                                <TicketInfo
                                    label="Now Serving"
                                    value={
                                        currentServing ?? "--"
                                    }
                                />

                                <TicketInfo
                                    label="Wait"
                                    value={
                                        myTicket.status ===
                                        "SERVING"
                                            ? "Now"
                                            : estimatedWait === 0
                                                ? "Next"
                                                : `~${estimatedWait}m`
                                    }
                                />

                            </div>

                        </div>


                        <div className="
                            border-t
                            border-zinc-800
                            p-5
                        ">

                            <button
                                onClick={openTicket}
                                className="
                                    w-full
                                    rounded-xl
                                    bg-cyan-600
                                    py-4
                                    text-sm
                                    font-black
                                "
                            >
                                Track My Ticket →
                            </button>


                            <button
                                onClick={
                                    openDisplayBoard
                                }
                                className="
                                    mt-3
                                    w-full
                                    rounded-xl
                                    border
                                    border-cyan-500/30
                                    py-4
                                    text-sm
                                    font-bold
                                    text-cyan-400
                                "
                            >
                                View Live Display Board ↗
                            </button>


                            {String(
                                    myTicket.status
                                ).toUpperCase() ===
                                "WAITING" && (

                                    <button
                                        onClick={() =>
                                            setShowCancelConfirm(
                                                true
                                            )
                                        }
                                        className="
                                        mt-3
                                        w-full
                                        rounded-xl
                                        border
                                        border-red-500/20
                                        py-3
                                        text-sm
                                        font-bold
                                        text-red-400
                                    "
                                    >
                                        Cancel Ticket
                                    </button>
                                )}

                        </div>

                    </section>
                )}


                {/* =================================================
                    GUEST / USER JOIN SECTION
                ================================================= */}

                {!myTicket && (

                    <section className="
                        mt-5
                        rounded-3xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        p-8
                        text-center
                    ">

                        <div className="text-4xl">
                            🎟️
                        </div>


                        {!user ? (

                            <>
                                <h2 className="
                                    mt-4
                                    text-xl
                                    font-black
                                ">
                                    Login required
                                </h2>

                                <p className="
                                    mx-auto
                                    mt-2
                                    max-w-md
                                    text-sm
                                    leading-6
                                    text-zinc-500
                                ">
                                    You can view this queue
                                    as a guest, but you must
                                    login to join the queue.
                                </p>


                                <button
                                    onClick={() =>
                                        navigate(
                                            "/login",
                                            {
                                                state: {
                                                    from: {
                                                        pathname:
                                                            `/queue/${queueId}`
                                                    }
                                                }
                                            }
                                        )
                                    }
                                    className="
                                        mt-6
                                        w-full
                                        rounded-xl
                                        bg-purple-600
                                        py-4
                                        text-sm
                                        font-black
                                        transition
                                        hover:bg-purple-500
                                        sm:max-w-md
                                    "
                                >
                                    Login to Join Queue
                                </button>
                            </>

                        ) : (

                            <>
                                <h2 className="
                                    mt-4
                                    text-xl
                                    font-black
                                ">
                                    Ready to join?
                                </h2>

                                <p className="
                                    mt-2
                                    text-sm
                                    text-zinc-600
                                ">
                                    Get a digital ticket and
                                    track your position.
                                </p>


                                <button
                                    onClick={
                                        handleJoinQueue
                                    }
                                    disabled={
                                        !isOpen ||
                                        joining
                                    }
                                    className="
                                        mt-6
                                        w-full
                                        rounded-xl
                                        bg-cyan-600
                                        py-4
                                        text-sm
                                        font-black
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                        sm:max-w-md
                                    "
                                >
                                    {joining
                                        ? "Getting your ticket..."
                                        : isPaused
                                            ? "Queue Paused"
                                            : isClosed
                                                ? "Queue Closed"
                                                : "🎟 Join Queue"
                                    }
                                </button>
                            </>

                        )}

                    </section>
                )}


                {/* LIVE */}

                <section className="
                    mt-5
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900/50
                    p-5
                ">

                    <p className="
                        text-sm
                        font-bold
                    ">
                        📡 Live updates
                    </p>

                    <p className="
                        mt-1
                        text-xs
                        text-zinc-600
                    ">
                        {connected
                            ? "Connected — queue changes appear automatically."
                            : "Reconnecting to the queue..."
                        }
                    </p>

                </section>


                <button
                    onClick={() =>
                        navigate("/join")
                    }
                    className="
                        mt-5
                        w-full
                        rounded-xl
                        border
                        border-zinc-800
                        py-4
                        text-sm
                        text-zinc-500
                    "
                >
                    ← Back to Queues
                </button>

            </main>


            {/* =================================================
                CANCEL MODAL
            ================================================= */}

            {showCancelConfirm && (

                <div className="
                    fixed
                    inset-0
                    z-50
                    flex
                    items-center
                    justify-center
                    bg-black/70
                    px-5
                ">

                    <div className="
                        w-full
                        max-w-sm
                        rounded-3xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        p-6
                    ">

                        <h2 className="
                            text-xl
                            font-black
                        ">
                            Cancel your ticket?
                        </h2>

                        <p className="
                            mt-2
                            text-sm
                            text-zinc-500
                        ">
                            You will lose your current
                            position in the queue.
                        </p>


                        <div className="
                            mt-6
                            flex
                            gap-3
                        ">

                            <button
                                onClick={() =>
                                    setShowCancelConfirm(
                                        false
                                    )
                                }
                                disabled={cancelling}
                                className="
                                    flex-1
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    py-3
                                    text-sm
                                "
                            >
                                Keep
                            </button>


                            <button
                                onClick={
                                    handleCancelTicket
                                }
                                disabled={cancelling}
                                className="
                                    flex-1
                                    rounded-xl
                                    bg-red-600
                                    py-3
                                    text-sm
                                    font-bold
                                    disabled:opacity-50
                                "
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Cancel"
                                }
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}


// =====================================================
// STAT
// =====================================================

function Stat({
                  label,
                  value
              }) {

    return (

        <div className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            p-4
        ">

            <p className="
                text-[9px]
                uppercase
                text-zinc-600
            ">
                {label}
            </p>

            <p className="
                mt-2
                text-2xl
                font-black
            ">
                {value}
            </p>

        </div>
    );
}


// =====================================================
// TICKET INFO
// =====================================================

function TicketInfo({
                        label,
                        value
                    }) {

    return (

        <div>

            <p className="
                text-[9px]
                uppercase
                text-zinc-600
            ">
                {label}
            </p>

            <p className="
                mt-1
                text-sm
                font-black
            ">
                {value}
            </p>

        </div>
    );
}


export default UserQueue;