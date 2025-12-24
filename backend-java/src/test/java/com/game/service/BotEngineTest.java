package com.game.service;

import com.game.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("BotEngine Tests")
class BotEngineTest {

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
                .players(new ArrayList<>(java.util.List.of(human, bot)))
                .deck(new java.util.Stack<>())
                .discardPile(new ArrayList<>())
                .turnContext(GameState.turnContextBuilder()
                        .activePlayerId(1)
                        .actionsRemaining(3)
                        .build())
                .logs(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should return END_TURN when bot has no cards")
    void testEndTurnWithNoCards() {
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertNotNull(move);
        assertEquals("END_TURN", move.getType());
    }

    @Test
    @DisplayName("Should prioritize Pass Go card")
    void testPrioritizePassGo() {
        Player bot = gameState.getPlayers().get(1);
        
        // Add Pass Go card
        Card passGo = Card.builder()
                .uid("pass-go-1")
                .name("Pass Go")
                .type(CardType.ACTION)
                .actionType(ActionType.PASS_GO)
                .value(1)
                .build();
        bot.getHand().add(passGo);
        
        // Add other cards
        Card money = Card.builder()
                .uid("money-1")
                .name("$5M")
                .type(CardType.MONEY)
                .value(5)
                .build();
        bot.getHand().add(money);
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("pass-go-1", move.getCardUid());
    }

    @Test
    @DisplayName("Should play property cards when available")
    void testPlayPropertyCard() {
        Player bot = gameState.getPlayers().get(1);
        
        Card property = Card.builder()
                .uid("prop-1")
                .name("Baltic Avenue")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build();
        bot.getHand().add(property);
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("prop-1", move.getCardUid());
    }

    @Test
    @DisplayName("Should bank money when bank value is low")
    void testBankMoneyWhenLow() {
        Player bot = gameState.getPlayers().get(1);
        
        // Bank is empty (value = 0, which is < 5)
        Card money = Card.builder()
                .uid("money-1")
                .name("$3M")
                .type(CardType.MONEY)
                .value(3)
                .build();
        bot.getHand().add(money);
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("money-1", move.getCardUid());
    }

    @Test
    @DisplayName("Should bank action cards when bank value is sufficient")
    void testBankActionCardsWhenSufficient() {
        Player bot = gameState.getPlayers().get(1);
        
        // Add money to bank (total value >= 5)
        for (int i = 0; i < 2; i++) {
            Card bankCard = Card.builder()
                    .uid("bank-" + i)
                    .name("$3M")
                    .type(CardType.MONEY)
                    .value(3)
                    .build();
            bot.getBank().add(bankCard);
        }
        
        // Add action card to hand (should be banked as money)
        Card action = Card.builder()
                .uid("action-1")
                .name("Debt Collector")
                .type(CardType.ACTION)
                .actionType(ActionType.DEBT_COLLECTOR)
                .value(3)
                .build();
        bot.getHand().add(action);
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Should bank the action card since bank is sufficient and no properties/pass-go available
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("action-1", move.getCardUid());
    }

    @Test
    @DisplayName("Should bank action cards as money when no better options")
    void testBankActionCards() {
        Player bot = gameState.getPlayers().get(1);
        
        // Add sufficient money to bank
        for (int i = 0; i < 3; i++) {
            bot.getBank().add(Card.builder()
                    .uid("bank-" + i)
                    .type(CardType.MONEY)
                    .value(2)
                    .build());
        }
        
        // Add action card
        Card action = Card.builder()
                .uid("action-1")
                .name("Debt Collector")
                .type(CardType.ACTION)
                .actionType(ActionType.DEBT_COLLECTOR)
                .value(3)
                .build();
        bot.getHand().add(action);
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        assertEquals("PLAY_CARD", move.getType());
        assertEquals("action-1", move.getCardUid());
    }

    @Test
    @DisplayName("Should handle multiple card types and choose correctly")
    void testMultipleCardPriority() {
        Player bot = gameState.getPlayers().get(1);
        
        // Add cards in reverse priority order
        Card money = Card.builder()
                .uid("money-1")
                .type(CardType.MONEY)
                .value(5)
                .build();
        
        Card property = Card.builder()
                .uid("prop-1")
                .type(CardType.PROPERTY)
                .color("brown")
                .value(1)
                .build();
        
        Card passGo = Card.builder()
                .uid("pass-go-1")
                .type(CardType.ACTION)
                .actionType(ActionType.PASS_GO)
                .value(1)
                .build();
        
        bot.getHand().add(money);
        bot.getHand().add(property);
        bot.getHand().add(passGo);
        
        Move move = botEngine.calculateBestMove(gameState, 1);
        
        // Should choose Pass Go (highest priority)
        assertEquals("pass-go-1", move.getCardUid());
    }
}
