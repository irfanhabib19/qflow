package com.qflow.queue.service;

import com.qflow.queue.dto.QueueEntryResponse;
import com.qflow.queue.dto.QueueEntryStatusResponse;
import com.qflow.queue.entity.Counter;
import com.qflow.queue.entity.CounterStatus;
import com.qflow.queue.entity.Queue;
import com.qflow.queue.entity.QueueEntry;
import com.qflow.queue.entity.QueueStatus;
import com.qflow.queue.entity.TicketStatus;
import com.qflow.queue.exception.QueueClosedException;
import com.qflow.queue.exception.QueueNotFoundException;
import com.qflow.queue.exception.QueuePausedException;
import com.qflow.queue.kafka.EventType;
import com.qflow.queue.kafka.QFlowEvent;
import com.qflow.queue.repository.CounterRepository;
import com.qflow.queue.repository.QueueEntryRepository;
import com.qflow.queue.repository.QueueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QueueEntryService {

    private final QueueRepository queueRepository;

    private final QueueEntryRepository queueEntryRepository;

    private final CounterRepository counterRepository;

    private final OutboxService outboxService;

    private final RedisService redisService;


    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public QueueEntryService(
            QueueRepository queueRepository,
            QueueEntryRepository queueEntryRepository,
            CounterRepository counterRepository,
            RedisService redisService,
            OutboxService outboxService) {

        this.queueRepository =
                queueRepository;

        this.queueEntryRepository =
                queueEntryRepository;

        this.counterRepository =
                counterRepository;

        this.redisService =
                redisService;

        this.outboxService =
                outboxService;
    }


    // ==========================================
    // JOIN QUEUE
    // ==========================================

    @Transactional
    public QueueEntryResponse joinQueue(
            Long queueId) {

        Queue queue =
                queueRepository
                        .findByIdForUpdate(queueId)
                        .orElseThrow(() ->
                                new QueueNotFoundException(
                                        "Queue not found with id: "
                                                + queueId
                                )
                        );


        // ==========================================
        // CHECK QUEUE STATUS
        // ==========================================

        if (queue.getStatus()
                == QueueStatus.CLOSED) {

            throw new QueueClosedException(
                    "Queue is currently closed"
            );
        }


        if (queue.getStatus()
                == QueueStatus.PAUSED) {

            throw new QueuePausedException(
                    "Queue is currently paused"
            );
        }


        // ==========================================
        // GENERATE NEXT TICKET
        // ==========================================

        Integer lastNumber =
                queue.getLastNumber();


        int nextTicketNumber =
                lastNumber == null
                        ? 1
                        : lastNumber + 1;


        queue.setLastNumber(
                nextTicketNumber
        );


        queueRepository.save(queue);


        // ==========================================
        // CREATE ENTRY
        // ==========================================

        QueueEntry entry =
                new QueueEntry();


        entry.setTicketNumber(
                nextTicketNumber
        );


        entry.setQueue(queue);


        entry.setStatus(
                TicketStatus.WAITING
        );


        // ==========================================
        // SAVE
        // ==========================================

        QueueEntry savedEntry =
                queueEntryRepository.save(
                        entry
                );


        // ==========================================
        // EVENT
        // ==========================================

        QFlowEvent event =
                new QFlowEvent(
                        EventType.TICKET_JOINED,
                        queue.getId(),
                        savedEntry.getId(),
                        savedEntry.getTicketNumber(),
                        LocalDateTime.now()
                );


        outboxService.saveEvent(event);


        // ==========================================
        // RESPONSE
        // ==========================================

        return toResponse(
                savedEntry
        );
    }


    // ==========================================
    // GET TICKET STATUS
    // ==========================================

    @Transactional(readOnly = true)
    public QueueEntryStatusResponse getTicketStatus(
            Long queueId,
            Long ticketId) {

        QueueEntry entry =
                queueEntryRepository
                        .findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found with id: "
                                                + ticketId
                                )
                        );


        // ==========================================
        // VERIFY QUEUE
        // ==========================================

        if (!entry.getQueue()
                .getId()
                .equals(queueId)) {

            throw new RuntimeException(
                    "Ticket does not belong to this queue"
            );
        }


        int ticketNumber =
                entry.getTicketNumber();


        int peopleAhead = 0;

        int position = 0;


        // ==========================================
        // WAITING
        // ==========================================

        if (entry.getStatus()
                == TicketStatus.WAITING) {

            peopleAhead =
                    (int)
                            queueEntryRepository
                                    .countByQueueIdAndStatusAndTicketNumberLessThan(
                                            queueId,
                                            TicketStatus.WAITING,
                                            ticketNumber
                                    );


            position =
                    peopleAhead + 1;
        }


        // ==========================================
        // SERVING
        // ==========================================

        else if (
                entry.getStatus()
                        == TicketStatus.SERVING
        ) {

            peopleAhead = 0;

            position = 0;
        }


        // ==========================================
        // SERVED / CANCELLED
        // ==========================================

        else {

            peopleAhead = 0;

            position = 0;
        }


        // ==========================================
        // CURRENT DISPLAY TICKET
        // ==========================================

        String currentTicketKey =
                getGlobalCurrentTicketKey(
                        queueId
                );


        String currentValue =
                redisService.get(
                        currentTicketKey
                );


        int currentServing =
                currentValue == null
                        ? 0
                        : Integer.parseInt(
                        currentValue
                );


        // ==========================================
        // RESPONSE
        // ==========================================

        return new QueueEntryStatusResponse(
                entry.getId(),
                ticketNumber,
                entry.getStatus(),
                queueId,
                currentServing,
                peopleAhead,
                position
        );
    }


    // ==========================================
    // CALL NEXT
    //
    // WAITING → SERVING
    // ==========================================

    @Transactional
    public QueueEntryResponse callNext(
            Long queueId,
            Integer counterNumber) {


        // ==========================================
        // LOCK QUEUE
        //
        // Prevents two counters from taking
        // the same waiting ticket.
        // ==========================================

        Queue queue =
                queueRepository
                        .findByIdForUpdate(queueId)
                        .orElseThrow(() ->
                                new QueueNotFoundException(
                                        "Queue not found with id: "
                                                + queueId
                                )
                        );


        // ==========================================
        // CHECK QUEUE STATUS
        // ==========================================

        if (queue.getStatus()
                == QueueStatus.CLOSED) {

            throw new QueueClosedException(
                    "Queue is currently closed"
            );
        }


        if (queue.getStatus()
                == QueueStatus.PAUSED) {

            throw new QueuePausedException(
                    "Queue is currently paused"
            );
        }


        // ==========================================
        // FIND REAL COUNTER
        // ==========================================

        Counter counter =
                validateCounter(
                        queueId,
                        counterNumber
                );


        // ==========================================
        // CHECK COUNTER STATUS
        // ==========================================

        if (counter.getStatus()
                == CounterStatus.SERVING) {

            throw new IllegalStateException(
                    "Counter "
                            + counterNumber
                            + " is already serving a ticket"
            );
        }


        if (counter.getStatus()
                == CounterStatus.OFFLINE) {

            throw new IllegalStateException(
                    "Counter "
                            + counterNumber
                            + " is offline"
            );
        }


        // ==========================================
        // FIND NEXT WAITING
        // ==========================================

        QueueEntry nextEntry =
                queueEntryRepository
                        .findFirstByQueueIdAndStatusOrderByTicketNumberAsc(
                                queueId,
                                TicketStatus.WAITING
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No waiting tickets in this queue"
                                )
                        );


        // ==========================================
        // ASSIGN COUNTER
        // ==========================================

        nextEntry.setCounterNumber(
                counterNumber
        );


        nextEntry.setStatus(
                TicketStatus.SERVING
        );


        // ==========================================
        // COUNTER → SERVING
        // ==========================================

        counter.setStatus(
                CounterStatus.SERVING
        );


        counterRepository.save(
                counter
        );


        // ==========================================
        // UPDATE QUEUE CURRENT NUMBER
        // ==========================================

        queue.setCurrentNumber(
                nextEntry.getTicketNumber()
        );


        // ==========================================
        // SAVE TICKET
        // ==========================================

        QueueEntry savedEntry =
                queueEntryRepository.save(
                        nextEntry
                );


        // ==========================================
        // SAVE QUEUE
        // ==========================================

        queueRepository.save(
                queue
        );


        // ==========================================
        // REDIS - COUNTER SPECIFIC
        // ==========================================

        String counterKey =
                getCounterCurrentTicketKey(
                        queueId,
                        counterNumber
                );


        redisService.set(
                counterKey,
                String.valueOf(
                        savedEntry.getTicketNumber()
                )
        );


        // ==========================================
        // REDIS - GLOBAL
        // ==========================================

        String globalKey =
                getGlobalCurrentTicketKey(
                        queueId
                );


        redisService.set(
                globalKey,
                String.valueOf(
                        savedEntry.getTicketNumber()
                )
        );


        // ==========================================
        // EVENT
        // ==========================================

        QFlowEvent calledEvent =
                new QFlowEvent(
                        EventType.TICKET_CALLED,
                        queueId,
                        savedEntry.getId(),
                        savedEntry.getTicketNumber(),
                        LocalDateTime.now()
                );


        outboxService.saveEvent(
                calledEvent
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return toResponse(
                savedEntry
        );
    }


    // ==========================================
    // COMPLETE CURRENT TICKET
    //
    // SERVING → SERVED
    // ==========================================

    @Transactional
    public QueueEntryResponse completeCurrentTicket(
            Long queueId,
            Integer counterNumber) {


        // ==========================================
        // LOCK QUEUE
        // ==========================================

        Queue queue =
                queueRepository
                        .findByIdForUpdate(queueId)
                        .orElseThrow(() ->
                                new QueueNotFoundException(
                                        "Queue not found with id: "
                                                + queueId
                                )
                        );


        // ==========================================
        // FIND REAL COUNTER
        // ==========================================

        Counter counter =
                validateCounter(
                        queueId,
                        counterNumber
                );


        // ==========================================
        // FIND CURRENT TICKET
        // ==========================================

        QueueEntry currentEntry =
                queueEntryRepository
                        .findFirstByQueueIdAndStatusAndCounterNumberOrderByTicketNumberAsc(
                                queueId,
                                TicketStatus.SERVING,
                                counterNumber
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Counter "
                                                + counterNumber
                                                + " is not serving any ticket"
                                )
                        );


        // ==========================================
        // SERVING → SERVED
        // ==========================================

        currentEntry.setStatus(
                TicketStatus.SERVED
        );


        // ==========================================
        // COUNTER → AVAILABLE
        // ==========================================

        counter.setStatus(
                CounterStatus.AVAILABLE
        );


        counterRepository.save(
                counter
        );


        // ==========================================
        // SAVE TICKET
        // ==========================================

        QueueEntry savedEntry =
                queueEntryRepository.save(
                        currentEntry
                );


        // ==========================================
        // CLEAR COUNTER REDIS
        // ==========================================

        String counterKey =
                getCounterCurrentTicketKey(
                        queueId,
                        counterNumber
                );


        redisService.delete(
                counterKey
        );


        // ==========================================
        // FIND REMAINING SERVING TICKETS
        // ==========================================

        List<QueueEntry> servingTickets =
                queueEntryRepository
                        .findByQueueIdAndStatus(
                                queueId,
                                TicketStatus.SERVING
                        );


        // ==========================================
        // UPDATE GLOBAL CURRENT NUMBER
        // ==========================================

        if (servingTickets.isEmpty()) {

            queue.setCurrentNumber(
                    0
            );


            redisService.delete(
                    getGlobalCurrentTicketKey(
                            queueId
                    )
            );

        } else {

            QueueEntry latestServing =
                    servingTickets
                            .stream()
                            .max(
                                    (a, b) ->
                                            Integer.compare(
                                                    a.getTicketNumber(),
                                                    b.getTicketNumber()
                                            )
                            )
                            .orElse(null);


            if (latestServing != null) {

                queue.setCurrentNumber(
                        latestServing.getTicketNumber()
                );


                redisService.set(
                        getGlobalCurrentTicketKey(
                                queueId
                        ),
                        String.valueOf(
                                latestServing.getTicketNumber()
                        )
                );
            }
        }


        // ==========================================
        // SAVE QUEUE
        // ==========================================

        queueRepository.save(
                queue
        );


        // ==========================================
        // EVENT
        // ==========================================

        QFlowEvent servedEvent =
                new QFlowEvent(
                        EventType.TICKET_SERVED,
                        queueId,
                        savedEntry.getId(),
                        savedEntry.getTicketNumber(),
                        LocalDateTime.now()
                );


        outboxService.saveEvent(
                servedEvent
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return toResponse(
                savedEntry
        );
    }


    // ==========================================
    // CANCEL TICKET
    // ==========================================

    @Transactional
    public QueueEntryResponse cancelTicket(
            Long queueId,
            Long ticketId) {

        QueueEntry entry =
                queueEntryRepository
                        .findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found with id: "
                                                + ticketId
                                )
                        );


        // ==========================================
        // VERIFY QUEUE
        // ==========================================

        if (!entry.getQueue()
                .getId()
                .equals(queueId)) {

            throw new RuntimeException(
                    "Ticket does not belong to this queue"
            );
        }


        // ==========================================
        // ONLY WAITING CAN CANCEL
        // ==========================================

        if (entry.getStatus()
                != TicketStatus.WAITING) {

            throw new RuntimeException(
                    "Only waiting tickets can be cancelled"
            );
        }


        // ==========================================
        // CANCEL
        // ==========================================

        entry.setStatus(
                TicketStatus.CANCELLED
        );


        QueueEntry savedEntry =
                queueEntryRepository.save(
                        entry
                );


        // ==========================================
        // EVENT
        // ==========================================

        QFlowEvent cancelledEvent =
                new QFlowEvent(
                        EventType.TICKET_CANCELLED,
                        queueId,
                        savedEntry.getId(),
                        savedEntry.getTicketNumber(),
                        LocalDateTime.now()
                );


        outboxService.saveEvent(
                cancelledEvent
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return toResponse(
                savedEntry
        );
    }


    // ==========================================
    // GET ALL TICKETS
    // ==========================================

    @Transactional(readOnly = true)
    public List<QueueEntryResponse> getAllTickets(
            Long queueId) {

        // ==========================================
        // VERIFY QUEUE
        // ==========================================

        queueRepository
                .findById(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found with id: "
                                        + queueId
                        )
                );


        // ==========================================
        // GET TICKETS
        // ==========================================

        return queueEntryRepository
                .findByQueueIdOrderByTicketNumberAsc(
                        queueId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ==========================================
    // RESPONSE MAPPER
    // ==========================================

    private QueueEntryResponse toResponse(
            QueueEntry entry) {

        return new QueueEntryResponse(
                entry.getId(),
                entry.getTicketNumber(),
                entry.getStatus(),
                entry.getCounterNumber(),
                entry.getQueue().getId(),
                entry.getJoinedAt()
        );
    }


    // ==========================================
    // VALIDATE REAL COUNTER
    // ==========================================

    private Counter validateCounter(
            Long queueId,
            Integer counterNumber) {

        if (counterNumber == null) {

            throw new IllegalArgumentException(
                    "Counter number is required"
            );
        }


        Counter counter =
                counterRepository
                        .findByQueueIdAndCounterNumber(
                                queueId,
                                counterNumber
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Counter "
                                                + counterNumber
                                                + " does not exist in this queue"
                                )
                        );


        // ==========================================
        // VERIFY QUEUE
        // ==========================================

        if (!counter.getQueue()
                .getId()
                .equals(queueId)) {

            throw new IllegalArgumentException(
                    "Counter does not belong to this queue"
            );
        }


        return counter;
    }


    // ==========================================
    // REDIS GLOBAL KEY
    // ==========================================

    private String getGlobalCurrentTicketKey(
            Long queueId) {

        return "qflow:queue:"
                + queueId
                + ":current-ticket";
    }


    // ==========================================
    // REDIS COUNTER KEY
    // ==========================================

    private String getCounterCurrentTicketKey(
            Long queueId,
            Integer counterNumber) {

        return "qflow:queue:"
                + queueId
                + ":counter:"
                + counterNumber
                + ":current-ticket";
    }
}