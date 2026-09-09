package com.openclassrooms.mddapi.service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.openclassrooms.mddapi.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests unitaires de {@link JwtService}. On utilise un encodeur/décodeur Nimbus
 * réels (clé HMAC symétrique) afin de vérifier le contenu réel du token émis.
 */
class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-with-at-least-256-bits!!";
    private static final String ISSUER = "mdd-api-test";
    private static final long EXPIRATION = 3600L;

    private JwtService jwtService;
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        SecretKeySpec key = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        jwtDecoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();

        JwtProperties properties = new JwtProperties(SECRET, EXPIRATION, ISSUER);
        jwtService = new JwtService(encoder, properties);
    }

    @Test
    void generateToken_shouldEmitSignedTokenWithSubjectIssuerAndScope() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "42",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        String token = jwtService.generateToken(authentication);

        assertThat(token).isNotBlank();

        Jwt decoded = jwtDecoder.decode(token);
        assertThat(decoded.getSubject()).isEqualTo("42");
        assertThat(decoded.getClaimAsString("iss")).isEqualTo(ISSUER);
        assertThat(decoded.<String>getClaim("scope")).isEqualTo("ROLE_USER");
        assertThat(decoded.getIssuedAt()).isNotNull();
        assertThat(decoded.getExpiresAt()).isNotNull();
        assertThat(decoded.getExpiresAt()).isAfter(Instant.now());
    }

    @Test
    void generateToken_shouldJoinMultipleAuthoritiesIntoScope() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "7",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"),
                        new SimpleGrantedAuthority("ROLE_ADMIN")));

        String token = jwtService.generateToken(authentication);

        Jwt decoded = jwtDecoder.decode(token);
        assertThat(decoded.<String>getClaim("scope")).contains("ROLE_USER", "ROLE_ADMIN");
    }

    @Test
    void generateToken_shouldProduceEmptyScopeWhenNoAuthorities() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("1", null, List.of());

        String token = jwtService.generateToken(authentication);

        Jwt decoded = jwtDecoder.decode(token);
        assertThat(decoded.<String>getClaim("scope")).isEmpty();
    }
}


