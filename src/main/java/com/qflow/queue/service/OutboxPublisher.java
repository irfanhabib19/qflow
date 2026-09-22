package com.qflow.queue.service;

import com.qflow.queue.entity.OutboxEvent;
import com.qflow.queue.kafka.KafkaProducerService;
import com.qflow.queue.repository.OutboxEventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OutboxPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaProducerService kafkaProducerService;

    public OutboxPublisher(
            OutboxEventRepository outboxEventRepository,
            KafkaProducerService kafkaProducerService) {

        this.outboxEventRepository = outboxEventRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    @Scheduled(fixedDelay = 2000)
    public void publishEvents() {

        List<OutboxEvent> events =
                outboxEventRepository
                        .findByPublishedFalseOrderByIdAsc();

        for (OutboxEvent event : events) {

            try {

                kafkaProducerService
                        .sendRawEvent(event.getPayload())
                        .get();

                event.setPublished(true);

                outboxEventRepository.save(event);

                System.out.println(
                        "📤 Outbox event published: "
                                + event.getId()
                );

            } catch (Exception e) {

                System.err.println(
                        "❌ Kafka publish failed for outbox event: "
                                + event.getId()
                );

                System.err.println(
                        "Event will remain unpublished and retry."
                );
            }
        }
    }
}