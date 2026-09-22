package com.qflow.queue.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "counters",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_queue_counter_number",
                        columnNames = {
                                "queue_id",
                                "counter_number"
                        }
                )
        }
)
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // COUNTER NUMBER
    // ==========================================

    @Column(
            name = "counter_number",
            nullable = false
    )
    private Integer counterNumber;


    // ==========================================
    // STATUS
    // ==========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CounterStatus status =
            CounterStatus.AVAILABLE;


    // ==========================================
    // CREATED TIME
    // ==========================================

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


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

        createdAt =
                LocalDateTime.now();

    }

}