package com.openclassrooms.mddapi.config;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Origines autorisées pour le CORS (clé {@code cors.allowed-origins}).
 *
 * <p>Validé au démarrage : une configuration absente ferait échouer silencieusement
 * toutes les requêtes du front (rejet en preflight), on préfère un échec immédiat.
 */
@Validated
@ConfigurationProperties(prefix = "cors")
public record CorsProperties(

        @NotEmpty(message = "Au moins une origine doit être autorisée (cors.allowed-origins)")
        List<String> allowedOrigins
) {
}
