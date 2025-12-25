package com.game.dto;

/**
 * Response DTO for session information
 */
public class SessionResponse {
    private String sessionId;
    private String username;
    private String currentGameId;

    public SessionResponse() {
    }

    public SessionResponse(String sessionId, String username) {
        this.sessionId = sessionId;
        this.username = username;
    }

    public SessionResponse(String sessionId, String username, String currentGameId) {
        this.sessionId = sessionId;
        this.username = username;
        this.currentGameId = currentGameId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCurrentGameId() {
        return currentGameId;
    }

    public void setCurrentGameId(String currentGameId) {
        this.currentGameId = currentGameId;
    }
}
