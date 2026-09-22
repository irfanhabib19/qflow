package com.qflow.queue.kafka;

import java.time.LocalDateTime;

public class QFlowEvent {
    private EventType eventType;
    private Long queueId;
    private Long ticketId;
    private Integer ticketNumber;
    private LocalDateTime timestamp;

    public QFlowEvent() {
    }

    public QFlowEvent(
            EventType eventType,
            Long queueId,
            Long ticketId,
            Integer ticketNumber,
            LocalDateTime timestamp) {

        this.eventType = eventType;
        this.queueId = queueId;
        this.ticketId = ticketId;
        this.ticketNumber = ticketNumber;
        this.timestamp = timestamp;
    }



    public Long getQueueId() {
        return queueId;
    }

    public void setQueueId(Long queueId) {
        this.queueId = queueId;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Integer getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(Integer ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

}