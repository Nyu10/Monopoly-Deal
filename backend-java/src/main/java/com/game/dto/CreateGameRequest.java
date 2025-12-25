package com.game.dto;

/**
 * Request DTO for creating a new game lobby
 */
public class CreateGameRequest {
    private String gameName;
    private Integer maxPlayers;

    public CreateGameRequest() {
    }

    public CreateGameRequest(String gameName, Integer maxPlayers) {
        this.gameName = gameName;
        this.maxPlayers = maxPlayers;
    }

    public String getGameName() {
        return gameName != null ? gameName : "New Game";
    }

    public void setGameName(String gameName) {
        this.gameName = gameName;
    }

    public int getMaxPlayers() {
        return maxPlayers != null ? maxPlayers : 4;
    }

    public void setMaxPlayers(Integer maxPlayers) {
        this.maxPlayers = maxPlayers;
    }
}
