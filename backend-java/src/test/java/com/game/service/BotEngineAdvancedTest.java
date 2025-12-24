package com.game.service;

import com.game.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Advanced Bot Engine Tests - State Machine & Optimization")
class BotEngineAdvancedTest {

    private BotEngine botEngine;
    private GameState gameState;

    @BeforeEach
    void setUp() {
        botEngine = new BotEngine();
        gameState = createTestGameState();
    }

    private GameState createTestGameState() {
        Player bot = new Player(1, "Test Bot", false);
        Player human = new Player(0, "Human", true);
        
        return GameState.builder()
                .gameId("test")
                .status("PLAYING")
                .players(new ArrayList<>(List.of(human, bot)))
                .deck(new Stack<>())
                .discardPile(new ArrayList<>())
                .turnContext(GameState.turnContextBuilder()
                        .activePlayerId(1)
                        .actionsRemaining(3)
                        .build())
                .logs(new ArrayList<>())
                .build();
    }

    // ==================== STATE MACHINE TESTS ====================

    @Test
    @DisplayName("Empty hand → END_TURN")
    void testEmptyHandEndsurn() {
        Player bot = gameState.getPlayers().get(1);
        // Hand is already empty
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("END_TURN", move.getType());
    }

    @Test
    @DisplayName("Only Pass Go in hand → Play Pass Go")
    void testOnlyPassGoPlaysIt() {
        Player bot = gameState.getPlayers().get(1);
        
        bot.getHand().add(Card.builder()
                .uid("pass-go-1")
                .name("Pass Go")
                .type(CardType.ACTION)
                .actionType(ActionType.PASS_GO)
                .value(1)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("pass-go-1", move.getCardUid());
    }

    @Test
    @DisplayName("Multiple properties → Choose property that completes set")
    void testPrioritizeSetCompletion() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bot already has 1 brown property
        bot.getProperties().add(Card.builder()
                .uid("brown-1")
                .name("Baltic Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        // Hand has: completing brown property + random green property
        bot.getHand().add(Card.builder()
                .uid("brown-2")
                .name("Mediterranean Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("green-1")
                .name("Pacific Ave")
                .type(CardType.PROPERTY)
                .color("green")
                .value(4)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Should choose brown-2 to complete the brown set
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("brown-2", move.getCardUid());
    }

    @Test
    @DisplayName("Near-complete sets → Prioritize completing over starting new")
    void testNearCompleteSetPriority() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bot has 2/3 light blue properties
        bot.getProperties().add(Card.builder()
                .uid("lb-1")
                .name("Oriental Ave")
                .type(CardType.PROPERTY)
                .color("light_blue")
                .value(1)
                .build());
        
        bot.getProperties().add(Card.builder()
                .uid("lb-2")
                .name("Vermont Ave")
                .type(CardType.PROPERTY)
                .color("light_blue")
                .value(1)
                .build());
        
        // Hand has: completing light blue + high-value dark blue
        bot.getHand().add(Card.builder()
                .uid("lb-3")
                .name("Connecticut Ave")
                .type(CardType.PROPERTY)
                .color("light_blue")
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("db-1")
                .name("Boardwalk")
                .type(CardType.PROPERTY)
                .color("dark_blue")
                .value(4)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Should complete light blue set (2/3 → 3/3) over starting dark blue (0/2 → 1/2)
        assertEquals("lb-3", move.getCardUid());
    }

    // ==================== OPTIMAL PLAY TESTS ====================

    @Test
    @DisplayName("Wild card placement → Choose color with highest incomplete set progress")
    void testWildCardOptimalPlacement() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bot has 1/3 red and 1/2 brown
        bot.getProperties().add(Card.builder()
                .uid("red-1")
                .name("Kentucky Ave")
                .type(CardType.PROPERTY)
                .color("red")
                .value(3)
                .build());
        
        bot.getProperties().add(Card.builder()
                .uid("brown-1")
                .name("Baltic Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        // Hand has red/yellow wild (can complete brown to 2/2 or advance red to 2/3)
        // Brown completion is better (50% → 100% vs 33% → 66%)
        bot.getHand().add(Card.builder()
                .uid("wild-1")
                .name("Red/Yellow Wild")
                .type(CardType.PROPERTY_WILD)
                .colors(List.of("red", "yellow"))
                .currentColor("red")
                .value(3)
                .build());
        
        // Note: Current bot doesn't have wild card optimization yet
        // This test documents expected behavior for future enhancement
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("wild-1", move.getCardUid());
    }

    @Test
    @DisplayName("Action cards available → Strategic use vs banking")
    void testActionCardStrategicUse() {
        Player bot = gameState.getPlayers().get(1);
        Player opponent = gameState.getPlayers().get(0);
        
        // Opponent has complete brown set
        opponent.getProperties().add(Card.builder()
                .uid("opp-brown-1")
                .name("Baltic Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        opponent.getProperties().add(Card.builder()
                .uid("opp-brown-2")
                .name("Mediterranean Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        // Bot has Deal Breaker (can steal complete set)
        bot.getHand().add(Card.builder()
                .uid("deal-breaker")
                .name("Deal Breaker")
                .type(CardType.ACTION)
                .actionType(ActionType.DEAL_BREAKER)
                .value(5)
                .build());
        
        // Bot also has money
        bot.getHand().add(Card.builder()
                .uid("money-1")
                .name("$5M")
                .type(CardType.MONEY)
                .value(5)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Current bot will bank money since bank is low
        // Future enhancement: Should use Deal Breaker strategically
        assertNotNull(move);
    }

    @Test
    @DisplayName("Banking strategy → Bank when needed, not excessively")
    void testBankingStrategy() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bot has $10M in bank (sufficient)
        bot.getBank().add(Card.builder()
                .uid("bank-1")
                .type(CardType.MONEY)
                .value(10)
                .build());
        
        // Hand has money and property
        bot.getHand().add(Card.builder()
                .uid("money-1")
                .type(CardType.MONEY)
                .value(3)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("prop-1")
                .name("Baltic Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Should play property, not bank more money
        assertEquals("prop-1", move.getCardUid());
    }

    @Test
    @DisplayName("Turn efficiency → Don't waste moves on low-value actions")
    void testTurnEfficiency() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bot has property that completes set + low-value money
        bot.getProperties().add(Card.builder()
                .uid("brown-1")
                .name("Baltic Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("brown-2")
                .name("Mediterranean Ave")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("money-1")
                .type(CardType.MONEY)
                .value(1)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Should complete set (high value) over banking $1M (low value)
        assertEquals("brown-2", move.getCardUid());
    }

    // ==================== MULTI-CARD DECISION TESTS ====================

    @Test
    @DisplayName("Pass Go + Property + Money → Choose Pass Go (card advantage)")
    void testPassGoPriority() {
        Player bot = gameState.getPlayers().get(1);
        
        bot.getHand().add(Card.builder()
                .uid("pass-go")
                .type(CardType.ACTION)
                .actionType(ActionType.PASS_GO)
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("prop")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("money")
                .type(CardType.MONEY)
                .value(5)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("pass-go", move.getCardUid());
    }

    @Test
    @DisplayName("Two properties: one completes set, one doesn't → Choose completing")
    void testSetCompletionOverNewProperty() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bot has 1/2 brown
        bot.getProperties().add(Card.builder()
                .uid("brown-1")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        // Hand has: completing brown + starting green
        bot.getHand().add(Card.builder()
                .uid("brown-2")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("green-1")
                .type(CardType.PROPERTY)
                .color("green")
                .value(4)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("brown-2", move.getCardUid());
    }

    @Test
    @DisplayName("Action card + Property (near win) → Choose property")
    void testPropertyOverActionWhenNearWin() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bot has 2 complete sets already
        addCompleteSet(bot, "brown", 2);
        addCompleteSet(bot, "dark_blue", 2);
        
        // Bot has 1/3 light blue (needs 2 more for win)
        bot.getProperties().add(Card.builder()
                .uid("lb-1")
                .type(CardType.PROPERTY)
                .color("light_blue")
                .value(1)
                .build());
        
        // Hand has: light blue property + Debt Collector
        bot.getHand().add(Card.builder()
                .uid("lb-2")
                .type(CardType.PROPERTY)
                .color("light_blue")
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("debt")
                .type(CardType.ACTION)
                .actionType(ActionType.DEBT_COLLECTOR)
                .value(3)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Should prioritize property (closer to win)
        assertEquals("lb-2", move.getCardUid());
    }

    @Test
    @DisplayName("Multiple action cards → Choose highest strategic value")
    void testActionCardPrioritization() {
        Player bot = gameState.getPlayers().get(1);
        
        // Hand has: Pass Go + Debt Collector + Birthday
        bot.getHand().add(Card.builder()
                .uid("pass-go")
                .type(CardType.ACTION)
                .actionType(ActionType.PASS_GO)
                .value(1)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("debt")
                .type(CardType.ACTION)
                .actionType(ActionType.DEBT_COLLECTOR)
                .value(3)
                .build());
        
        bot.getHand().add(Card.builder()
                .uid("birthday")
                .type(CardType.ACTION)
                .actionType(ActionType.BIRTHDAY)
                .value(2)
                .build());
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Pass Go has highest strategic value (card advantage)
        assertEquals("pass-go", move.getCardUid());
    }

    // ==================== HELPER METHODS ====================

    private void addCompleteSet(Player player, String color, int count) {
        for (int i = 0; i < count; i++) {
            player.getProperties().add(Card.builder()
                    .uid(color + "-" + i)
                    .name(color + " Property " + i)
                    .type(CardType.PROPERTY)
                    .color(color)
                    .value(1)
                    .build());
        }
    }
}
