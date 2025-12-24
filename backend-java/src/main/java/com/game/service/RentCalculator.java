package com.game.service;

import com.game.model.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class RentCalculator {
    
    // Required properties for complete sets
    private static final Map<String, Integer> SET_REQUIREMENTS = Map.of(
        "brown", 2,
        "light_blue", 3,
        "pink", 3,
        "orange", 3,
        "red", 3,
        "yellow", 3,
        "green", 3,
        "dark_blue", 2,
        "railroad", 4,
        "utility", 2
    );
    
    // Rent values by color and number of properties
    // Format: color -> [rent for 1 property, rent for 2 properties, ...]
    private static final Map<String, int[]> RENT_VALUES = Map.ofEntries(
        Map.entry("brown", new int[]{1, 2}),
        Map.entry("light_blue", new int[]{1, 2, 3}),
        Map.entry("pink", new int[]{1, 2, 4}),
        Map.entry("orange", new int[]{1, 3, 5}),
        Map.entry("red", new int[]{2, 3, 6}),
        Map.entry("yellow", new int[]{2, 4, 6}),
        Map.entry("green", new int[]{2, 4, 7}),
        Map.entry("dark_blue", new int[]{3, 8}),
        Map.entry("railroad", new int[]{1, 2, 3, 4}),
        Map.entry("utility", new int[]{1, 2})
    );
    
    /**
     * Calculate rent for a specific color property set
     */
    public int calculateRent(Player player, String color) {
        if (color == null || !RENT_VALUES.containsKey(color)) {
            return 0;
        }
        
        // Count properties of this color
        int propertyCount = countPropertiesOfColor(player, color);
        if (propertyCount == 0) {
            return 0;
        }
        
        int[] rentTable = RENT_VALUES.get(color);
        int baseRent = rentTable[Math.min(propertyCount - 1, rentTable.length - 1)];
        
        // Check if set is complete
        boolean isComplete = propertyCount >= SET_REQUIREMENTS.get(color);
        
        // Add building bonuses if complete set
        if (isComplete) {
            int buildingBonus = calculateBuildingBonus(player, color);
            return baseRent + buildingBonus;
        }
        
        return baseRent;
    }
    
    /**
     * Count properties of a specific color (including wild cards assigned to that color)
     */
    private int countPropertiesOfColor(Player player, String color) {
        int count = 0;
        for (Card card : player.getProperties()) {
            String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color.equals(cardColor)) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * Calculate bonus rent from buildings (house/hotel)
     */
    private int calculateBuildingBonus(Player player, String color) {
        int bonus = 0;
        
        for (Card card : player.getProperties()) {
            String cardColor = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color.equals(cardColor)) {
                if (card.hasHotel()) {
                    bonus += 4; // Hotel adds $4M
                } else if (card.hasHouse()) {
                    bonus += 3; // House adds $3M
                }
            }
        }
        
        return bonus;
    }
    
    /**
     * Get all colors that a player has properties for
     */
    public List<String> getAvailableRentColors(Player player) {
        Set<String> colors = new HashSet<>();
        for (Card card : player.getProperties()) {
            String color = card.getCurrentColor() != null ? card.getCurrentColor() : card.getColor();
            if (color != null && RENT_VALUES.containsKey(color)) {
                colors.add(color);
            }
        }
        return new ArrayList<>(colors);
    }
    
    /**
     * Select best color to charge rent for (highest rent value)
     */
    public String selectBestRentColor(Player player) {
        List<String> availableColors = getAvailableRentColors(player);
        if (availableColors.isEmpty()) {
            return null;
        }
        
        String bestColor = null;
        int maxRent = 0;
        
        for (String color : availableColors) {
            int rent = calculateRent(player, color);
            if (rent > maxRent) {
                maxRent = rent;
                bestColor = color;
            }
        }
        
        return bestColor;
    }
    
    /**
     * Check if a rent card can be used for a specific color
     */
    public boolean canUseRentCard(Card rentCard, String color) {
        if (rentCard.getType() == CardType.RENT_WILD) {
            return true; // Wild rent works for any color
        }
        
        if (rentCard.getType() == CardType.RENT && rentCard.getColors() != null) {
            return rentCard.getColors().contains(color);
        }
        
        return false;
    }
    
    /**
     * Check if player has complete set of a color
     */
    public boolean hasCompleteSet(Player player, String color) {
        if (!SET_REQUIREMENTS.containsKey(color)) {
            return false;
        }
        int required = SET_REQUIREMENTS.get(color);
        int count = countPropertiesOfColor(player, color);
        return count >= required;
    }
}
