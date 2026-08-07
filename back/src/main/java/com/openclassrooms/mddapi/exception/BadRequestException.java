package com.openclassrooms.mddapi.exception;

/**
 * Requête invalide sur le plan métier -> HTTP 400.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}

