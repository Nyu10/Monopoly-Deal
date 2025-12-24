package com.game.model;

import java.util.Objects;

/**
 * Value object representing a Game ID
 * Ensures type safety and validation
 */
public record GameId(String value) {
    
    public GameId {
        Objects.requireNonNull(value, "Game ID cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("Game ID cannot be blank");
        }
        if (!value.matches("^[a-zA-Z0-9-_]+$")) {
            throw new IllegalArgumentException("Game ID contains invalid characters");
        }
    }
    
    @Override
    public String toString() {
        return value;
    }
}
