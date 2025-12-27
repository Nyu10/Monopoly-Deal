/**
 * Property set definitions for Monopoly Deal
 * Single source of truth for colors, counts, and rent schedules
 */
export const PROPERTY_SETS = {
  BROWN: {
    id: 'brown',
    color: 'brown',
    hex: '#8D6E63',
    text: 'white',
    name: 'Brown',
    cardsNeeded: 2,
    rentSchedule: [1, 2],
  },
  LIGHT_BLUE: {
    id: 'light_blue',
    color: 'light_blue',
    hex: '#4FC3F7',
    text: 'black',
    name: 'Light Blue',
    cardsNeeded: 3,
    rentSchedule: [1, 2, 3],
  },
  PINK: {
    id: 'pink',
    color: 'pink',
    hex: '#EC407A',
    text: 'white',
    name: 'Pink',
    cardsNeeded: 3,
    rentSchedule: [1, 2, 4],
  },
  ORANGE: {
    id: 'orange',
    color: 'orange',
    hex: '#FF6F00',
    text: 'white',
    name: 'Orange',
    cardsNeeded: 3,
    rentSchedule: [1, 3, 5],
  },
  RED: {
    id: 'red',
    color: 'red',
    hex: '#D32F2F',
    text: 'white',
    name: 'Red',
    cardsNeeded: 3,
    rentSchedule: [2, 3, 6],
  },
  YELLOW: {
    id: 'yellow',
    color: 'yellow',
    hex: '#FDD835',
    text: 'black',
    name: 'Yellow',
    cardsNeeded: 3,
    rentSchedule: [2, 4, 6],
  },
  GREEN: {
    id: 'green',
    color: 'green',
    hex: '#388E3C',
    text: 'white',
    name: 'Green',
    cardsNeeded: 3,
    rentSchedule: [2, 4, 7],
  },
  DARK_BLUE: {
    id: 'dark_blue',
    color: 'dark_blue',
    hex: '#0D47A1',
    text: 'white',
    name: 'Dark Blue',
    cardsNeeded: 2,
    rentSchedule: [3, 8],
  },
  RAILROAD: {
    id: 'railroad',
    color: 'railroad',
    hex: '#424242',
    text: 'white',
    name: 'Railroad',
    cardsNeeded: 4,
    rentSchedule: [1, 2, 3, 4],
  },
  UTILITY: {
    id: 'utility',
    color: 'utility',
    hex: '#D4E157',
    text: 'black',
    name: 'Utility',
    cardsNeeded: 2,
    rentSchedule: [1, 2],
  }
};

export const COLORS = Object.keys(PROPERTY_SETS).reduce((acc, key) => {
  const set = PROPERTY_SETS[key];
  acc[set.color] = {
    hex: set.hex,
    text: set.text,
    count: set.cardsNeeded,
    name: set.name,
    rent: set.rentSchedule
  };
  return acc;
}, {});

// Add multi-color for rainbow wilds
COLORS.multi = { 
  hex: 'linear-gradient(45deg, #f06, #4a90e2, #7ed321, #f5a623)', 
  text: 'white',
  count: 0, 
  name: 'Wild', 
  rent: [] 
};

export default PROPERTY_SETS;
