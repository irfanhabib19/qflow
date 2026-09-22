package com.qflow.queue.kafka;

public enum EventType {

    TICKET_JOINED,
    TICKET_CALLED,
    TICKET_SERVED,
    TICKET_CANCELLED,

    QUEUE_PAUSED,
    QUEUE_RESUMED,
    QUEUE_CLOSED
}