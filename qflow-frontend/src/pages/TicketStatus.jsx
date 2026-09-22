import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getTicketStatus,
    cancelTicket
} from "../services/userApi.jsx";

import {
    createWebSocketClient
} from "../services/webSocket.js";


function TicketStatus() {

    const {
        queueId,
        ticketId
    } = useParams();

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [ticket, setTicket] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [connected, setConnected] = useState(false);

    const [cancelling, setCancelling] = useState(false);


    // ==========================================
    // LOAD TICKET
    // ==========================================

    async function loadTicketStatus() {

        if (!queueId || !ticketId) {

            setError(
                "Invalid ticket URL."
            );

            setLoading(false);

            return;
        }


        try {

            const data =
                await getTicketStatus(
                    queueId,
                    ticketId
                );


            console.log(
                "🎟️ Ticket status:",
                data
            );


            setTicket(data);

            setError("");


        } catch (err) {

            console.error(
                "❌ Failed to load ticket:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load ticket"
            );

        } finally {

            setLoading(false);
        }
    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadTicketStatus();

    }, [
        queueId,
        ticketId
    ]);


    // ==========================================
    // WEBSOCKET
    // ==========================================

    useEffect(() => {

        if (!queueId) {
            return;
        }


        console.log(
            "🔌 Connecting Ticket WebSocket:",
            queueId
        );


        const client =
            createWebSocketClient(

                queueId,

                event => {

                    console.log(
                        "📡 Ticket queue event:",
                        event
                    );


                    /*
                     * Queue changed.
                     *
                     * Reload this ticket so the
                     * user sees the latest status.
                     */

                    loadTicketStatus();
                },


                () => {

                    console.log(
                        "🟢 Ticket WebSocket connected"
                    );

                    setConnected(true);
                },


                error => {

                    console.error(
                        "🔴 Ticket WebSocket error:",
                        error
                    );

                    setConnected(false);
                }
            );


        return () => {

            console.log(
                "🔌 Disconnecting Ticket WebSocket"
            );

            setConnected(false);


            if (client) {

                client.deactivate();
            }

        };

    }, [
        queueId,
        ticketId
    ]);


    // ==========================================
    // CANCEL
    // ==========================================

    async function handleCancel() {

        if (!ticket) {
            return;
        }


        const status =
            String(
                ticket.ticketStatus ||
                ticket.status ||
                ""
            ).toUpperCase();


        if (status !== "WAITING") {
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

            setCancelling(true);

            setError("");


            await cancelTicket(
                queueId,
                ticketId
            );


            await loadTicketStatus();


        } catch (err) {

            console.error(
                "❌ Failed to cancel ticket:",
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
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="
                min-h-screen
                bg-[#07090d]
                px-5
                text-white
                flex
                items-center
                justify-center
            ">

                <div className="
                    w-full
                    max-w-md
                    text-center
                ">

                    <div className="
                        mx-auto
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-3xl
                        border
                        border-cyan-500/20
                        bg-cyan-500/10
                        text-4xl
                    ">
                        🎟️
                    </div>


                    <h1 className="
                        mt-6
                        text-2xl
                        font-black
                    ">
                        QFlow
                    </h1>


                    <p className="
                        mt-2
                        text-sm
                        text-zinc-500
                    ">
                        Loading your ticket...
                    </p>


                    <div className="
                        mx-auto
                        mt-6
                        h-1
                        w-32
                        overflow-hidden
                        rounded-full
                        bg-zinc-800
                    ">

                        <div className="
                            h-full
                            w-1/2
                            animate-pulse
                            rounded-full
                            bg-cyan-500
                        " />

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // ERROR / NOT FOUND
    // ==========================================

    if (!ticket) {

        return (

            <div className="
                             min-h-screen
                        bg-[#07090d]
                        px-5
                        text-white
                        flex
                        items-center
                        justify-center
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

                    <div className="
                        mx-auto
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        bg-red-500/10
                        text-3xl
                    ">
                        ⚠️
                    </div>


                    <h2 className="
                        mt-5
                        text-xl
                        font-black
                    ">
                        Ticket unavailable
                    </h2>


                    <p className="
                        mt-2
                        text-sm
                        leading-6
                        text-zinc-500
                    ">
                        {error ||
                            "Ticket could not be found."
                        }
                    </p>


                    <button
                        onClick={() =>
                            navigate(
                                `/queue/${queueId}`
                            )
                        }
                        className="
                            mt-6
                            w-full
                            rounded-2xl
                            bg-cyan-600
                            px-5
                            py-3.5
                            text-xs
                            font-bold
                            text-white
                            hover:bg-cyan-500
                        "
                    >
                        ← Back to Queue
                    </button>

                </div>

            </div>
        );
    }


    // ==========================================
    // DATA
    // ==========================================

    const status =
        String(
            ticket.ticketStatus ||
            ticket.status ||
            "WAITING"
        ).toUpperCase();


    const ticketNumber =
        ticket.ticketNumber ?? "-";


    const currentServing =
        ticket.currentServing ?? 0;


    const peopleAhead =
        ticket.peopleAhead ?? 0;


    const position =
        ticket.position ?? 0;


    // ==========================================
    // FLAGS
    // ==========================================

    const isWaiting =
        status === "WAITING";


    const isServing =
        status === "SERVING";


    const isServed =
        status === "SERVED";


    const isCancelled =
        status === "CANCELLED";


    // ==========================================
    // DISPLAY
    // ==========================================

    let statusText = status;

    let statusIcon = "🎟️";


    if (isWaiting) {

        statusText = "WAITING";

        statusIcon = "🟢";
    }


    if (isServing) {

        statusText = "YOUR TURN";

        statusIcon = "🔵";
    }


    if (isServed) {

        statusText = "SERVED";

        statusIcon = "✅";
    }


    if (isCancelled) {

        statusText = "CANCELLED";

        statusIcon = "⚫";
    }


    // ==========================================
    // COLORS
    // ==========================================

    let numberColor =
        "text-zinc-600";

    let cardBorder =
        "border-zinc-800";

    let cardBackground =
        "bg-zinc-900/60";


    if (isWaiting) {

        numberColor =
            "text-emerald-400";

        cardBorder =
            "border-emerald-500/20";

        cardBackground =
            "bg-emerald-500/[0.04]";
    }


    if (isServing) {

        numberColor =
            "text-blue-400";

        cardBorder =
            "border-blue-500/30";

        cardBackground =
            "bg-blue-500/[0.06]";
    }


    if (isServed) {

        numberColor =
            "text-emerald-400";

        cardBorder =
            "border-emerald-500/20";

        cardBackground =
            "bg-emerald-500/[0.04]";
    }


    // ==========================================
    // UI
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
                    flex
                    max-w-2xl
                    items-center
                    justify-between
                    px-5
                    py-4
                ">

                    <button
                        onClick={() =>
                            navigate(
                                `/queue/${queueId}`
                            )
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
                            🔥
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
                                text-[9px]
                                uppercase
                                tracking-widest
                                text-zinc-600
                            ">
                                Digital Ticket
                            </p>

                        </div>

                    </button>


                    <div className={`
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        ${
                        connected
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-zinc-800 bg-zinc-900 text-zinc-600"
                    }
                    `}>

                        <span className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${
                            connected
                                ? "animate-pulse bg-emerald-400"
                                : "bg-zinc-600"
                        }
                        `} />

                        {connected
                            ? "LIVE"
                            : "RECONNECTING"
                        }

                    </div>

                </div>

            </header>


            {/* MAIN */}

            <main className="
                mx-auto
                max-w-2xl
                px-5
                py-8
                sm:py-10
            ">

                <div className="
                    mb-6
                    text-center
                ">

                    <p className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.3em]
                        text-cyan-500
                    ">
                        Queue Ticket
                    </p>


                    <h1 className="
                        mt-2
                        text-2xl
                        font-black
                        sm:text-3xl
                    ">
                        Your place in line
                    </h1>


                    <p className="
                        mt-2
                        text-xs
                        text-zinc-600
                    ">
                        This page updates automatically.
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="
                        mb-5
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/5
                        p-4
                        text-xs
                        text-red-400
                    ">
                        ⚠️ {error}
                    </div>

                )}


                {/* TICKET */}

                <section className={`
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    p-6
                    text-center
                    shadow-2xl
                    sm:p-8
                    ${cardBorder}
                    ${cardBackground}
                `}>

                    {isServing && (

                        <div className="
                            absolute
                            left-0
                            right-0
                            top-0
                            h-1
                            animate-pulse
                            bg-blue-500
                        " />

                    )}


                    <p className="
                                         text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.3em]
                                    text-zinc-600
                                    ">
                        Your Ticket
                    </p>


                    <div className={`
                        mt-3
                        text-7xl
                        font-black
                        tracking-tight
                        sm:text-8xl
                        ${numberColor}
                    `}>
                        #{ticketNumber}
                    </div>


                    <div className={`
                        mx-auto
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-4
                        py-2
                        text-xs
                        font-bold
                        ${
                        isWaiting
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : isServing
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                : isServed
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : "border-zinc-700 bg-zinc-800 text-zinc-500"
                    }
                    `}>

                        <span>
                            {statusIcon}
                        </span>

                        {statusText}

                    </div>


                    {/* STATS */}

                    <div className="
                        mt-8
                        grid
                        grid-cols-3
                        gap-2
                        sm:gap-3
                    ">

                        <div className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-950/60
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
                                text-xl
                                font-black
                                text-blue-400
                                sm:text-2xl
                            ">
                                {currentServing > 0
                                    ? `#${currentServing}`
                                    : "-"
                                }
                            </p>

                        </div>


                        <div className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-950/60
                            p-4
                        ">

                            <p className="
                                text-[8px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-zinc-600
                            ">
                                People Ahead
                            </p>

                            <p className="
                                mt-2
                                text-xl
                                font-black
                                text-emerald-400
                                sm:text-2xl
                            ">
                                {isWaiting
                                    ? peopleAhead
                                    : 0
                                }
                            </p>

                        </div>


                        <div className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-950/60
                            p-4
                        ">

                            <p className="
                                text-[8px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-zinc-600
                            ">
                                Position
                            </p>

                            <p className="
                                mt-2
                                text-xl
                                font-black
                                text-cyan-400
                                sm:text-2xl
                            ">
                                {isWaiting
                                    ? position
                                    : "-"
                                }
                            </p>

                        </div>

                    </div>


                    {/* WAITING */}

                    {isWaiting && (

                        <div className="
                            mt-5
                            rounded-2xl
                            border
                            border-emerald-500/10
                            bg-emerald-500/5
                            p-5
                        ">

                            <div className="text-2xl">
                                ⏳
                            </div>

                            <p className="
                                mt-2
                                text-sm
                                font-bold
                                text-emerald-400
                            ">
                                Please wait for your turn
                            </p>

                            <p className="
                                mt-1
                                text-[10px]
                                leading-5
                                text-emerald-400/50
                            ">
                                Stay nearby. Your ticket will
                                update automatically.
                            </p>

                        </div>

                    )}


                    {/* SERVING */}

                    {isServing && (

                        <div className="
                            mt-5
                            rounded-2xl
                            border
                            border-blue-500/20
                            bg-blue-500/10
                            p-5
                        ">

                            <div className="
                                text-3xl
                                animate-pulse
                            ">
                                📢
                            </div>

                            <p className="
                                mt-2
                                text-lg
                                font-black
                                text-blue-400
                            ">
                                It's your turn!
                            </p>

                            <p className="
                                mt-1
                                text-xs
                                leading-5
                                text-blue-300/60
                            ">
                                Please proceed to the counter.
                            </p>

                            {ticket.counterNumber && (

                                <div className="
                                    mt-4
                                    inline-flex
                                    rounded-xl
                                    border
                                    border-blue-500/20
                                    bg-blue-500/10
                                    px-5
                                    py-2.5
                                    text-xs
                                    font-bold
                                    text-blue-300
                                ">
                                    Counter {ticket.counterNumber}
                                </div>

                            )}

                        </div>

                    )}


                    {/* SERVED */}

                    {isServed && (

                        <div className="
                            mt-5
                            rounded-2xl
                            border
                            border-emerald-500/20
                            bg-emerald-500/5
                            p-5
                        ">

                            <div className="text-3xl">
                                🎉
                            </div>

                            <p className="
                                mt-2
                                text-sm
                                font-bold
                                text-emerald-400
                            ">
                                Your ticket has been served
                            </p>

                            <p className="
                                mt-1
                                text-[10px]
                                text-emerald-400/50
                            ">
                                Thank you for using QFlow.
                            </p>

                        </div>

                    )}


                    {/* CANCELLED */}

                    {isCancelled && (

                        <div className="
                            mt-5
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            p-5
                        ">

                            <div className="text-3xl">
                                ⚫
                            </div>

                            <p className="
                                mt-2
                                text-sm
                                font-bold
                                text-zinc-500
                            ">
                                Ticket cancelled
                            </p>

                            <p className="
                                mt-1
                                text-[10px]
                                text-zinc-700
                            ">
                                You are no longer in the queue.
                            </p>

                        </div>

                    )}


                    {/* CANCEL */}

                    {isWaiting && (

                        <button
                            disabled={cancelling}
                            onClick={handleCancel}
                            className="
                                mt-5
                                w-full
                                rounded-2xl
                                border
                                border-red-500/20
                                bg-red-500/5
                                px-5
                                py-3.5
                                text-xs
                                font-bold
                                text-red-400
                                transition
                                hover:bg-red-500/10
                                active:scale-[0.99]
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            {cancelling
                                ? "⏳ Cancelling..."
                                : "❌ Cancel Ticket"
                            }
                        </button>

                    )}

                </section>


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
                        navigate(
                            `/queue/${queueId}`
                        )
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
                    ← Back to Queue
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

        </div>
    );
}


export default TicketStatus;