package com.qflow.queue.dto;

import com.qflow.queue.entity.TicketStatus;

public record QueueEntryStatusResponse(Long ticketId, Integer ticketNumber, TicketStatus ticketStatus, Long queueId,
  Integer currentServing, Integer peopleAhead,Integer position ) {
}
