package com.qflow.queue.exception;

public class QueueClosedException extends RuntimeException {

    public QueueClosedException(String message) {
        super(message);
    }
}