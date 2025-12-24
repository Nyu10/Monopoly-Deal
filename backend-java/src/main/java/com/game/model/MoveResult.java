package com.game.model;

/**
 * Result object for move processing
 * Provides clear success/failure feedback to clients
 */
public class MoveResult {
    private final boolean success;
    private final String errorCode;
    private final String errorMessage;
    private final GameState updatedState;
    
    private MoveResult(boolean success, String errorCode, String errorMessage, GameState updatedState) {
        this.success = success;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.updatedState = updatedState;
    }
    
    public static MoveResult success(GameState state) {
        return new MoveResult(true, null, null, state);
    }
    
    public static MoveResult failure(String errorCode, String errorMessage) {
        return new MoveResult(false, errorCode, errorMessage, null);
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public GameState getUpdatedState() {
        return updatedState;
    }
}
