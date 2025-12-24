package com.game.model;

import java.util.List;

public class Card {
    private String uid;
    private String name;
    private String description;
    private int value;
    private CardType type;
    private ActionType actionType;
    private String color; 
    private List<String> colors; 
    private String currentColor; 
    private boolean isRainbow;

    public Card() {}

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
    public CardType getType() { return type; }
    public void setType(CardType type) { this.type = type; }
    public ActionType getActionType() { return actionType; }
    public void setActionType(ActionType actionType) { this.actionType = actionType; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public List<String> getColors() { return colors; }
    public void setColors(List<String> colors) { this.colors = colors; }
    public String getCurrentColor() { return currentColor; }
    public void setCurrentColor(String currentColor) { this.currentColor = currentColor; }
    public boolean isRainbow() { return isRainbow; }
    public void setRainbow(boolean rainbow) { isRainbow = rainbow; }

    public static CardBuilder builder() { return new CardBuilder(); }
    public static class CardBuilder {
        private Card c = new Card();
        public CardBuilder uid(String u) { c.uid = u; return this; }
        public CardBuilder name(String n) { c.name = n; return this; }
        public CardBuilder description(String d) { c.description = d; return this; }
        public CardBuilder value(int v) { c.value = v; return this; }
        public CardBuilder type(CardType t) { c.type = t; return this; }
        public CardBuilder actionType(ActionType at) { c.actionType = at; return this; }
        public CardBuilder color(String clr) { c.color = clr; return this; }
        public CardBuilder colors(List<String> clrs) { c.colors = clrs; return this; }
        public CardBuilder currentColor(String cc) { c.currentColor = cc; return this; }
        public CardBuilder isRainbow(boolean r) { c.isRainbow = r; return this; }
        public Card build() { return c; }
    }
}
