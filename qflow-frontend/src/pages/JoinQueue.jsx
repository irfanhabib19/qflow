import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getQueues } from "../services/queueApi.jsx";


function JoinQueue() {

    const navigate = useNavigate();

    const [queues, setQueues] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    // ==========================================
    // LOAD QUEUES
    // ==========================================

    async function loadQueues() {

        try {

            setLoading(true);
            setError("");

            const data = await getQueues();

            console.log(
                "QFLOW QUEUES:",
                data
            );

            setQueues(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "QFLOW ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to load queues"
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadQueues();

    }, []);


    // ==========================================
    // CROWD
    // ==========================================

    function getWaitingCount(queue) {

        return Number(
            queue.waitingCount || 0
        );

    }


    function getCrowd(count) {

        if (count <= 5) {

            return {
                label: "Low crowd",
                dot: "bg-emerald-400",
                text: "text-emerald-400",
                bar: "bg-emerald-400"
            };

        }


        if (count <= 15) {

            return {
                label: "Moderate",
                dot: "bg-yellow-400",
                text: "text-yellow-400",
                bar: "bg-yellow-400"
            };

        }


        if (count <= 30) {

            return {
                label: "Busy",
                dot: "bg-orange-400",
                text: "text-orange-400",
                bar: "bg-orange-400"
            };

        }


        return {

            label: "Very busy",

            dot: "bg-red-400",

            text: "text-red-400",

            bar: "bg-red-400"

        };

    }


    // ==========================================
    // ESTIMATED WAIT
    // ==========================================

    function getEstimatedWait(count) {

        if (count === 0) {

            return "No wait";

        }

        return `~${count * 3} min`;

    }


    // ==========================================
    // FILTER QUEUES
    // ==========================================

    const filteredQueues =
        queues
            .filter(queue => {

                const status =
                    String(
                        queue.status || ""
                    ).toUpperCase();


                return status === "OPEN";

            })
            .filter(queue => {

                const keyword =
                    search
                        .trim()
                        .toLowerCase();


                if (!keyword) {

                    return true;

                }


                return (

                    String(
                        queue.name || ""
                    )
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    String(
                        queue.description || ""
                    )
                        .toLowerCase()
                        .includes(keyword)

                );

            })
            .sort(
                (a, b) =>
                    getWaitingCount(a) -
                    getWaitingCount(b)
            );


    // ==========================================
    // OPEN QUEUE
    // ==========================================

    function openQueue(queueId) {

        navigate(
            `/queue/${queueId}`
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
                        Loading queues...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

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
                        text-4xl
                    ">
                        ⚠️
                    </div>


                    <h1 className="
                        mt-4
                        text-xl
                        font-black
                    ">
                        Unable to load queues
                    </h1>


                    <p className="
                        mt-3
                        text-sm
                        leading-6
                        text-zinc-500
                    ">
                        {error}
                    </p>


                    <button
                        onClick={loadQueues}
                        className="
                            mt-6
                            rounded-2xl
                            bg-cyan-600
                            px-6
                            py-3
                            text-xs
                            font-black
                            hover:bg-cyan-500
                        "
                    >
                        Try Again
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
                border-b
                border-zinc-800
                bg-[#07090d]
            ">

                <div className="
                    mx-auto
                    max-w-6xl
                    px-5
                    py-5
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-2xl
                                bg-cyan-500/10
                                text-xl
                            ">
                                ⚡
                            </div>


                            <div>

                                <h1 className="
                                    text-lg
                                    font-black
                                    text-cyan-400
                                ">
                                    QFlow
                                </h1>


                                <p className="
                                    text-[9px]
                                    uppercase
                                    tracking-[0.2em]
                                    text-zinc-600
                                ">
                                    Smart Queue
                                </p>

                            </div>

                        </div>


                        <div className="
                            flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-emerald-500/20
                            bg-emerald-500/10
                            px-3
                            py-2
                            text-[9px]
                            font-bold
                            text-emerald-400
                        ">

                            <span className="
                                h-2
                                w-2
                                animate-pulse
                                rounded-full
                                bg-emerald-400
                            " />

                            LIVE

                        </div>

                    </div>

                </div>

            </header>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <main className="
                mx-auto
                max-w-6xl
                px-5
                py-8
                sm:py-12
            ">


                {/* HERO */}

                <section className="
                    rounded-[2rem]
                    border
                    border-zinc-800
                    bg-gradient-to-br
                    from-zinc-900
                    to-[#0b1720]
                    p-7
                    sm:p-10
                ">

                    <span className="
                        inline-flex
                        rounded-full
                        bg-cyan-500/10
                        px-3
                        py-1.5
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.2em]
                        text-cyan-400
                    ">
                        Queue finder
                    </span>


                    <h2 className="
                        mt-5
                        text-3xl
                        font-black
                        tracking-tight
                        sm:text-5xl
                    ">

                        Skip the line.
                        <br />

                        <span className="
                            text-cyan-400
                        ">
                            Join digitally.
                        </span>

                    </h2>


                    <p className="
                        mt-4
                        max-w-xl
                        text-sm
                        leading-6
                        text-zinc-500
                    ">
                        Find the queue with the
                        shortest wait and get your
                        digital ticket.
                    </p>


                    {/* SEARCH */}

                    <div className="
                        relative
                        mt-7
                        max-w-xl
                    ">

                        <span className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-zinc-600
                        ">
                            🔎
                        </span>


                        <input
                            value={search}
                            onChange={e =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search a queue..."
                            className="
                                w-full
                                rounded-2xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                py-4
                                pl-11
                                pr-4
                                text-sm
                                outline-none
                                placeholder:text-zinc-700
                                focus:border-cyan-500/40
                            "
                        />

                    </div>

                </section>


                {/* SECTION HEADER */}

                <div className="
                    mt-10
                    flex
                    items-end
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
                            Available now
                        </p>


                        <h2 className="
                            mt-1
                            text-2xl
                            font-black
                        ">
                            Choose your queue
                        </h2>

                    </div>


                    <span className="
                        text-xs
                        text-zinc-600
                    ">
                        {filteredQueues.length}
                        {" "}
                        available
                    </span>

                </div>


                {/* QUEUES */}

                {filteredQueues.length === 0 ? (

                    <div className="
                        mt-5
                        rounded-3xl
                        border
                        border-zinc-800
                        bg-zinc-900/50
                        p-12
                        text-center
                    ">

                        <div className="
                            text-4xl
                        ">
                            🎟️
                        </div>


                        <h3 className="
                            mt-4
                            text-lg
                            font-black
                        ">
                            No queues available
                        </h3>


                        <p className="
                            mt-2
                            text-sm
                            text-zinc-600
                        ">
                            There are currently no
                            open queues matching your
                            search.
                        </p>

                    </div>

                ) : (

                    <div className="
                        mt-5
                        grid
                        grid-cols-1
                        gap-5
                        md:grid-cols-2
                    ">

                        {filteredQueues.map(
                            queue => {

                                const waiting =
                                    getWaitingCount(
                                        queue
                                    );


                                const crowd =
                                    getCrowd(
                                        waiting
                                    );


                                return (

                                    <article
                                        key={queue.id}
                                        className="
                                            group
                                            rounded-3xl
                                            border
                                            border-zinc-800
                                            bg-zinc-900/60
                                            p-5
                                            transition
                                            hover:-translate-y-1
                                            hover:border-cyan-500/30
                                            hover:bg-zinc-900
                                        "
                                    >

                                        {/* TITLE */}

                                        <div className="
                                            flex
                                            items-start
                                            justify-between
                                            gap-4
                                        ">

                                            <div>

                                                <h3 className="
                                                    text-lg
                                                    font-black
                                                ">
                                                    {queue.name}
                                                </h3>


                                                <p className="
                                                    mt-1
                                                    text-[10px]
                                                    text-zinc-600
                                                ">
                                                    Queue #{queue.id}
                                                </p>

                                            </div>


                                            <span className="
                                                rounded-full
                                                bg-emerald-500/10
                                                px-3
                                                py-1.5
                                                text-[8px]
                                                font-black
                                                uppercase
                                                text-emerald-400
                                            ">
                                                OPEN
                                            </span>

                                        </div>


                                        {/* DESCRIPTION */}

                                        <p className="
                                            mt-5
                                            min-h-[40px]
                                            text-xs
                                            leading-5
                                            text-zinc-500
                                        ">
                                            {queue.description ||
                                                "Join this queue and receive a digital ticket."
                                            }
                                        </p>


                                        {/* WAITING */}

                                        <div className="
                                            mt-5
                                            rounded-2xl
                                            border
                                            border-zinc-800
                                            bg-zinc-950
                                            p-4
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                justify-between
                                            ">

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                ">

                                                    <span
                                                        className={`
                                                            h-2
                                                            w-2
                                                            rounded-full
                                                            ${crowd.dot}
                                                        `}
                                                    />


                                                    <span
                                                        className={`
                                                            text-xs
                                                            font-bold
                                                            ${crowd.text}
                                                        `}
                                                    >
                                                        {crowd.label}
                                                    </span>

                                                </div>


                                                <span className="
                                                    text-xs
                                                    text-zinc-500
                                                ">
                                                    {waiting}
                                                    {" "}
                                                    waiting
                                                </span>

                                            </div>


                                            {/* BAR */}

                                            <div className="
                                                mt-3
                                                h-1.5
                                                overflow-hidden
                                                rounded-full
                                                bg-zinc-800
                                            ">

                                                <div
                                                    className={`
                                                        h-full
                                                        rounded-full
                                                        ${crowd.bar}
                                                    `}
                                                    style={{
                                                        width:
                                                            `${Math.min(
                                                                waiting * 3,
                                                                100
                                                            )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>


                                        {/* STATS */}

                                        <div className="
                                            mt-4
                                            grid
                                            grid-cols-2
                                            gap-3
                                        ">

                                            <div className="
                                                rounded-2xl
                                                border
                                                border-zinc-800
                                                p-3
                                            ">

                                                <p className="
                                                    text-[8px]
                                                    uppercase
                                                    text-zinc-700
                                                ">
                                                    Estimated wait
                                                </p>


                                                <p className="
                                                    mt-1
                                                    text-sm
                                                    font-black
                                                ">
                                                    {getEstimatedWait(
                                                        waiting
                                                    )}
                                                </p>

                                            </div>


                                            <div className="
                                                rounded-2xl
                                                border
                                                border-zinc-800
                                                p-3
                                            ">

                                                <p className="
                                                    text-[8px]
                                                    uppercase
                                                    text-zinc-700
                                                ">
                                                    Now serving
                                                </p>


                                                <p className="
                                                    mt-1
                                                    text-sm
                                                    font-black
                                                    text-blue-400
                                                ">
                                                    {queue.currentNumber ||
                                                        "--"
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        {/* BUTTON */}

                                        <button
                                            onClick={() =>
                                                openQueue(
                                                    queue.id
                                                )
                                            }
                                            className="
                                                mt-4
                                                w-full
                                                rounded-2xl
                                                bg-cyan-600
                                                px-5
                                                py-4
                                                text-xs
                                                font-black
                                                transition
                                                hover:bg-cyan-500
                                                active:scale-[0.99]
                                            "
                                        >
                                            View Queue
                                            <span className="
                                                ml-2
                                            ">
                                                →
                                            </span>
                                        </button>

                                    </article>

                                );

                            }
                        )}

                    </div>

                )}


                {/* FOOTER */}

                <footer className="
                    py-12
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


export default JoinQueue;