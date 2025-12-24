package com.game.service;

import com.game.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("GameEngine Tests")
class GameEngineTest {

    private TestGameEngine gameEngine;
    private BotEngine botEngine;

    // Test-friendly GameEngine that doesn't require messaging template
    static class TestGameEngine extends GameEngine {
        private final BotEngine botEngine;
        
        public TestGameEngine(BotEngine botEngine) {
            super();
            this.botEngine = botEngine;
        }
        
        // Override to avoid null pointer on messaging template
        @Override
        public void processMove(String roomId, Move move) {
            // Call parent but catch any messaging exceptions
            try {
                super.processMove(roomId, move);
            } catch (NullPointerException e) {
                // Expected - no messaging template in tests
            }
        }
    }

    @BeforeEach
    void setUp() {
        botEngine = new BotEngine();
        gameEngine = new TestGameEngine(botEngine);
    }

    @Test
    @DisplayName("Should create game with 4 players")
    void testCreateGame() {
        String roomId = "test-room-1";
        GameState state = gameEngine.createGame(roomId);

        assertNotNull(state);
        assertEquals(roomId, state.getGameId());
        assertEquals("PLAYING", state.getStatus());
        assertEquals(4, state.getPlayers().size());
        
        // Check first player is human
        assertTrue(state.getPlayers().get(0).isHuman());
        assertEquals("You", state.getPlayers().get(0).getName());
        
        // Check other players are bots
        for (int i = 1; i < 4; i++) {
            assertFalse(state.getPlayers().get(i).isHuman());
        }
    }

    @Test
    @DisplayName("Should deal 5 cards to each player at start")
    void testInitialCardDeal() {
        GameState state = gameEngine.createGame("test-room-2");

        for (Player player : state.getPlayers()) {
            assertEquals(5, player.getHand().size(), 
                "Player " + player.getName() + " should have 5 cards");
        }
    }

    @Test
    @DisplayName("Should start with player 0's turn and 0 actions (must draw)")
    void testInitialTurnState() {
        GameState state = gameEngine.createGame("test-room-3");

        assertEquals(0, state.getTurnContext().getActivePlayerId());
        assertEquals(0, state.getTurnContext().getActionsRemaining());
    }

    @Test
    @DisplayName("Should handle draw move correctly")
    void testDrawMove() {
        String roomId = "test-room-4";
        GameState state = gameEngine.createGame(roomId);
        
        int initialHandSize = state.getPlayers().get(0).getHand().size();
        
        Move drawMove = new Move(0, "DRAW", null, null, null);
        gameEngine.processMove(roomId, drawMove);
        
        state = gameEngine.getGameState(roomId);
        int newHandSize = state.getPlayers().get(0).getHand().size();
        
        assertEquals(initialHandSize + 2, newHandSize, "Should draw 2 cards");
        assertEquals(3, state.getTurnContext().getActionsRemaining(), 
            "Should have 3 actions after drawing");
    }

    @Test
    @DisplayName("Should handle playing money card to bank")
    void testPlayMoneyCard() {
        String roomId = "test-room-5";
        GameState state = gameEngine.createGame(roomId);
        
        // First draw to get actions
        gameEngine.processMove(roomId, new Move(0, "DRAW", null, null, null));
        state = gameEngine.getGameState(roomId);
        
        // Add a money card to player's hand for testing
        Card moneyCard = Card.builder()
                .uid("test-money-1")
                .name("$5M")
                .type(CardType.MONEY)
                .value(5)
                .build();
        state.getPlayers().get(0).getHand().add(moneyCard);
        
        int initialBankSize = state.getPlayers().get(0).getBank().size();
        int initialActions = state.getTurnContext().getActionsRemaining();
        
        Move playMove = new Move(0, "PLAY_CARD", "test-money-1", null, null);
        gameEngine.processMove(roomId, playMove);
        
        state = gameEngine.getGameState(roomId);
        assertEquals(initialBankSize + 1, state.getPlayers().get(0).getBank().size());
        assertEquals(initialActions - 1, state.getTurnContext().getActionsRemaining());
    }

    @Test
    @DisplayName("Should handle playing property card")
    void testPlayPropertyCard() {
        String roomId = "test-room-6";
        GameState state = gameEngine.createGame(roomId);
        
        // Draw first
        gameEngine.processMove(roomId, new Move(0, "DRAW", null, null, null));
        state = gameEngine.getGameState(roomId);
        
        // Add a property card
        Card propertyCard = Card.builder()
                .uid("test-prop-1")
                .name("Baltic Avenue")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build();
        state.getPlayers().get(0).getHand().add(propertyCard);
        
        int initialPropSize = state.getPlayers().get(0).getProperties().size();
        
        Move playMove = new Move(0, "PLAY_CARD", "test-prop-1", null, null);
        gameEngine.processMove(roomId, playMove);
        
        state = gameEngine.getGameState(roomId);
        assertEquals(initialPropSize + 1, state.getPlayers().get(0).getProperties().size());
    }

    @Test
    @DisplayName("Should prevent playing when not player's turn")
    void testPreventPlayingOutOfTurn() {
        String roomId = "test-room-8";
        GameState state = gameEngine.createGame(roomId);
        
        // Try to play as player 1 when it's player 0's turn
        Card testCard = Card.builder()
                .uid("test-card")
                .name("Test")
                .type(CardType.MONEY)
                .value(1)
                .build();
        state.getPlayers().get(1).getHand().add(testCard);
        
        int initialHandSize = state.getPlayers().get(1).getHand().size();
        
        Move invalidMove = new Move(1, "PLAY_CARD", "test-card", null, null);
        gameEngine.processMove(roomId, invalidMove);
        
        state = gameEngine.getGameState(roomId);
        // Hand size should not change
        assertEquals(initialHandSize, state.getPlayers().get(1).getHand().size());
    }
}
