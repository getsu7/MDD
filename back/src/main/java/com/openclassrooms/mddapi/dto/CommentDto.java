package com.openclassrooms.mddapi.dto;

import java.time.LocalDateTime;

/**
 * Commentaire exposé par l'API.
 */
public record CommentDto(
        Long id,
        String content,
        Long authorId,
        String authorUsername,
        Long articleId,
        LocalDateTime createdAt
) {
}

