package com.game.service;

import com.game.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameEngine {
    private static final Logger log = LoggerFactory.getLogger(GameEngine.class);
    private final Map<String, GameRoom> activeGames = new ConcurrentHashMap<>();
    
    @Autowired
    private BotEngine botEngine;
    
    @Autowired
    private RentCalculator rentCalculator;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public GameState createGame(String roomId) {
        GameState state = initializeNewGame(roomId);
        GameRoom room = new GameRoom(roomId, state);
        activeGames.put(roomId, room);
        return state;
    }

    private GameState initializeNewGame(String roomId) {
        List<Player> players = new ArrayList<>();
        players.add(new Player(0, "You", true));
        players.add(new Player(1, "Bot Alpha", false));
        players.add(new Player(2, "Bot Beta", false));
        players.add(new Player(3, "Bot Gamma", false));

        Stack<Card> deck = DeckGenerator.generateDeck();
        Collections.shuffle(deck);

        // Deal 5 cards
        for (Player p : players) {
            for (int i = 0; i < 5; i++) {
                if (!deck.isEmpty()) {
                    p.getHand().add(deck.pop());
                }
            }
        }

        return GameState.builder()
                .gameId(roomId)
                .status("PLAYING")
                .players(players)
                .deck(deck)
                .discardPile(new ArrayList<>())
                .turnContext(GameState.turnContextBuilder()
                        .activePlayerId(0)
                        .actionsRemaining(0) // Start with 0, player must draw first
                        .build())
                .logs(new ArrayList<>(List.of(new GameState.GameLog("Property Hustle Started! Draw 2 cards to begin.", "system"))))
                .build();
    }

    public void processMove(String roomId, Move move) {
        GameRoom room = activeGames.get(roomId);
        if (room == null) {
            log.warn("Room not found: {}", roomId);
            return;
        }

        room.executeWithLock(() -> {
            GameState state = room.getGameState();
            log.info("Processing move: {} for player {} in room: {}", move.getType(), move.getPlayerId(), roomId);
            
            // Validate it's the player's turn
            if (state.getTurnContext().getActivePlayerId() != move.getPlayerId()) {
                log.warn("Not player {}'s turn. Current turn: {}", move.getPlayerId(), state.getTurnContext().getActivePlayerId());
                return;
            }
            
            switch (move.getType().toUpperCase()) {
                case "DRAW":
                    handleDraw(state, move.getPlayerId());
                    // After draw, check if next player is bot
                    triggerBotTurnIfNeeded(roomId, state);
                    break;
                case "PLAY_CARD":
                    handlePlayCard(state, move);
                    // After each move, check if turn should end or bot should play
                    checkTurnEndAndTriggerBot(roomId, state);
                    break;
                case "END_TURN":
                    handleEndTurn(state, move.getPlayerId());
                    triggerBotTurnIfNeeded(roomId, state);
                    break;
                case "REACT":
                    handleReaction(state, move);
                    triggerBotTurnIfNeeded(roomId, state);
                    break;
            }
            
            // Broadcast updated state
            broadcastGameState(roomId, state);
        });
    }

    private void handleDraw(GameState state, int playerId) {
        Player p = state.getPlayers().get(playerId);
        int drawCount = p.getHand().isEmpty() ? 5 : 2;
        
        for (int i = 0; i < drawCount; i++) {
            if (!state.getDeck().isEmpty()) {
                p.getHand().add(state.getDeck().pop());
            } else {
                // Reshuffle discard pile if deck is empty
                if (!state.getDiscardPile().isEmpty()) {
                    state.getDeck().addAll(state.getDiscardPile());
                    state.getDiscardPile().clear();
                    Collections.shuffle(state.getDeck());
                    if (!state.getDeck().isEmpty()) {
                        p.getHand().add(state.getDeck().pop());
                    }
                }
            }
        }
        
        state.getLogs().add(new GameState.GameLog(p.getName() + " drew " + drawCount + " cards.", "info"));
        
        // After drawing, set actions to 3
        state.getTurnContext().setActionsRemaining(3);
    }

    private void handlePlayCard(GameState state, Move move) {
        Player p = state.getPlayers().get(move.getPlayerId());
        Card card = p.getHand().stream()
                .filter(c -> c.getUid().equals(move.getCardUid()))
                .findFirst()
                .orElse(null);

        if (card == null) {
            log.warn("Card not found in player's hand: {}", move.getCardUid());
            return;
        }
        
        if (state.getTurnContext().getActionsRemaining() <= 0) {
            log.warn("No actions remaining for player {}", move.getPlayerId());
            return;
        }

        // Move card from hand
        p.getHand().remove(card);
        state.getTurnContext().setActionsRemaining(state.getTurnContext().getActionsRemaining() - 1);

        switch (card.getType()) {
            case MONEY:
                p.getBank().add(card);
                state.getLogs().add(new GameState.GameLog(p.getName() + " banked $" + card.getValue() + "M.", "info"));
                break;
            case PROPERTY:
            case PROPERTY_WILD:
                // Prevent banking properties (validation)
                p.getProperties().add(card);
                state.getLogs().add(new GameState.GameLog(p.getName() + " played property: " + card.getName(), "event"));
                checkWinCondition(state, p);
                break;
            case RENT:
            case RENT_WILD:
                handleRentCard(state, p, card, move);
                break;
            case ACTION:
                handleActionCard(state, p, card, move);
                break;
            default:
                break;
        }
    }

    private void handleActionCard(GameState state, Player p, Card card, Move move) {
        state.getDiscardPile().add(card);
        state.getLogs().add(new GameState.GameLog(p.getName() + " played action: " + card.getName(), "event"));
        
        switch (card.getActionType()) {
            case PASS_GO:
                handleDraw(state, p.getId());
                break;
                
            case DEBT_COLLECTOR:
                handleDebtCollector(state, p, move);
                break;
                
            case BIRTHDAY:
                handleBirthday(state, p);
                break;
                
            // TODO: Add more action types (Sly Deal, Forced Deal, Deal Breaker, etc.)
            default:
                log.warn("Unimplemented action type: {}", card.getActionType());
                break;
        }
    }

    private void handleDebtCollector(GameState state, Player player, Move move) {
        // Determine target player
        int targetPlayerId;
        if (move.getTargetPlayerId() != null) {
            targetPlayerId = move.getTargetPlayerId();
        } else {
            // Bot selects richest opponent
            targetPlayerId = selectRichestOpponent(state, player.getId());
        }
        
        // Create payment request for $2M
        createPaymentRequest(state, targetPlayerId, player.getId(), 2, "debt_collector", null);
        
        // Process payment immediately (for bots)
        PaymentRequest request = state.getTurnContext().getPendingPayments()
            .stream()
            .filter(r -> !r.isResolved())
            .findFirst()
            .orElse(null);
        
        if (request != null) {
            handlePayment(state, request);
        }
    }

    private void handleBirthday(GameState state, Player player) {
        // All other players pay $2M to the active player
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != player.getId()) {
                createPaymentRequest(state, opponent.getId(), player.getId(), 2, "birthday", null);
            }
        }
        
        // Process all payments
        List<PaymentRequest> pendingPayments = new ArrayList<>(state.getTurnContext().getPendingPayments());
        for (PaymentRequest request : pendingPayments) {
            if (!request.isResolved()) {
                handlePayment(state, request);
            }
        }
    }

    private int selectRichestOpponent(GameState state, int playerId) {
        int richestId = -1;
        int maxWealth = -1;
        
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != playerId) {
                int wealth = calculatePlayerWealth(opponent);
                if (wealth > maxWealth) {
                    maxWealth = wealth;
                    richestId = opponent.getId();
                }
            }
        }
        
        // If no opponent found, return next player
        return richestId != -1 ? richestId : (playerId + 1) % state.getPlayers().size();
    }

    private int calculatePlayerWealth(Player player) {
        int wealth = 0;
        wealth += player.getBank().stream().mapToInt(Card::getValue).sum();
        wealth += player.getHand().stream().mapToInt(Card::getValue).sum();
        wealth += player.getProperties().stream().mapToInt(Card::getValue).sum();
        return wealth;
    }

    private void handleRentCard(GameState state, Player player, Card rentCard, Move move) {
        state.getDiscardPile().add(rentCard);
        
        // Determine which color to charge rent for
        String rentColor;
        if (rentCard.getType() == CardType.RENT_WILD) {
            // Wild rent - bot selects best color
            rentColor = rentCalculator.selectBestRentColor(player);
            if (rentColor == null) {
                state.getLogs().add(new GameState.GameLog(
                    player.getName() + " played Wild Rent but has no properties!", "warning"));
                return;
            }
        } else {
            // Color-specific rent card - select from available colors
            List<String> availableColors = rentCalculator.getAvailableRentColors(player);
            rentColor = null;
            
            // Find first matching color from rent card's colors
            for (String color : rentCard.getColors()) {
                if (availableColors.contains(color)) {
                    int rent = rentCalculator.calculateRent(player, color);
                    if (rentColor == null || rent > rentCalculator.calculateRent(player, rentColor)) {
                        rentColor = color;
                    }
                }
            }
            
            if (rentColor == null) {
                state.getLogs().add(new GameState.GameLog(
                    player.getName() + " played " + rentCard.getName() + " but has no matching properties!", "warning"));
                return;
            }
        }
        
        // Calculate rent amount
        int rentAmount = rentCalculator.calculateRent(player, rentColor);
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " charged $" + rentAmount + "M rent for " + rentColor + " properties", "event"));
        
        // Determine target(s)
        if (rentCalculator.hasCompleteSet(player, rentColor)) {
            // Complete set - charge ALL opponents
            for (Player opponent : state.getPlayers()) {
                if (opponent.getId() != player.getId()) {
                    createPaymentRequest(state, opponent.getId(), player.getId(), rentAmount, "rent", rentCard.getUid());
                }
            }
        } else {
            // Incomplete set - charge ONE opponent
            int targetPlayerId;
            if (move.getTargetPlayerId() != null) {
                targetPlayerId = move.getTargetPlayerId();
            } else {
                // Bot selects richest opponent
                targetPlayerId = selectRichestOpponent(state, player.getId());
            }
            createPaymentRequest(state, targetPlayerId, player.getId(), rentAmount, "rent", rentCard.getUid());
        }
        
        // Process all pending payments
        List<PaymentRequest> pendingPayments = new ArrayList<>(state.getTurnContext().getPendingPayments());
        for (PaymentRequest request : pendingPayments) {
            if (!request.isResolved()) {
                handlePayment(state, request);
            }
        }
    }


    private void handleEndTurn(GameState state, int playerId) {
        Player p = state.getPlayers().get(playerId);
        
        // Force discard to 7
        while (p.getHand().size() > 7) {
            Card discarded = p.getHand().remove(0);
            state.getDiscardPile().add(discarded);
        }

        int nextPlayerId = (playerId + 1) % state.getPlayers().size();
        state.getTurnContext().setActivePlayerId(nextPlayerId);
        state.getTurnContext().setActionsRemaining(0); // Must draw first
        
        Player nextPlayer = state.getPlayers().get(nextPlayerId);
        state.getLogs().add(new GameState.GameLog("It is now " + nextPlayer.getName() + "'s turn.", "system"));
    }

    private void handleReaction(GameState state, Move move) {
        // Handle "Just Say No" or Accept Payment
        state.getTurnContext().setWaitingForResponse(false);
        state.getTurnContext().setPaused(false);
    }

    // Payment System Methods
    private void createPaymentRequest(GameState state, int fromPlayerId, int toPlayerId, int amount, String reason, String cardUid) {
        PaymentRequest request = new PaymentRequest(fromPlayerId, toPlayerId, amount, reason, cardUid);
        state.getTurnContext().getPendingPayments().add(request);
        
        Player fromPlayer = state.getPlayers().get(fromPlayerId);
        Player toPlayer = state.getPlayers().get(toPlayerId);
        
        state.getLogs().add(new GameState.GameLog(
            fromPlayer.getName() + " must pay $" + amount + "M to " + toPlayer.getName() + " (" + reason + ")",
            "payment"
        ));
        
        log.info("Payment request created: {} must pay ${} to {} (reason: {})", 
            fromPlayer.getName(), amount, toPlayer.getName(), reason);
    }

    private void handlePayment(GameState state, PaymentRequest request) {
        Player payer = state.getPlayers().get(request.getFromPlayerId());
        Player payee = state.getPlayers().get(request.getToPlayerId());
        
        // Bot automatically selects cards to pay
        if (!payer.isHuman()) {
            List<Card> cardsToPayWith = botEngine.selectCardsForPayment(payer, request.getAmount());
            processPayment(state, request, cardsToPayWith);
        }
        // For human players, this would wait for their selection
        // For now, we'll auto-process for all players
        else {
            List<Card> cardsToPayWith = selectCardsForPayment(payer, request.getAmount());
            processPayment(state, request, cardsToPayWith);
        }
    }

    private void processPayment(GameState state, PaymentRequest request, List<Card> cardsToPayWith) {
        Player payer = state.getPlayers().get(request.getFromPlayerId());
        Player payee = state.getPlayers().get(request.getToPlayerId());
        
        int totalValue = calculateTotalValue(cardsToPayWith);
        
        // Transfer cards from payer to payee's bank
        for (Card card : cardsToPayWith) {
            payer.getHand().remove(card);
            payer.getProperties().remove(card);
            payer.getBank().remove(card);
            payee.getBank().add(card);
            request.getPaidCardUids().add(card.getUid());
        }
        
        request.setResolved(true);
        
        state.getLogs().add(new GameState.GameLog(
            payer.getName() + " paid $" + totalValue + "M to " + payee.getName(),
            "payment"
        ));
        
        log.info("{} paid ${} to {} using {} cards", 
            payer.getName(), totalValue, payee.getName(), cardsToPayWith.size());
    }

    private List<Card> selectCardsForPayment(Player player, int amount) {
        List<Card> selectedCards = new ArrayList<>();
        int totalValue = 0;
        
        // Priority: Money cards first, then action cards, then properties
        List<Card> allCards = new ArrayList<>();
        allCards.addAll(player.getBank());
        allCards.addAll(player.getHand());
        
        // Sort by value (ascending) to minimize overpayment
        allCards.sort(Comparator.comparingInt(Card::getValue));
        
        for (Card card : allCards) {
            if (totalValue >= amount) break;
            
            // Prefer money and action cards over properties
            if (card.getType() == CardType.MONEY || card.getType() == CardType.ACTION) {
                selectedCards.add(card);
                totalValue += card.getValue();
            }
        }
        
        // If still not enough, add properties
        if (totalValue < amount) {
            for (Card card : allCards) {
                if (totalValue >= amount) break;
                if (!selectedCards.contains(card) && card.getType() == CardType.PROPERTY) {
                    selectedCards.add(card);
                    totalValue += card.getValue();
                }
            }
        }
        
        return selectedCards;
    }

    private int calculateTotalValue(List<Card> cards) {
        return cards.stream().mapToInt(Card::getValue).sum();
    }


    private void checkWinCondition(GameState state, Player player) {
        int completedSets = countCompletedSets(player);
        if (completedSets >= 3) {
            state.setStatus("GAME_OVER");
            state.getLogs().add(new GameState.GameLog(player.getName() + " WINS with 3 complete sets!", "event"));
        }
    }

    private int countCompletedSets(Player player) {
        // TODO: Implement proper set counting logic
        // For now, simplified version
        Map<String, Integer> colorCounts = new HashMap<>();
        for (Card card : player.getProperties()) {
            String color = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color != null) {
                colorCounts.put(color, colorCounts.getOrDefault(color, 0) + 1);
            }
        }
        
        int completed = 0;
        Map<String, Integer> requiredCounts = Map.of(
            "brown", 2, "blue", 2, "lightblue", 3, "pink", 3,
            "orange", 3, "red", 3, "yellow", 3, "green", 3, "railroad", 4, "utility", 2
        );
        
        for (Map.Entry<String, Integer> entry : colorCounts.entrySet()) {
            Integer required = requiredCounts.get(entry.getKey());
            if (required != null && entry.getValue() >= required) {
                completed++;
            }
        }
        
        return completed;
    }

    private void checkTurnEndAndTriggerBot(String roomId, GameState state) {
        // If actions remaining is 0, automatically end turn
        if (state.getTurnContext().getActionsRemaining() <= 0) {
            int currentPlayer = state.getTurnContext().getActivePlayerId();
            handleEndTurn(state, currentPlayer);
            broadcastGameState(roomId, state);
            triggerBotTurnIfNeeded(roomId, state);
        }
    }

    private void triggerBotTurnIfNeeded(String roomId, GameState state) {
        int activePlayerId = state.getTurnContext().getActivePlayerId();
        Player activePlayer = state.getPlayers().get(activePlayerId);
        
        if (!activePlayer.isHuman()) {
            log.info("Triggering bot turn for player {}", activePlayerId);
            // Schedule bot move with a delay for better UX
            new Thread(() -> {
                try {
                    Thread.sleep(1500); // 1.5 second delay
                    executeBotTurn(roomId, activePlayerId);
                } catch (InterruptedException e) {
                    log.error("Bot turn interrupted", e);
                }
            }).start();
        }
    }

    private void executeBotTurn(String roomId, int botId) {
        GameRoom room = activeGames.get(roomId);
        if (room == null) return;

        room.executeWithLock(() -> {
            GameState state = room.getGameState();
            
            // Check if still bot's turn
            if (state.getTurnContext().getActivePlayerId() != botId) {
                return;
            }
            
            // If bot needs to draw
            if (state.getTurnContext().getActionsRemaining() == 0) {
                handleDraw(state, botId);
                broadcastGameState(roomId, state);
                // Schedule next bot action
                new Thread(() -> {
                    try {
                        Thread.sleep(1200);
                        executeBotTurn(roomId, botId);
                    } catch (InterruptedException e) {
                        log.error("Bot turn interrupted", e);
                    }
                }).start();
                return;
            }
            
            // Calculate and execute bot move
            Move botMove = botEngine.calculateBestMove(state, botId);
            if (botMove != null) {
                log.info("Bot {} executing move: {}", botId, botMove.getType());
                processMove(roomId, botMove);
            } else {
                // No valid move, end turn
                handleEndTurn(state, botId);
                broadcastGameState(roomId, state);
                triggerBotTurnIfNeeded(roomId, state);
            }
        });
    }

    private void broadcastGameState(String roomId, GameState state) {
        messagingTemplate.convertAndSend("/topic/game/" + roomId, state);
    }

    public GameState getGameState(String roomId) {
        GameRoom room = activeGames.get(roomId);
        return room != null ? room.getGameState() : null;
    }
}
