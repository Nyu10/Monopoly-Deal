package com.game.model;

public class Move {
    private int playerId;
    private String type; // DRAW, PLAY_CARD, END_TURN, START
    private String cardUid;
    private Integer targetPlayerId;
    private String targetCardUid;

    public Move() {}

    public Move(int playerId, String type, String cardUid, Integer targetPlayerId, String targetCardUid) {
        this.playerId = playerId;
        this.type = type;
        this.cardUid = cardUid;
        this.targetPlayerId = targetPlayerId;
        this.targetCardUid = targetCardUid;
    }

    public int getPlayerId() { return playerId; }
    public void setPlayerId(int playerId) { this.playerId = playerId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCardUid() { return cardUid; }
    public void setCardUid(String cardUid) { this.cardUid = cardUid; }
    public Integer getTargetPlayerId() { return targetPlayerId; }
    public void setTargetPlayerId(Integer targetPlayerId) { this.targetPlayerId = targetPlayerId; }
    public String getTargetCardUid() { return targetCardUid; }
    public void setTargetCardUid(String targetCardUid) { this.targetCardUid = targetCardUid; }
}
