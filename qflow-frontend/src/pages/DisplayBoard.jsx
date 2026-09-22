import { useEffect, useRef, useState } from "react";

import {
    getQueues,
    getQueueById,
    getAllTickets,
    getCounters
} from "../services/queueApi";

import {
    createWebSocketClient
} from "../services/webSocket";


export default function DisplayBoard() {

    const [queues, setQueues] = useState([]);

    const [selectedQueueId, setSelectedQueueId] =
        useState("");

    const [queue, setQueue] =
        useState(null);

    const [tickets, setTickets] =
        useState([]);

    const [counters, setCounters] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [connected, setConnected] =
        useState(false);

    const websocketRef =
        useRef(null);


    // =====================================================
    // LOAD QUEUES
    // =====================================================

    useEffect(() => {

        let cancelled = false;

        async function loadQueues() {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getQueues();

                if (cancelled) {
                    return;
                }

                const queueList =
                    Array.isArray(data)
                        ? data
                        : [];

                setQueues(queueList);

                console.log(
                    "📋 Queues:",
                    queueList
                );


                if (queueList.length > 0) {

                    const firstQueue =
                        queueList[0];

                    const id =
                        firstQueue.id ??
                        firstQueue.queueId;

                    if (id) {

                        setSelectedQueueId(
                            String(id)
                        );

                    }

                }

            } catch (err) {

                console.error(
                    "❌ Failed to load queues:",
                    err
                );

                if (!cancelled) {

                    setError(
                        err.response?.data?.message ||
                        "Unable to load queues."
                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }

        loadQueues();

        return () => {

            cancelled = true;

        };

    }, []);


    // =====================================================
    // LOAD SELECTED QUEUE
    // =====================================================

    useEffect(() => {

        if (!selectedQueueId) {
            return;
        }

        let cancelled = false;


        async function loadQueueData() {

            try {

                setError("");

                console.log(
                    "🔎 Loading queue:",
                    selectedQueueId
                );


                const [
                    queueData,
                    ticketData,
                    counterData
                ] = await Promise.all([

                    getQueueById(
                        selectedQueueId
                    ),

                    getAllTickets(
                        selectedQueueId
                    ),

                    getCounters(
                        selectedQueueId
                    )

                ]);


                if (cancelled) {
                    return;
                }


                console.log(
                    "📦 Queue:",
                    queueData
                );

                console.log(
                    "🎫 Tickets:",
                    ticketData
                );

                console.log(
                    "🪑 Counters:",
                    counterData
                );


                setQueue(
                    queueData
                );

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
                    "❌ Display error:",
                    err
                );

                if (!cancelled) {

                    setError(
                        err.response?.data?.message ||
                        "Queue not found"
                    );

                }

            }

        }


        loadQueueData();


        return () => {

            cancelled = true;

        };

    }, [selectedQueueId]);


    // =====================================================
    // WEBSOCKET
    // =====================================================

    useEffect(() => {

        if (!selectedQueueId) {
            return;
        }


        // Close old connection

        if (websocketRef.current) {

            websocketRef.current.deactivate();

            websocketRef.current = null;

        }


        setConnected(false);


        const client =
            createWebSocketClient(

                selectedQueueId,

                async event => {

                    console.log(
                        "📡 Queue WebSocket event:",
                        event
                    );


                    /*
                     * Whenever something changes,
                     * reload the current queue data.
                     */

                    try {

                        const [
                            queueData,
                            ticketData,
                            counterData
                        ] = await Promise.all([

                            getQueueById(
                                selectedQueueId
                            ),

                            getAllTickets(
                                selectedQueueId
                            ),

                            getCounters(
                                selectedQueueId
                            )

                        ]);


                        setQueue(
                            queueData
                        );

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


                    } catch (error) {

                        console.error(
                            "❌ Failed to refresh display:",
                            error
                        );

                    }

                },


                () => {

                    console.log(
                        "🟢 Display WebSocket connected"
                    );

                    setConnected(true);

                },


                error => {

                    console.error(
                        "❌ Display WebSocket error:",
                        error
                    );

                    setConnected(false);

                }

            );


        websocketRef.current =
            client;


        return () => {

            if (client) {

                client.deactivate();

            }

            websocketRef.current =
                null;

            setConnected(false);

        };

    }, [selectedQueueId]);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="
                min-h-screen
                bg-[#05070d]
                flex
                items-center
                justify-center
                text-white
            ">

                <div className="
                    text-center
                ">

                    <div className="
                        text-5xl
                        mb-4
                    ">
                        📺
                    </div>

                    <p className="
                        text-gray-400
                    ">
                        Loading queues...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && queues.length === 0) {

        return (

            <div className="
                min-h-screen
                bg-[#05070d]
                flex
                items-center
                justify-center
                text-white
                px-6
            ">

                <div className="
                    max-w-md
                    w-full
                    bg-[#15161b]
                    border
                    border-red-500/30
                    rounded-2xl
                    p-8
                    text-center
                ">

                    <div className="
                        text-5xl
                        mb-5
                    ">
                        ⚠️
                    </div>

                    <h1 className="
                        text-2xl
                        font-bold
                        mb-3
                    ">
                        Unable to load queues
                    </h1>

                    <p className="
                        text-gray-400
                    ">
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="
            min-h-screen
            bg-[#05070d]
            text-white
            px-6
            py-8
        ">


            {/* HEADER */}

            <div className="
                max-w-7xl
                mx-auto
                mb-8
            ">

                <div className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-5
                ">

                    <div>

                        <p className="
                            text-purple-400
                            text-sm
                            font-semibold
                            uppercase
                            tracking-widest
                        ">
                            QFlow
                        </p>

                        <h1 className="
                            text-4xl
                            md:text-5xl
                            font-bold
                            mt-1
                        ">
                            Live Display Board
                        </h1>

                    </div>


                    {/* CONNECTION */}

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <span
                            className={`
                                w-3
                                h-3
                                rounded-full
                                ${
                                connected
                                    ? "bg-green-500"
                                    : "bg-red-500"
                            }
                            `}
                        />

                        <span className="
                            text-gray-400
                            text-sm
                        ">

                            {connected
                                ? "Live"
                                : "Connecting..."}

                        </span>

                    </div>

                </div>

            </div>


            {/* QUEUE SELECTOR */}

            <div className="
                max-w-7xl
                mx-auto
                mb-8
            ">

                <label className="
                    block
                    text-sm
                    text-gray-400
                    mb-2
                ">
                    Select Queue
                </label>


                <select
                    value={selectedQueueId}
                    onChange={e =>
                        setSelectedQueueId(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        md:w-96
                        bg-[#11131a]
                        border
                        border-gray-700
                        rounded-xl
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-purple-500
                    "
                >

                    {queues.map(item => {

                        const id =
                            item.id ??
                            item.queueId;

                        return (

                            <option
                                key={id}
                                value={id}
                            >

                                {item.name ??
                                    `Queue ${id}`}

                            </option>

                        );

                    })}

                </select>

            </div>


            {/* ERROR */}

            {error && (

                <div className="
                    max-w-7xl
                    mx-auto
                    mb-6
                    bg-red-500/10
                    border
                    border-red-500/30
                    rounded-xl
                    p-4
                    text-red-300
                ">

                    {error}

                </div>

            )}


            {queue && (

                <div className="
                    max-w-7xl
                    mx-auto
                ">


                    {/* QUEUE NAME */}

                    <div className="
                        bg-[#11131a]
                        border
                        border-gray-800
                        rounded-3xl
                        p-8
                        mb-8
                    ">

                        <p className="
                            text-purple-400
                            text-sm
                            uppercase
                            tracking-widest
                        ">
                            Queue
                        </p>

                        <h2 className="
                            text-3xl
                            md:text-4xl
                            font-bold
                            mt-2
                        ">

                            {queue.name}

                        </h2>

                        {queue.description && (

                            <p className="
                                text-gray-400
                                mt-2
                            ">

                                {queue.description}

                            </p>

                        )}

                    </div>


                    {/* CURRENT TICKET */}

                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-6
                        mb-8
                    ">


                        <div className="
                            bg-gradient-to-br
                            from-purple-600
                            to-indigo-700
                            rounded-3xl
                            p-10
                            text-center
                            shadow-2xl
                        ">

                            <p className="
                                text-purple-100
                                uppercase
                                tracking-widest
                                text-sm
                            ">
                                Current Ticket
                            </p>


                            <div className="
                                text-7xl
                                md:text-8xl
                                font-black
                                mt-6
                            ">

                                {
                                    queue.currentTicketNumber
                                    ??
                                    queue.currentTicket
                                    ??
                                    "-"
                                }

                            </div>

                        </div>


                        {/* STATUS */}

                        <div className="
                            bg-[#11131a]
                            border
                            border-gray-800
                            rounded-3xl
                            p-10
                            text-center
                        ">

                            <p className="
                                text-gray-400
                                uppercase
                                tracking-widest
                                text-sm
                            ">
                                Queue Status
                            </p>


                            <div className="
                                text-4xl
                                md:text-5xl
                                font-bold
                                mt-6
                            ">

                                {
                                    queue.status
                                    ??
                                    queue.queueStatus
                                    ??
                                    "OPEN"
                                }

                            </div>

                        </div>

                    </div>


                    {/* COUNTERS */}

                    {counters.length > 0 && (

                        <div className="
                            mb-8
                        ">

                            <h3 className="
                                text-2xl
                                font-bold
                                mb-5
                            ">
                                Counters
                            </h3>


                            <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                lg:grid-cols-4
                                gap-4
                            ">

                                {counters.map(
                                    counter => (

                                        <div
                                            key={
                                                counter.id ??
                                                counter.counterId
                                            }
                                            className="
                                                bg-[#11131a]
                                                border
                                                border-gray-800
                                                rounded-2xl
                                                p-5
                                            "
                                        >

                                            <p className="
                                                text-gray-400
                                                text-sm
                                            ">
                                                Counter
                                            </p>

                                            <p className="
                                                text-2xl
                                                font-bold
                                                mt-1
                                            ">

                                                {
                                                    counter.counterNumber
                                                    ??
                                                    counter.number
                                                    ??
                                                    "-"
                                                }

                                            </p>

                                            <p className="
                                                text-sm
                                                mt-2
                                                text-gray-500
                                            ">

                                                {
                                                    counter.status
                                                    ??
                                                    "UNKNOWN"
                                                }

                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}


                    {/* TICKETS */}

                    {tickets.length > 0 && (

                        <div>

                            <h3 className="
                                text-2xl
                                font-bold
                                mb-5
                            ">
                                Queue Tickets
                            </h3>


                            <div className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                lg:grid-cols-6
                                gap-4
                            ">

                                {tickets.map(
                                    ticket => (

                                        <div
                                            key={
                                                ticket.id ??
                                                ticket.ticketId
                                            }
                                            className={`
                                                rounded-2xl
                                                p-5
                                                text-center
                                                border
                                                ${
                                                ticket.status ===
                                                "SERVING"
                                                    ? "bg-purple-600 border-purple-400"
                                                    : "bg-[#11131a] border-gray-800"
                                            }
                                            `}
                                        >

                                            <p className="
                                                text-gray-400
                                                text-xs
                                                uppercase
                                            ">
                                                Ticket
                                            </p>

                                            <p className="
                                                text-3xl
                                                font-bold
                                                mt-2
                                            ">

                                                {
                                                    ticket.ticketNumber
                                                    ??
                                                    ticket.number
                                                    ??
                                                    "-"
                                                }

                                            </p>

                                            <p className="
                                                text-xs
                                                mt-2
                                            ">

                                                {
                                                    ticket.status
                                                    ??
                                                    "UNKNOWN"
                                                }

                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </div>

            )}

        </div>

    );

}