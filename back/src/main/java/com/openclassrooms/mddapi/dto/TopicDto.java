package com.openclassrooms.mddapi.dto;

/**
 * Thème exposé par l'API.
 */
public record TopicDto(
        Long id,
        String title,
        String description
) {
}

