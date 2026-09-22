// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE_URL =
    "http://localhost:8081/api/queues";

const WEBSOCKET_URL =
    "ws://localhost:8081/ws";


// ==========================================
// GET QUEUE ID
// ==========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const QUEUE_ID =
    urlParams.get("queueId");


let stompClient = null;
let subscription = null;


// ==========================================
// CHECK QUEUE ID
// ==========================================

if (!QUEUE_ID) {

    alert("Queue ID is missing");

    window.location.href =
        "admin.html";
}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        addLog(
            "🚀 QFlow Admin starting..."
        );

        addLog(
            `🏥 Queue ID: ${QUEUE_ID}`
        );

        setupButtons();

        loadQueue();

        connectWebSocket();

    }
);


// ==========================================
// LOAD QUEUE
// ==========================================

async function loadQueue() {

    addLog(
        "📡 Loading queue information..."
    );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/${QUEUE_ID}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const queue =
            await response.json();


        console.log(
            "Queue:",
            queue
        );


        updateQueueUI(queue);


        addLog(
            `✅ Queue #${queue.id} loaded`
        );


    } catch (error) {

        console.error(
            "Failed to load queue:",
            error
        );


        addLog(
            `❌ Failed to load queue: ${error.message}`
        );

    }

}


// ==========================================
// UPDATE QUEUE UI
// ==========================================

function updateQueueUI(queue) {

    const queueName =
        document.getElementById(
            "queueName"
        );

    const queueDescription =
        document.getElementById(
            "queueDescription"
        );

    const queueStatus =
        document.getElementById(
            "queueStatus"
        );

    const currentNumber =
        document.getElementById(
            "currentNumber"
        );

    const lastNumber =
        document.getElementById(
            "lastNumber"
        );

    const waitingCount =
        document.getElementById(
            "waitingCount"
        );

    const nowServing =
        document.getElementById(
            "nowServing"
        );


    // ======================================
    // NAME
    // ======================================

    if (queueName) {

        queueName.innerText =
            `#${queue.id} - ${
                queue.name || "Queue"
            }`;

    }


    // ======================================
    // DESCRIPTION
    // ======================================

    if (queueDescription) {

        queueDescription.innerText =
            queue.description ||
            "No description";

    }


    // ======================================
    // STATUS
    // ======================================

    if (queueStatus) {

        queueStatus.innerText =
            queue.status || "-";

        queueStatus.className =
            `queue-status ${getStatusClass(
                queue.status
            )}`;

    }


    // ======================================
    // CURRENT NUMBER
    // ======================================

    if (currentNumber) {

        currentNumber.innerText =
            queue.currentNumber ?? 0;

    }


    // ======================================
    // LAST NUMBER
    // ======================================

    if (lastNumber) {

        lastNumber.innerText =
            queue.lastNumber ?? 0;

    }


    // ======================================
    // WAITING COUNT
    // ======================================

    if (waitingCount) {

        waitingCount.innerText =
            queue.waitingCount ?? 0;

    }


    // ======================================
    // NOW SERVING
    // ======================================

    if (nowServing) {

        const current =
            queue.currentNumber ?? 0;


        if (current > 0) {

            nowServing.innerText =
                "#" + current;

        } else {

            nowServing.innerText =
                "-";

        }

    }


    // ======================================
    // UPDATE BUTTON STATE
    // ======================================

    updateControlButtons(
        queue.status
    );

}


// ==========================================
// BUTTON STATE
// ==========================================

function updateControlButtons(status) {

    const pauseBtn =
        document.getElementById(
            "pauseBtn"
        );

    const resumeBtn =
        document.getElementById(
            "resumeBtn"
        );

    const closeBtn =
        document.getElementById(
            "closeBtn"
        );

    const callNextBtn =
        document.getElementById(
            "callNextBtn"
        );


    if (!status) {
        return;
    }


    // ======================================
    // OPEN
    // ======================================

    if (status === "OPEN") {

        if (pauseBtn) {
            pauseBtn.disabled = false;
        }

        if (resumeBtn) {
            resumeBtn.disabled = true;
        }

        if (closeBtn) {
            closeBtn.disabled = false;
        }

        if (callNextBtn) {
            callNextBtn.disabled = false;
        }

    }


        // ======================================
        // PAUSED
    // ======================================

    else if (status === "PAUSED") {

        if (pauseBtn) {
            pauseBtn.disabled = true;
        }

        if (resumeBtn) {
            resumeBtn.disabled = false;
        }

        if (closeBtn) {
            closeBtn.disabled = false;
        }

        if (callNextBtn) {
            callNextBtn.disabled = true;
        }

    }


        // ======================================
        // CLOSED
    // ======================================

    else if (status === "CLOSED") {

        if (pauseBtn) {
            pauseBtn.disabled = true;
        }

        if (resumeBtn) {
            resumeBtn.disabled = true;
        }

        if (closeBtn) {
            closeBtn.disabled = true;
        }

        if (callNextBtn) {
            callNextBtn.disabled = true;
        }

    }

}


// ==========================================
// WEBSOCKET CONNECTION
// ==========================================

function connectWebSocket() {

    addLog(
        "🔄 Connecting WebSocket..."
    );


    if (
        typeof StompJs ===
        "undefined"
    ) {

        addLog(
            "❌ StompJs library not found"
        );

        updateConnectionStatus(
            "🔴 STOMP Library Missing",
            false
        );

        return;
    }


    addLog(
        "✅ StompJs library loaded"
    );


    stompClient =
        new StompJs.Client({

            brokerURL:
            WEBSOCKET_URL,

            reconnectDelay:
                5000,

            heartbeatIncoming:
                10000,

            heartbeatOutgoing:
                10000,


            debug:
                function (message) {

                    console.log(
                        "[STOMP]",
                        message
                    );

                },


            // ==================================
            // CONNECTED
            // ==================================

            onConnect:
                function () {

                    addLog(
                        "✅ STOMP CONNECTED"
                    );


                    updateConnectionStatus(
                        "🟢 Connected",
                        true
                    );


                    subscribeQueue();

                },


            // ==================================
            // STOMP ERROR
            // ==================================

            onStompError:
                function (frame) {

                    console.error(
                        "STOMP ERROR:",
                        frame
                    );


                    addLog(
                        "❌ STOMP ERROR"
                    );


                    if (
                        frame.headers &&
                        frame.headers.message
                    ) {

                        addLog(
                            `Message: ${frame.headers.message}`
                        );

                    }


                    updateConnectionStatus(
                        "🔴 STOMP Error",
                        false
                    );

                },


            // ==================================
            // WEBSOCKET ERROR
            // ==================================

            onWebSocketError:
                function (error) {

                    console.error(
                        "WebSocket ERROR:",
                        error
                    );


                    addLog(
                        "❌ WebSocket ERROR"
                    );


                    updateConnectionStatus(
                        "🔴 WebSocket Error",
                        false
                    );

                },


            // ==================================
            // WEBSOCKET CLOSE
            // ==================================

            onWebSocketClose:
                function () {

                    addLog(
                        "🔌 WebSocket connection closed"
                    );


                    updateConnectionStatus(
                        "🔴 Disconnected",
                        false
                    );

                }

        });


    addLog(
        "🚀 Activating WebSocket..."
    );


    stompClient.activate();

}


// ==========================================
// CONNECTION STATUS
// ==========================================

function updateConnectionStatus(
    message,
    connected
) {

    const status =
        document.getElementById(
            "connectionStatus"
        );


    if (!status) {
        return;
    }


    status.innerText =
        message;


    if (connected) {

        status.className =
            "status connected";

    } else {

        status.className =
            "status disconnected";

    }

}


// ==========================================
// SUBSCRIBE QUEUE
// ==========================================

function subscribeQueue() {

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        addLog(
            "❌ STOMP is not connected"
        );

        return;
    }


    if (subscription) {

        subscription.unsubscribe();

        subscription = null;

    }


    const destination =
        `/topic/queue/${QUEUE_ID}`;


    try {

        subscription =
            stompClient.subscribe(
                destination,
                function (message) {

                    try {

                        const event =
                            JSON.parse(
                                message.body
                            );


                        handleEvent(
                            event
                        );


                    } catch (error) {

                        console.error(
                            error
                        );


                        addLog(
                            "❌ Invalid WebSocket event"
                        );

                    }

                }
            );


        addLog(
            `✅ SUBSCRIBED: ${destination}`
        );


    } catch (error) {

        console.error(
            "Subscription error:",
            error
        );


        addLog(
            `❌ Subscription failed: ${error.message}`
        );

    }

}


// ==========================================
// HANDLE EVENTS
// ==========================================

function handleEvent(event) {

    console.log(
        "🔥 QFlow Event:",
        event
    );


    addLog(
        `🔥 EVENT: ${event.eventType}`
    );


    // ======================================
    // TICKET JOINED
    // ======================================

    if (
        event.eventType ===
        "TICKET_JOINED"
    ) {

        addLog(
            `🎟️ Ticket #${event.ticketNumber} joined queue`
        );


        loadQueue();

    }


        // ======================================
        // TICKET CANCELLED
    // ======================================

    else if (
        event.eventType ===
        "TICKET_CANCELLED"
    ) {

        addLog(
            `❌ Ticket #${event.ticketNumber} cancelled`
        );


        loadQueue();

    }


        // ======================================
        // TICKET SERVED
    // ======================================

    else if (
        event.eventType ===
        "TICKET_SERVED"
    ) {

        addLog(
            `✅ Ticket #${event.ticketNumber} served`
        );


        loadQueue();

    }


        // ======================================
        // TICKET CALLED
    // ======================================

    else if (
        event.eventType ===
        "TICKET_CALLED"
    ) {

        addLog(
            `📢 Ticket #${event.ticketNumber} is now serving`
        );


        loadQueue();

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

        const response =
            await fetch(
                `${API_BASE_URL}/${QUEUE_ID}/call-next`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {

            const message =
                await response.text();


            throw new Error(
                message ||
                "No waiting tickets"
            );

        }


        const data =
            await response.json();


        addLog(
            `📢 Called Ticket #${data.ticketNumber}`
        );


        await loadQueue();


    } catch (error) {

        console.error(
            "Call next error:",
            error
        );


        addLog(
            `❌ ${error.message}`
        );

    }

}


// ==========================================
// PAUSE QUEUE
// ==========================================

async function pauseQueue() {

    addLog(
        "⏸️ Pausing queue..."
    );


    await updateQueue(
        "pause"
    );

}


// ==========================================
// RESUME QUEUE
// ==========================================

async function resumeQueue() {

    addLog(
        "▶️ Resuming queue..."
    );


    await updateQueue(
        "resume"
    );

}


// ==========================================
// CLOSE QUEUE
// ==========================================

async function closeQueue() {

    const confirmed =
        confirm(
            `Close Queue #${QUEUE_ID}?`
        );


    if (!confirmed) {
        return;
    }


    addLog(
        "🔒 Closing queue..."
    );


    await updateQueue(
        "close"
    );

}


// ==========================================
// UPDATE QUEUE
// ==========================================

async function updateQueue(
    action
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/${QUEUE_ID}/${action}`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {

            const message =
                await response.text();


            throw new Error(
                message ||
                `Failed to ${action} queue`
            );

        }


        const queue =
            await response.json();


        updateQueueUI(
            queue
        );


        addLog(
            `✅ Queue ${action.toUpperCase()}`
        );


    } catch (error) {

        console.error(
            `Failed to ${action}:`,
            error
        );


        addLog(
            `❌ Failed to ${action} queue`
        );

    }

}


// ==========================================
// BUTTON SETUP
// ==========================================

function setupButtons() {

    const callNextBtn =
        document.getElementById(
            "callNextBtn"
        );

    const pauseBtn =
        document.getElementById(
            "pauseBtn"
        );

    const resumeBtn =
        document.getElementById(
            "resumeBtn"
        );

    const closeBtn =
        document.getElementById(
            "closeBtn"
        );

    const backBtn =
        document.getElementById(
            "backBtn"
        );


    if (callNextBtn) {

        callNextBtn.addEventListener(
            "click",
            callNext
        );

    }


    if (pauseBtn) {

        pauseBtn.addEventListener(
            "click",
            pauseQueue
        );

    }


    if (resumeBtn) {

        resumeBtn.addEventListener(
            "click",
            resumeQueue
        );

    }


    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeQueue
        );

    }


    if (backBtn) {

        backBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "admin.html";

            }
        );

    }

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

    if (!status) {
        return "unknown";
    }


    return status
        .toLowerCase()
        .replaceAll(
            "_",
            "-"
        );

}


// ==========================================
// EVENT LOG
// ==========================================

function addLog(message) {

    const log =
        document.getElementById(
            "eventLog"
        );


    if (!log) {
        return;
    }


    log.textContent +=
        message + "\n";


    log.scrollTop =
        log.scrollHeight;

}