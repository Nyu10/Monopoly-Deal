package com.game.model;

import java.util.ArrayList;
import java.util.List;

public class PaymentRequest {
    private int fromPlayerId;
    private int toPlayerId;
    private int amount;
    private String reason; // "rent", "debt_collector", "birthday", "forced_deal"
    private String cardUid; // The card that triggered this payment (for reference)
    private List<String> paidCardUids; // Cards used to pay
    private boolean resolved;

    public PaymentRequest() {
        this.paidCardUids = new ArrayList<>();
        this.resolved = false;
    }

    public PaymentRequest(int fromPlayerId, int toPlayerId, int amount, String reason, String cardUid) {
        this();
        this.fromPlayerId = fromPlayerId;
        this.toPlayerId = toPlayerId;
        this.amount = amount;
        this.reason = reason;
        this.cardUid = cardUid;
    }

    // Getters and Setters
    public int getFromPlayerId() { return fromPlayerId; }
    public void setFromPlayerId(int fromPlayerId) { this.fromPlayerId = fromPlayerId; }
    
    public int getToPlayerId() { return toPlayerId; }
    public void setToPlayerId(int toPlayerId) { this.toPlayerId = toPlayerId; }
    
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public String getCardUid() { return cardUid; }
    public void setCardUid(String cardUid) { this.cardUid = cardUid; }
    
    public List<String> getPaidCardUids() { return paidCardUids; }
    public void setPaidCardUids(List<String> paidCardUids) { this.paidCardUids = paidCardUids; }
    
    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
}
