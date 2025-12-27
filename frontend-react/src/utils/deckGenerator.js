import { CARD_TYPES, ACTION_TYPES, COLORS } from '../constants';

/**
 * Generates the official 110-card Monopoly Deal deck
 * This is the single source of truth for deck generation
 */
export const generateOfficialDeck = () => {
  const deck = [];
  let id = 0;
  
  const add = (card, qty) => {
    for (let i = 0; i < qty; i++) {
      deck.push({ 
        ...card, 
        id: `card-${id++}`, 
        uid: Math.random().toString(36).substr(2, 9) 
      });
    }
  };

  // 1. Money Cards (20 total)
  add({ type: CARD_TYPES.MONEY, value: 10, name: '$10M' }, 1);
  add({ type: CARD_TYPES.MONEY, value: 5, name: '$5M' }, 2);
  add({ type: CARD_TYPES.MONEY, value: 4, name: '$4M' }, 3);
  add({ type: CARD_TYPES.MONEY, value: 3, name: '$3M' }, 3);
  add({ type: CARD_TYPES.MONEY, value: 2, name: '$2M' }, 5);
  add({ type: CARD_TYPES.MONEY, value: 1, name: '$1M' }, 6);

  // 2. Property Cards (28 solid properties)
  const props = [
    { c: 'brown', n: ['Baltic Ave', 'Mediterranean Ave'], v: 1 },
    { c: 'dark_blue', n: ['Boardwalk'], v: 4 },
    { c: 'dark_blue', n: ['Park Place'], v: 3 },
    { c: 'green', n: ['North Carolina Ave', 'Pacific Ave', 'Pennsylvania Ave'], v: 4 },
    { c: 'yellow', n: ['Marvin Gardens', 'Ventnor Ave', 'Atlantic Ave'], v: 3 },
    { c: 'orange', n: ['New York Ave', 'St. James Place', 'Tennessee Ave'], v: 2 },
    { c: 'pink', n: ['St. Charles Place', 'Virginia Ave', 'States Ave'], v: 2 },
    { c: 'red', n: ['Kentucky Ave', 'Indiana Ave', 'Illinois Ave'], v: 3 },
    { c: 'light_blue', n: ['Oriental Ave', 'Vermont Ave', 'Connecticut Ave'], v: 1 },
    { c: 'railroad', n: ['Reading Railroad', 'Pennsylvania Railroad', 'B. & O. Railroad', 'Short Line'], v: 2 },
    { c: 'utility', n: ['Electric Company', 'Water Works'], v: 2 }
  ];
  props.forEach(p => p.n.forEach(name => add({ 
    type: CARD_TYPES.PROPERTY, 
    color: p.c, 
    name, 
    value: p.v 
  }, 1)));

  // 3. Wild Property Cards (11 total)
  // Dual-color wilds (9) - These have values printed on them but cannot be used for payment
  const duals = [
    { c: ['dark_blue', 'green'], v: 4 }, 
    { c: ['light_blue', 'brown'], v: 1 }, 
    { c: ['pink', 'orange'], v: 2 }, 
    { c: ['pink', 'orange'], v: 2 },
    { c: ['red', 'yellow'], v: 3 }, 
    { c: ['red', 'yellow'], v: 3 },
    { c: ['railroad', 'green'], v: 4 }, 
    { c: ['railroad', 'light_blue'], v: 4 }, 
    { c: ['railroad', 'utility'], v: 2 }
  ];
  duals.forEach(d => add({ 
    type: CARD_TYPES.PROPERTY_WILD, 
    colors: d.c, 
    value: d.v, 
    name: `${COLORS[d.c[0]].name}/${COLORS[d.c[1]].name} Wild`, 
    currentColor: d.c[0] 
  }, 1));
  
  // Rainbow wilds (2) - No value
  add({ 
    type: CARD_TYPES.PROPERTY_WILD, 
    colors: ['any'], 
    value: 0, 
    name: 'Rainbow Wild', 
    currentColor: 'multi', 
    isRainbow: true 
  }, 2);

  // 4. Action Cards (34 total)
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DEAL_BREAKER, value: 5, name: 'Deal Breaker', description: 'Steal a complete set' }, 2);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.JUST_SAY_NO, value: 4, name: 'Just Say No', description: 'Cancel action against you' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.SLY_DEAL, value: 3, name: 'Sly Deal', description: 'You may not steal a property that\'s part of a complete set' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.FORCED_DEAL, value: 3, name: 'Forced Deal', description: 'Swap properties (non-complete)' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DEBT_COLLECTOR, value: 5, name: 'Debt Collector', description: 'Force 1 player to pay $5M' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.BIRTHDAY, value: 2, name: 'It\'s My Birthday', description: 'All pay you $2M' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.PASS_GO, value: 1, name: 'Pass Go', description: 'Draw 2 cards' }, 10);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3, name: 'House', description: '+3M Rent on Full Set' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4, name: 'Hotel', description: '+4M Rent on Full Set with House' }, 2);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DOUBLE_RENT, value: 1, name: 'Double The Rent', description: '2x Rent Amount' }, 2);

  // 5. Rent Cards (13 total)
  const rents = [
    ['dark_blue', 'green'], 
    ['red', 'yellow'], 
    ['pink', 'orange'], 
    ['light_blue', 'brown'], 
    ['railroad', 'utility']
  ];
  rents.forEach(r => add({ 
    type: CARD_TYPES.RENT, 
    colors: r, 
    value: 1, 
    name: `${COLORS[r[0]].name}/${COLORS[r[1]].name} Rent` 
  }, 2));
  
  add({ 
    type: CARD_TYPES.RENT_WILD, 
    colors: ['any'], 
    value: 3, 
    name: 'Wild Rent', 
    description: 'Force 1 player to pay rent' 
  }, 3);

  return deck;
};

/**
 * Generates a "God Hand" containing one of every unique card
 */
export const generateGodHand = () => {
    const hand = [];
    let id = 1000; // Start with high ID to avoid collisions
    
    const addOne = (card) => {
      hand.push({ 
        ...card, 
        id: `god-card-${id++}`, 
        uid: Math.random().toString(36).substr(2, 9) 
      });
    };
  
    // 1. Money Cards (One of each value)
    [10, 5, 4, 3, 2, 1].forEach(val => {
        addOne({ type: CARD_TYPES.MONEY, value: val, name: `$${val}M` });
    });
  
    // 2. Property Cards (One of each named property)
    const props = [
      { c: 'brown', n: ['Baltic Ave', 'Mediterranean Ave'], v: 1 },
      { c: 'dark_blue', n: ['Boardwalk', 'Park Place'], v: 4 }, // Add both unique names
      // Note: Park Place v=3 actually in official deck? Let's check array above:
      // Board walk v=4, Park Place v=3. Yes.
      // Wait, in the official deck generation logic above:
      // { c: 'dark_blue', n: ['Boardwalk'], v: 4 },
      // { c: 'dark_blue', n: ['Park Place'], v: 3 },
      // It handles them separately. 
      // I will copy the props array structure but flatten it to ensure I get one of every name.
    ];
    // Copying the full props structure from above to be precise
     const fullProps = [
        { c: 'brown', n: ['Baltic Ave', 'Mediterranean Ave'], v: 1 },
        { c: 'dark_blue', n: ['Boardwalk'], v: 4 },
        { c: 'dark_blue', n: ['Park Place'], v: 3 },
        { c: 'green', n: ['North Carolina Ave', 'Pacific Ave', 'Pennsylvania Ave'], v: 4 },
        { c: 'yellow', n: ['Marvin Gardens', 'Ventnor Ave', 'Atlantic Ave'], v: 3 },
        { c: 'orange', n: ['New York Ave', 'St. James Place', 'Tennessee Ave'], v: 2 },
        { c: 'pink', n: ['St. Charles Place', 'Virginia Ave', 'States Ave'], v: 2 },
        { c: 'red', n: ['Kentucky Ave', 'Indiana Ave', 'Illinois Ave'], v: 3 },
        { c: 'light_blue', n: ['Oriental Ave', 'Vermont Ave', 'Connecticut Ave'], v: 1 },
        { c: 'railroad', n: ['Reading Railroad', 'Pennsylvania Railroad', 'B. & O. Railroad', 'Short Line'], v: 2 },
        { c: 'utility', n: ['Electric Company', 'Water Works'], v: 2 }
      ];
      fullProps.forEach(p => p.n.forEach(name => addOne({ 
        type: CARD_TYPES.PROPERTY, 
        color: p.c, 
        name, 
        value: p.v 
      })));

  
    // 3. Wild Property Cards (One of each type)
    const duals = [
      { c: ['dark_blue', 'green'], v: 4 }, 
      { c: ['light_blue', 'brown'], v: 1 }, 
      { c: ['pink', 'orange'], v: 2 }, // Unique pair
      { c: ['red', 'yellow'], v: 3 }, 
      { c: ['railroad', 'green'], v: 4 }, 
      { c: ['railroad', 'light_blue'], v: 4 }, 
      { c: ['railroad', 'utility'], v: 2 }
    ];
    // Note: The official deck has duplicates of some pairs (Pink/Orange x2, Red/Yellow x2).
    // I only need unique types.
    duals.forEach(d => addOne({ 
      type: CARD_TYPES.PROPERTY_WILD, 
      colors: d.c, 
      value: d.v, 
      name: `${COLORS[d.c[0]].name}/${COLORS[d.c[1]].name} Wild`, 
      currentColor: d.c[0] 
    }));
    
    // Rainbow wild
    addOne({ 
      type: CARD_TYPES.PROPERTY_WILD, 
      colors: ['any'], 
      value: 0, 
      name: 'Rainbow Wild', 
      currentColor: 'multi', 
      isRainbow: true 
    });
  
    // 4. Action Cards (One of each type)
    const actions = [
        { actionType: ACTION_TYPES.DEAL_BREAKER, value: 5, name: 'Deal Breaker', description: 'Steal a complete set' },
        { actionType: ACTION_TYPES.JUST_SAY_NO, value: 4, name: 'Just Say No', description: 'Cancel action against you' },
        { actionType: ACTION_TYPES.SLY_DEAL, value: 3, name: 'Sly Deal', description: 'You may not steal a property that\'s part of a complete set' },
        { actionType: ACTION_TYPES.FORCED_DEAL, value: 3, name: 'Forced Deal', description: 'Swap properties (non-complete)' },
        { actionType: ACTION_TYPES.DEBT_COLLECTOR, value: 5, name: 'Debt Collector', description: 'Force 1 player to pay $5M' },
        { actionType: ACTION_TYPES.BIRTHDAY, value: 2, name: 'It\'s My Birthday', description: 'All pay you $2M' },
        { actionType: ACTION_TYPES.PASS_GO, value: 1, name: 'Pass Go', description: 'Draw 2 cards' },
        { actionType: ACTION_TYPES.HOUSE, value: 3, name: 'House', description: '+3M Rent on Full Set' },
        { actionType: ACTION_TYPES.HOTEL, value: 4, name: 'Hotel', description: '+4M Rent on Full Set with House' },
        { actionType: ACTION_TYPES.DOUBLE_RENT, value: 1, name: 'Double The Rent', description: '2x Rent Amount' },
    ];
    actions.forEach(a => addOne({ ...a, type: CARD_TYPES.ACTION }));
  
    // 5. Rent Cards (One of each pair)
    const rents = [
      ['dark_blue', 'green'], 
      ['red', 'yellow'], 
      ['pink', 'orange'], 
      ['light_blue', 'brown'], 
      ['railroad', 'utility']
    ];
    rents.forEach(r => addOne({ 
      type: CARD_TYPES.RENT, 
      colors: r, 
      value: 1, 
      name: `${COLORS[r[0]].name}/${COLORS[r[1]].name} Rent` 
    }));
    
    addOne({ 
      type: CARD_TYPES.RENT_WILD, 
      colors: ['any'], 
      value: 3, 
      name: 'Wild Rent', 
      description: 'Force 1 player to pay rent' 
    });
  
    return hand;
  };

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  let cur = shuffled.length;
  let rand;
  
  while (cur !== 0) {
    rand = Math.floor(Math.random() * cur);
    cur--;
    [shuffled[cur], shuffled[rand]] = [shuffled[rand], shuffled[cur]];
  }
  
  return shuffled;
};
