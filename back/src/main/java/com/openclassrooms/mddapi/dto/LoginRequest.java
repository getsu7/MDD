package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload de connexion : l'identifiant peut être l'email ou le nom d'utilisateur.
 */
public record LoginRequest(

        @NotBlank(message = "L'identifiant est obligatoire")
        String identifier,

        @NotBlank(message = "Le mot de passe est obligatoire")
        String password
) {
}

