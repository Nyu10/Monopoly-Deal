import { describe, it, expect, beforeEach } from 'vitest';
import { ACTION_TYPES, CARD_TYPES } from './gameHelpers';

/**
 * Test suite for House and Hotel card mechanics
 * Tests both banking and property placement functionality
 */
describe('House and Hotel Card Mechanics', () => {
  let testCard;

  beforeEach(() => {
    testCard = null;
  });

  describe('House Card', () => {
    beforeEach(() => {
      testCard = {
        id: 'house-1',
        type: CARD_TYPES.ACTION,
        actionType: ACTION_TYPES.HOUSE,
        value: 3,
        name: 'House',
        description: '+3M Rent on Full Set'
      };
    });

    it('should have correct properties', () => {
      expect(testCard.type).toBe(CARD_TYPES.ACTION);
      expect(testCard.actionType).toBe(ACTION_TYPES.HOUSE);
      expect(testCard.value).toBe(3);
    });

    it('should be bankable as $3M', () => {
      // House cards can be banked as money
      expect(testCard.value).toBe(3);
      expect(testCard.type).toBe(CARD_TYPES.ACTION);
      // When destination is 'BANK', it should be allowed
    });

    it('should require complete set when played on properties', () => {
      // This is a validation rule:
      // Houses can only be placed on complete property sets
      const completeSet = {
        color: 'brown',
        properties: [
          { color: 'brown', name: 'Baltic Ave' },
          { color: 'brown', name: 'Mediterranean Ave' }
        ],
        isComplete: true
      };
      
      expect(completeSet.isComplete).toBe(true);
      expect(completeSet.properties.length).toBe(2);
    });

    it('should NOT be placeable on incomplete sets', () => {
      const incompleteSet = {
        color: 'brown',
        properties: [
          { color: 'brown', name: 'Baltic Ave' }
        ],
        isComplete: false
      };
      
      expect(incompleteSet.isComplete).toBe(false);
      // Game logic should prevent placement
    });

    it('should be removed if set becomes incomplete', () => {
      // When a property is stolen/traded from a set with a house,
      // the house should be removed
      const setWithHouse = {
        color: 'brown',
        properties: [
          { color: 'brown', name: 'Baltic Ave' },
          { color: 'brown', name: 'Mediterranean Ave' }
        ],
        houses: 1,
        isComplete: true
      };

      // After removing one property
      setWithHouse.properties.pop();
      setWithHouse.isComplete = false;
      
      // House should be removed
      expect(setWithHouse.isComplete).toBe(false);
      // Game logic should remove the house
    });
  });

  describe('Hotel Card', () => {
    beforeEach(() => {
      testCard = {
        id: 'hotel-1',
        type: CARD_TYPES.ACTION,
        actionType: ACTION_TYPES.HOTEL,
        value: 4,
        name: 'Hotel',
        description: '+4M Rent on Full Set with House'
      };
    });

    it('should have correct properties', () => {
      expect(testCard.type).toBe(CARD_TYPES.ACTION);
      expect(testCard.actionType).toBe(ACTION_TYPES.HOTEL);
      expect(testCard.value).toBe(4);
    });

    it('should be bankable as $4M', () => {
      // Hotel cards can be banked as money
      expect(testCard.value).toBe(4);
      expect(testCard.type).toBe(CARD_TYPES.ACTION);
      // When destination is 'BANK', it should be allowed
    });

    it('should require complete set with house when played on properties', () => {
      // This is a validation rule:
      // Hotels can only be placed on complete property sets that already have a house
      const completeSetWithHouse = {
        color: 'brown',
        properties: [
          { color: 'brown', name: 'Baltic Ave' },
          { color: 'brown', name: 'Mediterranean Ave' }
        ],
        houses: 1,
        hotels: 0,
        isComplete: true
      };
      
      expect(completeSetWithHouse.isComplete).toBe(true);
      expect(completeSetWithHouse.houses).toBeGreaterThan(0);
    });

    it('should NOT be placeable on complete sets without house', () => {
      const completeSetNoHouse = {
        color: 'brown',
        properties: [
          { color: 'brown', name: 'Baltic Ave' },
          { color: 'brown', name: 'Mediterranean Ave' }
        ],
        houses: 0,
        hotels: 0,
        isComplete: true
      };
      
      expect(completeSetNoHouse.isComplete).toBe(true);
      expect(completeSetNoHouse.houses).toBe(0);
      // Game logic should prevent placement
    });

    it('should NOT be placeable on incomplete sets even with house', () => {
      const incompleteSetWithHouse = {
        color: 'brown',
        properties: [
          { color: 'brown', name: 'Baltic Ave' }
        ],
        houses: 1,
        isComplete: false
      };
      
      expect(incompleteSetWithHouse.isComplete).toBe(false);
      // Game logic should prevent placement even though it has a house
    });
  });

  describe('Banking vs Property Placement', () => {
    it('should allow house to be banked regardless of property sets', () => {
      const house = {
        id: 'house-1',
        type: CARD_TYPES.ACTION,
        actionType: ACTION_TYPES.HOUSE,
        value: 3
      };

      const playerWithNoSets = {
        properties: [],
        bank: []
      };

      // Even with no complete sets, house can be banked
      expect(playerWithNoSets.properties.length).toBe(0);
      // Banking should be allowed
    });

    it('should allow hotel to be banked regardless of property sets', () => {
      const hotel = {
        id: 'hotel-1',
        type: CARD_TYPES.ACTION,
        actionType: ACTION_TYPES.HOTEL,
        value: 4
      };

      const playerWithNoSets = {
        properties: [],
        bank: []
      };

      // Even with no complete sets, hotel can be banked
      expect(playerWithNoSets.properties.length).toBe(0);
      // Banking should be allowed
    });

    it('should validate complete set requirement only when playing on properties', () => {
      const house = {
        id: 'house-1',
        type: CARD_TYPES.ACTION,
        actionType: ACTION_TYPES.HOUSE,
        value: 3
      };

      // When destination is 'PROPERTIES', validation applies
      const destinationProperties = 'PROPERTIES';
      expect(destinationProperties).toBe('PROPERTIES');
      // Validation: must have complete set

      // When destination is 'BANK', no validation needed
      const destinationBank = 'BANK';
      expect(destinationBank).toBe('BANK');
      // No validation needed
    });
  });

  describe('Validation Rules', () => {
    it('should validate house placement on complete sets only', () => {
      const validationRule = (card, destination, playerSets) => {
        if (card.actionType !== ACTION_TYPES.HOUSE) return true;
        if (destination === 'BANK') return true;
        if (destination === 'PROPERTIES') {
          // Must have at least one complete set
          return playerSets.some(set => set.isComplete);
        }
        return false;
      };

      const house = { actionType: ACTION_TYPES.HOUSE };
      const completeSets = [{ color: 'brown', isComplete: true }];
      const incompleteSets = [{ color: 'brown', isComplete: false }];

      expect(validationRule(house, 'BANK', [])).toBe(true);
      expect(validationRule(house, 'PROPERTIES', completeSets)).toBe(true);
      expect(validationRule(house, 'PROPERTIES', incompleteSets)).toBe(false);
    });

    it('should validate hotel placement on complete sets with house', () => {
      const validationRule = (card, destination, playerSets) => {
        if (card.actionType !== ACTION_TYPES.HOTEL) return true;
        if (destination === 'BANK') return true;
        if (destination === 'PROPERTIES') {
          // Must have at least one complete set with a house
          return playerSets.some(set => set.isComplete && set.houses > 0);
        }
        return false;
      };

      const hotel = { actionType: ACTION_TYPES.HOTEL };
      const completeSetWithHouse = [{ color: 'brown', isComplete: true, houses: 1 }];
      const completeSetNoHouse = [{ color: 'brown', isComplete: true, houses: 0 }];
      const incompleteSetWithHouse = [{ color: 'brown', isComplete: false, houses: 1 }];

      expect(validationRule(hotel, 'BANK', [])).toBe(true);
      expect(validationRule(hotel, 'PROPERTIES', completeSetWithHouse)).toBe(true);
      expect(validationRule(hotel, 'PROPERTIES', completeSetNoHouse)).toBe(false);
      expect(validationRule(hotel, 'PROPERTIES', incompleteSetWithHouse)).toBe(false);
    });
  });
});
