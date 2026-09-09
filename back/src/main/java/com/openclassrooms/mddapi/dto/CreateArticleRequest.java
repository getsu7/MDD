package com.openclassrooms.mddapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Création d'un article.
 */
public record CreateArticleRequest(

        @NotBlank(message = "Le titre est obligatoire")
        @Size(max = 255)
        String title,

        @NotBlank(message = "Le contenu est obligatoire")
        String content,

        @NotNull(message = "Le thème est obligatoire")
        Long topicId
) {
}

