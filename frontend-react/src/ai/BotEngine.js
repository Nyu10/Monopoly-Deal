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
  let value = card.value || 0; // Base monetary value

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
    } else {
      value += 2; // Even a new property is better than money usually
    }
  }

  // Action cards have situational value
  if (card.actionType === ACTION_TYPES.DEAL_BREAKER) {
    // Very valuable if opponents have complete sets
    const opponentCompleteSets = (gameState.players || []).filter((p, idx) => 
      idx !== gameState.currentPlayerIndex &&
      getSetsFromProperties(p.properties).some(s => s.isComplete)
    ).length;
    value += opponentCompleteSets * 15;
  }

  if (card.actionType === ACTION_TYPES.JUST_SAY_NO) {
    value += 12; // Extremely valuable defense
  }

  if (card.actionType === ACTION_TYPES.SLY_DEAL) {
    value += 8;
  }

  if (card.actionType === ACTION_TYPES.FORCED_DEAL) {
    value += 7;
  }

  if (card.actionType === ACTION_TYPES.PASS_GO) {
    value += 10; // Drawing is always good
  }

  if (card.actionType === ACTION_TYPES.DOUBLE_RENT) {
    const sets = getSetsFromProperties(playerState.properties);
    const hasCompleteSet = sets.some(s => s.isComplete);
    value += hasCompleteSet ? 10 : 2;
  }

  if (card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL) {
    const sets = getSetsFromProperties(playerState.properties);
    const canUse = sets.some(s => s.isComplete);
    value += canUse ? 15 : 5;
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
    brown: 2, dark_blue: 2, green: 3, yellow: 3,
    orange: 3, pink: 3, red: 3, light_blue: 3,
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
    const players = gameState.players || this.players;
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

    // Bank money or actions (but NEVER properties)
    const bankableCard = hand.find(c => 
      c.type === CARD_TYPES.MONEY || 
      c.type === CARD_TYPES.ACTION || 
      c.type === CARD_TYPES.RENT || 
      c.type === CARD_TYPES.RENT_WILD
    );
    if (bankableCard && Math.random() < 0.5) {
      return { action: 'BANK', card: bankableCard };
    }

    // Randomly use action cards (often suboptimal)
    const action = hand.find(c => c.type === CARD_TYPES.ACTION);
    if (action && Math.random() < 0.5) {
      return { action: 'PLAY_ACTION', card: action, target: this.getRandomOpponent(players) };
    }

    return { action: 'END_TURN' };
  }

  getRandomOpponent(providedPlayers) {
    const players = providedPlayers || this.players;
    const opponents = players.filter((_, idx) => idx !== this.playerIndex);
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
    const players = gameState.players || this.players;
    const myState = players[this.playerIndex];
    if (!myState) return { action: 'END_TURN' };
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
      const targetWithManySets = players.find((p, idx) => {
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

    // Priority 4: Use Debt Collector or Birthday if we need to drain opponents
    const debtCollector = hand.find(c => c.actionType === ACTION_TYPES.DEBT_COLLECTOR);
    if (debtCollector) {
      const richest = this.getRichestOpponent(players);
      return { action: 'PLAY_ACTION', card: debtCollector, target: richest };
    }

    const birthday = hand.find(c => c.actionType === ACTION_TYPES.BIRTHDAY);
    if (birthday) {
      return { action: 'PLAY_ACTION', card: birthday };
    }

    // Priority 5: Use rent cards if we have complete sets
    const hasCompleteSets = mySets.some(s => s.isComplete);
    if (hasCompleteSets) {
      const rentCard = hand.find(c => c.type === CARD_TYPES.RENT || c.type === CARD_TYPES.RENT_WILD);
      if (rentCard) {
        return { action: 'PLAY_ACTION', card: rentCard, target: this.getRichestOpponent(players) };
      }
    }

    // Priority 6: Bank money or action cards (NEVER properties)
    const bankableCard = [...hand]
      .filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD)
      .sort((a, b) => a.value - b.value)[0];
      
    if (bankableCard) {
      return { action: 'BANK', card: bankableCard };
    }

    return { action: 'END_TURN' };
  }

  getRichestOpponent(providedPlayers) {
    const players = providedPlayers || this.players;
    return players
      .map((p, idx) => ({ player: p, idx }))
      .filter(({ idx }) => idx !== this.playerIndex)
      .sort((a, b) => {
        const aWealth = a.player.bank.reduce((s, c) => s + (c.value || 0), 0);
        const bWealth = b.player.bank.reduce((s, c) => s + (c.value || 0), 0);
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
    const players = gameState.players || this.players;
    const myState = players[this.playerIndex];
    if (!myState) return { action: 'END_TURN' };
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
      const bestDeal = this.findBestDealBreakerTarget(players);
      if (bestDeal) {
        return { action: 'PLAY_ACTION', card: dealBreaker, target: bestDeal.opponent, targetCard: bestDeal.card };
      }
    }

    // Strategy 2: Complete high-value sets (Dark Blue, Green)
    const highValueSets = mySets.filter(s => 
      !s.isComplete && 
      ['dark_blue', 'green', 'railroad'].includes(s.color)
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
      const bestTarget = this.findBestSlyDealTarget(players);
      if (bestTarget) {
        return { action: 'PLAY_ACTION', card: slyDeal, target: bestTarget.opponent, targetCard: bestTarget.card };
      }
    }

    // Strategy 3.5: Forced Deal (Swap a property)
    const forcedDeal = hand.find(c => c.actionType === ACTION_TYPES.FORCED_DEAL);
    if (forcedDeal && myState.properties.length > 0) {
      const bestSwap = this.findBestForcedDealTarget(players);
      if (bestSwap) {
        return { 
          action: 'PLAY_ACTION', 
          card: forcedDeal, 
          target: bestSwap.opponent, 
          targetCard: bestSwap.theirCard,
          destination: bestSwap.myCard.id // destination is used for our card ID in current FE logic
        };
      }
    }

    // Strategy 4: Build any set
    const property = hand.find(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
    if (property) {
      return { action: 'PLAY_PROPERTY', card: property };
    }

    // Strategy 5: Use Debt Collector/Birthday to gain liquidity
    const debtCollector = hand.find(c => c.actionType === ACTION_TYPES.DEBT_COLLECTOR);
    if (debtCollector) {
      const richest = this.getRichestOpponent(players);
      return { action: 'PLAY_ACTION', card: debtCollector, target: richest };
    }

    const birthday = hand.find(c => c.actionType === ACTION_TYPES.BIRTHDAY);
    if (birthday) {
      return { action: 'PLAY_ACTION', card: birthday };
    }

    // Strategy 5.5: Pass Go (Draw 2)
    const passGo = hand.find(c => c.actionType === ACTION_TYPES.PASS_GO);
    if (passGo && (hand.length < 7)) {
      return { action: 'PLAY_ACTION', card: passGo };
    }

    // Strategy 6: Charge rent with complete sets
    if (completedSets > 0) {
      const doubleRent = hand.find(c => c.actionType === ACTION_TYPES.DOUBLE_RENT);
      const rentCard = hand.find(c => c.type === CARD_TYPES.RENT || c.type === CARD_TYPES.RENT_WILD);
      
      // Use Double Rent if we have a rent card to follow up
      if (doubleRent && rentCard && !gameState.doubleRentActive) {
        return { action: 'PLAY_ACTION', card: doubleRent };
      }

      if (rentCard) {
        // Find set with highest rent
        const bestSet = [...mySets].filter(s => s.rent > 0).sort((a, b) => b.rent - a.rent)[0];
        if (bestSet) {
          return { 
            action: 'PLAY_ACTION', 
            card: rentCard, 
            target: this.getRichestOpponent(players),
            targetCard: { id: bestSet.color } // TargetCardId is used as color for rent
          };
        }
      }
    }

    // Strategy 6.5: Play Buildings (House/Hotel)
    const building = hand.find(c => c.actionType === ACTION_TYPES.HOUSE || c.actionType === ACTION_TYPES.HOTEL);
    if (building && completedSets > 0) {
      const bestSet = this.findBestBuildingTarget(mySets);
      if (bestSet) {
        return { 
          action: 'PLAY_PROPERTY', // FE playCard handles destination based on card type
          card: building,
          targetCard: { id: bestSet.color } // Set color to play on
        };
      }
    }

    // Strategy 7: Bank low-value cards (NEVER properties)
    const bankableSorted = [...hand]
      .filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD)
      .sort((a, b) => {
        const aVal = evaluateCardValue(a, myState, gameState);
        const bVal = evaluateCardValue(b, myState, gameState);
        return aVal - bVal;
      });
    
    if (bankableSorted[0]) {
      return { action: 'BANK', card: bankableSorted[0] };
    }

    return { action: 'END_TURN' };
  }

  findBestSlyDealTarget(providedPlayers) {
    const players = providedPlayers || this.players;
    const myState = players[this.playerIndex];
    if (!myState) return null;
    const mySets = getSetsFromProperties(myState.properties);
    
    let bestTarget = null;
    let bestValue = 0;

    players.forEach((opponent, idx) => {
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

  findBestDealBreakerTarget(players) {
    let bestTarget = null;
    let maxSets = 0;

    players.forEach((opp, idx) => {
      if (idx === this.playerIndex) return;
      const sets = getSetsFromProperties(opp.properties).filter(s => s.isComplete);
      if (sets.length > 0) {
        // High priority to those about to win
        const priority = sets.length >= 2 ? 100 : 0;
        // Targeted card should be one in the completed set
        const targetSet = sets.sort((a, b) => b.totalValue - a.totalValue)[0];
        if (priority + targetSet.totalValue > maxSets) {
          maxSets = priority + targetSet.totalValue;
          bestTarget = { opponent: opp, card: targetSet.cards[0] };
        }
      }
    });
    return bestTarget;
  }

  findBestForcedDealTarget(players) {
    const myState = players[this.playerIndex];
    if (!myState || myState.properties.length === 0) return null;
    
    const mySets = getSetsFromProperties(myState.properties);
    const myJunkProp = myState.properties.find(p => {
      const set = mySets.find(s => s.color === (p.currentColor || p.color));
      return !set.isComplete && set.count === 1;
    }) || myState.properties[0];

    let bestTarget = null;
    let bestValue = 0;

    players.forEach((opponent, idx) => {
      if (idx === this.playerIndex) return;
      const oppSets = getSetsFromProperties(opponent.properties);
      oppSets.forEach(set => {
        if (set.isComplete) return; // Can't steal from complete sets
        
        set.cards.forEach(card => {
          let value = card.value;
          const helpsUs = mySets.find(s => s.color === (card.currentColor || card.color) && !s.isComplete);
          if (helpsUs) value += 10;
          
          if (value > bestValue) {
            bestValue = value;
            bestTarget = { opponent, theirCard: card, myCard: myJunkProp };
          }
        });
      });
    });

    return bestTarget;
  }

  findBestBuildingTarget(sets) {
    // Houses must be played first, but we just need a complete set
    return sets
      .filter(s => s.isComplete)
      .sort((a, b) => b.totalValue - a.totalValue)[0];
  }

  getRichestOpponent(providedPlayers) {
    const players = providedPlayers || this.players;
    return players
      .map((p, idx) => ({ player: p, idx }))
      .filter(({ idx }) => idx !== this.playerIndex)
      .sort((a, b) => {
        const aWealth = (a.player.bank || []).reduce((s, c) => s + (c.value || 0), 0) + 
                       (a.player.properties || []).reduce((s, c) => s + (c.value || 0), 0);
        const bWealth = (b.player.bank || []).reduce((s, c) => s + (c.value || 0), 0) +
                       (b.player.properties || []).reduce((s, c) => s + (c.value || 0), 0);
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
    const players = gameState.players || this.players;
    const myState = players[this.playerIndex];
    if (!myState) return { action: 'END_TURN' };
    
    // Check if we're being threatened (opponent has 2+ complete sets)
    const threat = players.find((p, idx) => {
      if (idx === this.playerIndex) return false;
      const sets = getSetsFromProperties(p.properties);
      return sets.filter(s => s.isComplete).length >= 2;
    });

    // Strategy 1: Defensive Deal Breaker
    if (threat) {
      const dealBreaker = hand.find(c => c.actionType === ACTION_TYPES.DEAL_BREAKER);
      if (dealBreaker) {
        const bestDeal = this.findBestDealBreakerTarget(players);
        if (bestDeal && bestDeal.opponent.id === threat.id) {
          return { action: 'PLAY_ACTION', card: dealBreaker, target: bestDeal.opponent, targetCard: bestDeal.card };
        }
      }
    }

    // Strategy 2: Optimize Wildcards (Flipping)
    // This bot is smart enough to flip wildcards to complete sets
    const myProperties = myState.properties;
    for (const card of myProperties) {
      if (card.colors && card.colors.length === 2) {
        const currentSets = getSetsFromProperties(myProperties);
        const currentColor = card.currentColor || card.color;
        const otherColor = card.colors.find(c => c !== currentColor);
        
        const currentSetInfo = currentSets.find(s => s.color === currentColor);
        const otherSetInfo = currentSets.find(s => s.color === otherColor) || { count: 0, needed: getSetSize(otherColor) };

        // Flip if it completes the other set and doesn't break a complete current set
        if (otherSetInfo.count === otherSetInfo.needed - 1 && (!currentSetInfo.isComplete || currentSetInfo.count > currentSetInfo.needed)) {
           return { action: 'FLIP_WILD', card: card };
        }
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
