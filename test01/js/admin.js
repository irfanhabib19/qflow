const API_BASE_URL = "http://localhost:8081/api/queues";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 QFlow Admin JS loaded");

    loadQueues();

});


// ==========================================
// LOAD QUEUES
// ==========================================

async function loadQueues() {

    const container =
        document.getElementById("queueList");

    if (!container) {

        console.error(
            "❌ queueList not found"
        );

        return;
    }

    container.innerHTML =
        "<p>🔄 Loading queues...</p>";

    console.log(
        "📡 Request:",
        API_BASE_URL
    );

    try {

        const response =
            await fetch(API_BASE_URL);

        console.log(
            "📥 Response:",
            response
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} ${response.statusText}`
            );

        }

        const queues =
            await response.json();

        console.log(
            "✅ Queues received:",
            queues
        );

        if (
            !Array.isArray(queues) ||
            queues.length === 0
        ) {

            container.innerHTML = `
                <div class="empty">
                    No queues found.
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        queues.forEach(queue => {

            container.appendChild(
                createQueueCard(queue)
            );

        });

    } catch (error) {

        console.error(
            "❌ LOAD QUEUES ERROR:",
            error
        );

        container.innerHTML = `
            <div class="error">

                <h3>❌ Failed to load queues</h3>

                <p>
                    ${error.message}
                </p>

                <button onclick="loadQueues()">
                    🔄 Retry
                </button>

            </div>
        `;
    }
}


// ==========================================
// CREATE QUEUE CARD
// ==========================================

function createQueueCard(queue) {

    const card =
        document.createElement("div");

    card.className =
        "queue-card";

    card.innerHTML = `

        <div class="queue-header">

            <div>

                <h3>
                    Queue #${queue.id}
                </h3>

                <p class="queue-name">
                    ${queue.name || "Unnamed Queue"}
                </p>

                <p class="queue-description">
                    ${queue.description || ""}
                </p>

            </div>

            <span class="
                queue-status
                ${getStatusClass(queue.status)}
            ">
                ${queue.status || "UNKNOWN"}
            </span>

        </div>


        <div class="queue-info">

            <!-- CURRENT NUMBER -->

            <div class="info-box">

                <span>
                    Current Number
                </span>

                <strong>
                    ${queue.currentNumber ?? 0}
                </strong>

            </div>


            <!-- LAST TICKET -->

            <div class="info-box">

                <span>
                    Last Ticket
                </span>

                <strong>
                    ${queue.lastNumber ?? 0}
                </strong>

            </div>


            <!-- WAITING -->

            <div class="info-box">

                <span>
                    Waiting
                </span>

                <strong>
                    ${queue.waitingCount ?? 0}
                </strong>

            </div>


            <!-- QUEUE ID -->

            <div class="info-box">

                <span>
                    Queue ID
                </span>

                <strong>
                    #${queue.id}
                </strong>

            </div>

        </div>


        <div class="queue-actions">

            <!-- OPEN -->

            <button
                class="open-btn"
                onclick="openQueue(${queue.id})">

                👁️ Open

            </button>


            <!-- PAUSE -->

            <button
                class="pause-btn"
                onclick="pauseQueue(${queue.id})">

                ⏸️ Pause

            </button>


            <!-- RESUME -->

            <button
                class="resume-btn"
                onclick="resumeQueue(${queue.id})">

                ▶️ Resume

            </button>


            <!-- CLOSE -->

            <button
                class="close-btn"
                onclick="closeQueue(${queue.id})">

                🔒 Close

            </button>

        </div>

    `;

    return card;
}


// ==========================================
// OPEN QUEUE
// ==========================================

function openQueue(queueId) {

    console.log(
        "🔥 Opening Queue:",
        queueId
    );

    window.location.href =
        `queue-admin.html?queueId=${queueId}`;
}


// ==========================================
// PAUSE
// ==========================================

async function pauseQueue(queueId) {

    console.log(
        "⏸️ Pausing Queue:",
        queueId
    );

    await updateQueue(
        queueId,
        "pause"
    );
}


// ==========================================
// RESUME
// ==========================================

async function resumeQueue(queueId) {

    console.log(
        "▶️ Resuming Queue:",
        queueId
    );

    await updateQueue(
        queueId,
        "resume"
    );
}


// ==========================================
// CLOSE
// ==========================================

async function closeQueue(queueId) {

    console.log(
        "🔒 Closing Queue:",
        queueId
    );

    const confirmed =
        confirm(
            `Close Queue #${queueId}?`
        );

    if (!confirmed) {
        return;
    }

    await updateQueue(
        queueId,
        "close"
    );
}


// ==========================================
// UPDATE QUEUE
// ==========================================

async function updateQueue(
    queueId,
    action
) {

    try {

        console.log(
            `📡 POST ${API_BASE_URL}/${queueId}/${action}`
        );

        const response =
            await fetch(
                `${API_BASE_URL}/${queueId}/${action}`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text ||
                `HTTP ${response.status}`
            );
        }

        const updatedQueue =
            await response.json();

        console.log(
            "✅ Updated:",
            updatedQueue
        );

        await loadQueues();

    } catch (error) {

        console.error(
            "❌ Update error:",
            error
        );

        alert(
            `Failed to ${action} Queue #${queueId}`
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
        .replaceAll("_", "-");
}