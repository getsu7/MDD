package com.openclassrooms.mddapi.dto;

import java.time.LocalDateTime;

/**
 * Article complet (détail).
 */
public record ArticleDto(
        Long id,
        String title,
        String content,
        Long authorId,
        String authorUsername,
        Long topicId,
        String topicTitle,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

