package com.game.dto;

/**
 * Request DTO for creating a guest session
 */
public class CreateSessionRequest {
    private String username;

    public CreateSessionRequest() {
    }

    public CreateSessionRequest(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
