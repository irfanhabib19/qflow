package com.qflow.queue.service;

import com.qflow.queue.entity.OutboxEvent;
import com.qflow.queue.kafka.QFlowEvent;
import com.qflow.queue.repository.OutboxEventRepository;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;

@Service
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final JsonMapper jsonMapper;

    public OutboxService(
            OutboxEventRepository outboxEventRepository,
            JsonMapper jsonMapper) {

        this.outboxEventRepository = outboxEventRepository;
        this.jsonMapper = jsonMapper;
    }

    public void saveEvent(QFlowEvent event) {

        try {
            String payload =
                    jsonMapper.writeValueAsString(event);

            OutboxEvent outboxEvent = new OutboxEvent();

            outboxEvent.setEventType(event.getEventType().name());
            outboxEvent.setPayload(payload);
            outboxEvent.setCreatedAt(LocalDateTime.now());
            outboxEvent.setPublished(false);

            outboxEventRepository.save(outboxEvent);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to create outbox event",
                    e
            );
        }
    }
}