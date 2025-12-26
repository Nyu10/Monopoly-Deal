/**
 * Game rules and balance constants
 * Single source of truth for all game mechanics
 */
export const GAME_RULES = {
  // Hand management
  STARTING_HAND_SIZE: 5,
  NORMAL_DRAW_COUNT: 2,
  EMPTY_HAND_DRAW_COUNT: 5,
  MAX_HAND_SIZE_END_OF_TURN: 7,
  
  // Turn rules
  MAX_ACTIONS_PER_TURN: 3,
  
  // Win condition
  COMPLETE_SETS_TO_WIN: 3,
  
  // Payment amounts (in millions)
  DEBT_COLLECTOR_AMOUNT: 5,
  BIRTHDAY_AMOUNT_PER_PLAYER: 2,
  
  // Building bonuses
  HOUSE_RENT_BONUS: 3,
  HOTEL_RENT_BONUS: 4,

  // Animation & AI Timings
  BOT_THINK_DELAY: 1500,
  ACTION_DELAY: 1000
};

export default GAME_RULES;
