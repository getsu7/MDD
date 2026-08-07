package com.openclassrooms.mddapi.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Profil utilisateur exposé par l'API (sans mot de passe).
 */
public record UserDto(
        Long id,
        String email,
        String username,
        List<TopicDto> subscribedTopics,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

