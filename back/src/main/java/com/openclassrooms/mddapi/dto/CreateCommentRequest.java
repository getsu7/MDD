package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Création d'un commentaire sur un article.
 */
public record CreateCommentRequest(

        @NotBlank(message = "Le contenu est obligatoire")
        String content
) {
}

