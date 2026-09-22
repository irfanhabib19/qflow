package com.qflow.queue.repository;

import com.qflow.queue.entity.Counter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CounterRepository
        extends JpaRepository<Counter, Long> {


    List<Counter> findByQueueIdOrderByCounterNumberAsc(
            Long queueId
    );


    Optional<Counter>
    findByQueueIdAndCounterNumber(
            Long queueId,
            Integer counterNumber
    );


    boolean existsByQueueIdAndCounterNumber(
            Long queueId,
            Integer counterNumber
    );

}