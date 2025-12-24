package com.game.service;

import com.game.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Set Detection Tests - Complete Property Sets")
class SetDetectionTest {

    private GameEngine gameEngine;
    private GameState gameState;

    @BeforeEach
    void setUp() {
        gameEngine = new GameEngine();
        gameState = gameEngine.createGame("test-set-detection");
    }

    // ==================== STANDARD PROPERTY SETS ====================

    @Test
    @DisplayName("Brown set (2 cards) - Baltic + Mediterranean")
    void testBrownSetCompletion() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Baltic Ave", "brown", 1));
        player.getProperties().add(createProperty("Mediterranean Ave", "brown", 1));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Brown set should be complete with 2 cards");
    }

    @Test
    @DisplayName("Dark Blue set (2 cards) - Boardwalk + Park Place")
    void testDarkBlueSetCompletion() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Boardwalk", "dark_blue", 4));
        player.getProperties().add(createProperty("Park Place", "dark_blue", 4));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Dark Blue set should be complete with 2 cards");
    }

    @Test
    @DisplayName("Light Blue set (3 cards) - Oriental + Vermont + Connecticut")
    void testLightBlueSetCompletion() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Oriental Ave", "light_blue", 1));
        player.getProperties().add(createProperty("Vermont Ave", "light_blue", 1));
        player.getProperties().add(createProperty("Connecticut Ave", "light_blue", 1));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Light Blue set should be complete with 3 cards");
    }

    @Test
    @DisplayName("Green set (3 cards) - All three green properties")
    void testGreenSetCompletion() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("North Carolina Ave", "green", 4));
        player.getProperties().add(createProperty("Pacific Ave", "green", 4));
        player.getProperties().add(createProperty("Pennsylvania Ave", "green", 4));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Green set should be complete with 3 cards");
    }

    @Test
    @DisplayName("Railroad set (4 cards) - All four railroads")
    void testRailroadSetCompletion() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Reading Railroad", "railroad", 2));
        player.getProperties().add(createProperty("Pennsylvania Railroad", "railroad", 2));
        player.getProperties().add(createProperty("B. & O. Railroad", "railroad", 2));
        player.getProperties().add(createProperty("Short Line", "railroad", 2));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Railroad set should be complete with 4 cards");
    }

    @Test
    @DisplayName("Utility set (2 cards) - Electric + Water")
    void testUtilitySetCompletion() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Electric Company", "utility", 2));
        player.getProperties().add(createProperty("Water Works", "utility", 2));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Utility set should be complete with 2 cards");
    }

    @Test
    @DisplayName("Incomplete set - Only 1 of 2 brown properties")
    void testIncompleteSet() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Baltic Ave", "brown", 1));
        
        int completedSets = countCompletedSets(player);
        assertEquals(0, completedSets, "Incomplete set should not count");
    }

    // ==================== WILD CARD SETS ====================

    @Test
    @DisplayName("2-color wild completes brown set")
    void testTwoColorWildCompletesSet() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Baltic Ave", "brown", 1));
        player.getProperties().add(createWildCard(List.of("light_blue", "brown"), "brown", 1));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Wild card should complete brown set");
    }

    @Test
    @DisplayName("Multi-color (rainbow) wild can complete any set")
    void testRainbowWildCompletesSet() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createProperty("Boardwalk", "dark_blue", 4));
        player.getProperties().add(createRainbowWild("dark_blue"));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Rainbow wild should complete dark blue set");
    }

    @Test
    @DisplayName("Wild card color change updates set completion")
    void testWildCardColorChange() {
        Player player = gameState.getPlayers().get(0);
        
        // Start with wild as brown
        Card wild = createWildCard(List.of("brown", "light_blue"), "brown", 1);
        player.getProperties().add(createProperty("Baltic Ave", "brown", 1));
        player.getProperties().add(wild);
        
        int completedSets1 = countCompletedSets(player);
        assertEquals(1, completedSets1, "Should complete brown set initially");
        
        // Change wild to light_blue
        wild.setCurrentColor("light_blue");
        player.getProperties().add(createProperty("Oriental Ave", "light_blue", 1));
        player.getProperties().add(createProperty("Vermont Ave", "light_blue", 1));
        
        int completedSets2 = countCompletedSets(player);
        assertEquals(1, completedSets2, "Should complete light blue set after color change");
    }

    @Test
    @DisplayName("Multiple wilds can be in same set")
    void testMultipleWildsInSet() {
        Player player = gameState.getPlayers().get(0);
        
        player.getProperties().add(createWildCard(List.of("green", "dark_blue"), "dark_blue", 4));
        player.getProperties().add(createRainbowWild("dark_blue"));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Two wilds should complete dark blue set (2 cards needed)");
    }

    // ==================== EDGE CASES ====================

    @Test
    @DisplayName("More than required cards in color still counts as 1 set")
    void testExtraCardsStillOneSet() {
        Player player = gameState.getPlayers().get(0);
        
        // Add 3 brown properties (only need 2)
        player.getProperties().add(createProperty("Baltic Ave", "brown", 1));
        player.getProperties().add(createProperty("Mediterranean Ave", "brown", 1));
        player.getProperties().add(createProperty("Extra Brown", "brown", 1));
        
        int completedSets = countCompletedSets(player);
        assertEquals(1, completedSets, "Extra cards should still count as 1 complete set");
    }

    @Test
    @DisplayName("Multiple complete sets counted correctly")
    void testMultipleCompleteSets() {
        Player player = gameState.getPlayers().get(0);
        
        // Complete brown set
        player.getProperties().add(createProperty("Baltic Ave", "brown", 1));
        player.getProperties().add(createProperty("Mediterranean Ave", "brown", 1));
        
        // Complete dark blue set
        player.getProperties().add(createProperty("Boardwalk", "dark_blue", 4));
        player.getProperties().add(createProperty("Park Place", "dark_blue", 4));
        
        // Complete utility set
        player.getProperties().add(createProperty("Electric Company", "utility", 2));
        player.getProperties().add(createProperty("Water Works", "utility", 2));
        
        int completedSets = countCompletedSets(player);
        assertEquals(3, completedSets, "Should count all 3 complete sets");
    }

    @Test
    @DisplayName("Win condition - 3 complete sets")
    void testWinCondition() {
        Player player = gameState.getPlayers().get(0);
        
        // Add 3 complete sets
        player.getProperties().add(createProperty("Baltic Ave", "brown", 1));
        player.getProperties().add(createProperty("Mediterranean Ave", "brown", 1));
        
        player.getProperties().add(createProperty("Boardwalk", "dark_blue", 4));
        player.getProperties().add(createProperty("Park Place", "dark_blue", 4));
        
        player.getProperties().add(createProperty("Electric Company", "utility", 2));
        player.getProperties().add(createProperty("Water Works", "utility", 2));
        
        int completedSets = countCompletedSets(player);
        assertTrue(completedSets >= 3, "Player should win with 3 complete sets");
    }

    // ==================== HELPER METHODS ====================

    private Card createProperty(String name, String color, int value) {
        return Card.builder()
                .uid(UUID.randomUUID().toString())
                .name(name)
                .type(CardType.PROPERTY)
                .color(color)
                .currentColor(color)
                .value(value)
                .build();
    }

    private Card createWildCard(List<String> colors, String currentColor, int value) {
        return Card.builder()
                .uid(UUID.randomUUID().toString())
                .name(String.join("/", colors) + " Wild")
                .type(CardType.PROPERTY_WILD)
                .colors(colors)
                .currentColor(currentColor)
                .value(value)
                .build();
    }

    private Card createRainbowWild(String currentColor) {
        return Card.builder()
                .uid(UUID.randomUUID().toString())
                .name("Multi-color Wild")
                .type(CardType.PROPERTY_WILD)
                .isRainbow(true)
                .currentColor(currentColor)
                .value(0)
                .build();
    }

    private int countCompletedSets(Player player) {
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
}
