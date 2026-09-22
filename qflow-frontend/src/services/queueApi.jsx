import api from "./api";

/* =========================================================
   GET ALL QUEUES
========================================================= */

export async function getQueues() {
    const response = await api.get("/queues");

    return response.data;
}


/* =========================================================
   GET QUEUE BY ID
========================================================= */

export async function getQueueById(queueId) {
    const response = await api.get(
        `/queues/${queueId}`
    );

    return response.data;
}


/* =========================================================
   CREATE QUEUE
========================================================= */

export async function createQueue({
                                      name,
                                      description
                                  }) {
    const response = await api.post(
        "/queues",
        {
            name,
            description
        }
    );

    return response.data;
}


/* =========================================================
   CALL NEXT TICKET
========================================================= */

export async function callNext(
    queueId,
    counterNumber
) {
    const response = await api.post(
        `/queues/${queueId}/call-next`,
        null,
        {
            params: {
                counter: counterNumber
            }
        }
    );

    return response.data;
}


/* =========================================================
   COMPLETE CURRENT TICKET
========================================================= */

export async function completeCurrentTicket(
    queueId,
    counterNumber
) {
    const response = await api.post(
        `/queues/${queueId}/complete`,
        null,
        {
            params: {
                counter: counterNumber
            }
        }
    );

    return response.data;
}


/* =========================================================
   CANCEL TICKET
========================================================= */

export async function cancelTicket(
    queueId,
    ticketId
) {
    const response = await api.post(
        `/queues/${queueId}/tickets/${ticketId}/cancel`
    );

    return response.data;
}


/* =========================================================
   PAUSE QUEUE
========================================================= */

export async function pauseQueue(
    queueId
) {
    const response = await api.post(
        `/queues/${queueId}/pause`
    );

    return response.data;
}


/* =========================================================
   RESUME QUEUE
========================================================= */

export async function resumeQueue(
    queueId
) {
    const response = await api.post(
        `/queues/${queueId}/resume`
    );

    return response.data;
}


/* =========================================================
   CLOSE QUEUE
========================================================= */

export async function closeQueue(
    queueId
) {
    const response = await api.post(
        `/queues/${queueId}/close`
    );

    return response.data;
}


/* =========================================================
   GET ALL TICKETS
========================================================= */

export async function getAllTickets(
    queueId
) {
    const response = await api.get(
        `/queues/${queueId}/tickets`
    );

    return response.data;
}


/* =========================================================
   GET ALL COUNTERS
========================================================= */

export async function getCounters(
    queueId
) {
    const response = await api.get(
        `/queues/${queueId}/counters`
    );

    return response.data;
}


/* =========================================================
   GET SINGLE COUNTER
========================================================= */

export async function getCounter(
    queueId,
    counterId
) {
    const response = await api.get(
        `/queues/${queueId}/counters/${counterId}`
    );

    return response.data;
}


/* =========================================================
   CREATE COUNTER
========================================================= */

export async function createCounter(
    queueId,
    counterNumber
) {
    const response = await api.post(
        `/queues/${queueId}/counters`,
        {
            counterNumber
        }
    );

    return response.data;
}


/* =========================================================
   ACTIVATE COUNTER
========================================================= */

export async function activateCounter(
    queueId,
    counterId
) {
    const response = await api.post(
        `/queues/${queueId}/counters/${counterId}/available`
    );

    return response.data;
}


/* =========================================================
   DEACTIVATE COUNTER
========================================================= */

export async function deactivateCounter(
    queueId,
    counterId
) {
    const response = await api.post(
        `/queues/${queueId}/counters/${counterId}/offline`
    );

    return response.data;
}


/* =========================================================
   DELETE COUNTER
========================================================= */

export async function deleteCounter(
    queueId,
    counterId
) {
    await api.delete(
        `/queues/${queueId}/counters/${counterId}`
    );

    return true;
}