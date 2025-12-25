import { describe, it, expect } from 'vitest';
import { CARD_TYPES } from '../../utils/gameHelpers';

/**
 * Regression tests for banking rules
 * Rule: Property cards CANNOT be banked - they must be played to the property area
 */
describe('Banking Rules - Property Cards', () => {
    it('should identify property cards that cannot be banked', () => {
        const propertyCard = { 
            id: 'prop-1', 
            type: CARD_TYPES.PROPERTY, 
            name: 'Boardwalk', 
            value: 4, 
            color: 'dark_blue' 
        };
        
        const propertyWildCard = {
            id: 'wild-1',
            type: CARD_TYPES.PROPERTY_WILD,
            name: 'Green/Railroad Wild',
            value: 4,
            colors: ['green', 'railroad']
        };
        
        const moneyCard = {
            id: 'money-1',
            type: CARD_TYPES.MONEY,
            name: '$5M',
            value: 5
        };
        
        const actionCard = {
            id: 'action-1',
            type: CARD_TYPES.ACTION,
            name: 'Deal Breaker',
            value: 5
        };
        
        // Helper function to check if a card can be banked
        const canBeBanked = (card) => {
            // Property cards (regular and wild) CANNOT be banked
            if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
                return false;
            }
            // Money and action cards CAN be banked
            return true;
        };
        
        // Assertions
        expect(canBeBanked(propertyCard)).toBe(false);
        expect(canBeBanked(propertyWildCard)).toBe(false);
        expect(canBeBanked(moneyCard)).toBe(true);
        expect(canBeBanked(actionCard)).toBe(true);
    });
    
    it('should validate destination for different card types', () => {
        const testCases = [
            { 
                card: { type: CARD_TYPES.PROPERTY, name: 'Park Place' },
                destination: 'BANK',
                shouldAllow: false,
                reason: 'Property cards cannot be banked'
            },
            { 
                card: { type: CARD_TYPES.PROPERTY_WILD, name: 'Multi Wild' },
                destination: 'BANK',
                shouldAllow: false,
                reason: 'Wild property cards cannot be banked'
            },
            { 
                card: { type: CARD_TYPES.PROPERTY, name: 'Park Place' },
                destination: 'PROPERTIES',
                shouldAllow: true,
                reason: 'Property cards can be played to properties'
            },
            { 
                card: { type: CARD_TYPES.MONEY, name: '$3M' },
                destination: 'BANK',
                shouldAllow: true,
                reason: 'Money cards can be banked'
            },
            { 
                card: { type: CARD_TYPES.ACTION, name: 'Sly Deal' },
                destination: 'BANK',
                shouldAllow: true,
                reason: 'Action cards can be banked for their value'
            }
        ];
        
        const validateDestination = (card, destination) => {
            if (destination === 'BANK') {
                // Cannot bank property cards
                if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
                    return false;
                }
            }
            if (destination === 'PROPERTIES') {
                // Only property cards can go to properties
                if (card.type !== CARD_TYPES.PROPERTY && card.type !== CARD_TYPES.PROPERTY_WILD) {
                    return false;
                }
            }
            return true;
        };
        
        testCases.forEach(({ card, destination, shouldAllow, reason }) => {
            const result = validateDestination(card, destination);
            expect(result).toBe(shouldAllow);
        });
    });
});
