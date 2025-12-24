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

        // Priority 3: Play Properties (win condition)
        Optional<Card> property = bot.getHand().stream()
                .filter(c -> c.getType() == CardType.PROPERTY || c.getType() == CardType.PROPERTY_WILD)
                .findFirst();
        if (property.isPresent()) {
            return new Move(botId, "PLAY_CARD", property.get().getUid(), null, null);
        }

        // Priority 3: Build economy (bank money if low)
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
}
