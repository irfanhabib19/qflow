import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    getQueueById,
    getAllTickets
} from "../services/queueApi.jsx";

import {
    createWebSocketClient
} from "../services/webSocket.js";

import "./PublicDisplay.css";


function PublicDisplay() {

    const { queueId } = useParams();


    // ==========================================
    // STATE
    // ==========================================

    const [queue, setQueue] =
        useState(null);

    const [tickets, setTickets] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [connected, setConnected] =
        useState(false);

    const [currentTime, setCurrentTime] =
        useState(new Date());

    const [announcement, setAnnouncement] =
        useState(null);


    // ==========================================
    // LOAD DISPLAY DATA
    // ==========================================

    async function loadDisplay() {

        try {

            const [
                queueData,
                ticketData
            ] = await Promise.all([

                getQueueById(queueId),

                getAllTickets(queueId)

            ]);


            setQueue(queueData);


            setTickets(
                Array.isArray(ticketData)
                    ? ticketData
                    : []
            );


            setError("");

        } catch (err) {

            console.error(
                "❌ Public display error:",
                err
            );


            setError(
                err.message ||
                "Failed to load display"
            );

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        if (!queueId) {
            return;
        }


        loadDisplay();

    }, [queueId]);


    // ==========================================
    // CLOCK
    // ==========================================

    useEffect(() => {

        const timer =
            setInterval(() => {

                setCurrentTime(
                    new Date()
                );

            }, 1000);


        return () =>
            clearInterval(timer);

    }, []);


    // ==========================================
    // WEBSOCKET
    // ==========================================

    useEffect(() => {

        if (!queueId) {
            return;
        }


        const client =
            createWebSocketClient(

                queueId,

                event => {

                    console.log(
                        "📡 Public display event:",
                        event
                    );


                    if (
                        event?.eventType ===
                        "TICKET_CALLED"
                    ) {

                        setAnnouncement({

                            ticketNumber:
                            event.ticketNumber,

                            counterNumber:
                            event.counterNumber

                        });


                        setTimeout(() => {

                            setAnnouncement(
                                null
                            );

                        }, 5000);

                    }


                    loadDisplay();

                },

                () => {

                    console.log(
                        "🟢 Public display connected"
                    );


                    setConnected(true);

                },

                () => {

                    console.log(
                        "🔴 Public display disconnected"
                    );


                    setConnected(false);

                }

            );


        return () => {

            setConnected(false);

            client.deactivate();

        };

    }, [queueId]);


    // ==========================================
    // COUNTERS
    // ==========================================

    const counters = [1, 2, 3];


    function getCounterTicket(
        counterNumber
    ) {

        return tickets.find(
            ticket =>
                ticket.status === "SERVING" &&
                Number(
                    ticket.counterNumber
                ) ===
                Number(
                    counterNumber
                )
        ) || null;

    }


    // ==========================================
    // COUNTER TICKETS
    // ==========================================

    const counterTickets =
        counters.map(
            counterNumber => ({

                counterNumber,

                ticket:
                    getCounterTicket(
                        counterNumber
                    )

            })
        );


    // ==========================================
    // COUNTS
    // ==========================================

    const waitingCount =
        tickets.filter(
            ticket =>
                ticket.status ===
                "WAITING"
        ).length;


    const servingCount =
        tickets.filter(
            ticket =>
                ticket.status ===
                "SERVING"
        ).length;


    const servedCount =
        tickets.filter(
            ticket =>
                ticket.status ===
                "SERVED"
        ).length;


    const cancelledCount =
        tickets.filter(
            ticket =>
                ticket.status ===
                "CANCELLED"
        ).length;


    // ==========================================
    // MAIN NOW SERVING
    // ==========================================

    const mainServingTicket =
        [...tickets]
            .filter(
                ticket =>
                    ticket.status ===
                    "SERVING"
            )
            .sort(
                (a, b) =>
                    Number(
                        a.counterNumber || 999
                    ) -
                    Number(
                        b.counterNumber || 999
                    )
            )[0] || null;


    // ==========================================
    // TIME
    // ==========================================

    const formattedTime =
        currentTime.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    const formattedDate =
        currentTime.toLocaleDateString(
            [],
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="public-display">

                <div className="display-loading">

                    🔄 Loading QFlow...

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (!queue) {

        return (

            <div className="public-display">

                <div className="display-error">

                    <h1>
                        ❌ Display Unavailable
                    </h1>

                    <p>
                        {error ||
                            "Queue could not be loaded."
                        }
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="public-display">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="public-header">

                <div>

                    <div className="brand">
                        🔥 QFlow
                    </div>


                    <div className="queue-name">

                        {queue.name}

                    </div>


                    <div className="queue-description">

                        {queue.description ||
                            "Digital Queue Management"
                        }

                    </div>

                </div>


                <div className="header-right">

                    <div
                        className={
                            connected
                                ? "live-status online"
                                : "live-status"
                        }
                    >

                        ●{" "}
                        {connected
                            ? "LIVE"
                            : "OFFLINE"
                        }

                    </div>


                    <div className="clock">

                        {formattedTime}

                    </div>


                    <div className="date">

                        {formattedDate}

                    </div>

                </div>

            </header>


            {/* ==================================
                ANNOUNCEMENT
            ================================== */}

            {announcement && (

                <div className="announcement">

                    <div className="announcement-title">

                        📢 PLEASE PROCEED

                    </div>


                    <div className="announcement-ticket">

                        #{announcement.ticketNumber}

                    </div>


                    {announcement.counterNumber && (

                        <div className="announcement-counter">

                            Counter{" "}
                            {announcement.counterNumber}

                        </div>

                    )}

                </div>

            )}


            {/* ==================================
                NOW SERVING
            ================================== */}

            <main>


                <section className="now-serving">

                    <div className="now-serving-label">

                        NOW SERVING

                    </div>


                    <div className="now-serving-ticket">

                        {mainServingTicket

                            ? `#${mainServingTicket.ticketNumber}`

                            : "--"

                        }

                    </div>


                    {mainServingTicket?.counterNumber && (

                        <div className="main-counter">

                            COUNTER{" "}
                            {mainServingTicket.counterNumber}

                        </div>

                    )}

                </section>


                {/* ==================================
                    COUNTERS
                ================================== */}

                <section className="display-section">

                    <h2>
                        COUNTERS
                    </h2>


                    <div className="public-counter-grid">

                        {counterTickets.map(
                            item => (

                                <div
                                    className={
                                        item.ticket
                                            ? "public-counter active"
                                            : "public-counter"
                                    }
                                    key={
                                        item.counterNumber
                                    }
                                >

                                    <div className="public-counter-title">

                                        COUNTER{" "}
                                        {
                                            item.counterNumber
                                        }

                                    </div>


                                    <div className="public-counter-ticket">

                                        {item.ticket

                                            ? `#${item.ticket.ticketNumber}`

                                            : "--"

                                        }

                                    </div>


                                    <div
                                        className={
                                            item.ticket
                                                ? "counter-state serving"
                                                : "counter-state available"
                                        }
                                    >

                                        {item.ticket
                                            ? "🔵 SERVING"
                                            : "🟢 AVAILABLE"
                                        }

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* ==================================
                    SUMMARY
                ================================== */}

                <section className="summary-grid">


                    <div className="summary-card waiting">

                        <span>
                            🟢 WAITING
                        </span>

                        <strong>
                            {waitingCount}
                        </strong>

                    </div>


                    <div className="summary-card serving">

                        <span>
                            🔵 SERVING
                        </span>

                        <strong>
                            {servingCount}
                        </strong>

                    </div>


                    <div className="summary-card served">

                        <span>
                            🔴 SERVED
                        </span>

                        <strong>
                            {servedCount}
                        </strong>

                    </div>


                    <div className="summary-card cancelled">

                        <span>
                            ⚫ CANCELLED
                        </span>

                        <strong>
                            {cancelledCount}
                        </strong>

                    </div>

                </section>


                {/* ==================================
                    TICKET BOARD
                ================================== */}

                <section className="display-section">

                    <div className="section-heading">

                        <h2>
                            TICKET BOARD
                        </h2>


                        <span>
                            LAST #{queue.lastNumber ?? 0}
                        </span>

                    </div>


                    <div className="public-ticket-grid">

                        {tickets.map(
                            ticket => (

                                <div
                                    className={
                                        `public-ticket ${
                                            ticket.status
                                                ?.toLowerCase()
                                        }`
                                    }
                                    key={ticket.id}
                                >

                                    <strong>

                                        #{ticket.ticketNumber}

                                    </strong>


                                    <span>

                                        {ticket.status ===
                                            "WAITING" &&
                                            "🟢 WAITING"
                                        }

                                        {ticket.status ===
                                            "SERVING" &&
                                            "🔵 SERVING"
                                        }

                                        {ticket.status ===
                                            "SERVED" &&
                                            "🔴 SERVED"
                                        }

                                        {ticket.status ===
                                            "CANCELLED" &&
                                            "⚫ CANCELLED"
                                        }

                                    </span>


                                    {ticket.status ===
                                        "SERVING" &&
                                        ticket.counterNumber && (

                                            <small>

                                                Counter{" "}
                                                {
                                                    ticket.counterNumber
                                                }

                                            </small>

                                        )}

                                </div>

                            )
                        )}

                    </div>

                </section>

            </main>


            {/* ==================================
                FOOTER
            ================================== */}

            <footer className="public-footer">

                <span>
                    QFlow • Digital Queue Management
                </span>


                <span>
                    Please wait for your ticket number
                </span>

            </footer>

        </div>

    );

}


export default PublicDisplay;