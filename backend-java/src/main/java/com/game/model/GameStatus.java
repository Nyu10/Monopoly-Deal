package com.game.model;

/**
 * Enum representing the status of a game
 * Replaces String-based status for type safety
 */
public enum GameStatus {
    WAITING("Waiting for players"),
    PLAYING("Game in progress"),
    PAUSED("Game paused"),
    GAME_OVER("Game finished");
    
    private final String description;
    
    GameStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
