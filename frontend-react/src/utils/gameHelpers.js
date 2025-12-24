export const COLORS = {
  brown: { hex: '#795548', count: 2, name: 'Brown', rent: [1, 2], text: 'white' },
  dark_blue: { hex: '#0D47A1', count: 2, name: 'Dark Blue', rent: [3, 8], text: 'white' },
  green: { hex: '#2E7D32', count: 3, name: 'Green', rent: [2, 4, 7], text: 'white' },
  yellow: { hex: '#FBC02D', count: 3, name: 'Yellow', rent: [2, 4, 6], text: 'black' },
  orange: { hex: '#EF6C00', count: 3, name: 'Orange', rent: [1, 3, 5], text: 'white' },
  pink: { hex: '#C2185B', count: 3, name: 'Pink', rent: [1, 2, 4], text: 'white' },
  red: { hex: '#D32F2F', count: 3, name: 'Red', rent: [2, 3, 6], text: 'white' },
  light_blue: { hex: '#03A9F4', count: 3, name: 'Light Blue', rent: [1, 2, 3], text: 'black' },
  utility: { hex: '#AFB42B', count: 2, name: 'Utility', rent: [1, 2], text: 'black' },
  railroad: { hex: '#212121', count: 4, name: 'Railroad', rent: [1, 2, 4, 8], text: 'white' },
  multi: { hex: 'linear-gradient(45deg, #f06, #4a90e2, #7ed321, #f5a623)', count: 0, name: 'Multi', text: 'white', rent: [] }
};

export const CARD_TYPES = {
  PROPERTY: 'PROPERTY',
  ACTION: 'ACTION',
  MONEY: 'MONEY',
  RENT: 'RENT',
  PROPERTY_WILD: 'PROPERTY_WILD',
  RENT_WILD: 'RENT_WILD'
};

export const ACTION_TYPES = {
  PASS_GO: 'PASS_GO',
  DEAL_BREAKER: 'DEAL_BREAKER',
  JUST_SAY_NO: 'JUST_SAY_NO',
  SLY_DEAL: 'SLY_DEAL',
  FORCED_DEAL: 'FORCED_DEAL',
  DEBT_COLLECTOR: 'DEBT_COLLECTOR',
  BIRTHDAY: 'BIRTHDAY',
  HOUSE: 'HOUSE',
  HOTEL: 'HOTEL',
  DOUBLE_RENT: 'DOUBLE_RENT'
};

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
          if (set.houses) rent += 3;
          if (set.hotels) rent += 4;
      }
      return { ...set, isComplete, rent };
  });
};
