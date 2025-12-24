package com.game.service;

import com.game.constants.GameConstants;
import com.game.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for property manipulation (stealing, swapping, etc.)
 * Extracted from GameEngine to follow Single Responsibility Principle
 */
@Service
public class PropertyService {
    
    private static final Logger log = LoggerFactory.getLogger(PropertyService.class);
    
    private final RentCalculator rentCalculator;
    
    public PropertyService(RentCalculator rentCalculator) {
        this.rentCalculator = rentCalculator;
    }
    
    /**
     * Select a stealable property from target player
     * Cannot steal from complete sets
     */
    public Card selectStealableProperty(GameState state, Player target, Player thief) {
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
    
    /**
     * Select a property to give away (lowest value, not in complete set)
     */
    public Card selectPropertyToGiveAway(Player player) {
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
        tradableProps.sort((a, b) -> Integer.compare(a.getValue(), b.getValue()));
        return tradableProps.get(0);
    }
    
    /**
     * Check if adding a property of this color would help complete a set
     */
    public boolean wouldHelpCompleteSet(Player player, String color) {
        if (color == null) return false;
        
        int currentCount = 0;
        for (Card card : player.getProperties()) {
            String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color.equals(cardColor)) {
                currentCount++;
            }
        }
        
        // Check if adding one more would complete the set
        return !rentCalculator.hasCompleteSet(player, color) && currentCount > 0;
    }
    
    /**
     * Find a complete set to steal from target player
     */
    public String findCompleteSetToSteal(Player target) {
        List<String> availableColors = rentCalculator.getAvailableRentColors(target);
        
        for (String color : availableColors) {
            if (rentCalculator.hasCompleteSet(target, color)) {
                return color;
            }
        }
        
        return null;
    }
    
    /**
     * Find a complete set for building placement
     */
    public String findCompleteSetForBuilding(Player player) {
        List<String> availableColors = rentCalculator.getAvailableRentColors(player);
        
        for (String color : availableColors) {
            if (rentCalculator.hasCompleteSet(player, color)) {
                return color;
            }
        }
        
        return null;
    }
    
    /**
     * Find a complete set with a house for hotel placement
     */
    public String findCompleteSetWithHouse(Player player) {
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
     * Select best target for Sly Deal
     */
    public int selectBestSlyDealTarget(GameState state, int playerId) {
        int bestTarget = -1;
        int maxValue = 0;
        
        Player player = state.getPlayers().get(playerId);
        
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != playerId) {
                Card bestProperty = selectStealableProperty(state, opponent, player);
                if (bestProperty != null && bestProperty.getValue() > maxValue) {
                    maxValue = bestProperty.getValue();
                    bestTarget = opponent.getId();
                }
            }
        }
        
        return bestTarget != -1 ? bestTarget : (playerId + 1) % state.getPlayers().size();
    }
    
    /**
     * Select player with a complete set for Deal Breaker
     */
    public int selectPlayerWithCompleteSet(GameState state, int playerId) {
        for (Player opponent : state.getPlayers()) {
            if (opponent.getId() != playerId) {
                if (findCompleteSetToSteal(opponent) != null) {
                    return opponent.getId();
                }
            }
        }
        return -1;
    }
}
