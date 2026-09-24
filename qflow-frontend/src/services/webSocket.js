import { Client } from "@stomp/stompjs";

const WS_URL = "ws://localhost:8080/ws";

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
        console.error("❌ WebSocket queueId is missing");
        return null;
    }

    console.log(
        "🔌 Connecting queue WebSocket:",
        WS_URL
    );

    const client = new Client({
        brokerURL: WS_URL,

        reconnectDelay: 5000,

        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        debug: (message) => {
            console.log("[STOMP]", message);
        },

        onConnect: () => {
            console.log(
                "🟢 Queue WebSocket connected"
            );

            const destination = `/topic/queue/${queueId}`;

            console.log(
                "📡 Subscribing to:",
                destination
            );

            client.subscribe(
                destination,
                (message) => {
                    try {
                        console.log(
                            "📨 Queue WebSocket message:",
                            message.body
                        );

                        const event = JSON.parse(
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

        onStompError: (frame) => {
            console.error(
                "❌ STOMP error:",
                frame
            );

            if (onError) {
                onError(frame);
            }
        },

        onWebSocketError: (error) => {
            console.error(
                "❌ WebSocket error:",
                error
            );

            if (onError) {
                onError(error);
            }
        },

        onWebSocketClose: (event) => {
            console.warn(
                "🔴 Queue WebSocket closed:",
                event
            );
        },
    });

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
        brokerURL: WS_URL,

        reconnectDelay: 5000,

        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        debug: (message) => {
            console.log("[STOMP]", message);
        },

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

            client.subscribe(
                destination,
                (message) => {
                    try {
                        console.log(
                            "📨 User WebSocket message:",
                            message.body
                        );

                        const event = JSON.parse(
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

        onStompError: (frame) => {
            console.error(
                "❌ STOMP error:",
                frame
            );

            if (onError) {
                onError(frame);
            }
        },

        onWebSocketError: (error) => {
            console.error(
                "❌ WebSocket error:",
                error
            );

            if (onError) {
                onError(error);
            }
        },

        onWebSocketClose: (event) => {
            console.warn(
                "🔴 User WebSocket closed:",
                event
            );
        },
    });

    client.activate();

    return client;
}