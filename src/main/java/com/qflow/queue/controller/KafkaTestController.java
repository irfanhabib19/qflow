package com.qflow.queue.controller;

import com.qflow.queue.kafka.EventType;
import com.qflow.queue.kafka.KafkaProducerService;
import com.qflow.queue.kafka.QFlowEvent;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/kafka")
public class KafkaTestController {

    private final KafkaProducerService kafkaProducerService;

    public KafkaTestController(
            KafkaProducerService kafkaProducerService) {

        this.kafkaProducerService = kafkaProducerService;
    }

    @PostMapping("/test")
    public String sendTestEvent() {

        QFlowEvent event = new QFlowEvent(
                EventType.TICKET_JOINED,
                1L,
                10L,
                5,
                LocalDateTime.now()
        );

        kafkaProducerService.sendEvent(event);

        return "QFlow event sent to Kafka";
    }
}