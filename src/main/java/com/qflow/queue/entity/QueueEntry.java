package com.qflow.queue.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "queue_entries",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_queue_ticket_number",
                        columnNames = {
                                "queue_id",
                                "ticket_number"
                        }
                )
        }
)
@Getter
@Setter
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // TICKET NUMBER
    // ==========================================

    @Column(nullable = false)
    private Integer ticketNumber;


    // ==========================================
    // TICKET STATUS
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.WAITING;


    // ==========================================
    // COUNTER
    // ==========================================

    @Column
    private Integer counterNumber;


    // ==========================================
    // JOINED TIME
    // ==========================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;


    // ==========================================
    // QUEUE
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "queue_id",
            nullable = false
    )
    private Queue queue;


    // ==========================================
    // CREATED
    // ==========================================

    @PrePersist
    protected void onCreate() {

        joinedAt =
                LocalDateTime.now();
    }
}