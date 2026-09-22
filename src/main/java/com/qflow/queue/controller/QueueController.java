package com.qflow.queue.controller;

import com.qflow.queue.dto.CreateQueueRequest;
import com.qflow.queue.dto.QueueResponse;
import com.qflow.queue.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queues")
@CrossOrigin(
        origins = "http://localhost:5173"
)
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping
    public ResponseEntity<QueueResponse> createQueue(
            @Valid @RequestBody CreateQueueRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(queueService.createQueue(request));
    }

    @GetMapping
    public ResponseEntity<List<QueueResponse>> getAllQueues() {

        return ResponseEntity.ok(
                queueService.getAllQueues()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<QueueResponse> getQueueById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                queueService.getQueueById(id)
        );
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<QueueResponse> pauseQueue(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                queueService.pauseQueue(id)
        );
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<QueueResponse> resumeQueue(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                queueService.resumeQueue(id)
        );
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<QueueResponse> closeQueue(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                queueService.closeQueue(id)
        );
    }
}