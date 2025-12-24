package com.game.model;

/**
 * Standard error codes for game operations
 */
public final class ErrorCodes {
    
    private ErrorCodes() {
        throw new AssertionError("Cannot instantiate error codes class");
    }
    
    // Room errors
    public static final String ROOM_NOT_FOUND = "ROOM_NOT_FOUND";
    public static final String ROOM_FULL = "ROOM_FULL";
    
    // Player errors
    public static final String NOT_PLAYERS_TURN = "NOT_PLAYERS_TURN";
    public static final String PLAYER_NOT_FOUND = "PLAYER_NOT_FOUND";
    
    // Card errors
    public static final String CARD_NOT_FOUND = "CARD_NOT_FOUND";
    public static final String CARD_NOT_IN_HAND = "CARD_NOT_IN_HAND";
    public static final String INVALID_CARD_PLAY = "INVALID_CARD_PLAY";
    
    // Action errors
    public static final String NO_ACTIONS_REMAINING = "NO_ACTIONS_REMAINING";
    public static final String INVALID_TARGET = "INVALID_TARGET";
    public static final String NO_VALID_TARGET = "NO_VALID_TARGET";
    
    // Property errors
    public static final String CANNOT_STEAL_COMPLETE_SET = "CANNOT_STEAL_COMPLETE_SET";
    public static final String NO_PROPERTIES_TO_STEAL = "NO_PROPERTIES_TO_STEAL";
    
    // Payment errors
    public static final String INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS";
    public static final String INVALID_PAYMENT = "INVALID_PAYMENT";
    
    // General errors
    public static final String INVALID_MOVE_TYPE = "INVALID_MOVE_TYPE";
    public static final String GAME_ALREADY_OVER = "GAME_ALREADY_OVER";
}
