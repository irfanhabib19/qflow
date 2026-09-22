import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getQueueById,
    getAllTickets,
    callNext,
    completeCurrentTicket,
    cancelTicket,
    pauseQueue,
    resumeQueue,
    closeQueue,
    getCounters,
    createCounter,
    activateCounter,
    deactivateCounter
} from "../services/queueApi.jsx";


function QueueAdmin() {

    const { queueId } = useParams();
    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [queue, setQueue] = useState(null);

    const [tickets, setTickets] = useState([]);

    const [counters, setCounters] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    const [counterLoading, setCounterLoading] = useState(null);

    const [ticketLoading, setTicketLoading] = useState(null);


    // ==========================================
    // CREATE COUNTER MODAL
    // ==========================================

    const [showCounterModal, setShowCounterModal] =
        useState(false);

    const [counterNumber, setCounterNumber] =
        useState("");

    const [creatingCounter, setCreatingCounter] =
        useState(false);

    const [counterError, setCounterError] =
        useState("");


    // ==========================================
    // LOAD DATA
    // ==========================================

    async function loadData(initial = false) {

        try {

            if (initial) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");


            const [
                queueData,
                ticketData,
                counterData
            ] = await Promise.all([

                getQueueById(queueId),

                getAllTickets(queueId),

                getCounters(queueId)

            ]);


            setQueue(queueData);


            setTickets(
                Array.isArray(ticketData)
                    ? ticketData
                    : []
            );


            setCounters(
                Array.isArray(counterData)
                    ? counterData
                    : []
            );

        } catch (err) {

            console.error(
                "Queue admin loading error:",
                err
            );

            setError(
                err.message ||
                "Failed to load queue data."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        if (!queueId) {
            return;
        }

        loadData(true);

    }, [queueId]);


    // ==========================================
    // STATISTICS
    // ==========================================

    const statistics = useMemo(() => {

        const waiting =
            tickets.filter(
                ticket =>
                    ticket.status === "WAITING"
            ).length;


        const serving =
            tickets.filter(
                ticket =>
                    ticket.status === "SERVING"
            ).length;


        const served =
            tickets.filter(
                ticket =>
                    ticket.status === "SERVED"
            ).length;


        const cancelled =
            tickets.filter(
                ticket =>
                    ticket.status === "CANCELLED"
            ).length;


        return {
            total: tickets.length,
            waiting,
            serving,
            served,
            cancelled
        };

    }, [tickets]);


    // ==========================================
    // QUEUE STATUS
    // ==========================================

    const status =
        queue?.status?.toUpperCase() ||
        "UNKNOWN";


    const queueOpen =
        status === "OPEN";


    const queuePaused =
        status === "PAUSED";


    const queueClosed =
        status === "CLOSED";


    // ==========================================
    // CURRENT TICKET FOR COUNTER
    // ==========================================

    function getCurrentTicket(counterNumber) {

        return tickets.find(
            ticket =>

                ticket.status === "SERVING" &&

                Number(ticket.counterNumber) ===
                Number(counterNumber)

        ) || null;

    }


    // ==========================================
    // CALL NEXT
    // ==========================================

    async function handleCallNext(counterNumber) {

        try {

            setCounterLoading(counterNumber);

            setError("");


            await callNext(
                queueId,
                counterNumber
            );


            await loadData();

        } catch (err) {

            console.error(
                "Call next error:",
                err
            );

            setError(
                err.message ||
                "Failed to call next ticket."
            );

        } finally {

            setCounterLoading(null);

        }

    }


    // ==========================================
    // COMPLETE
    // ==========================================

    async function handleComplete(counterNumber) {

        try {

            setCounterLoading(counterNumber);

            setError("");


            await completeCurrentTicket(
                queueId,
                counterNumber
            );


            await loadData();

        } catch (err) {

            console.error(
                "Complete ticket error:",
                err
            );

            setError(
                err.message ||
                "Failed to complete ticket."
            );

        } finally {

            setCounterLoading(null);

        }

    }


    // ==========================================
    // CANCEL TICKET
    // ==========================================

    async function handleCancel(ticket) {

        if (ticket.status !== "WAITING") {
            return;
        }


        const confirmed =
            window.confirm(
                `Cancel ticket #${ticket.ticketNumber}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setTicketLoading(ticket.id);

            setError("");


            await cancelTicket(
                queueId,
                ticket.id
            );


            await loadData();

        } catch (err) {

            console.error(
                "Cancel ticket error:",
                err
            );

            setError(
                err.message ||
                "Failed to cancel ticket."
            );

        } finally {

            setTicketLoading(null);

        }

    }


    // ==========================================
    // PAUSE QUEUE
    // ==========================================

    async function handlePause() {

        try {

            setActionLoading(true);

            setError("");


            await pauseQueue(queueId);

            await loadData();

        } catch (err) {

            console.error(
                "Pause queue error:",
                err
            );

            setError(
                err.message ||
                "Failed to pause queue."
            );

        } finally {

            setActionLoading(false);

        }

    }


    // ==========================================
    // RESUME QUEUE
    // ==========================================

    async function handleResume() {

        try {

            setActionLoading(true);

            setError("");


            await resumeQueue(queueId);

            await loadData();

        } catch (err) {

            console.error(
                "Resume queue error:",
                err
            );

            setError(
                err.message ||
                "Failed to resume queue."
            );

        } finally {

            setActionLoading(false);

        }

    }


    // ==========================================
    // CLOSE QUEUE
    // ==========================================

    async function handleClose() {

        const confirmed =
            window.confirm(
                "Are you sure you want to close this queue?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setActionLoading(true);

            setError("");


            await closeQueue(queueId);

            await loadData();

        } catch (err) {

            console.error(
                "Close queue error:",
                err
            );

            setError(
                err.message ||
                "Failed to close queue."
            );

        } finally {

            setActionLoading(false);

        }

    }


    // ==========================================
    // OPEN COUNTER MODAL
    // ==========================================

    function openCounterModal() {

        setCounterNumber("");

        setCounterError("");

        setShowCounterModal(true);

    }


    // ==========================================
    // CLOSE COUNTER MODAL
    // ==========================================

    function closeCounterModal() {

        if (creatingCounter) {
            return;
        }

        setShowCounterModal(false);

        setCounterNumber("");

        setCounterError("");

    }


    // ==========================================
    // CREATE COUNTER
    // ==========================================

    async function handleCreateCounter(event) {

        event.preventDefault();


        const number =
            Number(counterNumber);


        if (!number || number <= 0) {

            setCounterError(
                "Enter a valid counter number."
            );

            return;

        }


        const alreadyExists =
            counters.some(
                counter =>
                    Number(counter.counterNumber) ===
                    number
            );


        if (alreadyExists) {

            setCounterError(
                `Counter ${number} already exists.`
            );

            return;

        }


        try {

            setCreatingCounter(true);

            setCounterError("");


            await createCounter(
                queueId,
                number
            );


            setShowCounterModal(false);

            setCounterNumber("");

            setCounterError("");


            await loadData();

        } catch (err) {

            console.error(
                "Create counter error:",
                err
            );

            setCounterError(
                err.message ||
                "Failed to create counter."
            );

        } finally {

            setCreatingCounter(false);

        }

    }


    // ==========================================
    // ACTIVATE / DEACTIVATE COUNTER
    // ==========================================

    async function handleToggleCounter(counter) {

        try {

            setCounterLoading(counter.id);

            setError("");


            const counterStatus =
                counter.status?.toUpperCase();


            // AVAILABLE -> OFFLINE

            if (
                counterStatus === "AVAILABLE"
            ) {

                await deactivateCounter(
                    queueId,
                    counter.id
                );

            }


            // OFFLINE -> AVAILABLE

            else if (
                counterStatus === "OFFLINE"
            ) {

                await activateCounter(
                    queueId,
                    counter.id
                );

            }


            // SERVING

            else if (
                counterStatus === "SERVING"
            ) {

                setError(
                    "This counter is currently serving a ticket. Complete the ticket before taking the counter offline."
                );

                return;

            }


            await loadData();

        } catch (err) {

            console.error(
                "Counter update error:",
                err
            );

            setError(
                err.message ||
                "Failed to update counter."
            );

        } finally {

            setCounterLoading(null);

        }

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
            ">

                <div className="text-center">

                    <div className="
                        mx-auto
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-cyan-500/20
                        bg-cyan-500/10
                        text-3xl
                    ">
                        🔥
                    </div>


                    <h2 className="
                        mt-5
                        text-lg
                        font-bold
                    ">
                        QFlow
                    </h2>


                    <p className="
                        mt-1
                        text-xs
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
                px-5
                flex
                items-center
                justify-center
                text-white
            ">

                <div className="
                    w-full
                    max-w-md
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-8
                    text-center
                ">

                    <div className="text-4xl">
                        ⚠️
                    </div>


                    <h2 className="
                        mt-4
                        text-xl
                        font-bold
                    ">
                        Unable to load queue
                    </h2>


                    <p className="
                        mt-2
                        text-sm
                        text-zinc-500
                    ">
                        {error ||
                            "Unable to load this queue."
                        }
                    </p>


                    <button
                        onClick={() =>
                            navigate("/admin")
                        }
                        className="
                            mt-6
                            rounded-xl
                            bg-cyan-600
                            px-5
                            py-3
                            text-xs
                            font-bold
                            text-white
                            transition
                            hover:bg-cyan-500
                        "
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </div>

        );

    }


    // ==========================================
    // MAIN
    // ==========================================

    return (

        <div className="
            min-h-screen
            bg-[#07090d]
            text-white
        ">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="
                sticky
                top-0
                z-40
                border-b
                border-zinc-800/80
                bg-[#07090d]/90
                backdrop-blur-xl
            ">

                <div className="
                    mx-auto
                    flex
                    max-w-7xl
                    items-center
                    justify-between
                    px-5
                    py-4
                    sm:px-8
                ">

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        <button
                            onClick={() =>
                                navigate("/admin")
                            }
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-zinc-800
                                bg-zinc-900
                                text-zinc-400
                                transition
                                hover:border-zinc-700
                                hover:text-white
                            "
                        >
                            ←
                        </button>


                        <div>

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">

                                <span className="text-lg">
                                    🔥
                                </span>


                                <span className="
                                    font-bold
                                    text-cyan-400
                                ">
                                    QFlow
                                </span>


                                <span className="
                                    rounded-full
                                    border
                                    border-zinc-800
                                    bg-zinc-900
                                    px-2
                                    py-0.5
                                    text-[8px]
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-zinc-500
                                ">
                                    Admin
                                </span>

                            </div>


                            <p className="
                                mt-0.5
                                text-[10px]
                                text-zinc-600
                            ">
                                Queue Operations
                            </p>

                        </div>

                    </div>


                    <button
                        onClick={() =>
                            loadData()
                        }
                        disabled={refreshing}
                        className="
                            flex
                            h-9
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            px-3
                            text-[10px]
                            font-semibold
                            text-zinc-400
                            transition
                            hover:border-zinc-700
                            hover:text-white
                            disabled:opacity-50
                        "
                    >

                        <span className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }>
                            ↻
                        </span>

                        Refresh

                    </button>

                </div>

            </header>


            {/* ==================================
                MAIN
            ================================== */}

            <main className="
                mx-auto
                max-w-7xl
                px-5
                py-7
                sm:px-8
                sm:py-10
            ">


                {/* ERROR */}

                {error && (

                    <div className="
                        mb-6
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/5
                        p-4
                    ">

                        <span>⚠️</span>


                        <div className="flex-1">

                            <p className="
                                text-xs
                                font-bold
                                text-red-400
                            ">
                                Something went wrong
                            </p>


                            <p className="
                                mt-1
                                text-[11px]
                                text-red-400/70
                            ">
                                {error}
                            </p>

                        </div>


                        <button
                            onClick={() =>
                                setError("")
                            }
                            className="
                                text-zinc-600
                                hover:text-white
                            "
                        >
                            ✕
                        </button>

                    </div>

                )}


                {/* ==================================
                    QUEUE HERO
                ================================== */}

                <section className="
                    relative
                    mb-7
                    overflow-hidden
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-gradient-to-br
                    from-zinc-900
                    via-zinc-900
                    to-cyan-950/20
                    p-6
                    sm:p-8
                ">

                    <div className="
                        absolute
                        -right-20
                        -top-20
                        h-60
                        w-60
                        rounded-full
                        bg-cyan-500/5
                        blur-3xl
                    " />


                    <div className="
                        relative
                        flex
                        flex-col
                        gap-6
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    ">

                        <div>

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">

                                <span className="
                                    rounded-full
                                    bg-cyan-500/10
                                    px-2.5
                                    py-1
                                    text-[8px]
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-cyan-400
                                ">
                                    Queue #{queue.id}
                                </span>


                                <span className={`
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-[8px]
                                    font-bold
                                    ${
                                    status === "OPEN"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : status === "PAUSED"
                                            ? "bg-yellow-500/10 text-yellow-400"
                                            : "bg-red-500/10 text-red-400"
                                }
                                `}>
                                    ● {status}
                                </span>

                            </div>


                            <h1 className="
                                mt-4
                                text-3xl
                                font-black
                                tracking-tight
                                sm:text-4xl
                            ">
                                {queue.name}
                            </h1>


                            <p className="
                                mt-2
                                max-w-2xl
                                text-sm
                                leading-6
                                text-zinc-500
                            ">
                                {queue.description ||
                                    "Manage customers, counters and ticket flow from one place."
                                }
                            </p>

                        </div>


                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                rounded-2xl
                                border
                                border-cyan-500/20
                                bg-cyan-500/5
                                px-6
                                py-4
                                text-center
                            ">

                                <p className="
                                    text-[8px]
                                    uppercase
                                    tracking-widest
                                    text-zinc-600
                                ">
                                    Current
                                </p>


                                <p className="
                                    mt-1
                                    text-3xl
                                    font-black
                                    text-cyan-400
                                ">
                                    #{queue.currentNumber ?? 0}
                                </p>

                            </div>


                            <div className="
                                rounded-2xl
                                border
                                border-emerald-500/20
                                bg-emerald-500/5
                                px-6
                                py-4
                                text-center
                            ">

                                <p className="
                                    text-[8px]
                                    uppercase
                                    tracking-widest
                                    text-zinc-600
                                ">
                                    Waiting
                                </p>


                                <p className="
                                    mt-1
                                    text-3xl
                                    font-black
                                    text-emerald-400
                                ">
                                    {statistics.waiting}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================
                    STATISTICS
                ================================== */}

                <section className="
                    mb-7
                    grid
                    grid-cols-2
                    gap-3
                    md:grid-cols-4
                ">

                    <StatCard
                        label="Total Tickets"
                        value={statistics.total}
                        icon="🎟️"
                    />


                    <StatCard
                        label="Waiting"
                        value={statistics.waiting}
                        icon="🟢"
                        accent="green"
                    />


                    <StatCard
                        label="Serving"
                        value={statistics.serving}
                        icon="🔵"
                        accent="blue"
                    />


                    <StatCard
                        label="Completed"
                        value={statistics.served}
                        icon="✅"
                        accent="red"
                    />

                </section>


                {/* ==================================
                    COUNTERS
                ================================== */}

                <section className="mb-7">

                    <div className="
                        mb-5
                        flex
                        items-end
                        justify-between
                        gap-4
                    ">

                        <div>

                            <p className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-cyan-500
                            ">
                                Service Operations
                            </p>


                            <h2 className="
                                mt-1
                                text-2xl
                                font-black
                            ">
                                Counters
                            </h2>


                            <p className="
                                mt-1
                                text-xs
                                text-zinc-600
                            ">
                                Control your active service counters.
                            </p>

                        </div>


                        <button
                            onClick={
                                openCounterModal
                            }
                            disabled={queueClosed}
                            className="
                                rounded-xl
                                bg-cyan-600
                                px-4
                                py-2.5
                                text-[10px]
                                font-bold
                                text-white
                                shadow-lg
                                shadow-cyan-950/30
                                transition
                                hover:bg-cyan-500
                                disabled:cursor-not-allowed
                                disabled:opacity-30
                            "
                        >
                            ＋ Add Counter
                        </button>

                    </div>


                    {counters.length === 0 ? (

                        <div className="
                            rounded-3xl
                            border
                            border-dashed
                            border-zinc-800
                            bg-zinc-900/40
                            px-6
                            py-16
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
                                🎯
                            </div>


                            <h3 className="
                                mt-5
                                text-base
                                font-bold
                                text-zinc-300
                            ">
                                No counters yet
                            </h3>


                            <p className="
                                mx-auto
                                mt-2
                                max-w-sm
                                text-xs
                                leading-5
                                text-zinc-600
                            ">
                                Create your first service counter
                                to start serving customers.
                            </p>


                            <button
                                onClick={
                                    openCounterModal
                                }
                                disabled={queueClosed}
                                className="
                                    mt-6
                                    rounded-xl
                                    bg-cyan-600
                                    px-5
                                    py-3
                                    text-xs
                                    font-bold
                                    text-white
                                    hover:bg-cyan-500
                                    disabled:opacity-30
                                "
                            >
                                ＋ Create First Counter
                            </button>

                        </div>

                    ) : (

                        <div className="
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-2
                            xl:grid-cols-3
                        ">

                            {counters.map(
                                counter => {

                                    const currentTicket =
                                        getCurrentTicket(
                                            counter.counterNumber
                                        );


                                    const loadingCounter =
                                        counterLoading ===
                                        counter.id;


                                    return (

                                        <CounterCard
                                            key={counter.id}
                                            counter={counter}
                                            currentTicket={
                                                currentTicket
                                            }
                                            loading={
                                                loadingCounter
                                            }
                                            queueOpen={
                                                queueOpen
                                            }
                                            onCallNext={
                                                handleCallNext
                                            }
                                            onComplete={
                                                handleComplete
                                            }
                                            onToggle={
                                                handleToggleCounter
                                            }
                                        />

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================
                    TICKETS
                ================================== */}

                <section className="
                    mb-7
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-900/40
                    p-5
                    sm:p-7
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div>

                            <p className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-cyan-500
                            ">
                                Customer Flow
                            </p>


                            <h2 className="
                                mt-1
                                text-2xl
                                font-black
                            ">
                                Tickets
                            </h2>

                        </div>


                        <span className="
                            rounded-full
                            border
                            border-zinc-800
                            bg-zinc-900
                            px-3
                            py-1.5
                            text-[9px]
                            font-bold
                            text-zinc-500
                        ">
                            {statistics.total} tickets
                        </span>

                    </div>


                    {tickets.length === 0 ? (

                        <div className="
                            mt-6
                            rounded-2xl
                            border
                            border-dashed
                            border-zinc-800
                            py-12
                            text-center
                        ">

                            <div className="text-3xl">
                                🎟️
                            </div>


                            <p className="
                                mt-3
                                text-xs
                                text-zinc-600
                            ">
                                No customers have joined yet.
                            </p>

                        </div>

                    ) : (

                        <div className="
                            mt-6
                            grid
                            grid-cols-2
                            gap-3
                            sm:grid-cols-3
                            lg:grid-cols-5
                            xl:grid-cols-6
                        ">

                            {tickets
                                .slice()
                                .sort(
                                    (a, b) =>
                                        Number(a.ticketNumber) -
                                        Number(b.ticketNumber)
                                )
                                .map(ticket => (

                                    <TicketCard
                                        key={ticket.id}
                                        ticket={ticket}
                                        loading={
                                            ticketLoading ===
                                            ticket.id
                                        }
                                        queueOpen={
                                            queueOpen
                                        }
                                        onCancel={
                                            handleCancel
                                        }
                                    />

                                ))}

                        </div>

                    )}

                </section>


                {/* ==================================
                    QUEUE CONTROLS
                ================================== */}

                <section className="
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-900/40
                    p-5
                    sm:p-7
                ">

                    <p className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.2em]
                        text-cyan-500
                    ">
                        Administration
                    </p>


                    <h2 className="
                        mt-1
                        text-2xl
                        font-black
                    ">
                        Queue Controls
                    </h2>


                    <div className="
                        mt-6
                        flex
                        flex-wrap
                        gap-3
                    ">

                        <button
                            disabled={
                                actionLoading ||
                                !queueOpen
                            }
                            onClick={
                                handlePause
                            }
                            className="
                                rounded-xl
                                border
                                border-yellow-500/20
                                bg-yellow-500/10
                                px-5
                                py-3
                                text-xs
                                font-bold
                                text-yellow-400
                                transition
                                hover:bg-yellow-500/20
                                disabled:cursor-not-allowed
                                disabled:opacity-30
                            "
                        >
                            ⏸ Pause Queue
                        </button>


                        <button
                            disabled={
                                actionLoading ||
                                !queuePaused
                            }
                            onClick={
                                handleResume
                            }
                            className="
                                rounded-xl
                                border
                                border-emerald-500/20
                                bg-emerald-500/10
                                px-5
                                py-3
                                text-xs
                                font-bold
                                text-emerald-400
                                transition
                                hover:bg-emerald-500/20
                                disabled:cursor-not-allowed
                                disabled:opacity-30
                            "
                        >
                            ▶ Resume Queue
                        </button>


                        <button
                            disabled={
                                actionLoading ||
                                queueClosed
                            }
                            onClick={
                                handleClose
                            }
                            className="
                                rounded-xl
                                border
                                border-red-500/20
                                bg-red-500/10
                                px-5
                                py-3
                                text-xs
                                font-bold
                                text-red-400
                                transition
                                hover:bg-red-500/20
                                disabled:cursor-not-allowed
                                disabled:opacity-30
                            "
                        >
                            🔒 Close Queue
                        </button>

                    </div>

                </section>


                {/* ==================================
                    FOOTER
                ================================== */}

                <footer className="
                    py-10
                    text-center
                ">

                    <p className="
                        text-[9px]
                        uppercase
                        tracking-widest
                        text-zinc-700
                    ">
                        QFlow · Queue Management System
                    </p>

                </footer>

            </main>


            {/* ==========================================
                CREATE COUNTER MODAL
            ========================================== */}

            {showCounterModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/80
                        px-4
                        backdrop-blur-md
                    "
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCounterModal();
                        }

                    }}
                >

                    <form
                        onSubmit={
                            handleCreateCounter
                        }
                        className="
                            w-full
                            max-w-md
                            rounded-3xl
                            border
                            border-zinc-800
                            bg-[#101217]
                            p-6
                            shadow-2xl
                            shadow-black
                        "
                    >

                        <div className="
                            flex
                            items-start
                            justify-between
                        ">

                            <div>

                                <span className="
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.2em]
                                    text-cyan-400
                                ">
                                    Counter Setup
                                </span>


                                <h2 className="
                                    mt-2
                                    text-2xl
                                    font-black
                                ">
                                    Add Counter
                                </h2>


                                <p className="
                                    mt-1
                                    text-xs
                                    text-zinc-600
                                ">
                                    Create a service counter for
                                    this queue.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeCounterModal
                                }
                                disabled={
                                    creatingCounter
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-zinc-900
                                    text-zinc-500
                                    transition
                                    hover:bg-zinc-800
                                    hover:text-white
                                "
                            >
                                ✕
                            </button>

                        </div>


                        {counterError && (

                            <div className="
                                mt-5
                                rounded-xl
                                border
                                border-red-500/20
                                bg-red-500/5
                                p-3
                                text-xs
                                text-red-400
                            ">
                                ⚠️ {counterError}
                            </div>

                        )}


                        <div className="mt-6">

                            <label className="
                                mb-2
                                block
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-zinc-500
                            ">
                                Counter Number
                            </label>


                            <input
                                type="number"
                                min="1"
                                value={
                                    counterNumber
                                }
                                onChange={event =>
                                    setCounterNumber(
                                        event.target.value
                                    )
                                }
                                placeholder="Example: 1"
                                disabled={
                                    creatingCounter
                                }
                                autoFocus
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-zinc-800
                                    bg-zinc-950
                                    px-4
                                    py-4
                                    text-sm
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-cyan-500
                                    focus:ring-4
                                    focus:ring-cyan-500/10
                                    disabled:opacity-50
                                "
                            />


                            <p className="
                                mt-2
                                text-[10px]
                                text-zinc-700
                            ">
                                Example: Counter 1, Counter 2,
                                Counter 3
                            </p>

                        </div>


                        <div className="
                            mt-6
                            flex
                            gap-3
                        ">

                            <button
                                type="button"
                                onClick={
                                    closeCounterModal
                                }
                                disabled={
                                    creatingCounter
                                }
                                className="
                                    flex-1
                                    rounded-xl
                                    border
                                    border-zinc-800
                                    bg-zinc-900
                                    px-4
                                    py-3
                                    text-xs
                                    font-bold
                                    text-zinc-400
                                    transition
                                    hover:bg-zinc-800
                                    hover:text-white
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    creatingCounter ||
                                    !counterNumber
                                }
                                className="
                                    flex-1
                                    rounded-xl
                                    bg-cyan-600
                                    px-4
                                    py-3
                                    text-xs
                                    font-bold
                                    text-white
                                    transition
                                    hover:bg-cyan-500
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                {creatingCounter
                                    ? "⏳ Creating..."
                                    : "＋ Create Counter"
                                }
                            </button>

                        </div>

                    </form>

                </div>

            )}

        </div>

    );

}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
                      label,
                      value,
                      icon,
                      accent
                  }) {

    const accentClass =
        accent === "green"
            ? "text-emerald-400"
            : accent === "blue"
                ? "text-blue-400"
                : accent === "red"
                    ? "text-red-400"
                    : "text-cyan-400";


    return (

        <div className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900/50
            p-5
            transition
            hover:border-zinc-700
        ">

            <div className="
                flex
                items-center
                justify-between
            ">

                <span className="text-lg">
                    {icon}
                </span>


                <span className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-zinc-600
                ">
                    {label}
                </span>

            </div>


            <p className={`
                mt-4
                text-3xl
                font-black
                ${accentClass}
            `}>
                {value}
            </p>

        </div>

    );

}


// =====================================================
// COUNTER CARD
// =====================================================

function CounterCard({
                         counter,
                         currentTicket,
                         loading,
                         queueOpen,
                         onCallNext,
                         onComplete,
                         onToggle
                     }) {

    const counterStatus =
        counter.status?.toUpperCase() ||
        "OFFLINE";


    const available =
        counterStatus === "AVAILABLE";


    const serving =
        counterStatus === "SERVING";


    const offline =
        counterStatus === "OFFLINE";


    return (

        <div className={`
            relative
            overflow-hidden
            rounded-3xl
            border
            p-5
            transition
            ${
            offline
                ? "border-zinc-800 bg-zinc-900/40"
                : serving
                    ? "border-blue-500/30 bg-blue-500/[0.04]"
                    : "border-emerald-500/20 bg-emerald-500/[0.025]"
        }
        `}>

            {/* STATUS BAR */}

            <div className={`
                absolute
                left-0
                top-0
                h-1
                w-full
                ${
                offline
                    ? "bg-zinc-700"
                    : serving
                        ? "bg-blue-500"
                        : "bg-emerald-500"
            }
            `} />


            {/* HEADER */}

            <div className="
                flex
                items-center
                justify-between
            ">

                <div>

                    <p className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-zinc-600
                    ">
                        Service Counter
                    </p>


                    <h3 className="
                        mt-1
                        text-xl
                        font-black
                    ">
                        Counter {counter.counterNumber}
                    </h3>

                </div>


                <span className={`
                    rounded-full
                    px-3
                    py-1.5
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${
                    available
                        ? "bg-emerald-500/10 text-emerald-400"
                        : serving
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-zinc-800 text-zinc-500"
                }
                `}>

                    {available && "● Available"}

                    {serving && "● Serving"}

                    {offline && "● Offline"}

                </span>

            </div>


            {/* CURRENT TICKET */}

            <div className="
                my-7
                rounded-2xl
                border
                border-zinc-800
                bg-[#090b0f]
                px-5
                py-6
                text-center
            ">

                <p className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-zinc-600
                ">
                    Currently Serving
                </p>


                <p className={`
                    mt-2
                    text-5xl
                    font-black
                    ${
                    currentTicket
                        ? "text-blue-400"
                        : "text-zinc-800"
                }
                `}>

                    {currentTicket
                        ? `#${currentTicket.ticketNumber}`
                        : "--"
                    }

                </p>


                {serving && (

                    <p className="
                        mt-3
                        text-[9px]
                        font-semibold
                        text-blue-400
                    ">
                        Customer at this counter
                    </p>

                )}


                {available && (

                    <p className="
                        mt-3
                        text-[9px]
                        font-semibold
                        text-emerald-400
                    ">
                        Ready for next customer
                    </p>

                )}


                {offline && (

                    <p className="
                        mt-3
                        text-[9px]
                        font-semibold
                        text-zinc-600
                    ">
                        Counter is offline
                    </p>

                )}

            </div>


            {/* ACTIONS */}

            <div className="
                grid
                grid-cols-2
                gap-2
            ">

                <button
                    disabled={
                        !queueOpen ||
                        !available ||
                        loading
                    }
                    onClick={() =>
                        onCallNext(
                            counter.counterNumber
                        )
                    }
                    className="
                        rounded-xl
                        bg-blue-600
                        px-3
                        py-3
                        text-[10px]
                        font-bold
                        text-white
                        transition
                        hover:bg-blue-500
                        disabled:cursor-not-allowed
                        disabled:opacity-25
                    "
                >

                    {loading
                        ? "⏳"
                        : "📢 Call Next"
                    }

                </button>


                <button
                    disabled={
                        !queueOpen ||
                        !serving ||
                        loading ||
                        !currentTicket
                    }
                    onClick={() =>
                        onComplete(
                            counter.counterNumber
                        )
                    }
                    className="
                        rounded-xl
                        bg-emerald-600
                        px-3
                        py-3
                        text-[10px]
                        font-bold
                        text-white
                        transition
                        hover:bg-emerald-500
                        disabled:cursor-not-allowed
                        disabled:opacity-25
                    "
                >

                    {loading
                        ? "⏳"
                        : "✅ Complete"
                    }

                </button>

            </div>


            {/* COUNTER TOGGLE */}

            {serving ? (

                <div className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-blue-500/20
                    bg-blue-500/5
                    px-3
                    py-2.5
                    text-center
                    text-[9px]
                    font-bold
                    text-blue-400
                ">
                    🔵 Serving a customer
                </div>

            ) : (

                <button
                    disabled={loading}
                    onClick={() =>
                        onToggle(counter)
                    }
                    className={`
                        mt-2
                        w-full
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-[9px]
                        font-bold
                        transition
                        ${
                        available
                            ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400 hover:bg-yellow-500/10"
                            : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                    }
                    `}
                >

                    {loading
                        ? "⏳ Updating..."
                        : available
                            ? "⏸ Set Counter Offline"
                            : "▶ Activate Counter"
                    }

                </button>

            )}

        </div>

    );

}


// =====================================================
// TICKET CARD
// =====================================================

function TicketCard({
                        ticket,
                        loading,
                        queueOpen,
                        onCancel
                    }) {

    const status =
        ticket.status?.toUpperCase();


    const waiting =
        status === "WAITING";


    const serving =
        status === "SERVING";


    const served =
        status === "SERVED";


    const cancelled =
        status === "CANCELLED";


    return (

        <div className={`
            rounded-2xl
            border
            p-4
            ${
            waiting
                ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                : serving
                    ? "border-blue-500/30 bg-blue-500/[0.04]"
                    : served
                        ? "border-red-500/20 bg-red-500/[0.025]"
                        : "border-zinc-800 bg-zinc-900/40"
        }
        `}>

            <div className="text-center">

                <p className={`
                    text-2xl
                    font-black
                    ${
                    waiting
                        ? "text-emerald-400"
                        : serving
                            ? "text-blue-400"
                            : served
                                ? "text-red-400"
                                : "text-zinc-600"
                }
                `}>
                    #{ticket.ticketNumber}
                </p>


                <p className={`
                    mt-1
                    text-[8px]
                    font-bold
                    uppercase
                    ${
                    waiting
                        ? "text-emerald-400"
                        : serving
                            ? "text-blue-400"
                            : served
                                ? "text-red-400"
                                : "text-zinc-600"
                }
                `}>

                    {waiting && "WAITING"}

                    {serving && "SERVING"}

                    {served && "SERVED"}

                    {cancelled && "CANCELLED"}

                </p>


                {serving &&
                    ticket.counterNumber && (

                        <p className="
                            mt-2
                            text-[8px]
                            text-blue-400
                        ">
                            Counter {ticket.counterNumber}
                        </p>

                    )}

            </div>


            {waiting ? (

                <button
                    disabled={
                        !queueOpen ||
                        loading
                    }
                    onClick={() =>
                        onCancel(ticket)
                    }
                    className="
                        mt-4
                        w-full
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/5
                        px-2
                        py-2
                        text-[9px]
                        font-bold
                        text-red-400
                        transition
                        hover:bg-red-500/10
                        disabled:cursor-not-allowed
                        disabled:opacity-25
                    "
                >
                    {loading
                        ? "⏳ Cancelling..."
                        : "❌ Cancel"
                    }
                </button>

            ) : (

                <div className="
                    mt-4
                    rounded-xl
                    bg-zinc-900
                    px-2
                    py-2
                    text-center
                    text-[8px]
                    text-zinc-600
                ">

                    {serving &&
                        "Currently serving"
                    }

                    {served &&
                        "Completed"
                    }

                    {cancelled &&
                        "Cancelled"
                    }

                </div>

            )}

        </div>

    );

}


export default QueueAdmin;