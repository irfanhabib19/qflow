package com.qflow.queue.controller;

import com.qflow.queue.service.RedisService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/redis")
public class RedisTestController {

    private final RedisService redisService;

    public RedisTestController(RedisService redisService) {
        this.redisService = redisService;
    }

    @PostMapping("/test")
    public String testRedis() {

        redisService.set("qflow:test", "Redis is working!");

        return redisService.get("qflow:test");
    }
}