package com.game.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Lobby information for a game room
 * Used for listing available games
 */
public class LobbyGame {
    private String roomId;
    private String gameName;
    private int currentPlayers;
    private int maxPlayers;
    private String status; // "WAITING", "PLAYING", "FINISHED"
    private List<String> playerNames;
    private String createdBy;
    private long createdAt;

    public LobbyGame() {
        this.playerNames = new ArrayList<>();
        this.createdAt = System.currentTimeMillis();
        this.status = "WAITING";
    }

    public LobbyGame(String roomId, String gameName, int maxPlayers, String createdBy) {
        this();
        this.roomId = roomId;
        this.gameName = gameName;
        this.maxPlayers = maxPlayers;
        this.createdBy = createdBy;
    }

    public boolean isFull() {
        return currentPlayers >= maxPlayers;
    }

    public boolean canJoin() {
        return !isFull() && "WAITING".equals(status);
    }

    // Getters and setters
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    
    public String getGameName() { return gameName; }
    public void setGameName(String gameName) { this.gameName = gameName; }
    
    public int getCurrentPlayers() { return currentPlayers; }
    public void setCurrentPlayers(int currentPlayers) { this.currentPlayers = currentPlayers; }
    
    public int getMaxPlayers() { return maxPlayers; }
    public void setMaxPlayers(int maxPlayers) { this.maxPlayers = maxPlayers; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public List<String> getPlayerNames() { return playerNames; }
    public void setPlayerNames(List<String> playerNames) { this.playerNames = playerNames; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}
