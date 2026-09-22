package com.qflow.queue.auth.service;

import com.qflow.queue.auth.dto.AuthResponse;
import com.qflow.queue.auth.dto.LoginRequest;
import com.qflow.queue.auth.dto.RegisterRequest;
import com.qflow.queue.auth.entity.Role;
import com.qflow.queue.auth.entity.User;
import com.qflow.queue.auth.repository.UserRepository;
import com.qflow.queue.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ==========================================
    // REGISTER
    // ==========================================

    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        // Hash password
        String encodedPassword =
                passwordEncoder.encode(request.password());

        // Create user
        User user = new User();

        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(encodedPassword);
        user.setRole(Role.USER);

        // Save user
        User savedUser =
                userRepository.save(user);

        // Generate JWT
        String token =
                jwtService.generateToken(savedUser);

        // Return response
        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    // ==========================================
    // LOGIN
    // ==========================================

    public AuthResponse login(LoginRequest request) {

        // 1. Find user by email
        User user =
                userRepository
                        .findByEmail(request.email())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid email or password"
                                )
                        );

        // 2. Verify password
        boolean passwordMatches =
                passwordEncoder.matches(
                        request.password(),
                        user.getPassword()
                );

        // 3. Reject invalid password
        if (!passwordMatches) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        // 4. Generate JWT
        String token =
                jwtService.generateToken(user);

        // 5. Return authenticated user
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}