package com.qflow.queue.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

import java.util.concurrent.CompletableFuture;

@Service
public class KafkaProducerService {

    private static final String TOPIC = "qflow-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final JsonMapper jsonMapper;

    public KafkaProducerService(
            KafkaTemplate<String, String> kafkaTemplate,
            JsonMapper jsonMapper) {

        this.kafkaTemplate = kafkaTemplate;
        this.jsonMapper = jsonMapper;
    }

    public void sendEvent(QFlowEvent event) {

        try {
            String json = jsonMapper.writeValueAsString(event);

            System.out.println("Sending event: " + json);

            kafkaTemplate.send(TOPIC, json);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to serialize QFlow event", e);
        }
    }
    public CompletableFuture<SendResult<String, String>> sendRawEvent(
            String payload) {

        return kafkaTemplate.send(TOPIC, payload);
    }
}