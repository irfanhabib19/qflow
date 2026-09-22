package com.qflow.queue.controller;

import com.qflow.queue.dto.CounterResponse;
import com.qflow.queue.dto.CreateCounterRequest;
import com.qflow.queue.service.CounterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queues/{queueId}/counters")
@CrossOrigin(
        origins = "http://localhost:5173"
)
public class CounterController {

    private final CounterService counterService;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public CounterController(
            CounterService counterService) {

        this.counterService =
                counterService;
    }

    // ==========================================
    // CREATE COUNTER
    // ADMIN ONLY
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CounterResponse> createCounter(

            @PathVariable Long queueId,

            @Valid
            @RequestBody
            CreateCounterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        counterService.createCounter(
                                queueId,
                                request
                        )
                );
    }

    // ==========================================
    // GET ALL COUNTERS
    // AUTHENTICATED USERS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<CounterResponse>>
    getCounters(
            @PathVariable Long queueId) {

        return ResponseEntity.ok(
                counterService.getCounters(
                        queueId
                )
        );
    }

    // ==========================================
    // GET COUNTER
    // AUTHENTICATED USERS
    // ==========================================

    @GetMapping("/{counterId}")
    public ResponseEntity<CounterResponse>
    getCounter(

            @PathVariable Long queueId,

            @PathVariable Long counterId) {

        return ResponseEntity.ok(
                counterService.getCounter(
                        queueId,
                        counterId
                )
        );
    }

    // ==========================================
    // SET OFFLINE
    // ADMIN ONLY
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{counterId}/offline")
    public ResponseEntity<CounterResponse>
    setOffline(

            @PathVariable Long queueId,

            @PathVariable Long counterId) {

        return ResponseEntity.ok(
                counterService.setOffline(
                        queueId,
                        counterId
                )
        );
    }

    // ==========================================
    // SET AVAILABLE
    // ADMIN ONLY
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{counterId}/available")
    public ResponseEntity<CounterResponse>
    setAvailable(

            @PathVariable Long queueId,

            @PathVariable Long counterId) {

        return ResponseEntity.ok(
                counterService.setAvailable(
                        queueId,
                        counterId
                )
        );
    }

    // ==========================================
    // DELETE COUNTER
    // ADMIN ONLY
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{counterId}")
    public ResponseEntity<Void> deleteCounter(

            @PathVariable Long queueId,

            @PathVariable Long counterId) {

        counterService.deleteCounter(
                queueId,
                counterId
        );

        return ResponseEntity.noContent()
                .build();
    }
}