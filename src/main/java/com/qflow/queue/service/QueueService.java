package com.qflow.queue.service;

import com.qflow.queue.dto.CreateQueueRequest;
import com.qflow.queue.dto.QueueResponse;
import com.qflow.queue.entity.Queue;
import com.qflow.queue.entity.QueueStatus;
import com.qflow.queue.entity.TicketStatus;
import com.qflow.queue.exception.InvalidQueueStateException;
import com.qflow.queue.exception.QueueNotFoundException;
import com.qflow.queue.repository.QueueEntryRepository;
import com.qflow.queue.repository.QueueRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QueueService {

    private final QueueRepository queueRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final RedisService redisService;

    public QueueService(
            QueueRepository queueRepository,
            QueueEntryRepository queueEntryRepository,
            RedisService redisService) {

        this.queueRepository = queueRepository;
        this.queueEntryRepository = queueEntryRepository;
        this.redisService = redisService;
    }


    // ==========================================
    // CREATE QUEUE
    // ==========================================

    public QueueResponse createQueue(
            CreateQueueRequest request) {

        Queue queue = new Queue();

        queue.setName(request.name());
        queue.setDescription(request.description());

        Queue savedQueue =
                queueRepository.save(queue);

        redisService.set(
                "qflow:queue:" +
                        savedQueue.getId() +
                        ":last-ticket",

                String.valueOf(
                        savedQueue.getLastNumber()
                )
        );

        return toResponse(savedQueue);
    }


    // ==========================================
    // GET ALL QUEUES
    // ==========================================

    public List<QueueResponse> getAllQueues() {

        return queueRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ==========================================
    // GET QUEUE BY ID
    // ==========================================

    public QueueResponse getQueueById(
            Long id) {

        Queue queue =
                queueRepository.findById(id)
                        .orElseThrow(() ->
                                new QueueNotFoundException(
                                        "Queue not found with id: "
                                                + id
                                )
                        );

        return toResponse(queue);
    }


    // ==========================================
    // CONVERT TO RESPONSE
    // ==========================================

    private QueueResponse toResponse(
            Queue queue) {

        long waitingCount =
                queueEntryRepository
                        .countByQueueIdAndStatus(
                                queue.getId(),
                                TicketStatus.WAITING
                        );

        return new QueueResponse(

                queue.getId(),

                queue.getName(),

                queue.getDescription(),

                queue.getStatus(),

                queue.getCurrentNumber(),

                queue.getLastNumber(),

                waitingCount,

                queue.getCreatedAt()
        );
    }


    // ==========================================
    // PAUSE QUEUE
    // ==========================================

    @Transactional
    public QueueResponse pauseQueue(
            Long queueId) {

        Queue queue =
                queueRepository.findById(queueId)
                        .orElseThrow(() ->
                                new QueueNotFoundException(
                                        "Queue not found with id: "
                                                + queueId
                                )
                        );

        if (
                queue.getStatus()
                        == QueueStatus.CLOSED
        ) {

            throw new InvalidQueueStateException(
                    "Closed queue cannot be paused"
            );
        }

        if (
                queue.getStatus()
                        == QueueStatus.PAUSED
        ) {

            throw new InvalidQueueStateException(
                    "Queue is already paused"
            );
        }

        queue.setStatus(
                QueueStatus.PAUSED
        );

        return toResponse(
                queueRepository.save(queue)
        );
    }


    // ==========================================
    // RESUME QUEUE
    // ==========================================

    @Transactional
    public QueueResponse resumeQueue(
            Long queueId) {

        Queue queue =
                queueRepository.findById(queueId)
                        .orElseThrow(() ->
                                new QueueNotFoundException(
                                        "Queue not found with id: "
                                                + queueId
                                )
                        );

        if (
                queue.getStatus()
                        == QueueStatus.CLOSED
        ) {

            throw new InvalidQueueStateException(
                    "Closed queue cannot be resumed"
            );
        }

        if (
                queue.getStatus()
                        == QueueStatus.OPEN
        ) {

            throw new InvalidQueueStateException(
                    "Queue is already open"
            );
        }

        queue.setStatus(
                QueueStatus.OPEN
        );

        return toResponse(
                queueRepository.save(queue)
        );
    }


    // ==========================================
    // CLOSE QUEUE
    // ==========================================

    @Transactional
    public QueueResponse closeQueue(
            Long queueId) {

        Queue queue =
                queueRepository.findById(queueId)
                        .orElseThrow(() ->
                                new QueueNotFoundException(
                                        "Queue not found with id: "
                                                + queueId
                                )
                        );

        if (
                queue.getStatus()
                        == QueueStatus.CLOSED
        ) {

            throw new InvalidQueueStateException(
                    "Queue is already closed"
            );
        }

        queue.setStatus(
                QueueStatus.CLOSED
        );

        return toResponse(
                queueRepository.save(queue)
        );
    }
}