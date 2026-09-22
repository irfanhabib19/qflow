package com.qflow.queue.service;

import com.qflow.queue.dto.CounterResponse;
import com.qflow.queue.dto.CreateCounterRequest;
import com.qflow.queue.entity.Counter;
import com.qflow.queue.entity.CounterStatus;
import com.qflow.queue.entity.Queue;
import com.qflow.queue.entity.QueueStatus;
import com.qflow.queue.entity.QueueEntry;
import com.qflow.queue.entity.TicketStatus;
import com.qflow.queue.exception.QueueNotFoundException;
import com.qflow.queue.repository.CounterRepository;
import com.qflow.queue.repository.QueueEntryRepository;
import com.qflow.queue.repository.QueueRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CounterService {

    private final CounterRepository counterRepository;

    private final QueueRepository queueRepository;

    private final QueueEntryRepository queueEntryRepository;


    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public CounterService(
            CounterRepository counterRepository,
            QueueRepository queueRepository,
            QueueEntryRepository queueEntryRepository) {

        this.counterRepository =
                counterRepository;

        this.queueRepository =
                queueRepository;

        this.queueEntryRepository =
                queueEntryRepository;
    }


    // ==========================================
    // CREATE COUNTER
    // ==========================================

    @Transactional
    public CounterResponse createCounter(
            Long queueId,
            CreateCounterRequest request) {

        // ==========================================
        // FIND QUEUE
        // ==========================================

        Queue queue =
                queueRepository
                        .findById(queueId)
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

            throw new IllegalStateException(
                    "Cannot create a counter for a closed queue"
            );
        }


        // ==========================================
        // CHECK DUPLICATE
        // ==========================================

        boolean exists =
                counterRepository
                        .existsByQueueIdAndCounterNumber(
                                queueId,
                                request.counterNumber()
                        );


        if (exists) {

            throw new IllegalArgumentException(
                    "Counter "
                            + request.counterNumber()
                            + " already exists in this queue"
            );
        }


        // ==========================================
        // CREATE COUNTER
        // ==========================================

        Counter counter =
                new Counter();


        counter.setCounterNumber(
                request.counterNumber()
        );


        counter.setStatus(
                CounterStatus.AVAILABLE
        );


        counter.setQueue(
                queue
        );


        // ==========================================
        // SAVE
        // ==========================================

        Counter savedCounter =
                counterRepository.save(
                        counter
                );


        return toResponse(
                savedCounter
        );
    }


    // ==========================================
    // GET ALL COUNTERS
    // ==========================================

    @Transactional
    public List<CounterResponse> getCounters(
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
        // GET COUNTERS
        // ==========================================

        return counterRepository
                .findByQueueIdOrderByCounterNumberAsc(
                        queueId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ==========================================
    // GET COUNTER
    // ==========================================

    @Transactional
    public CounterResponse getCounter(
            Long queueId,
            Long counterId) {

        Counter counter =
                counterRepository
                        .findById(counterId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Counter not found with id: "
                                                + counterId
                                )
                        );


        // ==========================================
        // VERIFY QUEUE
        // ==========================================

        if (!counter.getQueue()
                .getId()
                .equals(queueId)) {

            throw new RuntimeException(
                    "Counter does not belong to this queue"
            );
        }


        return toResponse(counter);
    }


    // ==========================================
    // SET COUNTER OFFLINE
    // ==========================================

    @Transactional
    public CounterResponse setOffline(
            Long queueId,
            Long counterId) {

        Counter counter =
                getCounterEntity(
                        queueId,
                        counterId
                );


        // ==========================================
        // CANNOT GO OFFLINE WHILE SERVING
        // ==========================================

        if (counter.getStatus()
                == CounterStatus.SERVING) {

            throw new IllegalStateException(
                    "Counter cannot go offline while serving a ticket"
            );
        }


        counter.setStatus(
                CounterStatus.OFFLINE
        );


        return toResponse(
                counterRepository.save(counter)
        );
    }


    // ==========================================
    // SET COUNTER AVAILABLE
    // ==========================================

    @Transactional
    public CounterResponse setAvailable(
            Long queueId,
            Long counterId) {

        Counter counter =
                getCounterEntity(
                        queueId,
                        counterId
                );


        // ==========================================
        // CANNOT MANUALLY FREE SERVING COUNTER
        // ==========================================

        if (counter.getStatus()
                == CounterStatus.SERVING) {

            throw new IllegalStateException(
                    "Counter is currently serving a ticket"
            );
        }


        counter.setStatus(
                CounterStatus.AVAILABLE
        );


        return toResponse(
                counterRepository.save(counter)
        );
    }


    // ==========================================
    // DELETE COUNTER
    // ==========================================

    @Transactional
    public void deleteCounter(
            Long queueId,
            Long counterId) {

        Counter counter =
                getCounterEntity(
                        queueId,
                        counterId
                );


        // ==========================================
        // CANNOT DELETE ACTIVE COUNTER
        // ==========================================

        if (counter.getStatus()
                == CounterStatus.SERVING) {

            throw new IllegalStateException(
                    "Cannot delete a counter while it is serving a ticket"
            );
        }


        // ==========================================
        // DELETE
        // ==========================================

        counterRepository.delete(counter);
    }


    // ==========================================
    // FIND COUNTER ENTITY
    // ==========================================

    private Counter getCounterEntity(
            Long queueId,
            Long counterId) {

        Counter counter =
                counterRepository
                        .findById(counterId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Counter not found with id: "
                                                + counterId
                                )
                        );


        if (!counter.getQueue()
                .getId()
                .equals(queueId)) {

            throw new RuntimeException(
                    "Counter does not belong to this queue"
            );
        }


        return counter;
    }


    // ==========================================
    // RESPONSE MAPPER
    // ==========================================

    private CounterResponse toResponse(
            Counter counter) {

        Integer currentTicketNumber =
                queueEntryRepository
                        .findFirstByQueueIdAndStatusAndCounterNumberOrderByTicketNumberAsc(
                                counter.getQueue().getId(),
                                TicketStatus.SERVING,
                                counter.getCounterNumber()
                        )
                        .map(QueueEntry::getTicketNumber)
                        .orElse(null);


        return new CounterResponse(

                counter.getId(),

                counter.getCounterNumber(),

                counter.getStatus(),

                counter.getQueue().getId(),

                counter.getCreatedAt(),

                currentTicketNumber

        );
    }
}