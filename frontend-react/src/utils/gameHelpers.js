import { COLORS, CARD_TYPES, ACTION_TYPES, GAME_RULES } from '../constants';

export { COLORS, CARD_TYPES, ACTION_TYPES };

export const getSets = (properties) => {
  if (!properties) return [];
  const sets = {};
  properties.forEach(card => {
      let color = card.color || card.currentColor;
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
      
      const isComplete = set.cards.length >= def.count;
      let rentIndex = Math.min(set.cards.length - 1, def.rent.length - 1);
      let rent = def.rent[rentIndex] || 0;
      if (isComplete) {
          if (set.houses) rent += GAME_RULES.HOUSE_RENT_BONUS;
          if (set.hotels) rent += GAME_RULES.HOTEL_RENT_BONUS;
      }
      return { ...set, isComplete, rent };
  });
};

export const countCompleteSets = (properties) => {
    return getSets(properties).filter(s => s.isComplete).length;
};
