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


function UserQueue() {

    const { queueId } = useParams();

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [queue, setQueue] = useState(null);

    const [tickets, setTickets] = useState([]);

    const [myTicket, setMyTicket] = useState(null);

    const [loading, setLoading] = useState(true);

    const [joining, setJoining] = useState(false);

    const [cancelling, setCancelling] = useState(false);

    const [connected, setConnected] = useState(false);

    const [error, setError] = useState("");

    const [showCancelConfirm, setShowCancelConfirm] =
        useState(false);


    // ==========================================
    // LOAD QUEUE
    // ==========================================

    async function loadQueue() {

        try {

            const data = await getQueueById(queueId);

            setQueue(data);

        } catch (err) {

            console.error(
                "❌ Failed to load queue:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load queue"
            );
        }
    }


    // ==========================================
    // LOAD TICKETS
    // ==========================================

    async function loadTickets() {

        try {

            const data =
                await getAllTickets(queueId);

            const ticketList =
                Array.isArray(data)
                    ? data
                    : [];

            setTickets(ticketList);


            // ==================================
            // RECOVER MY TICKET
            // ==================================

            const savedTicketId =
                localStorage.getItem(
                    `qflow-ticket-${queueId}`
                );


            if (!savedTicketId) {

                setMyTicket(null);

                return;
            }


            const savedTicket =
                ticketList.find(
                    ticket =>
                        String(ticket.id) ===
                        String(savedTicketId)
                );


            if (savedTicket) {

                setMyTicket(savedTicket);

            } else {

                setMyTicket(null);

                localStorage.removeItem(
                    `qflow-ticket-${queueId}`
                );
            }

        } catch (err) {

            console.error(
                "❌ Failed to load tickets:",
                err
            );
        }
    }


    // ==========================================
    // LOAD EVERYTHING
    // ==========================================

    async function loadData() {

        try {

            await Promise.all([
                loadQueue(),
                loadTickets()
            ]);

        } catch (err) {

            console.error(
                "❌ Failed to load queue data:",
                err
            );
        }
    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        if (!queueId) {

            setError("Invalid queue ID.");

            setLoading(false);

            return;
        }


        async function load() {

            setLoading(true);

            setError("");

            await loadData();

            setLoading(false);
        }


        load();

    }, [queueId]);


    // ==========================================
    // WEBSOCKET
    // ==========================================

    useEffect(() => {

        if (!queueId) {
            return;
        }


        console.log(
            "🔌 Connecting UserQueue WebSocket:",
            queueId
        );


        const client =
            createWebSocketClient(

                queueId,

                event => {

                    console.log(
                        "📡 UserQueue event:",
                        event
                    );

                    /*
                     * Whenever something changes
                     * in this queue, reload the
                     * latest state.
                     */

                    loadData();
                },


                () => {

                    console.log(
                        "🟢 UserQueue WebSocket connected"
                    );

                    setConnected(true);
                },


                error => {

                    console.error(
                        "🔴 UserQueue WebSocket error:",
                        error
                    );

                    setConnected(false);
                }
            );


        return () => {

            console.log(
                "🔌 Disconnecting UserQueue WebSocket"
            );

            setConnected(false);


            if (client) {

                client.deactivate();

            }
        };

    }, [queueId]);


    // ==========================================
    // WAITING TICKETS
    // ==========================================

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


    // ==========================================
    // SERVING TICKETS
    // ==========================================

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


    // ==========================================
    // PEOPLE AHEAD
    // ==========================================

    const peopleAhead =
        useMemo(() => {

            if (!myTicket) {
                return 0;
            }


            return waitingTickets.filter(
                ticket =>
                    Number(
                        ticket.ticketNumber
                    ) <
                    Number(
                        myTicket.ticketNumber
                    )
            ).length;

        }, [
            waitingTickets,
            myTicket
        ]);


    // ==========================================
    // ESTIMATED WAIT
    // ==========================================

    const estimatedWait =
        useMemo(() => {

            if (!myTicket) {
                return 0;
            }


            if (peopleAhead <= 0) {
                return 0;
            }


            return peopleAhead * 3;

        }, [
            peopleAhead,
            myTicket
        ]);


    // ==========================================
    // CURRENT SERVING
    // ==========================================

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


    // ==========================================
    // QUEUE STATUS
    // ==========================================

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


    // ==========================================
    // CROWD
    // ==========================================

    function getCrowdInfo(count) {

        if (count <= 5) {

            return {
                label: "Low crowd",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                dot: "bg-emerald-400"
            };
        }


        if (count <= 15) {

            return {
                label: "Moderate",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/20",
                dot: "bg-yellow-400"
            };
        }


        if (count <= 30) {

            return {
                label: "Busy",
                color: "text-orange-400",
                bg: "bg-orange-500/10",
                border: "border-orange-500/20",
                dot: "bg-orange-400"
            };
        }


        return {
            label: "Very busy",
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            dot: "bg-red-400"
        };
    }


    const crowd =
        getCrowdInfo(
            waitingTickets.length
        );


    // ==========================================
    // JOIN QUEUE
    // ==========================================

    async function handleJoinQueue() {

        try {

            setJoining(true);

            setError("");


            const ticket =
                await joinQueue(queueId);


            console.log(
                "🎟 QFlow ticket:",
                ticket
            );


            setMyTicket(ticket);


            // ==================================
            // SAVE TICKET
            // ==================================

            localStorage.setItem(
                `qflow-ticket-${queueId}`,
                String(ticket.id)
            );


            await loadData();


        } catch (err) {

            console.error(
                "❌ Join queue error:",
                err
            );


            if (
                err.response?.status === 401
            ) {

                setError(
                    "Please login before joining a queue."
                );

                return;
            }


            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to join queue"
            );

        } finally {

            setJoining(false);
        }
    }


    // ==========================================
    // OPEN DISPLAY BOARD
    // ==========================================

    function openDisplayBoard() {

        window.open(
            `/display/${queueId}`,
            "_blank",
            "noopener,noreferrer"
        );
    }


    // ==========================================
    // CANCEL TICKET
    // ==========================================

    async function handleCancelTicket() {

        if (!myTicket) {
            return;
        }


        try {

            setCancelling(true);

            setError("");


            const updatedTicket =
                await cancelTicket(
                    queueId,
                    myTicket.id
                );


            console.log(
                "❌ Cancelled ticket:",
                updatedTicket
            );


            setMyTicket(null);


            localStorage.removeItem(
                `qflow-ticket-${queueId}`
            );


            setShowCancelConfirm(false);


            await loadData();


        } catch (err) {

            console.error(
                "❌ Cancel ticket error:",
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


    // ==========================================
    // GO TO TICKET
    // ==========================================

    function openTicket() {

        if (!myTicket) {
            return;
        }


        /*
         * IMPORTANT:
         *
         * App.jsx expects:
         *
         * /ticket/:queueId/:ticketId
         *
         * Therefore we must pass BOTH IDs.
         */

        navigate(
            `/ticket/${queueId}/${myTicket.id}`
        );
    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="
                min-h-screen
                bg-[#07090d]
                text-white
                flex
                items-center
                justify-center
                px-5
            ">

                <div className="text-center">

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


    // ==========================================
    // QUEUE NOT FOUND
    // ==========================================

    if (!queue) {

        return (

            <div className="
                min-h-screen
                bg-[#07090d]
                text-white
                flex
                items-center
                justify-center
                px-5
            ">

                <div className="
                    max-w-md
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

                    <p className="
                        mt-3
                        text-sm
                        text-zinc-600
                    ">
                        This queue may have been
                        removed or is no longer
                        available.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/join")
                        }
                        className="
                            mt-6
                            rounded-2xl
                            bg-cyan-600
                            px-6
                            py-3
                            text-xs
                            font-black
                            transition
                            hover:bg-cyan-500
                        "
                    >
                        Back to queues
                    </button>

                </div>

            </div>
        );
    }


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="
            min-h-screen
            bg-[#07090d]
            text-white
        ">

            {/* HEADER */}

            <header className="
                sticky
                top-0
                z-40
                border-b
                border-zinc-800
                bg-[#07090d]/90
                backdrop-blur-xl
            ">

                <div className="
                    mx-auto
                    max-w-5xl
                    px-5
                    py-4
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <button
                            onClick={() =>
                                navigate("/join")
                            }
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-cyan-500/10
                                text-xl
                            ">
                                ⚡
                            </div>

                            <div className="text-left">

                                <p className="
                                    text-base
                                    font-black
                                    text-cyan-400
                                ">
                                    QFlow
                                </p>

                                <p className="
                                    text-[8px]
                                    uppercase
                                    tracking-[0.2em]
                                    text-zinc-600
                                ">
                                    Smart Queue
                                </p>

                            </div>

                        </button>


                        <div className="
                            flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-emerald-500/20
                            bg-emerald-500/10
                            px-3
                            py-1.5
                            text-[9px]
                            font-black
                            text-emerald-400
                        ">

                            <span className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${
                                connected
                                    ? "animate-pulse bg-emerald-400"
                                    : "bg-red-400"
                            }
                            `} />

                            {connected
                                ? "LIVE"
                                : "OFFLINE"
                            }

                        </div>

                    </div>

                </div>

            </header>


            {/* MAIN */}

            <main className="
                mx-auto
                max-w-5xl
                px-5
                py-7
                sm:py-10
            ">

                <button
                    onClick={() =>
                        navigate("/join")
                    }
                    className="
                        mb-5
                        text-xs
                        font-bold
                        text-zinc-600
                        transition
                        hover:text-white
                    "
                >
                    ← All queues
                </button>


                {/* QUEUE HEADER */}

                <section className="
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-zinc-800
                    bg-gradient-to-br
                    from-zinc-900
                    to-[#0b1720]
                    p-6
                    sm:p-8
                ">

                    <div className="
                        flex
                        flex-col
                        gap-6
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    ">

                        <div>

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-cyan-500/10
                                    text-2xl
                                ">
                                    🎟️
                                </div>

                                <div>

                                    <h1 className="
                                        text-2xl
                                        font-black
                                        sm:text-3xl
                                    ">
                                        {queue.name}
                                    </h1>

                                    <p className="
                                        mt-1
                                        text-[10px]
                                        text-zinc-600
                                    ">
                                        Queue #{queue.id}
                                    </p>

                                </div>

                            </div>

                            <p className="
                                mt-5
                                max-w-xl
                                text-sm
                                leading-6
                                text-zinc-500
                            ">
                                {queue.description ||
                                    "Join this queue digitally and track your position in real time."
                                }
                            </p>

                        </div>


                        <div>

                            {isOpen && (

                                <div className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    bg-emerald-500/10
                                    px-3
                                    py-2
                                    text-[9px]
                                    font-black
                                    uppercase
                                    text-emerald-400
                                ">

                                    <span className="
                                        h-1.5
                                        w-1.5
                                        animate-pulse
                                        rounded-full
                                        bg-emerald-400
                                    " />

                                    Queue Open

                                </div>

                            )}


                            {isPaused && (

                                <div className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          rounded-full
                                          bg-yellow-500/10
                                    px-3
                                    py-2
                                    text-[9px]
                                    font-black
                                    uppercase
                                    text-yellow-400
                                    ">
                                    ● Queue Paused
                                </div>

                            )}


                            {isClosed && (

                                <div className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    bg-red-500/10
                                    px-3
                                    py-2
                                    text-[9px]
                                    font-black
                                    uppercase
                                    text-red-400
                                ">
                                    ● Queue Closed
                                </div>

                            )}

                        </div>

                    </div>

                </section>


                {/* ERROR */}

                {error && (

                    <div className="
                        mt-5
                        rounded-2xl
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

                    <div className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-900/60
                        p-4
                    ">

                        <p className="
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-zinc-600
                        ">
                            Waiting
                        </p>

                        <p className="
                            mt-2
                            text-2xl
                            font-black
                        ">
                            {waitingTickets.length}
                        </p>

                        <div className="
                            mt-2
                            flex
                            items-center
                            gap-1.5
                        ">

                            <span
                                className={`
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    ${crowd.dot}
                                `}
                            />

                            <span
                                className={`
                                    text-[9px]
                                    font-bold
                                    ${crowd.color}
                                `}
                            >
                                {crowd.label}
                            </span>

                        </div>

                    </div>


                    <div className="
                        rounded-2xl
                        border
                        border-blue-500/20
                        bg-blue-500/5
                        p-4
                    ">

                        <p className="
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-zinc-600
                        ">
                            Now Serving
                        </p>

                        <p className="
                            mt-2
                            text-2xl
                            font-black
                            text-blue-400
                        ">
                            {currentServing ?? "--"}
                        </p>

                    </div>


                    <div className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-900/60
                        p-4
                    ">

                        <p className="
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-zinc-600
                        ">
                            Tickets
                        </p>

                        <p className="
                            mt-2
                            text-2xl
                            font-black
                        ">
                            {queue.lastNumber ?? 0}
                        </p>

                        <p className="
                            mt-1
                            text-[9px]
                            text-zinc-600
                        ">
                            issued
                        </p>

                    </div>


                    <div className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-900/60
                        p-4
                    ">

                        <p className="
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-zinc-600
                        ">
                            Estimated
                        </p>

                        <p className="
                            mt-2
                            text-2xl
                            font-black
                        ">
                            {myTicket
                                ? estimatedWait
                                : waitingTickets.length * 3
                            }
                        </p>

                        <p className="
                            mt-1
                            text-[9px]
                            text-zinc-600
                        ">
                            minutes
                        </p>

                    </div>

                </section>


                {/* MY TICKET */}

                {myTicket && (

                    <section className="
                        mt-5
                        overflow-hidden
                        rounded-[2rem]
                        border
                        border-cyan-500/20
                        bg-gradient-to-br
                        from-cyan-500/10
                        via-zinc-900
                        to-zinc-900
                    ">

                        <div className="
                            p-6
                            sm:p-8
                        ">

                            <div className="
                                flex
                                items-center
                                justify-between
                            ">

                                <div>

                                    <p className="
                                        text-[9px]
                                        font-black
                                        uppercase
                                        tracking-[0.2em]
                                        text-cyan-400
                                    ">
                                        Your ticket
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
                                    py-1.5
                                    text-[9px]
                                    font-black
                                    uppercase
                                    text-emerald-400
                                ">
                                    {String(
                                        myTicket.status
                                    ).toUpperCase()}
                                </span>

                            </div>


                            <div className="
                                py-8
                                text-center
                            ">

                                <p className="
                                    text-[10px]
                                    font-bold
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
                                    tracking-tight
                                    text-cyan-400
                                    sm:text-8xl
                                ">
                                    {myTicket.ticketNumber}
                                </p>

                            </div>


                            <div className="
                                border-t
                                border-dashed
                                border-zinc-700
                            " />


                            <div className="
                                grid
                                grid-cols-2
                                gap-4
                                pt-6
                                sm:grid-cols-4
                            ">

                                <TicketInfo
                                    label="Position"
                                    value={
                                        myTicket.status === "SERVING"
                                            ? "Now"
                                            : `#${peopleAhead + 1}`
                                    }
                                />

                                <TicketInfo
                                    label="Ahead"
                                    value={
                                        myTicket.status === "SERVING"
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
                                        myTicket.status === "SERVING"
                                            ? "Now"
                                            : estimatedWait === 0
                                                ? "Next"
                                                : `~${estimatedWait}m`
                                    }
                                />

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="
                            border-t
                            border-zinc-800
                            bg-zinc-950/40
                            p-5
                            sm:p-6
                        ">

                            <button
                                onClick={openTicket}
                                className="
                                    w-full
                                    rounded-2xl
                                    bg-cyan-600
                                    px-5
                                    py-4
                                    text-xs
                                    font-black
                                    transition
                                    hover:bg-cyan-500
                                "
                            >
                                Track My Ticket →
                            </button>


                            <button
                                onClick={openDisplayBoard}
                                className="
                                    mt-3
                                    w-full
                                    rounded-2xl
                                    border
                                    border-cyan-500/30
                                    bg-cyan-500/10
                                    px-5
                                    py-4
                                    text-xs
                                    font-black
                                    text-cyan-400
                                    transition
                                    hover:border-cyan-400/50
                                    hover:bg-cyan-500/20
                                "
                            >
                                View Live Display Board ↗
                            </button>


                            {String(
                                myTicket.status
                            ).toUpperCase() === "WAITING" && (

                                <button
                                    onClick={() =>
                                        setShowCancelConfirm(true)
                                    }
                                    className="
                                        mt-3
                                        w-full
                                        rounded-2xl
                                        border
                                        border-red-500/20
                                        px-5
                                        py-3
                                        text-xs
                                        font-bold
                                        text-red-400
                                        transition
                                        hover:bg-red-500/10
                                    "
                                >
                                    Cancel Ticket
                                </button>

                            )}

                        </div>

                    </section>

                )}


                {/* JOIN CARD */}

                {!myTicket && (

                    <section className="
                        mt-5
                        rounded-[2rem]
                        border
                        border-zinc-800
                        bg-zinc-900/60
                        p-6
                        sm:p-8
                    ">

                        <div className="
                            text-center
                        ">

                            <div className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-cyan-500/10
                                text-3xl
                            ">
                                🎟️
                            </div>

                            <h2 className="
                                mt-5
                                text-xl
                                font-black
                            ">
                                Ready to join?
                            </h2>

                            <p className="
                                mx-auto
                                mt-2
                                max-w-md
                                text-sm
                                leading-6
                                text-zinc-600
                            ">
                                Get a digital ticket and
                                track your position without
                                standing in line.
                            </p>

                            <button
                                disabled={
                                    !isOpen ||
                                    joining
                                }
                                onClick={handleJoinQueue}
                                className="
                                    mt-7
                                    w-full
                                    rounded-2xl
                                    bg-cyan-600
                                    px-6
                                    py-4
                                    text-xs
                                    font-black
                                    transition
                                    hover:bg-cyan-500
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

                        </div>

                    </section>

                )}


                {/* LIVE */}

                <section className="
                    mt-5
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-900/40
                    p-5
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-cyan-500/10
                            text-lg
                        ">
                            📡
                        </div>

                        <div>

                            <p className="
                                text-xs
                                font-bold
                            ">
                                Live updates
                            </p>

                            <p className="
                                mt-1
                                text-[10px]
                                text-zinc-600
                            ">
                                {connected
                                    ? "Connected — queue changes appear automatically."
                                    : "Reconnecting to the queue..."
                                }
                            </p>

                        </div>

                    </div>

                </section>


                <button
                    onClick={() =>
                        navigate("/join")
                    }
                    className="
                        mt-5
                        w-full
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-900/50
                        px-5
                        py-4
                        text-xs
                        font-bold
                        text-zinc-400
                        transition
                        hover:border-zinc-700
                        hover:bg-zinc-900
                        hover:text-white
                    "
                >
                    ← Back to Queues
                </button>


                <footer className="
                    py-10
                    text-center
                ">

                    <p className="
                        text-[9px]
                        uppercase
                        tracking-[0.2em]
                        text-zinc-700
                    ">
                        QFlow · Smart Queue Management
                    </p>

                </footer>

            </main>


            {/* CANCEL MODAL */}

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
                    backdrop-blur-sm
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

                        <div className="text-3xl">
                            ⚠️
                        </div>

                        <h2 className="
                            mt-4
                            text-xl
                            font-black
                        ">
                            Cancel your ticket?
                        </h2>

                        <p className="
                            mt-2
                            text-sm
                            leading-6
                            text-zinc-500
                        ">
                            You will leave the queue and
                            lose your current position.
                        </p>

                        <div className="
                            mt-6
                            flex
                            gap-3
                        ">

                            <button
                                onClick={() =>
                                    setShowCancelConfirm(false)
                                }
                                disabled={cancelling}
                                className="
                                    flex-1
                                    rounded-2xl
                                    border
                                    border-zinc-700
                                    px-4
                                    py-3
                                    text-xs
                                    font-bold
                                    text-zinc-400
                                    transition
                                    hover:text-white
                                "
                            >
                                Keep Ticket
                            </button>

                            <button
                                onClick={handleCancelTicket}
                                disabled={cancelling}
                                className="
                                    flex-1
                                    rounded-2xl
                                    bg-red-600
                                    px-4
                                    py-3
                                    text-xs
                                    font-black
                                    transition
                                    hover:bg-red-500
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


// ==========================================
// TICKET INFO
// ==========================================

function TicketInfo({
                        label,
                        value
                    }) {

    return (

        <div>

            <p className="
                text-[8px]
                font-bold
                uppercase
                tracking-wider
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