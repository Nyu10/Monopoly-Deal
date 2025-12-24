package com.game.constants;

/**
 * Game configuration constants for Monopoly Deal
 */
public final class GameConstants {
    
    // Prevent instantiation
    private GameConstants() {
        throw new AssertionError("Cannot instantiate constants class");
    }
    
    // Game Setup
    public static final int INITIAL_HAND_SIZE = 5;
    public static final int NORMAL_DRAW_COUNT = 2;
    public static final int ACTIONS_PER_TURN = 3;
    public static final int MAX_HAND_SIZE = 7;
    public static final int SETS_TO_WIN = 3;
    
    // Payment Amounts
    public static final int DEBT_COLLECTOR_AMOUNT = 2;
    public static final int BIRTHDAY_AMOUNT = 2;
    
    // Bot Strategy Thresholds
    public static final int LOW_WEALTH_THRESHOLD = 10;
    public static final int LOW_BANK_THRESHOLD = 5;
    public static final int HIGH_RENT_THRESHOLD = 3;
    public static final int LOW_WEALTH_FOR_RENT_BLOCK = 5;
    public static final int HIGH_RENT_FOR_AUTO_BLOCK = 6;
    public static final int WINNING_SETS_THRESHOLD = 2;
    
    // Timing
    public static final int BOT_TURN_DELAY_MS = 1500;
    public static final int BOT_MOVE_DELAY_MS = 800;
    
    // Property Set Requirements
    public static final int BROWN_SET_SIZE = 2;
    public static final int DARK_BLUE_SET_SIZE = 2;
    public static final int UTILITY_SET_SIZE = 2;
    public static final int LIGHT_BLUE_SET_SIZE = 3;
    public static final int PINK_SET_SIZE = 3;
    public static final int ORANGE_SET_SIZE = 3;
    public static final int RED_SET_SIZE = 3;
    public static final int YELLOW_SET_SIZE = 3;
    public static final int GREEN_SET_SIZE = 3;
    public static final int RAILROAD_SET_SIZE = 4;
    
    // Just Say No Thresholds
    public static final int DEAL_BREAKER_THREAT_LEVEL = 10;
    public static final int SLY_DEAL_THREAT_LEVEL = 6;
    public static final int FORCED_DEAL_THREAT_LEVEL = 5;
    public static final int JUST_SAY_NO_THRESHOLD_SINGLE = 7;
    public static final int JUST_SAY_NO_THRESHOLD_MULTIPLE = 5;
    public static final int PROPERTY_COUNT_FOR_HIGH_THREAT = 5;
}
