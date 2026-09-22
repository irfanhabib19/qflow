package com.qflow.queue.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketEventService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventService(
            SimpMessagingTemplate messagingTemplate) {

        this.messagingTemplate = messagingTemplate;
    }

    public void sendToQueue(Long queueId, Object event) {

        String destination =
                "/topic/queue/" + queueId;

        messagingTemplate.convertAndSend(
                destination,
                event
        );
    }
}