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
                // Smart wild card color selection
                if (card.getType() == CardType.PROPERTY_WILD) {
                    String bestColor = selectBestWildCardColor(p, card);
                    if (bestColor != null) {
                        card.setCurrentColor(bestColor);
                    }
                }
                
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
                if (checkForJustSayNo(state, p, move, "DEBT_COLLECTOR")) return;
                handleDebtCollector(state, p, move);
                break;
                
            case BIRTHDAY:
                // Birthday affects all players, harder to Just Say No
                handleBirthday(state, p);
                break;
                
            case SLY_DEAL:
                if (checkForJustSayNo(state, p, move, "SLY_DEAL")) return;
                handleSlyDeal(state, p, move);
                break;
                
            case FORCED_DEAL:
                if (checkForJustSayNo(state, p, move, "FORCED_DEAL")) return;
                handleForcedDeal(state, p, move);
                break;
                
            case DEAL_BREAKER:
                if (checkForJustSayNo(state, p, move, "DEAL_BREAKER")) return;
                handleDealBreaker(state, p, move);
                break;
                
            case JUST_SAY_NO:
                // Just Say No is handled in checkForJustSayNo
                state.getLogs().add(new GameState.GameLog(
                    p.getName() + " said NO! The action was cancelled.",
                    "event"));
                break;
                
            case HOUSE:
                handleHouse(state, p, move);
                break;
                
            case HOTEL:
                handleHotel(state, p, move);
                break;
                
            case DOUBLE_RENT:
                handleDoubleRent(state, p);
                break;
                
            default:
                log.warn("Unimplemented action type: {}", card.getActionType());
                break;
        }
    }

    private void handleDoubleRent(GameState state, Player player) {
        // Set flag to double next rent
        state.getTurnContext().setDoubleRentActive(true);
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " played Double Rent! Next rent will be doubled.",
            "event"));
        
        log.info("{} activated Double Rent", player.getName());
    }

    private void handleHouse(GameState state, Player player, Move move) {
        // Find a complete set to place house on
        String targetColor = findCompleteSetForBuilding(player);
        
        if (targetColor == null) {
            state.getLogs().add(new GameState.GameLog(
                player.getName() + " played House but has no complete sets!",
                "warning"));
            return;
        }
        
        // Place house on one property of that color
        for (Card card : player.getProperties()) {
            String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (targetColor.equals(cardColor) && !card.hasHouse() && !card.hasHotel()) {
                card.setHasHouse(true);
                state.getLogs().add(new GameState.GameLog(
                    player.getName() + " placed a House on " + card.getName() + "!",
                    "event"));
                log.info("{} placed house on {}", player.getName(), card.getName());
                return;
            }
        }
    }

    private void handleHotel(GameState state, Player player, Move move) {
        // Find a complete set with a house to upgrade to hotel
        String targetColor = findCompleteSetWithHouse(player);
        
        if (targetColor == null) {
            state.getLogs().add(new GameState.GameLog(
                player.getName() + " played Hotel but has no complete sets with a House!",
                "warning"));
            return;
        }
        
        // Upgrade house to hotel on one property
        for (Card card : player.getProperties()) {
            String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (targetColor.equals(cardColor) && card.hasHouse() && !card.hasHotel()) {
                card.setHasHotel(true);
                state.getLogs().add(new GameState.GameLog(
                    player.getName() + " upgraded to a Hotel on " + card.getName() + "!",
                    "event"));
                log.info("{} placed hotel on {}", player.getName(), card.getName());
                return;
            }
        }
    }

    private String findCompleteSetForBuilding(Player player) {
        List<String> availableColors = rentCalculator.getAvailableRentColors(player);
        
        for (String color : availableColors) {
            if (rentCalculator.hasCompleteSet(player, color)) {
                return color;
            }
        }
        
        return null;
    }

    private String findCompleteSetWithHouse(Player player) {
        List<String> availableColors = rentCalculator.getAvailableRentColors(player);
        
        for (String color : availableColors) {
            if (rentCalculator.hasCompleteSet(player, color)) {
                // Check if any property in this set has a house
                for (Card card : player.getProperties()) {
                    String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
                    if (color.equals(cardColor) && card.hasHouse()) {
                        return color;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Check if target player wants to use Just Say No
     * Returns true if action was cancelled
     */
    private boolean checkForJustSayNo(GameState state, Player attacker, Move move, String actionType) {
        // Determine target player
        int targetPlayerId = -1;
        
        switch (actionType) {
            case "DEBT_COLLECTOR":
            case "SLY_DEAL":
            case "FORCED_DEAL":
                targetPlayerId = move.getTargetPlayerId() != null ? 
                    move.getTargetPlayerId() : selectBestSlyDealTarget(state, attacker.getId());
                break;
            case "DEAL_BREAKER":
                targetPlayerId = selectPlayerWithCompleteSet(state, attacker.getId());
                break;
        }
        
        if (targetPlayerId == -1 || targetPlayerId == attacker.getId()) {
            return false;
        }
        
        Player target = state.getPlayers().get(targetPlayerId);
        
        // Check if target has Just Say No card
        Card justSayNo = target.getHand().stream()
            .filter(c -> c.getActionType() == ActionType.JUST_SAY_NO)
            .findFirst()
            .orElse(null);
        
        if (justSayNo == null) {
            return false; // No Just Say No available
        }
        
        // Bot decides whether to use Just Say No
        boolean shouldUseJustSayNo = false;
        if (!target.isHuman()) {
            shouldUseJustSayNo = botEngine.shouldUseJustSayNo(state, actionType, target, attacker);
        }
        // For human players, would need UI interaction - for now, bots auto-decide
        
        if (shouldUseJustSayNo) {
            // Use Just Say No
            target.getHand().remove(justSayNo);
            state.getDiscardPile().add(justSayNo);
            
            state.getLogs().add(new GameState.GameLog(
                target.getName() + " played Just Say No! " + attacker.getName() + "'s " + 
                actionType.replace("_", " ") + " was cancelled!",
                "event"));
            
            log.info("{} used Just Say No to block {}'s {}", 
                target.getName(), attacker.getName(), actionType);
            
            return true; // Action cancelled
        }
        
        return false; // Action proceeds
    }


    private void handleSlyDeal(GameState state, Player player, Move move) {
        // Select target player
        int targetPlayerId = move.getTargetPlayerId() != null ? 
            move.getTargetPlayerId() : selectBestSlyDealTarget(state, player.getId());
        
        Player target = state.getPlayers().get(targetPlayerId);
        
        // Select property to steal (cannot be from complete set)
        Card propertyToSteal = selectStealableProperty(state, target, player);
        
        if (propertyToSteal == null) {
            state.getLogs().add(new GameState.GameLog(
                player.getName() + " played Sly Deal but " + target.getName() + " has no stealable properties!", 
                "warning"));
            return;
        }
        
        // Steal the property
        target.getProperties().remove(propertyToSteal);
        player.getProperties().add(propertyToSteal);
        
        String buildingInfo = "";
        if (propertyToSteal.hasHotel()) {
            buildingInfo = " (with Hotel)";
        } else if (propertyToSteal.hasHouse()) {
            buildingInfo = " (with House)";
        }
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " stole " + propertyToSteal.getName() + buildingInfo + " from " + target.getName() + "!",
            "event"));
        
        log.info("{} stole {}{} from {}", player.getName(), propertyToSteal.getName(), buildingInfo, target.getName());
    }

    private void handleForcedDeal(GameState state, Player player, Move move) {
        // Select target player
        int targetPlayerId = move.getTargetPlayerId() != null ? 
            move.getTargetPlayerId() : selectBestForcedDealTarget(state, player.getId());
        
        Player target = state.getPlayers().get(targetPlayerId);
        
        // Select property to give away (low value, not in complete set)
        Card propertyToGive = selectPropertyToGiveAway(state, player);
        
        // Select property to receive (high value, not in complete set)
        Card propertyToReceive = selectStealableProperty(state, target, player);
        
        if (propertyToGive == null || propertyToReceive == null) {
            state.getLogs().add(new GameState.GameLog(
                player.getName() + " played Forced Deal but cannot complete the trade!",
                "warning"));
            return;
        }
        
        // Swap properties
        player.getProperties().remove(propertyToGive);
        target.getProperties().add(propertyToGive);
        
        target.getProperties().remove(propertyToReceive);
        player.getProperties().add(propertyToReceive);
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " swapped " + propertyToGive.getName() + 
            " for " + propertyToReceive.getName() + " with " + target.getName() + "!",
            "event"));
        
        log.info("{} traded {} for {} with {}", 
            player.getName(), propertyToGive.getName(), propertyToReceive.getName(), target.getName());
    }

    private void handleDealBreaker(GameState state, Player player, Move move) {
        // Select target player with complete set
        int targetPlayerId = selectPlayerWithCompleteSet(state, player.getId());
        
        if (targetPlayerId == -1) {
            state.getLogs().add(new GameState.GameLog(
                player.getName() + " played Deal Breaker but no one has a complete set!",
                "warning"));
            return;
        }
        
        Player target = state.getPlayers().get(targetPlayerId);
        
        // Find a complete set to steal
        String colorToSteal = findCompleteSetToSteal(state, target);
        
        if (colorToSteal == null) {
            state.getLogs().add(new GameState.GameLog(
                player.getName() + " played Deal Breaker but couldn't find a complete set!",
                "warning"));
            return;
        }
        
        // Steal entire set
        List<Card> setCards = new ArrayList<>();
        for (Card card : target.getProperties()) {
            String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (colorToSteal.equals(cardColor)) {
                setCards.add(card);
            }
        }
        
        for (Card card : setCards) {
            target.getProperties().remove(card);
            player.getProperties().add(card);
        }
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " stole " + target.getName() + "'s complete " + 
            colorToSteal + " set (" + setCards.size() + " properties)!",
            "event"));
        
        log.info("{} stole complete {} set from {}", 
            player.getName(), colorToSteal, target.getName());
        
        // Check if player now wins
        checkWinCondition(state, player);
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

    // Property manipulation helper methods
    
    private Card selectStealableProperty(GameState state, Player target, Player thief) {
        // Cannot steal from complete sets
        List<Card> stealableProps = new ArrayList<>();
        
        for (Card card : target.getProperties()) {
            String color = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color != null && !rentCalculator.hasCompleteSet(target, color)) {
                stealableProps.add(card);
            }
        }
        
        if (stealableProps.isEmpty()) {
            return null;
        }
        
        // Prioritize properties that help thief complete sets
        for (Card prop : stealableProps) {
            String color = prop.getCurrentColor() != null ? prop.getCurrentColor() : prop.getColor();
            if (color != null && wouldHelpCompleteSet(thief, color)) {
                return prop;
            }
        }
        
        // Otherwise, steal highest value property
        stealableProps.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));
        return stealableProps.get(0);
    }

    private Card selectPropertyToGiveAway(GameState state, Player player) {
        // Give away lowest value property not in complete set
        List<Card> tradableProps = new ArrayList<>();
        
        for (Card card : player.getProperties()) {
            String color = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color != null && !rentCalculator.hasCompleteSet(player, color)) {
                tradableProps.add(card);
            }
        }
        
        if (tradableProps.isEmpty()) {
            return null;
        }
        
        // Sort by value (ascending) to give away lowest value
        tradableProps.sort(Comparator.comparingInt(Card::getValue));
        return tradableProps.get(0);
    }

    private boolean wouldHelpCompleteSet(Player player, String color) {
        if (color == null) return false;
        
        int currentCount = 0;
        for (Card card : player.getProperties()) {
            String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color.equals(cardColor)) {
                currentCount++;
            }
        }
        
        // Check if adding one more would complete the set
        return rentCalculator.hasCompleteSet(player, color) == false && currentCount > 0;
    }

    private int selectBestSlyDealTarget(GameState state, int playerId) {
        int bestTarget = -1;
        int maxValue = 0;
        
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != playerId) {
                Card bestProperty = selectStealableProperty(state, opponent, state.getPlayers().get(playerId));
                if (bestProperty != null && bestProperty.getValue() > maxValue) {
                    maxValue = bestProperty.getValue();
                    bestTarget = opponent.getId();
                }
            }
        }
        
        return bestTarget != -1 ? bestTarget : (playerId + 1) % state.getPlayers().size();
    }

    private int selectBestForcedDealTarget(GameState state, int playerId) {
        // Similar to Sly Deal, find player with valuable stealable properties
        return selectBestSlyDealTarget(state, playerId);
    }

    private int selectPlayerWithCompleteSet(GameState state, int playerId) {
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != playerId) {
                if (findCompleteSetToSteal(state, opponent) != null) {
                    return opponent.getId();
                }
            }
        }
        return -1;
    }

    private String findCompleteSetToSteal(GameState state, Player target) {
        List<String> availableColors = rentCalculator.getAvailableRentColors(target);
        
        for (String color : availableColors) {
            if (rentCalculator.hasCompleteSet(target, color)) {
                return color;
            }
        }
        
        return null;
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
        
        // Apply Double Rent multiplier if active
        if (state.getTurnContext().isDoubleRentActive()) {
            rentAmount *= 2;
            state.getTurnContext().setDoubleRentActive(false); // Reset after use
            state.getLogs().add(new GameState.GameLog(
                "Double Rent activated! Rent doubled to $" + rentAmount + "M!",
                "event"));
        }
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " charged $" + rentAmount + "M rent for " + rentColor + " properties", "event"));
        
        // Determine target(s) and check for Just Say No
        if (rentCalculator.hasCompleteSet(player, rentColor)) {
            // Complete set - charge ALL opponents
            for (Player opponent : state.getPlayers()) {
                if (opponent.getId() != player.getId()) {
                    // Check if this opponent uses Just Say No
                    if (checkForJustSayNoRent(state, player, opponent, rentAmount)) {
                        continue; // This opponent blocked the rent
                    }
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
            
            // Check for Just Say No
            Player target = state.getPlayers().get(targetPlayerId);
            if (!checkForJustSayNoRent(state, player, target, rentAmount)) {
                createPaymentRequest(state, targetPlayerId, player.getId(), rentAmount, "rent", rentCard.getUid());
            }
        }
        
        // Process all pending payments
        List<PaymentRequest> pendingPayments = new ArrayList<>(state.getTurnContext().getPendingPayments());
        for (PaymentRequest request : pendingPayments) {
            if (!request.isResolved()) {
                handlePayment(state, request);
            }
        }
    }

    private boolean checkForJustSayNoRent(GameState state, Player charger, Player target, int rentAmount) {
        // Check if target has Just Say No card
        Card justSayNo = target.getHand().stream()
            .filter(c -> c.getActionType() == ActionType.JUST_SAY_NO)
            .findFirst()
            .orElse(null);
        
        if (justSayNo == null) {
            return false;
        }
        
        // Bot decides whether to use Just Say No for rent
        boolean shouldUse = false;
        if (!target.isHuman()) {
            // Use Just Say No if rent is high and bot has low money
            int targetWealth = calculatePlayerWealth(target);
            shouldUse = (rentAmount >= 3 && targetWealth < 5) || rentAmount >= 6;
        }
        
        if (shouldUse) {
            target.getHand().remove(justSayNo);
            state.getDiscardPile().add(justSayNo);
            
            state.getLogs().add(new GameState.GameLog(
                target.getName() + " played Just Say No! Rent was cancelled.",
                "event"));
            
            log.info("{} used Just Say No to block ${} rent from {}", 
                target.getName(), rentAmount, charger.getName());
            
            return true;
        }
        
        return false;
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
        
        // Check if payment is insufficient
        if (totalValue < request.getAmount()) {
            state.getLogs().add(new GameState.GameLog(
                payer.getName() + " can only pay $" + totalValue + "M of the $" + request.getAmount() + "M owed!",
                "warning"
            ));
        }
        
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
        // Count completed property sets for win condition
        Map<String, Integer> colorCounts = new HashMap<>();
        for (Card card : player.getProperties()) {
            String color = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color != null) {
                colorCounts.put(color, colorCounts.getOrDefault(color, 0) + 1);
            }
        }
        
        int completed = 0;
        Map<String, Integer> requiredCounts = Map.of(
            "brown", 2, "dark_blue", 2, "light_blue", 3, "pink", 3,
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

    private String selectBestWildCardColor(Player player, Card wildCard) {
        // For rainbow wild cards, can be any color
        List<String> possibleColors;
        if (wildCard.isRainbow()) {
            possibleColors = Arrays.asList("brown", "dark_blue", "light_blue", "pink", 
                "orange", "red", "yellow", "green", "railroad", "utility");
        } else if (wildCard.getColors() != null && !wildCard.getColors().isEmpty()) {
            possibleColors = wildCard.getColors();
        } else {
            return wildCard.getCurrentColor(); // Already has a color
        }
        
        // Count existing properties by color
        Map<String, Integer> colorCounts = new HashMap<>();
        for (Card card : player.getProperties()) {
            String color = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color != null) {
                colorCounts.put(color, colorCounts.getOrDefault(color, 0) + 1);
            }
        }
        
        // Set requirements
        Map<String, Integer> requiredCounts = Map.of(
            "brown", 2, "dark_blue", 2, "light_blue", 3, "pink", 3,
            "orange", 3, "red", 3, "yellow", 3, "green", 3, "railroad", 4, "utility", 2
        );
        
        // Strategy: Choose color that gets closest to completing a set
        String bestColor = null;
        int bestScore = -1;
        
        for (String color : possibleColors) {
            int currentCount = colorCounts.getOrDefault(color, 0);
            Integer required = requiredCounts.get(color);
            
            if (required != null) {
                // Score: how close to completing the set
                int score = currentCount;
                
                // Bonus if this would complete the set
                if (currentCount + 1 >= required) {
                    score += 100;
                }
                
                // Bonus for colors with higher rent values
                if (color.equals("dark_blue") || color.equals("green")) {
                    score += 5;
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestColor = color;
                }
            }
        }
        
        // If no good choice, pick first available color
        return bestColor != null ? bestColor : possibleColors.get(0);
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
