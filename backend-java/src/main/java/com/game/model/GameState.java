package com.game.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

public class GameState {
    private String gameId;
    private String status;
    private List<Player> players;
    private Stack<Card> deck;
    private List<Card> discardPile;
    private TurnContext turnContext;
    private List<GameLog> logs;

    public GameState() {}

    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<Player> getPlayers() { return players; }
    public void setPlayers(List<Player> players) { this.players = players; }
    public Stack<Card> getDeck() { return deck; }
    public void setDeck(Stack<Card> deck) { this.deck = deck; }
    public List<Card> getDiscardPile() { return discardPile; }
    public void setDiscardPile(List<Card> discardPile) { this.discardPile = discardPile; }
    public TurnContext getTurnContext() { return turnContext; }
    public void setTurnContext(TurnContext turnContext) { this.turnContext = turnContext; }
    public List<GameLog> getLogs() { return logs; }
    public void setLogs(List<GameLog> logs) { this.logs = logs; }

    public static class TurnContext {
        private int activePlayerId;
        private int actionsRemaining;
        private boolean waitingForResponse;
        private Integer targetPlayerId;
        private Card pendingActionCard;
        private ReactionEffect pendingEffect;
        private int turnTimer;
        private boolean paused;
        private List<PaymentRequest> pendingPayments;
        private boolean doubleRentActive;

        public TurnContext() {
            this.pendingPayments = new ArrayList<>();
            this.doubleRentActive = false;
        }

        public int getActivePlayerId() { return activePlayerId; }
        public void setActivePlayerId(int activePlayerId) { this.activePlayerId = activePlayerId; }
        public int getActionsRemaining() { return actionsRemaining; }
        public void setActionsRemaining(int actionsRemaining) { this.actionsRemaining = actionsRemaining; }
        public boolean isWaitingForResponse() { return waitingForResponse; }
        public void setWaitingForResponse(boolean waitingForResponse) { this.waitingForResponse = waitingForResponse; }
        public Integer getTargetPlayerId() { return targetPlayerId; }
        public void setTargetPlayerId(Integer targetPlayerId) { this.targetPlayerId = targetPlayerId; }
        public Card getPendingActionCard() { return pendingActionCard; }
        public void setPendingActionCard(Card pendingActionCard) { this.pendingActionCard = pendingActionCard; }
        public ReactionEffect getPendingEffect() { return pendingEffect; }
        public void setPendingEffect(ReactionEffect pendingEffect) { this.pendingEffect = pendingEffect; }
        public int getTurnTimer() { return turnTimer; }
        public void setTurnTimer(int turnTimer) { this.turnTimer = turnTimer; }
        public boolean isPaused() { return paused; }
        public void setPaused(boolean paused) { this.paused = paused; }
        public List<PaymentRequest> getPendingPayments() { return pendingPayments; }
        public void setPendingPayments(List<PaymentRequest> pendingPayments) { this.pendingPayments = pendingPayments; }
        public boolean isDoubleRentActive() { return doubleRentActive; }
        public void setDoubleRentActive(boolean doubleRentActive) { this.doubleRentActive = doubleRentActive; }
    }

    public static class GameLog {
        private String text;
        private String type;
        public GameLog() {}
        public GameLog(String text, String type) { this.text = text; this.type = type; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    public static class ReactionEffect {
        private String type;
        private int amount;
        private String targetCardUid;
        public ReactionEffect() {}
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public int getAmount() { return amount; }
        public void setAmount(int amount) { this.amount = amount; }
        public String getTargetCardUid() { return targetCardUid; }
        public void setTargetCardUid(String targetCardUid) { this.targetCardUid = targetCardUid; }
    }

    // Builder manual implementation for compatibility with existing code
    public static GameStateBuilder builder() { return new GameStateBuilder(); }
    public static class GameStateBuilder {
        private GameState gs = new GameState();
        public GameStateBuilder gameId(String id) { gs.gameId = id; return this; }
        public GameStateBuilder status(String s) { gs.status = s; return this; }
        public GameStateBuilder players(List<Player> p) { gs.players = p; return this; }
        public GameStateBuilder deck(Stack<Card> d) { gs.deck = d; return this; }
        public GameStateBuilder discardPile(List<Card> dp) { gs.discardPile = dp; return this; }
        public GameStateBuilder turnContext(TurnContext tc) { gs.turnContext = tc; return this; }
        public GameStateBuilder logs(List<GameLog> l) { gs.logs = l; return this; }
        public GameState build() { return gs; }
    }

    public static class TurnContextBuilder {
        private TurnContext tc = new TurnContext();
        public TurnContextBuilder activePlayerId(int id) { tc.activePlayerId = id; return this; }
        public TurnContextBuilder actionsRemaining(int ar) { tc.actionsRemaining = ar; return this; }
        public TurnContext build() { return tc; }
    }

    public static TurnContextBuilder turnContextBuilder() { return new TurnContextBuilder(); }
}
