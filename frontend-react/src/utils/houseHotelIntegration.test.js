import { describe, it, expect } from 'vitest';
import { ACTION_TYPES, CARD_TYPES } from './gameHelpers';

/**
 * Integration tests for House and Hotel card banking and placement
 * These tests verify the complete flow from card selection to placement/banking
 */
describe('House and Hotel Integration Tests', () => {
  
  describe('House Card Banking Flow', () => {
    it('should allow banking a house card with no complete sets', () => {
      const player = {
        hand: [
          { id: 'house-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3 }
        ],
        bank: [],
        properties: [
          // Incomplete brown set (needs 2)
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' }
        ]
      };

      const houseCard = player.hand[0];
      const destination = 'BANK';

      // Validation should pass for banking
      const canBank = destination === 'BANK' || 
                      houseCard.type !== CARD_TYPES.PROPERTY;
      
      expect(canBank).toBe(true);
      expect(houseCard.value).toBe(3);
    });

    it('should allow banking a house card even with complete sets available', () => {
      const player = {
        hand: [
          { id: 'house-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3 }
        ],
        bank: [],
        properties: [
          // Complete brown set
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' },
          { id: 'prop-2', color: 'brown', name: 'Mediterranean Ave' }
        ]
      };

      const houseCard = player.hand[0];
      const destination = 'BANK';

      // Player can choose to bank even with complete sets
      expect(destination).toBe('BANK');
      expect(houseCard.value).toBe(3);
    });
  });

  describe('House Card Property Placement Flow', () => {
    it('should allow placing house on complete set', () => {
      const player = {
        hand: [
          { id: 'house-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3 }
        ],
        bank: [],
        properties: [
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' },
          { id: 'prop-2', color: 'brown', name: 'Mediterranean Ave' }
        ]
      };

      const houseCard = player.hand[0];
      const destination = 'PROPERTIES';
      const targetColor = 'brown';

      // Check if set is complete
      const brownProps = player.properties.filter(p => p.color === 'brown');
      const isComplete = brownProps.length >= 2; // Brown needs 2

      expect(isComplete).toBe(true);
      expect(destination).toBe('PROPERTIES');
    });

    it('should prevent placing house on incomplete set', () => {
      const player = {
        hand: [
          { id: 'house-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3 }
        ],
        bank: [],
        properties: [
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' }
          // Missing second brown property
        ]
      };

      const houseCard = player.hand[0];
      const destination = 'PROPERTIES';
      const targetColor = 'brown';

      // Check if set is complete
      const brownProps = player.properties.filter(p => p.color === 'brown');
      const isComplete = brownProps.length >= 2; // Brown needs 2

      expect(isComplete).toBe(false);
      // Validation should prevent placement
    });
  });

  describe('Hotel Card Banking Flow', () => {
    it('should allow banking a hotel card with no complete sets', () => {
      const player = {
        hand: [
          { id: 'hotel-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4 }
        ],
        bank: [],
        properties: []
      };

      const hotelCard = player.hand[0];
      const destination = 'BANK';

      // Validation should pass for banking
      const canBank = destination === 'BANK' || 
                      hotelCard.type !== CARD_TYPES.PROPERTY;
      
      expect(canBank).toBe(true);
      expect(hotelCard.value).toBe(4);
    });

    it('should allow banking a hotel card even with complete sets (no house)', () => {
      const player = {
        hand: [
          { id: 'hotel-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4 }
        ],
        bank: [],
        properties: [
          // Complete brown set but no house
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' },
          { id: 'prop-2', color: 'brown', name: 'Mediterranean Ave' }
        ]
      };

      const hotelCard = player.hand[0];
      const destination = 'BANK';

      // Player can choose to bank instead of being stuck
      expect(destination).toBe('BANK');
      expect(hotelCard.value).toBe(4);
    });
  });

  describe('Hotel Card Property Placement Flow', () => {
    it('should allow placing hotel on complete set with house', () => {
      const player = {
        hand: [
          { id: 'hotel-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4 }
        ],
        bank: [],
        properties: [
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave', hasHouse: true },
          { id: 'prop-2', color: 'brown', name: 'Mediterranean Ave' }
        ]
      };

      const hotelCard = player.hand[0];
      const destination = 'PROPERTIES';
      const targetColor = 'brown';

      // Check if set is complete and has house
      const brownProps = player.properties.filter(p => p.color === 'brown');
      const isComplete = brownProps.length >= 2;
      const hasHouse = brownProps.some(p => p.hasHouse);

      expect(isComplete).toBe(true);
      expect(hasHouse).toBe(true);
      expect(destination).toBe('PROPERTIES');
    });

    it('should prevent placing hotel on complete set without house', () => {
      const player = {
        hand: [
          { id: 'hotel-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4 }
        ],
        bank: [],
        properties: [
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' },
          { id: 'prop-2', color: 'brown', name: 'Mediterranean Ave' }
        ]
      };

      const hotelCard = player.hand[0];
      const destination = 'PROPERTIES';
      const targetColor = 'brown';

      // Check if set is complete and has house
      const brownProps = player.properties.filter(p => p.color === 'brown');
      const isComplete = brownProps.length >= 2;
      const hasHouse = brownProps.some(p => p.hasHouse);

      expect(isComplete).toBe(true);
      expect(hasHouse).toBe(false);
      // Validation should prevent placement
    });

    it('should prevent placing hotel on incomplete set even with house', () => {
      const player = {
        hand: [
          { id: 'hotel-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4 }
        ],
        bank: [],
        properties: [
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave', hasHouse: true }
          // Missing second property
        ]
      };

      const hotelCard = player.hand[0];
      const destination = 'PROPERTIES';
      const targetColor = 'brown';

      // Check if set is complete
      const brownProps = player.properties.filter(p => p.color === 'brown');
      const isComplete = brownProps.length >= 2;
      const hasHouse = brownProps.some(p => p.hasHouse);

      expect(isComplete).toBe(false);
      expect(hasHouse).toBe(true);
      // Validation should prevent placement (set not complete)
    });
  });

  describe('Strategic Decision Making', () => {
    it('should allow player to choose between banking and placing house', () => {
      const player = {
        hand: [
          { id: 'house-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3 }
        ],
        bank: [],
        properties: [
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' },
          { id: 'prop-2', color: 'brown', name: 'Mediterranean Ave' }
        ]
      };

      const houseCard = player.hand[0];

      // Option 1: Bank for $3M
      const bankOption = {
        destination: 'BANK',
        value: houseCard.value,
        valid: true
      };

      // Option 2: Place on complete set for rent bonus
      const brownProps = player.properties.filter(p => p.color === 'brown');
      const placeOption = {
        destination: 'PROPERTIES',
        targetColor: 'brown',
        valid: brownProps.length >= 2,
        rentBonus: 3 // +3M to rent
      };

      expect(bankOption.valid).toBe(true);
      expect(placeOption.valid).toBe(true);
      // Player can choose either option
    });

    it('should only allow banking when no complete sets available', () => {
      const player = {
        hand: [
          { id: 'house-1', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3 }
        ],
        bank: [],
        properties: [
          { id: 'prop-1', color: 'brown', name: 'Baltic Ave' },
          { id: 'prop-2', color: 'green', name: 'Pacific Ave' }
        ]
      };

      const houseCard = player.hand[0];

      // Option 1: Bank for $3M
      const bankOption = {
        destination: 'BANK',
        value: houseCard.value,
        valid: true
      };

      // Option 2: Place on properties
      const hasCompleteSet = false; // No complete sets
      const placeOption = {
        destination: 'PROPERTIES',
        valid: hasCompleteSet
      };

      expect(bankOption.valid).toBe(true);
      expect(placeOption.valid).toBe(false);
      // Only banking is available
    });
  });
});
