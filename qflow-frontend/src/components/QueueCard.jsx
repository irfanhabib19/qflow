import React from "react";


function QueueCard({
                       queue,
                       onOpen
                   }) {

    const status =
        queue.status?.toUpperCase() ||
        "UNKNOWN";


    const statusConfig = {

        OPEN: {
            label: "Open",
            dot: "bg-emerald-500",
            text: `
                text-emerald-600
                dark:text-emerald-400
            `,
            badge: `
                border-emerald-200
                bg-emerald-50
                dark:border-emerald-500/20
                dark:bg-emerald-500/10
            `,
            accent: "bg-emerald-400"
        },


        PAUSED: {
            label: "Paused",
            dot: "bg-amber-500",
            text: `
                text-amber-600
                dark:text-amber-400
            `,
            badge: `
                border-amber-200
                bg-amber-50
                dark:border-amber-500/20
                dark:bg-amber-500/10
            `,
            accent: "bg-amber-400"
        },


        CLOSED: {
            label: "Closed",
            dot: "bg-red-500",
            text: `
                text-red-600
                dark:text-red-400
            `,
            badge: `
                border-red-200
                bg-red-50
                dark:border-red-500/20
                dark:bg-red-500/10
            `,
            accent: "bg-red-400"
        },


        UNKNOWN: {
            label: "Unknown",
            dot: "bg-zinc-400",
            text: `
                text-zinc-500
                dark:text-zinc-400
            `,
            badge: `
                border-zinc-200
                bg-zinc-100
                dark:border-zinc-700
                dark:bg-zinc-800
            `,
            accent: "bg-zinc-400"
        }

    };


    const config =
        statusConfig[status] ||
        statusConfig.UNKNOWN;


    const currentNumber =
        queue.currentNumber ?? 0;


    const lastNumber =
        queue.lastNumber ?? 0;


    const waitingCount =
        queue.waitingCount ?? 0;


    function handleOpen() {

        if (!queue?.id) {
            return;
        }


        onOpen(queue.id);

    }


    return (

        <article className="
            group
            relative
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-slate-300
            hover:shadow-xl
            dark:border-zinc-800/80
            dark:bg-zinc-900/60
            dark:shadow-black/10
            dark:hover:border-zinc-700
            dark:hover:bg-zinc-900
        ">


            {/* TOP ACCENT */}

            <div className={`
                absolute
                left-0
                top-0
                h-[2px]
                w-full
                ${config.accent}
            `} />


            <div className="
                p-5
                sm:p-6
            ">


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                ">


                    <div className="
                        min-w-0
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
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-cyan-100
                                bg-cyan-50
                                text-lg
                                dark:border-cyan-500/20
                                dark:bg-cyan-500/10
                            ">
                                🎫
                            </div>


                            <div className="
                                min-w-0
                            ">

                                <p className="
                                    text-[9px]
                                    font-medium
                                    uppercase
                                    tracking-[0.18em]
                                    text-slate-400
                                    dark:text-zinc-600
                                ">
                                    Queue #{queue.id}
                                </p>


                                <h3 className="
                                    mt-0.5
                                    truncate
                                    text-base
                                    font-bold
                                    text-slate-900
                                    sm:text-lg
                                    dark:text-white
                                ">
                                    {queue.name ||
                                        "Unnamed Queue"
                                    }
                                </h3>

                            </div>

                        </div>


                        <p className="
                            mt-4
                            line-clamp-2
                            min-h-[40px]
                            text-xs
                            leading-5
                            text-slate-500
                            dark:text-zinc-500
                        ">
                            {queue.description ||
                                "No description available for this queue."
                            }
                        </p>

                    </div>


                    {/* STATUS */}

                    <div className={`
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-bold
                        ${config.badge}
                        ${config.text}
                    `}>

                        <span className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${config.dot}
                            ${
                            status === "OPEN"
                                ? "animate-pulse"
                                : ""
                        }
                        `} />


                        {config.label}

                    </div>

                </div>


                {/* ==================================
                    LIVE QUEUE
                ================================== */}

                <div className="
                    mt-5
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                    dark:border-zinc-800
                    dark:bg-[#0b0b0b]/70
                ">


                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        <span className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.15em]
                            text-slate-400
                            dark:text-zinc-600
                        ">
                            Live Queue
                        </span>


                        {status === "OPEN" && (

                            <span className="
                                flex
                                items-center
                                gap-1
                                text-[8px]
                                font-medium
                                text-emerald-600
                                dark:text-emerald-400
                            ">

                                <span className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-emerald-400
                                    animate-pulse
                                " />

                                LIVE

                            </span>

                        )}

                    </div>


                    <div className="
                        mt-4
                        grid
                        grid-cols-3
                        divide-x
                        divide-slate-200
                        dark:divide-zinc-800
                    ">


                        {/* SERVING */}

                        <div className="
                            px-2
                        ">

                            <p className="
                                text-[8px]
                                uppercase
                                tracking-wide
                                text-slate-400
                                dark:text-zinc-600
                            ">
                                Serving
                            </p>


                            <p className="
                                mt-1
                                text-2xl
                                font-black
                                text-cyan-600
                                dark:text-cyan-400
                            ">
                                #{currentNumber}
                            </p>

                        </div>


                        {/* WAITING */}

                        <div className="
                            px-3
                        ">

                            <p className="
                                text-[8px]
                                uppercase
                                tracking-wide
                                text-slate-400
                                dark:text-zinc-600
                            ">
                                Waiting
                            </p>


                            <p className="
                                mt-1
                                text-2xl
                                font-black
                                text-emerald-600
                                dark:text-emerald-400
                            ">
                                {waitingCount}
                            </p>

                        </div>


                        {/* LAST */}

                        <div className="
                            px-3
                        ">

                            <p className="
                                text-[8px]
                                uppercase
                                tracking-wide
                                text-slate-400
                                dark:text-zinc-600
                            ">
                                Last
                            </p>


                            <p className="
                                mt-1
                                text-2xl
                                font-black
                                text-slate-700
                                dark:text-zinc-300
                            ">
                                #{lastNumber}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    FOOTER
                ================================== */}

                <div className="
                    mt-5
                    flex
                    items-center
                    justify-between
                    gap-3
                ">


                    <div className="
                        flex
                        items-center
                        gap-2
                        text-[9px]
                        text-slate-400
                        dark:text-zinc-600
                    ">

                        <span>
                            Queue ID
                        </span>


                        <span className="
                            rounded-md
                            bg-slate-100
                            px-2
                            py-1
                            font-mono
                            text-slate-500
                            dark:bg-zinc-800
                            dark:text-zinc-400
                        ">
                            #{queue.id}
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={handleOpen}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-slate-900
                            px-4
                            py-2.5
                            text-[10px]
                            font-bold
                            text-white
                            shadow-sm
                            transition-all
                            duration-200
                            hover:bg-cyan-500
                            active:scale-[0.97]
                            dark:bg-white
                            dark:text-zinc-950
                            dark:hover:bg-cyan-400
                        "
                    >

                        Manage


                        <span className="
                            transition-transform
                            duration-200
                            group-hover:translate-x-0.5
                        ">
                            →
                        </span>

                    </button>

                </div>

            </div>

        </article>

    );

}


export default QueueCard;