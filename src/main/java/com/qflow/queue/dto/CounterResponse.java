package com.qflow.queue.dto;

import com.qflow.queue.entity.CounterStatus;

import java.time.LocalDateTime;

public record CounterResponse(

        Long id,

        Integer counterNumber,

        CounterStatus status,

        Long queueId,

        LocalDateTime createdAt,

        Integer currentTicketNumber

) {
}