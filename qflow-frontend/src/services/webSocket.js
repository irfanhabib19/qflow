import { Client } from "@stomp/stompjs";

// =====================================================
// WEBSOCKET CONFIGURATION
// =====================================================
//
// Local:
// VITE_WS_URL=ws://localhost:8080/ws
//
// Production:
// VITE_WS_URL=wss://qflow-ramd.onrender.com/ws
//

const WS_URL =
    import.meta.env.VITE_WS_URL ||
    "ws://localhost:8080/ws";


// =====================================================
// QUEUE WEBSOCKET
// Used by Display Board / Queue Display
// =====================================================

export function createWebSocketClient(
    queueId,
    onEvent,
    onConnect,
    onError
) {

    if (!queueId) {
        console.error(
            "❌ WebSocket queueId is missing"
        );

        return null;
    }

    console.log(
        "🔌 Connecting queue WebSocket:",
        WS_URL
    );

    const client = new Client({

        // WebSocket URL
        brokerURL: WS_URL,

        // Automatically reconnect
        reconnectDelay: 5000,

        // Heartbeat
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        // STOMP debug logs
        debug: (message) => {
            console.log(
                "[STOMP]",
                message
            );
        },


        // =================================================
        // CONNECTED
        // =================================================

        onConnect: () => {

            console.log(
                "🟢 Queue WebSocket connected"
            );

            const destination =
                `/topic/queue/${queueId}`;

            console.log(
                "📡 Subscribing to:",
                destination
            );


            // Subscribe to queue events
            client.subscribe(
                destination,
                (message) => {

                    try {

                        console.log(
                            "📨 Queue WebSocket message:",
                            message.body
                        );

                        const event =
                            JSON.parse(
                                message.body
                            );

                        console.log(
                            "📡 Queue event:",
                            event
                        );

                        if (onEvent) {
                            onEvent(event);
                        }

                    } catch (error) {

                        console.error(
                            "❌ Event parsing failed:",
                            error
                        );
                    }
                }
            );


            if (onConnect) {
                onConnect();
            }
        },


        // =================================================
        // STOMP ERROR
        // =================================================

        onStompError: (frame) => {

            console.error(
                "❌ STOMP error:",
                frame
            );

            if (onError) {
                onError(frame);
            }
        },


        // =================================================
        // WEBSOCKET ERROR
        // =================================================

        onWebSocketError: (error) => {

            console.error(
                "❌ WebSocket error:",
                error
            );

            if (onError) {
                onError(error);
            }
        },


        // =================================================
        // WEBSOCKET CLOSED
        // =================================================

        onWebSocketClose: (event) => {

            console.warn(
                "🔴 Queue WebSocket closed:",
                event
            );
        },
    });


    // Start connection
    client.activate();

    return client;
}



// =====================================================
// USER WEBSOCKET
// Used by My Tickets
// =====================================================

export function createUserWebSocketClient(
    userId,
    onEvent,
    onConnect,
    onError
) {

    if (!userId) {

        console.error(
            "❌ WebSocket userId is missing"
        );

        return null;
    }

    console.log(
        "🔌 Connecting user WebSocket:",
        WS_URL
    );

    const client = new Client({

        // WebSocket URL
        brokerURL: WS_URL,

        // Automatically reconnect
        reconnectDelay: 5000,

        // Heartbeat
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        // STOMP debug
        debug: (message) => {

            console.log(
                "[STOMP]",
                message
            );
        },


        // =================================================
        // CONNECTED
        // =================================================

        onConnect: () => {

            console.log(
                "🟢 User WebSocket connected"
            );

            const destination =
                `/topic/user/${userId}`;

            console.log(
                "📡 Subscribing to:",
                destination
            );


            // Subscribe to user-specific events
            client.subscribe(
                destination,
                (message) => {

                    try {

                        console.log(
                            "📨 User WebSocket message:",
                            message.body
                        );

                        const event =
                            JSON.parse(
                                message.body
                            );

                        console.log(
                            "📡 User ticket event:",
                            event
                        );

                        if (onEvent) {
                            onEvent(event);
                        }

                    } catch (error) {

                        console.error(
                            "❌ Event parsing failed:",
                            error
                        );
                    }
                }
            );


            if (onConnect) {
                onConnect();
            }
        },


        // =================================================
        // STOMP ERROR
        // =================================================

        onStompError: (frame) => {

            console.error(
                "❌ STOMP error:",
                frame
            );

            if (onError) {
                onError(frame);
            }
        },


        // =================================================
        // WEBSOCKET ERROR
        // =================================================

        onWebSocketError: (error) => {

            console.error(
                "❌ WebSocket error:",
                error
            );

            if (onError) {
                onError(error);
            }
        },


        // =================================================
        // WEBSOCKET CLOSED
        // =================================================

        onWebSocketClose: (event) => {

            console.warn(
                "🔴 User WebSocket closed:",
                event
            );
        },
    });


    // Start connection
    client.activate();

    return client;
}