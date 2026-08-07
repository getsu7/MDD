package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Mise à jour du profil : champs optionnels (null = inchangé).
 */
public record UpdateProfileRequest(

        @Email(message = "Format d'email invalide")
        @Size(max = 255)
        String email,

        @Size(min = 3, max = 100)
        String username,

        @Size(min = 8, max = 100, message = "Le mot de passe doit contenir au moins 8 caractères")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).+$",
                message = "Le mot de passe doit contenir une minuscule, une majuscule, un chiffre et un caractère spécial"
        )
        String password
) {
}

