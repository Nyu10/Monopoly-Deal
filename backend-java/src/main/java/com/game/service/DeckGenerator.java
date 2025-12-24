package com.game.service;

import com.game.model.*;
import java.util.*;

public class DeckGenerator {
    public static Stack<Card> generateDeck() {
        Stack<Card> deck = new Stack<>();
        
        // 1. Money (20 Total)
        addMoney(deck, 10, 1);
        addMoney(deck, 5, 2);
        addMoney(deck, 4, 3);
        addMoney(deck, 3, 3);
        addMoney(deck, 2, 5);
        addMoney(deck, 1, 6);

        // 2. Properties (28 Total)
        addProperty(deck, "dark_blue", Arrays.asList("Boardwalk", "Park Place"), 4, 1); // 2 cards total
        addProperty(deck, "green", Arrays.asList("North Carolina Ave", "Pacific Ave", "Pennsylvania Ave"), 4, 1); // 3 cards total
        addProperty(deck, "yellow", Arrays.asList("Marvin Gardens", "Ventnor Ave", "Atlantic Ave"), 3, 1); // 3 cards total
        addProperty(deck, "red", Arrays.asList("Kentucky Ave", "Indiana Ave", "Illinois Ave"), 3, 1); // 3 cards total
        addProperty(deck, "orange", Arrays.asList("New York Ave", "St. James Place", "Tennessee Ave"), 2, 1); // 3 cards total
        addProperty(deck, "pink", Arrays.asList("St. Charles Place", "Virginia Ave", "States Ave"), 2, 1); // 3 cards total
        addProperty(deck, "light_blue", Arrays.asList("Oriental Ave", "Vermont Ave", "Connecticut Ave"), 1, 1); // 3 cards total
        addProperty(deck, "brown", Arrays.asList("Baltic Ave", "Mediterranean Ave"), 1, 1); // 2 cards total
        addProperty(deck, "railroad", Arrays.asList("Reading Railroad", "Pennsylvania Railroad", "B. & O. Railroad", "Short Line"), 2, 1); // 4 cards total
        addProperty(deck, "utility", Arrays.asList("Electric Company", "Water Works"), 2, 1); // 2 cards total

        // 3. Action Cards (34 Total)
        addAction(deck, ActionType.DEAL_BREAKER, 5, "Deal Breaker", "Steal a completed set from any player. (Includes any buildings)", 2);
        addAction(deck, ActionType.JUST_SAY_NO, 4, "Just Say No", "Use any time an Action card is played against you.", 3);
        addAction(deck, ActionType.SLY_DEAL, 3, "Sly Deal", "Steal a property from any player. (Cannot be part of a completed set)", 3);
        addAction(deck, ActionType.FORCED_DEAL, 3, "Forced Deal", "Swap any property with another player. (Cannot be part of a completed set)", 3);
        addAction(deck, ActionType.PASS_GO, 1, "Pass Go", "Draw 2 extra cards.", 10);
        addAction(deck, ActionType.DEBT_COLLECTOR, 3, "Debt Collector", "Force any player to pay you $2M.", 3);
        addAction(deck, ActionType.BIRTHDAY, 2, "It's My Birthday", "All players pay you $2M.", 3);
        addAction(deck, ActionType.HOUSE, 3, "House", "Add onto any completed set to add $3M to the rent value.", 3);
        addAction(deck, ActionType.HOTEL, 4, "Hotel", "Add onto any completed set that already has a house to add $4M to the rent value.", 2);
        addAction(deck, ActionType.DOUBLE_RENT, 1, "Double the Rent", "Play with a Rent card to double the total rent.", 2);

        // 4. Property Wildcards (11 Total)
        addWild(deck, Arrays.asList("dark_blue", "green"), 4, 1);
        addWild(deck, Arrays.asList("light_blue", "brown"), 1, 1);
        addWild(deck, Arrays.asList("pink", "orange"), 2, 2);
        addWild(deck, Arrays.asList("red", "yellow"), 3, 2);
        addWild(deck, Arrays.asList("green", "railroad"), 4, 1);
        addWild(deck, Arrays.asList("light_blue", "railroad"), 4, 1);
        addWild(deck, Arrays.asList("railroad", "utility"), 2, 1);
        addWildMulti(deck, 2); // Multi-color Wild (0 Value)

        // 5. Rent Cards (13 Total)
        addRent(deck, Arrays.asList("dark_blue", "green"), 1, 2);
        addRent(deck, Arrays.asList("red", "yellow"), 1, 2);
        addRent(deck, Arrays.asList("pink", "orange"), 1, 2);
        addRent(deck, Arrays.asList("light_blue", "brown"), 1, 2);
        addRent(deck, Arrays.asList("railroad", "utility"), 1, 2);
        addRentWild(deck, 3, 3); // Wild Rent (Any color)

        return deck;
    }

    private static void addMoney(Stack<Card> deck, int val, int qty) {
        for (int i=0; i<qty; i++) {
            deck.push(Card.builder()
                .uid(UUID.randomUUID().toString())
                .name("$" + val + "M")
                .description("Money Card")
                .value(val)
                .type(CardType.MONEY)
                .build());
        }
    }

    private static void addProperty(Stack<Card> deck, String color, List<String> names, int val, int qty) {
        for (String name : names) {
            for (int i=0; i<qty; i++) {
                deck.push(Card.builder()
                    .uid(UUID.randomUUID().toString())
                    .name(name)
                    .value(val)
                    .color(color)
                    .currentColor(color)
                    .type(CardType.PROPERTY)
                    .build());
            }
        }
    }

    private static void addAction(Stack<Card> deck, ActionType type, int val, String name, String desc, int qty) {
        for (int i=0; i<qty; i++) {
            deck.push(Card.builder()
                .uid(UUID.randomUUID().toString())
                .name(name)
                .description(desc)
                .value(val)
                .type(CardType.ACTION)
                .actionType(type)
                .build());
        }
    }

    private static void addWild(Stack<Card> deck, List<String> colors, int val, int qty) {
        for (int i=0; i<qty; i++) {
            deck.push(Card.builder()
                .uid(UUID.randomUUID().toString())
                .name(String.join("/", colors) + " Wild")
                .value(val)
                .type(CardType.PROPERTY_WILD)
                .colors(colors)
                .currentColor(colors.get(0))
                .build());
        }
    }

    private static void addWildMulti(Stack<Card> deck, int qty) {
        for (int i=0; i<qty; i++) {
            deck.push(Card.builder()
                .uid(UUID.randomUUID().toString())
                .name("Multi-color Wild")
                .value(0)
                .type(CardType.PROPERTY_WILD)
                .isRainbow(true)
                .build());
        }
    }

    private static void addRent(Stack<Card> deck, List<String> colors, int val, int qty) {
        for (int i=0; i<qty; i++) {
            deck.push(Card.builder()
                .uid(UUID.randomUUID().toString())
                .name(String.join("/", colors) + " Rent")
                .value(val)
                .type(CardType.RENT)
                .colors(colors)
                .build());
        }
    }

    private static void addRentWild(Stack<Card> deck, int val, int qty) {
        for (int i=0; i<qty; i++) {
            deck.push(Card.builder()
                .uid(UUID.randomUUID().toString())
                .name("Wild Rent")
                .description("Force any player to pay rent for any of your properties.")
                .value(val)
                .type(CardType.RENT_WILD)
                .build());
        }
    }
}
