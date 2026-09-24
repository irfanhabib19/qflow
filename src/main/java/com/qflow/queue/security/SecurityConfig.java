package com.qflow.queue.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig {

    @Value("${qflow.jwt.secret}")
    private String jwtSecret;

    // ==========================================
    // PASSWORD ENCODER
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==========================================
    // JWT SECRET KEY
    // ==========================================

    @Bean
    public SecretKey jwtSecretKey() {

        byte[] keyBytes =
                jwtSecret.getBytes(StandardCharsets.UTF_8);

        return new SecretKeySpec(
                keyBytes,
                "HmacSHA256"
        );
    }

    // ==========================================
    // JWT ENCODER
    // ==========================================

    @Bean
    public JwtEncoder jwtEncoder(
            SecretKey jwtSecretKey) {

        return NimbusJwtEncoder
                .withSecretKey(jwtSecretKey)
                .algorithm(MacAlgorithm.HS256)
                .build();
    }

    // ==========================================
    // JWT DECODER
    // ==========================================

    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey jwtSecretKey) {

        return NimbusJwtDecoder
                .withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    // ==========================================
    // JWT AUTHORITY CONVERTER
    // ==========================================

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("role");

        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
        );

        return converter;
    }

    // ==========================================
    // SECURITY FILTER CHAIN
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource,
            JwtAuthenticationConverter jwtAuthenticationConverter
    ) throws Exception {

        http

                // ==================================
                // CORS
                // ==================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource
                        )
                )

                // ==================================
                // CSRF
                // ==================================

                .csrf(csrf ->
                        csrf.disable()
                )

                // ==================================
                // SESSION
                // ==================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ==================================
                // AUTHORIZATION
                // ==================================

                .authorizeHttpRequests(auth -> auth

                        // --------------------------
                        // CORS PREFLIGHT
                        // --------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // --------------------------
                        // AUTH
                        // --------------------------

                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        // --------------------------
                        // WEBSOCKET
                        // --------------------------

                        .requestMatchers(
                                "/ws/**"
                        ).permitAll()

                        // --------------------------
                        // PUBLIC QUEUES
                        // --------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/queues"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/queues/*"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/queues/*/tickets"
                        ).permitAll()

                        // --------------------------
                        // USER QUEUE OPERATIONS
                        // --------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/queues/*/join"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/queues/*/tickets/*"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/queues/*/tickets/*/cancel"
                        ).authenticated()

                        // --------------------------
                        // ADMIN
                        // --------------------------

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // --------------------------
                        // EVERYTHING ELSE
                        // --------------------------

                        .anyRequest().authenticated()
                )

                // ==================================
                // JWT RESOURCE SERVER
                // ==================================

                .oauth2ResourceServer(
                        oauth2 ->
                                oauth2.jwt(
                                        jwt ->
                                                jwt.jwtAuthenticationConverter(
                                                        jwtAuthenticationConverter
                                                )
                                )
                );

        return http.build();
    }
}