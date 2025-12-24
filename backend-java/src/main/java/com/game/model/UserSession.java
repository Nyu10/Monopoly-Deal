package com.game.model;

/**
 * Simple in-memory user session for free multiplayer
 * No database required - sessions stored in memory
 */
public class UserSession {
    private String sessionId;
    private String username;
    private String currentGameId;
    private long lastActivity;
    private boolean isGuest;

    public UserSession() {
        this.lastActivity = System.currentTimeMillis();
        this.isGuest = true;
    }

    public UserSession(String sessionId, String username) {
        this.sessionId = sessionId;
        this.username = username;
        this.lastActivity = System.currentTimeMillis();
        this.isGuest = true;
    }

    public void updateActivity() {
        this.lastActivity = System.currentTimeMillis();
    }

    public boolean isExpired(long timeoutMs) {
        return System.currentTimeMillis() - lastActivity > timeoutMs;
    }

    // Getters and setters
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getCurrentGameId() { return currentGameId; }
    public void setCurrentGameId(String currentGameId) { this.currentGameId = currentGameId; }
    
    public long getLastActivity() { return lastActivity; }
    public void setLastActivity(long lastActivity) { this.lastActivity = lastActivity; }
    
    public boolean isGuest() { return isGuest; }
    public void setGuest(boolean guest) { isGuest = guest; }
}
