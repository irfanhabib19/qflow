package com.qflow.queue.security;

import com.qflow.queue.auth.entity.User;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateToken(User user) {

        Instant now = Instant.now();

        Instant expiration =
                now.plusSeconds(60 * 60); // 1 hour

        JwtClaimsSet claims =
                JwtClaimsSet.builder()
                        .subject(user.getEmail())
                        .claim("userId", user.getId())
                        .claim("name", user.getName())
                        .claim("role", user.getRole().name())
                        .issuedAt(now)
                        .expiresAt(expiration)
                        .build();

        JwsHeader header =
                JwsHeader.with(MacAlgorithm.HS256)
                        .type("JWT")
                        .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();
    }
}