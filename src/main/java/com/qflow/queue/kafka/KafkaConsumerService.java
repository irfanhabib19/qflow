package com.qflow.queue.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qflow.queue.service.WebSocketEventService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private final WebSocketEventService webSocketEventService;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(
            WebSocketEventService webSocketEventService,
            ObjectMapper objectMapper) {

        this.webSocketEventService = webSocketEventService;
        this.objectMapper = objectMapper;

        System.out.println("🔥 KafkaConsumerService CREATED");
    }

    @KafkaListener(
            topics = "qflow-events",
            groupId = "qflow-test-group"
    )
    public void consume(String message) {

        System.out.println(
                "🔥🔥 KAFKA CONSUMER RECEIVED: " + message
        );

        try {

            QFlowEvent event =
                    objectMapper.readValue(
                            message,
                            QFlowEvent.class
                    );

            System.out.println(
                    "📦 Event type: "
                            + event.getEventType()
            );

            System.out.println(
                    "🏥 Queue ID: "
                            + event.getQueueId()
            );

            webSocketEventService.sendToQueue(
                    event.getQueueId(),
                    event
            );

            System.out.println(
                    "📡 WebSocket Event Sent to Queue: "
                            + event.getQueueId()
            );

        } catch (Exception e) {

            System.err.println(
                    "❌ Kafka event processing failed"
            );

            e.printStackTrace();
        }
    }
}