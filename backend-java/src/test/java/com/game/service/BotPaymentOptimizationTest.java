package com.game.service;

import com.game.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BotPaymentOptimizationTest {

    private BotEngine botEngine;
    private Player bot;

    @BeforeEach
    void setUp() {
        botEngine = new BotEngine();
        bot = new Player(2, "Bot 2", false);
    }

    @Test
    void testOptimizePayment_PassGoAndReadingRailroad_Debt2M() {
        // Setup: Bot has Pass Go (1M Action) and Reading Railroad (2M Property)
        Card passGo = Card.builder()
                .uid("pass_go")
                .name("Pass Go")
                .value(1)
                .actionType(ActionType.PASS_GO)
                .type(CardType.ACTION)
                .build();
                
        Card readingRailroad = Card.builder()
                .uid("reading_railroad")
                .name("Reading Railroad")
                .value(2)
                .type(CardType.PROPERTY)
                .color("railroad")
                .build();
        
        bot.getBank().add(passGo); // Bank it as Money
        bot.getProperties().add(readingRailroad); // Play it
        
        // Execute: Pay 2M
        List<Card> payment = botEngine.selectCardsForPayment(bot, 2);
        
        // Sort payment result for consistent assertion if needed, but size=1 makes it easy
        
        // Assert: valid payment >= 2M
        int totalValue = payment.stream().mapToInt(Card::getValue).sum();
        assertTrue(totalValue >= 2, "Payment must be at least 2M");
        
        // Assert: Optimization should prefer paying exactly 2M with Property rather than 3M with Action+Property
        assertEquals(1, payment.size(), "Should pay with exactly 1 card");
        assertEquals("Reading Railroad", payment.get(0).getName(), "Should pay with Reading Railroad");
        assertEquals(2, totalValue, "Should pay exactly 2M");
    }

    @Test
    void testOptimizePayment_MultipleSmallCards() {
        // Debt 3M. Hand: Money(1), Money(1), Property(2).
        Card m1 = Card.builder()
                .uid("m1")
                .name("1M")
                .value(1)
                .type(CardType.MONEY)
                .build();
                
        Card m2 = Card.builder()
                .uid("m2")
                .name("1M")
                .value(1)
                .type(CardType.MONEY)
                .build();
                
        Card p1 = Card.builder()
                .uid("p1")
                .name("Property")
                .value(2)
                .type(CardType.PROPERTY)
                .color("brown")
                .build();
        
        bot.getBank().add(m1);
        bot.getBank().add(m2);
        bot.getProperties().add(p1); // Played property
        
        List<Card> payment = botEngine.selectCardsForPayment(bot, 3);
        int val = payment.stream().mapToInt(Card::getValue).sum();
        
        assertEquals(3, val, "Should pay exactly 3M");
        assertTrue(payment.contains(p1), "Should include Property");
        assertEquals(2, payment.size(), "Should use 2 cards (1 Money + 1 Property)");
    }
    @Test
    void testMinimizePayment_HighValueMoney_LowValueProperty() {
        // Scenario: Debt 1M.
        // Bot has: 5M Money card (Bank)
        //          2M Property card (Played)
        
        Card money5M = Card.builder()
                .uid("m5")
                .name("5M")
                .value(5)
                .type(CardType.MONEY)
                .build();
                
        Card property2M = Card.builder()
                .uid("p2")
                .name("Property 2M")
                .value(2)
                .type(CardType.PROPERTY)
                .color("green")
                .build();
        
        bot.getBank().add(money5M);
        bot.getProperties().add(property2M); // Card is on the table
        
        // Execute: Pay 1M
        List<Card> payment = botEngine.selectCardsForPayment(bot, 1);
        
        int totalValue = payment.stream().mapToInt(Card::getValue).sum();
        
        assertEquals(1, payment.size());
        assertEquals(2, totalValue, "Should pay 2M Property instead of 5M Money to minimize loss");
        assertEquals("Property 2M", payment.get(0).getName());
    }


}
