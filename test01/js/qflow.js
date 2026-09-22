const QUEUE_ID = 4;

let client = null;
let subscription = null;
let ticketId = null;


// ==========================================
// LOG
// ==========================================

function addLog(message) {

    const log = document.getElementById("eventLog");

    if (!log) {
        console.error("eventLog element not found");
        return;
    }

    log.textContent += message + "\n";
    log.scrollTop = log.scrollHeight;
}


// ==========================================
// CONNECTION STATUS
// ==========================================

function updateConnectionStatus(message) {

    const status =
        document.getElementById("connectionStatus");

    if (status) {
        status.innerText = message;
    }
}


// ==========================================
// CONNECT WEBSOCKET
// ==========================================

function connectWebSocket() {

    addLog("🔄 Connecting...");
    updateConnectionStatus("🟡 Connecting...");

    client = new StompJs.Client({

        brokerURL: "ws://localhost:8081/ws",

        reconnectDelay: 5000,

        debug: function (message) {
            console.log("[STOMP]", message);
        },


        // ======================================
        // CONNECTED
        // ======================================

        onConnect: function (frame) {

            console.log(
                "STOMP connected:",
                frame
            );

            updateConnectionStatus(
                "🟢 Connected"
            );

            addLog(
                "✅ STOMP CONNECTED"
            );

            subscribeQueue();
        },


        // ======================================
        // STOMP ERROR
        // ======================================

        onStompError: function (frame) {

            console.error(
                "STOMP ERROR:",
                frame
            );

            updateConnectionStatus(
                "🔴 STOMP Error"
            );

            addLog(
                "❌ STOMP ERROR"
            );

            if (frame.headers) {

                addLog(
                    "Message: " +
                    (
                        frame.headers["message"]
                        || "Unknown"
                    )
                );
            }

            if (frame.body) {
                addLog(frame.body);
            }
        },


        // ======================================
        // WEBSOCKET ERROR
        // ======================================

        onWebSocketError: function (error) {

            console.error(
                "WebSocket ERROR:",
                error
            );

            updateConnectionStatus(
                "🔴 Disconnected"
            );

            addLog(
                "❌ WebSocket connection failed"
            );
        },


        // ======================================
        // CONNECTION CLOSED
        // ======================================

        onWebSocketClose: function () {

            console.log(
                "WebSocket connection closed"
            );

            updateConnectionStatus(
                "🔴 Disconnected"
            );

            addLog(
                "🔌 WebSocket connection closed"
            );

            subscription = null;
        }

    });


    client.activate();
}


// ==========================================
// SUBSCRIBE TO QUEUE
// ==========================================

function subscribeQueue() {

    if (!client || !client.connected) {

        addLog(
            "❌ STOMP is not connected"
        );

        return;
    }


    if (subscription) {

        addLog(
            "⚠️ Already subscribed"
        );

        return;
    }


    subscription = client.subscribe(

        `/topic/queue/${QUEUE_ID}`,

        function (message) {

            console.log(
                "WebSocket message:",
                message.body
            );

            try {

                const event =
                    JSON.parse(message.body);

                handleEvent(event);

            } catch (error) {

                console.error(
                    "Invalid WebSocket message:",
                    error
                );

                addLog(
                    "❌ Invalid event received"
                );
            }
        }
    );


    addLog(
        `✅ SUBSCRIBED: /topic/queue/${QUEUE_ID}`
    );
}


// ==========================================
// HANDLE WEBSOCKET EVENTS
// ==========================================

function handleEvent(event) {

    console.log(
        "QFlow Event:",
        event
    );


    addLog(
        `🔥 EVENT: ${event.eventType}`
    );


    // ======================================
    // TICKET JOINED
    // ======================================

    if (
        event.eventType === "TICKET_JOINED"
    ) {

        addLog(
            `🎟️ Ticket #${event.ticketNumber} joined queue`
        );
    }


    // ======================================
    // TICKET CANCELLED
    // ======================================

    if (
        event.eventType === "TICKET_CANCELLED"
    ) {

        addLog(
            `❌ Ticket #${event.ticketNumber} cancelled`
        );


        // If this is MY ticket
        if (
            ticketId &&
            Number(event.ticketId) === Number(ticketId)
        ) {

            document.getElementById(
                "ticketStatus"
            ).innerText =
                "Status: CANCELLED";
        }
    }


    // ======================================
    // TICKET SERVED
    // ======================================

    if (
        event.eventType === "TICKET_SERVED"
    ) {

        addLog(
            `✅ Ticket #${event.ticketNumber} served`
        );


        if (
            ticketId &&
            Number(event.ticketId) === Number(ticketId)
        ) {

            document.getElementById(
                "ticketStatus"
            ).innerText =
                "Status: SERVED";
        }
    }


    // ======================================
    // TICKET CALLED
    // ======================================

    if (
        event.eventType === "TICKET_CALLED"
    ) {

        const nowServing =
            document.getElementById(
                "nowServing"
            );


        if (nowServing) {

            nowServing.innerText =
                "#" + event.ticketNumber;
        }


        addLog(
            `📢 Ticket #${event.ticketNumber} is now serving`
        );


        if (
            ticketId &&
            Number(event.ticketId) === Number(ticketId)
        ) {

            document.getElementById(
                "ticketStatus"
            ).innerText =
                "Status: CALLED";
        }
    }


    // ======================================
    // IMPORTANT
    // Refresh my position
    // after every queue event
    // ======================================

    if (ticketId) {

        refreshTicketStatus();

    }
}


// ==========================================
// JOIN QUEUE
// ==========================================

async function joinQueue() {

    addLog(
        "🎟️ Joining queue..."
    );


    try {

        const response = await fetch(

            `http://localhost:8081/api/queues/${QUEUE_ID}/join`,

            {
                method: "POST"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        // Save ticket ID
        ticketId = data.id;


        // Ticket number
        document.getElementById(
            "ticketNumber"
        ).innerText =
            "#" + data.ticketNumber;


        // Initial status
        document.getElementById(
            "ticketStatus"
        ).innerText =
            "Status: " + data.status;


        addLog(
            `🎟️ Joined queue → Ticket #${data.ticketNumber}`
        );


        // Get actual position
        await refreshTicketStatus();

    }


    catch (error) {

        console.error(
            "Join error:",
            error
        );

        addLog(
            "❌ Could not join queue"
        );
    }
}


// ==========================================
// GET TICKET STATUS
// ==========================================

async function refreshTicketStatus() {

    if (!ticketId) {
        return;
    }


    try {

        const response = await fetch(

            `http://localhost:8081/api/queues/${QUEUE_ID}/tickets/${ticketId}`

        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "📊 Updated ticket status:",
            data
        );


        // ======================================
        // TICKET NUMBER
        // ======================================

        document.getElementById(
            "ticketNumber"
        ).innerText =
            "#" + data.ticketNumber;


        // ======================================
        // PEOPLE AHEAD
        // ======================================

        document.getElementById(
            "peopleAhead"
        ).innerText =
            data.peopleAhead;


        // ======================================
        // POSITION
        // ======================================

        document.getElementById(
            "position"
        ).innerText =
            data.position;


        // ======================================
        // STATUS
        // ======================================

        document.getElementById(
            "ticketStatus"
        ).innerText =
            "Status: " + data.ticketStatus;


        // ======================================
        // CURRENT SERVING
        // ======================================

        const nowServing =
            document.getElementById(
                "nowServing"
            );


        if (
            nowServing &&
            data.currentServing !== undefined &&
            data.currentServing !== 0
        ) {

            nowServing.innerText =
                "#" + data.currentServing;
        }

    }


    catch (error) {

        console.error(
            "❌ Failed to refresh ticket status:",
            error
        );
    }
}


// ==========================================
// CANCEL TICKET
// ==========================================

async function cancelTicket() {

    if (!ticketId) {

        addLog(
            "❌ No ticket to cancel"
        );

        return;
    }


    try {

        const response = await fetch(

            `http://localhost:8081/api/queues/${QUEUE_ID}/tickets/${ticketId}/cancel`,

            {
                method: "POST"
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        document.getElementById(
            "ticketStatus"
        ).innerText =
            "Status: " + data.status;


        addLog(
            `❌ Ticket #${data.ticketNumber} cancelled`
        );


        // Get latest state
        await refreshTicketStatus();

    }


    catch (error) {

        console.error(
            "Cancel error:",
            error
        );

        addLog(
            "❌ Failed to cancel ticket"
        );
    }
}


// ==========================================
// CALL NEXT
// ==========================================

async function callNext() {

    addLog(
        "📢 Calling next ticket..."
    );


    try {

        const response = await fetch(

            `http://localhost:8081/api/queues/${QUEUE_ID}/call-next`,

            {
                method: "POST"
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "No waiting tickets"
            );
        }


        const data =
            await response.json();


        addLog(
            `📢 Called Ticket #${data.ticketNumber}`
        );


        // WebSocket event will update
        // the dashboard automatically

    }


    catch (error) {

        console.error(
            "Call next error:",
            error
        );

        addLog(
            "❌ " + error.message
        );
    }
}


// ==========================================
// BUTTON EVENTS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const joinBtn =
            document.getElementById(
                "joinBtn"
            );


        const cancelBtn =
            document.getElementById(
                "cancelBtn"
            );


        const callNextBtn =
            document.getElementById(
                "callNextBtn"
            );


        if (joinBtn) {

            joinBtn.addEventListener(
                "click",
                joinQueue
            );
        }


        if (cancelBtn) {

            cancelBtn.addEventListener(
                "click",
                cancelTicket
            );
        }


        if (callNextBtn) {

            callNextBtn.addEventListener(
                "click",
                callNext
            );
        }


        // Start WebSocket
        connectWebSocket();

    }
);