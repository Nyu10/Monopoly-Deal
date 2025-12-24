package com.game.model;

/**
 * Value object representing a Player ID
 * Ensures type safety and validation
 */
public record PlayerId(int value) {
    
    public PlayerId {
        if (value < 0) {
            throw new IllegalArgumentException("Player ID cannot be negative: " + value);
        }
        if (value > 99) {
            throw new IllegalArgumentException("Player ID too large: " + value);
        }
    }
    
    @Override
    public String toString() {
        return String.valueOf(value);
    }
}
