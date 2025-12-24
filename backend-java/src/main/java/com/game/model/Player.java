package com.game.model;

import java.util.ArrayList;
import java.util.List;

public class Player {
    private int id;
    private String name;
    private boolean isHuman;
    private List<Card> hand;
    private List<Card> properties;
    private List<Card> bank;

    public Player() {
        this.hand = new ArrayList<>();
        this.properties = new ArrayList<>();
        this.bank = new ArrayList<>();
    }

    public Player(int id, String name, boolean isHuman) {
        this();
        this.id = id;
        this.name = name;
        this.isHuman = isHuman;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isHuman() { return isHuman; }
    public void setHuman(boolean human) { isHuman = human; }
    public List<Card> getHand() { return hand; }
    public void setHand(List<Card> hand) { this.hand = hand; }
    public List<Card> getProperties() { return properties; }
    public void setProperties(List<Card> properties) { this.properties = properties; }
    public List<Card> getBank() { return bank; }
    public void setBank(List<Card> bank) { this.bank = bank; }
}
