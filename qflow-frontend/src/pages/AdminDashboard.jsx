import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getQueues
} from "../services/queueApi.jsx";

import QueueCard
    from "../components/QueueCard.jsx";

import ThemeToggle
    from "../components/ThemeToggle.jsx";


function AdminDashboard() {

    const [queues, setQueues] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    const navigate =
        useNavigate();


    // ==========================================
    // LOAD QUEUES
    // ==========================================

    async function loadQueues(
        initial = false
    ) {

        try {

            if (initial) {

                setLoading(true);

            } else {

                setRefreshing(true);

            }


            setError("");


            const data =
                await getQueues();


            console.log(
                "🔥 QFlow Queues:",
                data
            );


            setQueues(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "❌ Queue loading error:",
                err
            );


            setError(
                err.message ||
                "Failed to load queues"
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

        loadQueues(true);

    }, []);


    // ==========================================
    // OPEN QUEUE
    // ==========================================

    function openQueue(queueId) {

        navigate(
            `/admin/queue/${queueId}`
        );

    }


    // ==========================================
    // STATISTICS
    // ==========================================

    const statistics =
        useMemo(() => {

            const open =
                queues.filter(
                    queue =>
                        queue.status
                            ?.toUpperCase() ===
                        "OPEN"
                ).length;


            const paused =
                queues.filter(
                    queue =>
                        queue.status
                            ?.toUpperCase() ===
                        "PAUSED"
                ).length;


            const closed =
                queues.filter(
                    queue =>
                        queue.status
                            ?.toUpperCase() ===
                        "CLOSED"
                ).length;


            const waiting =
                queues.reduce(
                    (
                        total,
                        queue
                    ) => {

                        return (
                            total +
                            Number(
                                queue.waitingCount ||
                                0
                            )
                        );

                    },
                    0
                );


            return {
                total:
                queues.length,

                open,

                paused,

                closed,

                waiting
            };

        }, [queues]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-slate-50
                px-5
                text-slate-900
                dark:bg-[#080808]
                dark:text-white
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
                        border
                        border-cyan-200
                        bg-cyan-50
                        text-2xl
                        shadow-sm
                        animate-pulse
                        dark:border-cyan-500/20
                        dark:bg-cyan-500/10
                    ">
                        🔥
                    </div>


                    <h2 className="
                        mt-5
                        text-lg
                        font-bold
                    ">
                        Loading QFlow
                    </h2>


                    <p className="
                        mt-1
                        text-xs
                        text-slate-500
                        dark:text-zinc-600
                    ">
                        Preparing your dashboard...
                    </p>

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
            bg-slate-50
            text-slate-900
            transition-colors
            duration-300
            dark:bg-[#080808]
            dark:text-white
        ">


            {/* ==================================
                NAVBAR
            ================================== */}

            <header className="
                sticky
                top-0
                z-40
                border-b
                border-slate-200/80
                bg-white/90
                backdrop-blur-xl
                dark:border-zinc-800/80
                dark:bg-[#080808]/90
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


                    {/* BRAND */}

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
                            border
                            border-cyan-200
                            bg-cyan-50
                            text-lg
                            dark:border-cyan-500/20
                            dark:bg-cyan-500/10
                        ">
                            🔥
                        </div>


                        <div>

                            <h1 className="
                                text-base
                                font-black
                                tracking-tight
                                text-cyan-600
                                dark:text-cyan-400
                            ">
                                QFlow
                            </h1>


                            <p className="
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-slate-400
                                dark:text-zinc-600
                            ">
                                Queue Management
                            </p>

                        </div>

                    </div>


                    {/* RIGHT */}

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">


                        {/* ONLINE */}

                        <div className="
                            hidden
                            items-center
                            gap-2
                            sm:flex
                        ">

                            <span className="
                                h-2
                                w-2
                                rounded-full
                                bg-emerald-400
                                animate-pulse
                            " />


                            <span className="
                                text-[9px]
                                font-semibold
                                text-slate-500
                                dark:text-zinc-500
                            ">
                                SYSTEM ONLINE
                            </span>

                        </div>


                        {/* THEME */}

                        <ThemeToggle />


                        {/* PROFILE */}

                        <button
                            type="button"
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                text-sm
                                shadow-sm
                                transition
                                hover:border-slate-300
                                dark:border-zinc-800
                                dark:bg-zinc-900
                                dark:hover:border-zinc-700
                            "
                        >
                            👤
                        </button>

                    </div>

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


                {/* ==================================
                    HERO
                ================================== */}

                <section className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-cyan-100
                    bg-gradient-to-br
                    from-cyan-50
                    via-white
                    to-slate-50
                    p-6
                    shadow-sm
                    sm:p-8
                    dark:border-zinc-800
                    dark:from-cyan-500/[0.08]
                    dark:via-zinc-900/70
                    dark:to-zinc-900/40
                ">


                    {/* DECORATION */}

                    <div className="
                        pointer-events-none
                        absolute
                        -right-20
                        -top-20
                        h-56
                        w-56
                        rounded-full
                        bg-cyan-400/10
                        blur-3xl
                        dark:bg-cyan-500/10
                    " />


                    <div className="
                        pointer-events-none
                        absolute
                        -bottom-32
                        -left-20
                        h-64
                        w-64
                        rounded-full
                        bg-blue-400/5
                        blur-3xl
                        dark:bg-blue-500/5
                    " />


                    <div className="
                        relative
                        flex
                        flex-col
                        gap-6
                        lg:flex-row
                        lg:items-end
                        lg:justify-between
                    ">


                        {/* TEXT */}

                        <div>

                            <div className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-cyan-200
                                bg-white/80
                                px-3
                                py-1.5
                                shadow-sm
                                dark:border-cyan-500/20
                                dark:bg-cyan-500/5
                            ">

                                <span className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-cyan-500
                                    dark:bg-cyan-400
                                " />


                                <span className="
                                    text-[8px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-cyan-600
                                    dark:text-cyan-400
                                ">
                                    Admin Dashboard
                                </span>

                            </div>


                            <h2 className="
                                mt-4
                                max-w-2xl
                                text-3xl
                                font-black
                                tracking-tight
                                text-slate-900
                                sm:text-4xl
                                dark:text-white
                            ">

                                Manage your queues

                                <span className="
                                    text-slate-400
                                    dark:text-zinc-600
                                ">
                                    {" "}with ease.
                                </span>

                            </h2>


                            <p className="
                                mt-3
                                max-w-xl
                                text-sm
                                leading-6
                                text-slate-500
                                dark:text-zinc-500
                            ">
                                Monitor your queues, manage
                                counters, and keep your
                                customers moving smoothly.
                            </p>

                        </div>


                        {/* CREATE */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/create-queue"
                                )
                            }
                            className="
                                group
                                inline-flex
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                bg-cyan-500
                                px-5
                                py-3.5
                                text-xs
                                font-black
                                text-white
                                shadow-lg
                                shadow-cyan-500/20
                                transition-all
                                hover:bg-cyan-400
                                hover:shadow-cyan-500/30
                                active:scale-[0.98]
                                sm:w-auto
                                dark:text-zinc-950
                            "
                        >

                            <span className="
                                text-base
                            ">
                                ＋
                            </span>


                            Create New Queue


                            <span className="
                                transition-transform
                                group-hover:translate-x-1
                            ">
                                →
                            </span>

                        </button>

                    </div>

                </section>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="
                        mt-5
                        flex
                        flex-col
                        gap-3
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-4
                        sm:flex-row
                        sm:items-center
                        dark:border-red-500/20
                        dark:bg-red-500/[0.04]
                    ">

                        <div className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-red-100
                            dark:bg-red-500/10
                        ">
                            ⚠️
                        </div>


                        <div className="flex-1">

                            <p className="
                                text-xs
                                font-bold
                                text-red-600
                                dark:text-red-400
                            ">
                                Unable to load queues
                            </p>


                            <p className="
                                mt-0.5
                                text-[10px]
                                text-slate-500
                                dark:text-zinc-600
                            ">
                                {error}
                            </p>

                        </div>


                        <button
                            onClick={() =>
                                loadQueues(false)
                            }
                            disabled={refreshing}
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-2
                                text-[10px]
                                font-bold
                                text-slate-600
                                shadow-sm
                                hover:bg-slate-50
                                disabled:opacity-40
                                dark:border-zinc-700
                                dark:bg-zinc-900
                                dark:text-zinc-300
                                dark:hover:bg-zinc-800
                            "
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* ==================================
                    STATS
                ================================== */}

                <section className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-3
                    lg:grid-cols-4
                ">

                    <StatCard
                        icon="🎫"
                        label="Total Queues"
                        value={statistics.total}
                        description="All queues"
                    />


                    <StatCard
                        icon="🟢"
                        label="Active"
                        value={statistics.open}
                        description="Currently open"
                        valueClass="
                            text-emerald-600
                            dark:text-emerald-400
                        "
                    />


                    <StatCard
                        icon="👥"
                        label="Waiting"
                        value={statistics.waiting}
                        description="Customers waiting"
                        valueClass="
                            text-cyan-600
                            dark:text-cyan-400
                        "
                    />


                    <StatCard
                        icon="⏸️"
                        label="Paused"
                        value={statistics.paused}
                        description="Temporarily paused"
                        valueClass="
                            text-amber-600
                            dark:text-amber-400
                        "
                    />

                </section>


                {/* ==================================
                    QUEUES
                ================================== */}

                <section className="mt-10">


                    {/* HEADER */}

                    <div className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    ">

                        <div>

                            <div className="
                                flex
                                items-center
                                gap-2
                            ">

                                <h2 className="
                                    text-xl
                                    font-black
                                    text-slate-900
                                    dark:text-white
                                ">
                                    Your Queues
                                </h2>


                                <span className="
                                    rounded-full
                                    bg-slate-100
                                    px-2
                                    py-0.5
                                    text-[9px]
                                    font-bold
                                    text-slate-500
                                    dark:bg-zinc-800
                                    dark:text-zinc-500
                                ">
                                    {queues.length}
                                </span>

                            </div>


                            <p className="
                                mt-1
                                text-xs
                                text-slate-500
                                dark:text-zinc-600
                            ">
                                Manage and monitor your queue operations.
                            </p>

                        </div>


                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={() =>
                                loadQueues(false)
                            }
                            disabled={refreshing}
                            className="
                                inline-flex
                                w-fit
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-2.5
                                text-[10px]
                                font-bold
                                text-slate-500
                                shadow-sm
                                transition
                                hover:border-slate-300
                                hover:bg-slate-50
                                hover:text-slate-900
                                disabled:opacity-40
                                dark:border-zinc-800
                                dark:bg-zinc-900
                                dark:text-zinc-400
                                dark:hover:border-zinc-700
                                dark:hover:bg-zinc-800
                                dark:hover:text-white
                            "
                        >

                            <span className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }>
                                ↻
                            </span>


                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"
                            }

                        </button>

                    </div>


                    {/* ==================================
                        EMPTY
                    ================================== */}

                    {!error &&
                        queues.length === 0 && (

                            <div className="
                                mt-5
                                rounded-3xl
                                border
                                border-dashed
                                border-slate-300
                                bg-white
                                px-6
                                py-16
                                text-center
                                shadow-sm
                                dark:border-zinc-800
                                dark:bg-zinc-900/30
                            ">

                                <div className="
                                    mx-auto
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-cyan-50
                                    text-2xl
                                    dark:bg-cyan-500/10
                                ">
                                    🎫
                                </div>


                                <h3 className="
                                    mt-5
                                    text-lg
                                    font-bold
                                    text-slate-900
                                    dark:text-white
                                ">
                                    Create your first queue
                                </h3>


                                <p className="
                                    mx-auto
                                    mt-2
                                    max-w-sm
                                    text-xs
                                    leading-5
                                    text-slate-500
                                    dark:text-zinc-600
                                ">
                                    Set up a queue for your
                                    business and start managing
                                    customers efficiently.
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/admin/create-queue"
                                        )
                                    }
                                    className="
                                        mt-6
                                        rounded-xl
                                        bg-cyan-500
                                        px-5
                                        py-2.5
                                        text-[10px]
                                        font-black
                                        text-white
                                        shadow-lg
                                        shadow-cyan-500/10
                                        hover:bg-cyan-400
                                        dark:text-zinc-950
                                    "
                                >
                                    ＋ Create Queue
                                </button>

                            </div>

                        )}


                    {/* ==================================
                        QUEUE GRID
                    ================================== */}

                    {queues.length > 0 && (

                        <div className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-2
                            xl:grid-cols-3
                        ">

                            {queues.map(
                                queue => (

                                    <QueueCard
                                        key={queue.id}
                                        queue={queue}
                                        onOpen={openQueue}
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================
                    FOOTER
                ================================== */}

                <footer className="
                    mt-14
                    border-t
                    border-slate-200
                    py-6
                    text-center
                    dark:border-zinc-900
                ">

                    <p className="
                        text-[9px]
                        text-slate-400
                        dark:text-zinc-700
                    ">
                        QFlow · Smart Queue Management
                    </p>

                </footer>

            </main>

        </div>

    );

}


// ==========================================
// STAT CARD
// ==========================================

function StatCard({
                      icon,
                      label,
                      value,
                      description,
                      valueClass = `
        text-slate-900
        dark:text-white
    `
                  }) {

    return (

        <div className="
            group
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-slate-300
            hover:shadow-md
            sm:p-5
            dark:border-zinc-800/80
            dark:bg-zinc-900/50
            dark:hover:border-zinc-700
            dark:hover:bg-zinc-900
        ">


            <div className="
                flex
                items-center
                justify-between
            ">

                <span className="
                    text-base
                    opacity-80
                ">
                    {icon}
                </span>


                <span className="
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-wide
                    text-slate-400
                    dark:text-zinc-700
                ">
                    {label}
                </span>

            </div>


            <p className={`
                mt-3
                text-2xl
                font-black
                tracking-tight
                ${valueClass}
            `}>
                {value}
            </p>


            <p className="
                mt-1
                text-[9px]
                text-slate-500
                dark:text-zinc-600
            ">
                {description}
            </p>

        </div>

    );

}


export default AdminDashboard;