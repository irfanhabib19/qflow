package com.qflow.queue.auth.dto;

import com.qflow.queue.auth.entity.Role;

public record AuthResponse(

        String token,

        Long userId,

        String name,

        String email,

        Role role

) {
}