package com.qflow.queue.dto;

import com.qflow.queue.entity.QueueStatus;

import java.time.LocalDateTime;

public record QueueResponse(
        Long id,
        String name,
        String description,
        QueueStatus status,
        Integer currentNumber,
        Integer lastNumber,
        Long waitingCount,
        LocalDateTime createdAt
) {
}