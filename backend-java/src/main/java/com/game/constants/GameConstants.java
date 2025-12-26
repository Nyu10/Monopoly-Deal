package com.game.constants;

/**
 * Game constants and balance rules.
 * Centralized source of truth for the backend.
 */
public final class GameConstants {
    private GameConstants() {
        // Prevent instantiation
    }

    // Hand management
    public static final int STARTING_HAND_SIZE = 5;
    public static final int INITIAL_HAND_SIZE = STARTING_HAND_SIZE; // Alias for legacy code
    
    public static final int NORMAL_DRAW_COUNT = 2;
    public static final int EMPTY_HAND_DRAW_COUNT = 5;
    public static final int MAX_HAND_SIZE = 7;

    // Turn rules
    public static final int MAX_ACTIONS_PER_TURN = 3;
    public static final int ACTIONS_PER_TURN = MAX_ACTIONS_PER_TURN; // Alias for legacy code
    
    // AI / Bot delays
    public static final int BOT_TURN_DELAY_MS = 1500;

    // Win condition
    public static final int COMPLETE_SETS_TO_WIN = 3;
    public static final int SETS_TO_WIN = COMPLETE_SETS_TO_WIN; // Alias for legacy code

    // Payment amounts (in millions)
    public static final int DEBT_COLLECTOR_AMOUNT = 5;
    public static final int BIRTHDAY_AMOUNT_PER_PLAYER = 2;

    // Action Card types
    public static final String ACTION_PASS_GO = "PASS_GO";
    public static final String ACTION_DEBT_COLLECTOR = "DEBT_COLLECTOR";
    public static final String ACTION_BIRTHDAY = "BIRTHDAY";
    public static final String ACTION_JUST_SAY_NO = "JUST_SAY_NO";
    public static final String ACTION_SLY_DEAL = "SLY_DEAL";
    public static final String ACTION_FORCED_DEAL = "FORCED_DEAL";
    public static final String ACTION_DEAL_BREAKER = "DEAL_BREAKER";
}
