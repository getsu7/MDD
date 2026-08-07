package com.openclassrooms.mddapi.dto;

/**
 * Réponse d'authentification contenant le JWT.
 */
public record AuthResponse(String token, String type) {

    public AuthResponse(String token) {
        this(token, "Bearer");
    }
}

