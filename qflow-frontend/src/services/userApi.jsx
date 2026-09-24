import api from "./api";


// =====================================================
// JOIN QUEUE
// =====================================================

export async function joinQueue(queueId) {

    const response = await api.post(
        `/queues/${queueId}/join`
    );

    return response.data;
}


// =====================================================
// GET TICKET STATUS
// =====================================================

export async function getTicketStatus(
    queueId,
    ticketId
) {

    const response = await api.get(
        `/queues/${queueId}/tickets/${ticketId}`
    );

    return response.data;
}


// =====================================================
// CANCEL TICKET
// =====================================================

export async function cancelTicket(
    queueId,
    ticketId
) {

    const response = await api.post(
        `/queues/${queueId}/tickets/${ticketId}/cancel`
    );

    return response.data;
}


// =====================================================
// GET MY TICKETS
// =====================================================

export async function getMyTickets() {

    const response = await api.get(
        "/users/me/tickets"
    );

    return response.data;
}