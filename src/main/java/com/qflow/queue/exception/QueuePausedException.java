package com.qflow.queue.exception;

public class QueuePausedException extends RuntimeException {

    public QueuePausedException(String message) {
        super(message);
    }
}