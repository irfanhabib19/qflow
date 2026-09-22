package com.qflow.queue.repository;

import com.qflow.queue.entity.QueueEntry;
import com.qflow.queue.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QueueEntryRepository
        extends JpaRepository<QueueEntry, Long> {

    Optional<QueueEntry>
    findFirstByQueueIdAndStatusOrderByTicketNumberAsc(
            Long queueId,
            TicketStatus status
    );

    long countByQueueIdAndStatusAndTicketNumberLessThan(
            Long queueId,
            TicketStatus status,
            Integer ticketNumber
    );

    long countByQueueIdAndStatus(
            Long queueId,
            TicketStatus status
    );

    List<QueueEntry>
    findTop3ByQueueIdAndStatusOrderByTicketNumberAsc(
            Long queueId,
            TicketStatus status
    );

    // ==========================================
    // ALL TICKETS
    // ==========================================

    List<QueueEntry>
    findByQueueIdOrderByTicketNumberAsc(
            Long queueId
    );
    Optional<QueueEntry>
    findFirstByQueueIdAndStatusAndCounterNumberOrderByTicketNumberAsc(
            Long queueId,
            TicketStatus status,
            Integer counterNumber
    );

    List<QueueEntry> findByQueueIdAndStatus(Long queueId, TicketStatus ticketStatus);
}