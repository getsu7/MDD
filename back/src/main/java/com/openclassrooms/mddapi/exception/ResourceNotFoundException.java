package com.openclassrooms.mddapi.exception;

/**
 * Ressource inexistante -> HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String resource, Object id) {
        return new ResourceNotFoundException("%s introuvable (id=%s)".formatted(resource, id));
    }
}

