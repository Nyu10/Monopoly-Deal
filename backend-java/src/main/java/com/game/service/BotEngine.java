package com.game.service;

import com.game.model.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class BotEngine {

    public Move calculateBestMove(GameState state, int botId) {
        Player bot = state.getPlayers().get(botId);
        
        // If no cards in hand, must end turn
        if (bot.getHand().isEmpty()) {
            return new Move(botId, "END_TURN", null, null, null);
        }
        
        // Priority 1: Pass Go (maximize card advantage)
        Optional<Card> passGo = bot.getHand().stream()
                .filter(c -> c.getActionType() == ActionType.PASS_GO)
                .findFirst();
        if (passGo.isPresent()) {
            return new Move(botId, "PLAY_CARD", passGo.get().getUid(), null, null);
        }

        // Priority 2: Use economic action cards when opponents have money
        int botWealth = calculateBotWealth(bot);
        boolean opponentsHaveMoney = checkOpponentsHaveMoney(state, botId);
        
        if (opponentsHaveMoney && botWealth < 10) {
            // Try Birthday first (gets money from all players)
            Optional<Card> birthday = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.BIRTHDAY)
                    .findFirst();
            if (birthday.isPresent()) {
                return new Move(botId, "PLAY_CARD", birthday.get().getUid(), null, null);
            }
            
            // Try Debt Collector (gets money from richest player)
            Optional<Card> debtCollector = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.DEBT_COLLECTOR)
                    .findFirst();
            if (debtCollector.isPresent()) {
                return new Move(botId, "PLAY_CARD", debtCollector.get().getUid(), null, null);
            }
            
            // Try Rent cards if bot has properties
            if (!bot.getProperties().isEmpty()) {
                // Try wild rent first (works for any color)
                Optional<Card> wildRent = bot.getHand().stream()
                        .filter(c -> c.getType() == CardType.RENT_WILD)
                        .findFirst();
                if (wildRent.isPresent()) {
                    return new Move(botId, "PLAY_CARD", wildRent.get().getUid(), null, null);
                }
                
                // Try color-specific rent
                Optional<Card> rent = bot.getHand().stream()
                        .filter(c -> c.getType() == CardType.RENT)
                        .findFirst();
                if (rent.isPresent()) {
                    return new Move(botId, "PLAY_CARD", rent.get().getUid(), null, null);
                }
            }
        }

        // Priority 3: Use property manipulation cards strategically
        int botCompletedSets = countBotCompletedSets(bot);
        boolean closeToWinning = botCompletedSets >= 2;
        
        if (closeToWinning || opponentsHaveProperties(state, botId)) {
            // Try Deal Breaker first (steal complete set)
            Optional<Card> dealBreaker = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.DEAL_BREAKER)
                    .findFirst();
            if (dealBreaker.isPresent() && anyOpponentHasCompleteSet(state, botId)) {
                return new Move(botId, "PLAY_CARD", dealBreaker.get().getUid(), null, null);
            }
            
            // Try Sly Deal (steal single property)
            Optional<Card> slyDeal = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.SLY_DEAL)
                    .findFirst();
            if (slyDeal.isPresent()) {
                return new Move(botId, "PLAY_CARD", slyDeal.get().getUid(), null, null);
            }
            
            // Try Forced Deal (swap properties)
            Optional<Card> forcedDeal = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.FORCED_DEAL)
                    .findFirst();
            if (forcedDeal.isPresent() && !bot.getProperties().isEmpty()) {
                return new Move(botId, "PLAY_CARD", forcedDeal.get().getUid(), null, null);
            }
        }

        // Priority 4: Play Properties (win condition)
        Optional<Card> property = bot.getHand().stream()
                .filter(c -> c.getType() == CardType.PROPERTY || c.getType() == CardType.PROPERTY_WILD)
                .findFirst();
        if (property.isPresent()) {
            return new Move(botId, "PLAY_CARD", property.get().getUid(), null, null);
        }

        // Priority 5: Use buildings on complete sets
        if (botCompletedSets > 0) {
            // Try to place House
            Optional<Card> house = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.HOUSE)
                    .findFirst();
            if (house.isPresent()) {
                return new Move(botId, "PLAY_CARD", house.get().getUid(), null, null);
            }
            
            // Try to place Hotel (if has house)
            Optional<Card> hotel = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.HOTEL)
                    .findFirst();
            if (hotel.isPresent() && hasHouseOnCompleteSet(bot)) {
                return new Move(botId, "PLAY_CARD", hotel.get().getUid(), null, null);
            }
            
            // Try Double Rent before charging rent
            Optional<Card> doubleRent = bot.getHand().stream()
                    .filter(c -> c.getActionType() == ActionType.DOUBLE_RENT)
                    .findFirst();
            if (doubleRent.isPresent() && hasRentCard(bot)) {
                return new Move(botId, "PLAY_CARD", doubleRent.get().getUid(), null, null);
            }
        }

        // Priority 6: Build economy (bank money if low)
        int bankValue = bot.getBank().stream().mapToInt(Card::getValue).sum();
        if (bankValue < 5) {
            Optional<Card> money = bot.getHand().stream()
                    .filter(c -> c.getType() == CardType.MONEY)
                    .findFirst();
            if (money.isPresent()) {
                return new Move(botId, "PLAY_CARD", money.get().getUid(), null, null);
            }
        }

        // Priority 4: Bank any remaining action cards as money
        Optional<Card> actionCard = bot.getHand().stream()
                .filter(c -> c.getType() == CardType.ACTION || c.getType() == CardType.RENT || c.getType() == CardType.RENT_WILD)
                .findFirst();
        if (actionCard.isPresent()) {
            return new Move(botId, "PLAY_CARD", actionCard.get().getUid(), null, null);
        }

        // No valid moves, end turn
        return new Move(botId, "END_TURN", null, null, null);
    }

    /**
     * Select cards for bot to pay a debt
     * Priority: Money cards > Action cards > Low-value properties
     */
    public List<Card> selectCardsForPayment(Player bot, int amount) {
        List<Card> selectedCards = new ArrayList<>();
        int totalValue = 0;
        
        // Collect all available cards
        List<Card> availableCards = new ArrayList<>();
        availableCards.addAll(bot.getBank());
        availableCards.addAll(bot.getHand());
        
        // Sort by value (ascending) to minimize overpayment
        availableCards.sort(Comparator.comparingInt(Card::getValue));
        
        // Priority 1: Use money cards first
        for (Card card : availableCards) {
            if (totalValue >= amount) break;
            if (card.getType() == CardType.MONEY) {
                selectedCards.add(card);
                totalValue += card.getValue();
            }
        }
        
        // Priority 2: Use action cards if still need more
        if (totalValue < amount) {
            for (Card card : availableCards) {
                if (totalValue >= amount) break;
                if (!selectedCards.contains(card) && 
                    (card.getType() == CardType.ACTION || 
                     card.getType() == CardType.RENT || 
                     card.getType() == CardType.RENT_WILD)) {
                    selectedCards.add(card);
                    totalValue += card.getValue();
                }
            }
        }
        
        // Priority 3: Use properties as last resort (lowest value first)
        if (totalValue < amount) {
            for (Card card : availableCards) {
                if (totalValue >= amount) break;
                if (!selectedCards.contains(card) && 
                    (card.getType() == CardType.PROPERTY || 
                     card.getType() == CardType.PROPERTY_WILD)) {
                    selectedCards.add(card);
                    totalValue += card.getValue();
                }
            }
        }
        
        return selectedCards;
    }

    private int calculateBotWealth(Player bot) {
        int wealth = 0;
        wealth += bot.getBank().stream().mapToInt(Card::getValue).sum();
        wealth += bot.getHand().stream().mapToInt(Card::getValue).sum();
        return wealth;
    }

    private boolean checkOpponentsHaveMoney(GameState state, int botId) {
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != botId) {
                int opponentWealth = opponent.getBank().stream().mapToInt(Card::getValue).sum();
                if (opponentWealth >= 2) {
                    return true;
                }
            }
        }
        return false;
    }

    private int countBotCompletedSets(Player bot) {
        // Simple count of properties by color
        Map<String, Integer> colorCounts = new HashMap<>();
        for (Card card : bot.getProperties()) {
            String color = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color != null) {
                colorCounts.put(color, colorCounts.getOrDefault(color, 0) + 1);
            }
        }
        
        // Count complete sets (simplified)
        int completed = 0;
        Map<String, Integer> requiredCounts = Map.of(
            "brown", 2, "light_blue", 3, "pink", 3, "orange", 3,
            "red", 3, "yellow", 3, "green", 3, "dark_blue", 2, 
            "railroad", 4, "utility", 2
        );
        
        for (Map.Entry<String, Integer> entry : colorCounts.entrySet()) {
            Integer required = requiredCounts.get(entry.getKey());
            if (required != null && entry.getValue() >= required) {
                completed++;
            }
        }
        
        return completed;
    }

    private boolean opponentsHaveProperties(GameState state, int botId) {
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != botId && !opponent.getProperties().isEmpty()) {
                return true;
            }
        }
        return false;
    }

    private boolean anyOpponentHasCompleteSet(GameState state, int botId) {
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != botId) {
                int completedSets = countBotCompletedSets(opponent);
                if (completedSets > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Decide whether bot should use Just Say No to block an action
     * Threat assessment based on action type and bot's current state
     */
    public boolean shouldUseJustSayNo(GameState state, String actionType, Player target, Player attacker) {
        int targetCompletedSets = countBotCompletedSets(target);
        int attackerCompletedSets = countBotCompletedSets(attacker);
        
        // Threat levels for different actions
        int threatLevel = 0;
        
        switch (actionType) {
            case "DEAL_BREAKER":
                // Very high threat - losing a complete set
                threatLevel = 10;
                // Even higher if target is close to winning
                if (targetCompletedSets >= 2) {
                    threatLevel = 15;
                }
                break;
                
            case "SLY_DEAL":
                // Medium-high threat - losing a property
                threatLevel = 6;
                // Higher if target has many properties
                if (target.getProperties().size() >= 5) {
                    threatLevel = 8;
                }
                break;
                
            case "FORCED_DEAL":
                // Medium threat - swapping properties
                threatLevel = 5;
                break;
                
            case "DEBT_COLLECTOR":
                // Low-medium threat - losing $2M
                int targetWealth = calculateBotWealth(target);
                if (targetWealth < 5) {
                    threatLevel = 7; // High threat if low on money
                } else {
                    threatLevel = 3; // Low threat if wealthy
                }
                break;
                
            default:
                threatLevel = 2;
                break;
        }
        
        // Consider number of Just Say No cards
        long justSayNoCount = target.getHand().stream()
            .filter(c -> c.getActionType() == ActionType.JUST_SAY_NO)
            .count();
        
        // If bot has multiple Just Say No cards, lower threshold
        int threshold = justSayNoCount > 1 ? 5 : 7;
        
        // Use Just Say No if threat level exceeds threshold
        boolean shouldUse = threatLevel >= threshold;
        
        // Always use against Deal Breaker if target has 2+ complete sets
        if (actionType.equals("DEAL_BREAKER") && targetCompletedSets >= 2) {
            shouldUse = true;
        }
        
        // Don't use if attacker is far behind (let them catch up for more interesting game)
        if (attackerCompletedSets == 0 && targetCompletedSets >= 2) {
            shouldUse = false;
        }
        
        return shouldUse;
    }

    private boolean hasHouseOnCompleteSet(Player bot) {
        for (Card card : bot.getProperties()) {
            if (card.hasHouse()) {
                return true;
            }
        }
        return false;
    }

    private boolean hasRentCard(Player bot) {
        return bot.getHand().stream()
            .anyMatch(c -> c.getType() == CardType.RENT || c.getType() == CardType.RENT_WILD);
    }
}
