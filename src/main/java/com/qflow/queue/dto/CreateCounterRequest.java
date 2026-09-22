package com.qflow.queue.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateCounterRequest(

        @NotNull(message = "Counter number is required")
        @Min(
                value = 1,
                message = "Counter number must be at least 1"
        )
        Integer counterNumber

) {
}