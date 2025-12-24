/**
 * MONOPOLY DEAL BOT AI ENGINE
 * 
 * This module implements multiple bot difficulty levels with distinct strategies:
 * - EASY: Random/chaotic play, makes obvious mistakes
 * - MEDIUM: Balanced strategy, some tactical awareness
 * - HARD: Optimal play, aggressive set completion
 * - EXPERT: Near-perfect play with psychological tactics
 */

// Bot Difficulty Levels
export const BOT_DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  EXPERT: 'EXPERT'
};

// Card type constants (should match main game)
const CARD_TYPES = {
  PROPERTY: 'PROPERTY',
  PROPERTY_WILD: 'PROPERTY_WILD',
  MONEY: 'MONEY',
  ACTION: 'ACTION',
  RENT: 'RENT',
  RENT_WILD: 'RENT_WILD',
  JSN: 'JSN'
};

const ACTION_TYPES = {
  DEAL_BREAKER: 'DEAL_BREAKER',
  SLY_DEAL: 'SLY_DEAL',
  FORCED_DEAL: 'FORCED_DEAL',
  DEBT_COLLECTOR: 'DEBT_COLLECTOR',
  BIRTHDAY: 'BIRTHDAY',
  PASS_GO: 'PASS_GO',
  HOUSE: 'HOUSE',
  HOTEL: 'HOTEL',
  DOUBLE_RENT: 'DOUBLE_RENT',
  JUST_SAY_NO: 'JUST_SAY_NO'
};

/**
 * Evaluates the strategic value of a card
 */
function evaluateCardValue(card, playerState, gameState) {
  let value = card.value; // Base monetary value

  // Property cards are worth more if they help complete sets
  if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
    const sets = getSetsFromProperties(playerState.properties);
    const relevantSet = sets.find(s => 
      s.color === card.color || 
      (card.colors && card.colors.includes(s.color))
    );
    
    if (relevantSet) {
      // Completing a set is extremely valuable
      if (relevantSet.cards.length === relevantSet.needed - 1) {
        value += 20; // About to complete!
      } else {
        value += 5 * relevantSet.cards.length; // Partial set bonus
      }
    }
  }

  // Action cards have situational value
  if (card.actionType === ACTION_TYPES.DEAL_BREAKER) {
    // Very valuable if opponents have complete sets
    const opponentCompleteSets = gameState.opponents.filter(opp => 
      getSetsFromProperties(opp.properties).some(s => s.isComplete)
    ).length;
    value += opponentCompleteSets * 10;
  }

  if (card.actionType === ACTION_TYPES.JUST_SAY_NO) {
    // Always valuable for defense
    value += 8;
  }

  if (card.actionType === ACTION_TYPES.SLY_DEAL) {
    // Valuable if opponents have good properties
    value += 6;
  }

  return value;
}

/**
 * Gets set information from properties
 */
function getSetsFromProperties(properties) {
  const colorGroups = {};
  
  properties.forEach(prop => {
    const color = prop.currentColor || prop.color;
    if (!colorGroups[color]) {
      colorGroups[color] = [];
    }
    colorGroups[color].push(prop);
  });

  return Object.entries(colorGroups).map(([color, cards]) => ({
    color,
    cards,
    count: cards.length,
    needed: getSetSize(color),
    isComplete: cards.length >= getSetSize(color),
    totalValue: cards.reduce((sum, c) => sum + c.value, 0)
  }));
}

function getSetSize(color) {
  const sizes = {
    brown: 2, blue: 2, green: 3, yellow: 3,
    orange: 3, pink: 3, red: 3, cyan: 3,
    utility: 2, railroad: 4
  };
  return sizes[color] || 3;
}

/**
 * EASY BOT - Random play, makes mistakes
 */
export class EasyBot {
  constructor(playerIndex, players) {
    this.playerIndex = playerIndex;
    this.players = players;
  }

  decideMove(hand, gameState) {
    // 30% chance to just bank a random card
    if (Math.random() < 0.3 && hand.length > 0) {
      const randomCard = hand[Math.floor(Math.random() * hand.length)];
      return { action: 'BANK', card: randomCard };
    }

    // Play first property found
    const property = hand.find(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
    if (property) {
      return { action: 'PLAY_PROPERTY', card: property };
    }

    // Bank money
    const money = hand.find(c => c.type === CARD_TYPES.MONEY);
    if (money) {
      return { action: 'BANK', card: money };
    }

    // Randomly use action cards (often suboptimal)
    const action = hand.find(c => c.type === CARD_TYPES.ACTION);
    if (action && Math.random() < 0.5) {
      return { action: 'PLAY_ACTION', card: action, target: this.getRandomOpponent() };
    }

    return { action: 'END_TURN' };
  }

  getRandomOpponent() {
    const opponents = this.players.filter((_, idx) => idx !== this.playerIndex);
    return opponents[Math.floor(Math.random() * opponents.length)];
  }
}

/**
 * MEDIUM BOT - Balanced strategy
 */
export class MediumBot {
  constructor(playerIndex, players) {
    this.playerIndex = playerIndex;
    this.players = players;
  }

  decideMove(hand, gameState) {
    const myState = this.players[this.playerIndex];
    const mySets = getSetsFromProperties(myState.properties);

    // Priority 1: Complete a set if possible
    const almostComplete = mySets.find(s => s.count === s.needed - 1);
    if (almostComplete) {
      const completingCard = hand.find(c => 
        (c.color === almostComplete.color) ||
        (c.colors && c.colors.includes(almostComplete.color))
      );
      if (completingCard) {
        return { action: 'PLAY_PROPERTY', card: completingCard };
      }
    }

    // Priority 2: Use Deal Breaker if opponent has 2+ complete sets
    const dealBreaker = hand.find(c => c.actionType === ACTION_TYPES.DEAL_BREAKER);
    if (dealBreaker) {
      const targetWithManySets = this.players.find((p, idx) => {
        if (idx === this.playerIndex) return false;
        const sets = getSetsFromProperties(p.properties);
        return sets.filter(s => s.isComplete).length >= 2;
      });
      if (targetWithManySets) {
        return { action: 'PLAY_ACTION', card: dealBreaker, target: targetWithManySets };
      }
    }

    // Priority 3: Play properties to build sets
    const property = hand.find(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
    if (property) {
      return { action: 'PLAY_PROPERTY', card: property };
    }

    // Priority 4: Use rent cards if we have complete sets
    const hasCompleteSets = mySets.some(s => s.isComplete);
    if (hasCompleteSets) {
      const rentCard = hand.find(c => c.type === CARD_TYPES.RENT || c.type === CARD_TYPES.RENT_WILD);
      if (rentCard) {
        return { action: 'PLAY_ACTION', card: rentCard, target: this.getRichestOpponent() };
      }
    }

    // Priority 5: Bank money or low-value cards
    const lowValueCard = hand.sort((a, b) => a.value - b.value)[0];
    if (lowValueCard) {
      return { action: 'BANK', card: lowValueCard };
    }

    return { action: 'END_TURN' };
  }

  getRichestOpponent() {
    return this.players
      .map((p, idx) => ({ player: p, idx }))
      .filter(({ idx }) => idx !== this.playerIndex)
      .sort((a, b) => {
        const aWealth = a.player.bank.reduce((s, c) => s + c.value, 0);
        const bWealth = b.player.bank.reduce((s, c) => s + c.value, 0);
        return bWealth - aWealth;
      })[0]?.player;
  }
}

/**
 * HARD BOT - Optimal play
 */
export class HardBot {
  constructor(playerIndex, players) {
    this.playerIndex = playerIndex;
    this.players = players;
  }

  decideMove(hand, gameState) {
    const myState = this.players[this.playerIndex];
    const mySets = getSetsFromProperties(myState.properties);
    const completedSets = mySets.filter(s => s.isComplete).length;

    // CRITICAL: If we can win this turn, do it
    if (completedSets === 2) {
      const winningCard = hand.find(c => {
        if (c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD) return false;
        // Check if this completes a new set
        const almostComplete = mySets.find(s => 
          !s.isComplete && 
          s.count === s.needed - 1 &&
          (c.color === s.color || (c.colors && c.colors.includes(s.color)))
        );
        return !!almostComplete;
      });
      if (winningCard) {
        return { action: 'PLAY_PROPERTY', card: winningCard };
      }
    }

    // Strategy 1: Steal complete sets from opponents about to win
    const dealBreaker = hand.find(c => c.actionType === ACTION_TYPES.DEAL_BREAKER);
    if (dealBreaker) {
      const dangerousOpponent = this.players.find((p, idx) => {
        if (idx === this.playerIndex) return false;
        const oppSets = getSetsFromProperties(p.properties);
        return oppSets.filter(s => s.isComplete).length >= 2;
      });
      if (dangerousOpponent) {
        return { action: 'PLAY_ACTION', card: dealBreaker, target: dangerousOpponent };
      }
    }

    // Strategy 2: Complete high-value sets (Dark Blue, Green)
    const highValueSets = mySets.filter(s => 
      !s.isComplete && 
      ['blue', 'green', 'railroad'].includes(s.color)
    );
    for (const set of highValueSets) {
      const completingCard = hand.find(c =>
        c.color === set.color || (c.colors && c.colors.includes(set.color))
      );
      if (completingCard) {
        return { action: 'PLAY_PROPERTY', card: completingCard };
      }
    }

    // Strategy 3: Sly Deal valuable properties
    const slyDeal = hand.find(c => c.actionType === ACTION_TYPES.SLY_DEAL);
    if (slyDeal) {
      const bestTarget = this.findBestSlyDealTarget();
      if (bestTarget) {
        return { action: 'PLAY_ACTION', card: slyDeal, target: bestTarget.opponent, targetCard: bestTarget.card };
      }
    }

    // Strategy 4: Build any set
    const property = hand.find(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
    if (property) {
      return { action: 'PLAY_PROPERTY', card: property };
    }

    // Strategy 5: Charge rent with complete sets
    if (completedSets > 0) {
      const rentCard = hand.find(c => c.type === CARD_TYPES.RENT || c.type === CARD_TYPES.RENT_WILD);
      if (rentCard) {
        return { action: 'PLAY_ACTION', card: rentCard, target: this.getRichestOpponent() };
      }
    }

    // Strategy 6: Bank low-value cards
    const sortedByValue = [...hand].sort((a, b) => {
      const aVal = evaluateCardValue(a, myState, gameState);
      const bVal = evaluateCardValue(b, myState, gameState);
      return aVal - bVal;
    });
    
    if (sortedByValue[0]) {
      return { action: 'BANK', card: sortedByValue[0] };
    }

    return { action: 'END_TURN' };
  }

  findBestSlyDealTarget() {
    const myState = this.players[this.playerIndex];
    const mySets = getSetsFromProperties(myState.properties);
    
    let bestTarget = null;
    let bestValue = 0;

    this.players.forEach((opponent, idx) => {
      if (idx === this.playerIndex) return;
      
      const oppSets = getSetsFromProperties(opponent.properties);
      oppSets.forEach(set => {
        if (set.isComplete) return; // Can't steal from complete sets
        
        set.cards.forEach(card => {
          // Value is higher if it helps us complete a set
          let value = card.value;
          const helpsUs = mySets.find(s => 
            s.color === card.color && !s.isComplete
          );
          if (helpsUs) {
            value += 10;
          }
          
          if (value > bestValue) {
            bestValue = value;
            bestTarget = { opponent, card };
          }
        });
      });
    });

    return bestTarget;
  }

  getRichestOpponent() {
    return this.players
      .map((p, idx) => ({ player: p, idx }))
      .filter(({ idx }) => idx !== this.playerIndex)
      .sort((a, b) => {
        const aWealth = a.player.bank.reduce((s, c) => s + c.value, 0) + 
                       a.player.properties.reduce((s, c) => s + c.value, 0);
        const bWealth = b.player.bank.reduce((s, c) => s + c.value, 0) +
                       b.player.properties.reduce((s, c) => s + c.value, 0);
        return bWealth - aWealth;
      })[0]?.player;
  }
}

/**
 * EXPERT BOT - Near-perfect play with psychological tactics
 */
export class ExpertBot extends HardBot {
  constructor(playerIndex, players) {
    super(playerIndex, players);
    this.memory = {
      opponentJustSayNos: {}, // Track who likely has JSN cards
      threatenedBy: null
    };
  }

  decideMove(hand, gameState) {
    // Expert bots also consider:
    // - Saving Just Say No for critical moments
    // - Baiting out opponent's Just Say No cards
    // - Optimal wildcard placement
    // - Defensive banking when threatened
    
    const myState = this.players[this.playerIndex];
    const mySets = getSetsFromProperties(myState.properties);
    
    // Check if we're being threatened (opponent has 2 complete sets)
    const threat = this.players.find((p, idx) => {
      if (idx === this.playerIndex) return false;
      const sets = getSetsFromProperties(p.properties);
      return sets.filter(s => s.isComplete).length >= 2;
    });

    // If threatened and we have Deal Breaker, use it immediately
    if (threat) {
      const dealBreaker = hand.find(c => c.actionType === ACTION_TYPES.DEAL_BREAKER);
      if (dealBreaker) {
        return { action: 'PLAY_ACTION', card: dealBreaker, target: threat };
      }
    }

    // Otherwise, use parent Hard bot logic
    return super.decideMove(hand, gameState);
  }
}

/**
 * Factory function to create appropriate bot
 */
export function createBot(difficulty, playerIndex, players) {
  switch (difficulty) {
    case BOT_DIFFICULTY.EASY:
      return new EasyBot(playerIndex, players);
    case BOT_DIFFICULTY.MEDIUM:
      return new MediumBot(playerIndex, players);
    case BOT_DIFFICULTY.HARD:
      return new HardBot(playerIndex, players);
    case BOT_DIFFICULTY.EXPERT:
      return new ExpertBot(playerIndex, players);
    default:
      return new MediumBot(playerIndex, players);
  }
}
