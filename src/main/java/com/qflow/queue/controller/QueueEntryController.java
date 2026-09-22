package com.qflow.queue.controller;

import com.qflow.queue.dto.QueueEntryResponse;
import com.qflow.queue.dto.QueueEntryStatusResponse;
import com.qflow.queue.service.QueueEntryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queues")
public class QueueEntryController {

    private final QueueEntryService queueEntryService;


    public QueueEntryController(
            QueueEntryService queueEntryService) {

        this.queueEntryService =
                queueEntryService;
    }


    // ==========================================
    // JOIN QUEUE
    // ==========================================

    @PostMapping("/{queueId}/join")
    public ResponseEntity<QueueEntryResponse> joinQueue(
            @PathVariable Long queueId) {

        QueueEntryResponse response =
                queueEntryService.joinQueue(
                        queueId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ==========================================
    // GET TICKET STATUS
    // ==========================================

    @GetMapping("/{queueId}/tickets/{ticketId}")
    public ResponseEntity<QueueEntryStatusResponse>
    getTicketStatus(
            @PathVariable Long queueId,
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                queueEntryService.getTicketStatus(
                        queueId,
                        ticketId
                )
        );
    }

    // ==========================================
// CALL NEXT
// ==========================================

    @PostMapping("/{queueId}/call-next")
    public ResponseEntity<QueueEntryResponse> callNext(
            @PathVariable Long queueId,
            @RequestParam Integer counter) {

        return ResponseEntity.ok(
                queueEntryService.callNext(
                        queueId,
                        counter
                )
        );
    }


    // ==========================================
    // COMPLETE CURRENT TICKET
    // ==========================================

    @PostMapping("/{queueId}/complete")
    public ResponseEntity<QueueEntryResponse> completeCurrentTicket(
            @PathVariable Long queueId,
            @RequestParam Integer counter) {

        return ResponseEntity.ok(
                queueEntryService.completeCurrentTicket(
                        queueId,
                        counter
                )
        );
    }


    // ==========================================
    // CANCEL TICKET
    // ==========================================

    @PostMapping("/{queueId}/tickets/{ticketId}/cancel")
    public ResponseEntity<QueueEntryResponse>
    cancelTicket(
            @PathVariable Long queueId,
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                queueEntryService.cancelTicket(
                        queueId,
                        ticketId
                )
        );
    }
    // ==========================================
// GET ALL TICKETS
// ==========================================

    @GetMapping("/{queueId}/tickets")
    public ResponseEntity<List<QueueEntryResponse>> getAllTickets(
            @PathVariable Long queueId) {

        return ResponseEntity.ok(
                queueEntryService.getAllTickets(
                        queueId
                )
        );
    }
}