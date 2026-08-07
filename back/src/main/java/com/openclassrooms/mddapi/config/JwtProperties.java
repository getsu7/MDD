package com.openclassrooms.mddapi.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Propriétés de configuration du JWT, alimentées par les clés {@code jwt.*}
 * de application.properties.
 *
 * @param secret clé secrète symétrique (HMAC-SHA256), au moins 256 bits / 32 caractères
 * @param expiration durée de validité du token en secondes
 * @param issuer émetteur du token (claim "iss")
 */
@Validated
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(

        @NotBlank(message = "La clé secrète JWT est obligatoire (jwt.secret)")
        @Size(min = 32, message = "La clé secrète JWT doit faire au moins 32 caractères (256 bits) pour HMAC-SHA256")
        String secret,

        @Positive(message = "La durée de validité du token doit être positive")
        long expiration,

        @NotBlank(message = "L'émetteur du token est obligatoire (jwt.issuer)")
        String issuer
) {
}
