package com.qflow.queue.dto;

import com.qflow.queue.entity.TicketStatus;

import java.time.LocalDateTime;

public record QueueEntryResponse(
        Long id,
        Integer ticketNumber,
        TicketStatus status,
        Integer counterNumber,
        Long queueId,
        LocalDateTime joinedAt
) {
}