import { COLORS, CARD_TYPES, ACTION_TYPES, GAME_RULES } from '../constants';

export { COLORS, CARD_TYPES, ACTION_TYPES };

export const getSets = (properties) => {
  if (!properties) return [];
  const sets = {};
  properties.forEach(card => {
      // For wild cards, currentColor takes precedence over color
      let color = card.currentColor || card.color;
      if (card.isRainbow && color === 'multi') color = 'any_rainbow'; 
      
      if (!sets[color]) sets[color] = { color, cards: [], houses: 0, hotels: 0 };
      
      if (card.actionType === ACTION_TYPES.HOUSE) sets[color].houses++;
      else if (card.actionType === ACTION_TYPES.HOTEL) sets[color].hotels++;
      else sets[color].cards.push(card);
  });

  return Object.values(sets).map(set => {
      if (set.color === 'any_rainbow') return { ...set, isComplete: false, rent: 0 }; 
      const def = COLORS[set.color];
      if (!def) return { ...set, isComplete: false, rent: 0 }; 
      
      const hasRealProperty = set.cards.some(c => c.type === CARD_TYPES.PROPERTY);
      const isComplete = hasRealProperty && set.cards.length >= def.count;
      
      let rent = 0;
      if (hasRealProperty) {
          let rentIndex = Math.min(set.cards.length - 1, def.rent.length - 1);
          rent = def.rent[rentIndex] || 0;
          if (isComplete) {
              if (set.houses) rent += GAME_RULES.HOUSE_RENT_BONUS;
              if (set.hotels) rent += GAME_RULES.HOTEL_RENT_BONUS;
          }
      }
      
      return { ...set, isComplete, rent, hasRealProperty };
  });
};

export const countCompleteSets = (properties) => {
    return getSets(properties).filter(s => s.isComplete).length;
};

/**
 * Calculates the total value of cards in a bank
 */
export const calculateBankTotal = (bankCards) => {
  return (bankCards || []).reduce((sum, card) => sum + (card.value || 0), 0);
};

/**
 * Determines the default destination for a card being played
 */
export const getPreferredDestination = (card, actionType = null) => {
  if (actionType === 'BANK') return 'BANK';
  
  if (card.type === CARD_TYPES.MONEY) return 'BANK';
  if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) return 'PROPERTIES';
  if (card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL) return 'PROPERTIES';
  
  if (card.type === CARD_TYPES.ACTION || card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD) {
    return 'DISCARD';
  }
  
  return 'PROPERTIES';
};
