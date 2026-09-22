import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createQueue } from "../services/queueApi.jsx";


function CreateQueue() {

    const navigate = useNavigate();


    const [name, setName] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================
    // CREATE QUEUE
    // ==========================================

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");


        if (!name.trim()) {

            setError(
                "Please enter a queue name."
            );

            return;
        }


        try {

            setLoading(true);


            const queue =
                await createQueue({
                    name: name.trim(),
                    description:
                        description.trim()
                });


            console.log(
                "🔥 Queue created:",
                queue
            );


            // Go back to dashboard

            navigate("/admin");

        } catch (err) {

            console.error(
                "❌ Create queue error:",
                err
            );


            setError(
                err.message ||
                "Failed to create queue."
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <div className="
            min-h-screen
            bg-slate-50
            text-slate-900
            dark:bg-[#080808]
            dark:text-white
        ">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="
                border-b
                border-slate-200
                bg-white/90
                backdrop-blur-xl
                dark:border-zinc-800
                dark:bg-[#080808]/90
            ">

                <div className="
                    mx-auto
                    flex
                    max-w-4xl
                    items-center
                    justify-between
                    px-5
                    py-4
                    sm:px-8
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
                            bg-cyan-50
                            text-lg
                            dark:bg-cyan-500/10
                        ">
                            🔥
                        </div>


                        <div>

                            <h1 className="
                                font-black
                                text-cyan-600
                                dark:text-cyan-400
                            ">
                                QFlow
                            </h1>


                            <p className="
                                text-[8px]
                                uppercase
                                tracking-[0.18em]
                                text-slate-400
                                dark:text-zinc-600
                            ">
                                Queue Management
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin")
                        }
                        className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2
                            text-xs
                            font-bold
                            text-slate-600
                            hover:bg-slate-50
                            dark:border-zinc-800
                            dark:bg-zinc-900
                            dark:text-zinc-400
                            dark:hover:bg-zinc-800
                        "
                    >
                        ← Back
                    </button>

                </div>

            </header>


            {/* ==================================
                CONTENT
            ================================== */}

            <main className="
                mx-auto
                max-w-4xl
                px-5
                py-8
                sm:px-8
                sm:py-12
            ">


                <div className="
                    mx-auto
                    max-w-2xl
                ">


                    {/* TITLE */}

                    <div className="
                        mb-7
                    ">

                        <div className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-cyan-200
                            bg-cyan-50
                            px-3
                            py-1.5
                            dark:border-cyan-500/20
                            dark:bg-cyan-500/10
                        ">

                            <span className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-cyan-500
                            " />

                            <span className="
                                text-[8px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-cyan-600
                                dark:text-cyan-400
                            ">
                                New Queue
                            </span>

                        </div>


                        <h2 className="
                            mt-4
                            text-3xl
                            font-black
                            tracking-tight
                            sm:text-4xl
                        ">
                            Create a queue
                        </h2>


                        <p className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-500
                            dark:text-zinc-500
                        ">
                            Set up a new queue for your
                            customers and start managing
                            their waiting experience.
                        </p>

                    </div>


                    {/* FORM CARD */}

                    <form
                        onSubmit={handleSubmit}
                        className="
                            rounded-3xl
                            border
                            border-slate-200
                            bg-white
                            p-6
                            shadow-sm
                            sm:p-8
                            dark:border-zinc-800
                            dark:bg-zinc-900/60
                        "
                    >


                        {/* QUEUE NAME */}

                        <div>

                            <label
                                htmlFor="queue-name"
                                className="
                                    text-xs
                                    font-bold
                                    text-slate-700
                                    dark:text-zinc-300
                                "
                            >
                                Queue name
                            </label>


                            <p className="
                                mt-1
                                text-[10px]
                                text-slate-400
                                dark:text-zinc-600
                            ">
                                Give your queue a clear,
                                recognizable name.
                            </p>


                            <input
                                id="queue-name"
                                type="text"
                                value={name}
                                onChange={event =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. General OPD"
                                maxLength={100}
                                disabled={loading}
                                className="
                                    mt-3
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-cyan-400
                                    focus:ring-4
                                    focus:ring-cyan-500/10
                                    disabled:opacity-50
                                    dark:border-zinc-800
                                    dark:bg-[#0b0b0b]
                                    dark:text-white
                                    dark:placeholder:text-zinc-700
                                "
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="
                            mt-6
                        ">

                            <label
                                htmlFor="queue-description"
                                className="
                                    text-xs
                                    font-bold
                                    text-slate-700
                                    dark:text-zinc-300
                                "
                            >
                                Description
                                <span className="
                                    ml-1
                                    font-normal
                                    text-slate-400
                                ">
                                    (optional)
                                </span>
                            </label>


                            <p className="
                                mt-1
                                text-[10px]
                                text-slate-400
                                dark:text-zinc-600
                            ">
                                Help customers understand
                                what this queue is for.
                            </p>


                            <textarea
                                id="queue-description"
                                value={description}
                                onChange={event =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. For patients visiting the general outpatient department."
                                maxLength={500}
                                rows={5}
                                disabled={loading}
                                className="
                                    mt-3
                                    w-full
                                    resize-none
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-cyan-400
                                    focus:ring-4
                                    focus:ring-cyan-500/10
                                    disabled:opacity-50
                                    dark:border-zinc-800
                                    dark:bg-[#0b0b0b]
                                    dark:text-white
                                    dark:placeholder:text-zinc-700
                                "
                            />


                            <div className="
                                mt-2
                                text-right
                                text-[9px]
                                text-slate-400
                                dark:text-zinc-700
                            ">
                                {description.length}/500
                            </div>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="
                                mt-5
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                p-3
                                text-xs
                                text-red-600
                                dark:border-red-500/20
                                dark:bg-red-500/5
                                dark:text-red-400
                            ">
                                ⚠️ {error}
                            </div>

                        )}


                        {/* ACTIONS */}

                        <div className="
                            mt-7
                            flex
                            flex-col-reverse
                            gap-3
                            sm:flex-row
                            sm:justify-end
                        ">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/admin")
                                }
                                disabled={loading}
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-5
                                    py-3
                                    text-xs
                                    font-bold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:opacity-40
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                    dark:text-zinc-400
                                    dark:hover:bg-zinc-800
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !name.trim()
                                }
                                className="
                                    rounded-xl
                                    bg-cyan-500
                                    px-6
                                    py-3
                                    text-xs
                                    font-black
                                    text-white
                                    shadow-lg
                                    shadow-cyan-500/20
                                    transition
                                    hover:bg-cyan-400
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                    dark:text-zinc-950
                                "
                            >

                                {loading
                                    ? "Creating..."
                                    : "Create Queue →"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>

    );

}


export default CreateQueue;