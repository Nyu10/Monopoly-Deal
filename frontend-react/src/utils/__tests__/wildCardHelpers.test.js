import { describe, it, expect } from 'vitest';
import { getSets, ACTION_TYPES, CARD_TYPES, COLORS } from '../gameHelpers';

describe('getSets', () => {
    it('groups properties by their standard color', () => {
        const properties = [
            { id: 1, name: 'Blue Prop 1', color: 'blue', type: CARD_TYPES.PROPERTY },
            { id: 2, name: 'Blue Prop 2', color: 'blue', type: CARD_TYPES.PROPERTY }
        ];

        const sets = getSets(properties);
        expect(sets).toHaveLength(1);
        expect(sets[0].color).toBe('blue');
        expect(sets[0].cards).toHaveLength(2);
    });

    it('prioritizes currentColor over color for wild cards', () => {
        // This is the critical test for the bug fix
        // A Dual Wild (Blue/Green) that is currently set to 'green' should be grouped into the Green set, 
        // even if 'blue' is listed first in its colors or if it has a base color.
        
        const properties = [
            // Standard Green Property
            { id: 1, name: 'Green Prop 1', color: 'green', type: CARD_TYPES.PROPERTY },
            
            // Wild Card (Blue/Green) flipped to Green
            { 
                id: 2, 
                name: 'Wild Blue/Green', 
                type: CARD_TYPES.PROPERTY_WILD,
                colors: ['blue', 'green'],
                color: 'blue', // Some data structures might have a default color
                currentColor: 'green' // This should be respected
            }
        ];

        const sets = getSets(properties);
        
        // Should produce 1 set (Green) with 2 cards
        // If the bug existed, it might produce 2 sets (Green and Blue)
        const greenSet = sets.find(s => s.color === 'green');
        const blueSet = sets.find(s => s.color === 'blue');

        expect(greenSet).toBeDefined();
        expect(greenSet.cards).toHaveLength(2); // Both cards should be here
        expect(blueSet).toBeUndefined();
    });

    it('handles rainbow wild cards acting as a specific color', () => {
        const properties = [
            { id: 1, name: 'Red Prop 1', color: 'red', type: CARD_TYPES.PROPERTY },
            { 
                id: 2, 
                name: 'Rainbow Wild', 
                type: CARD_TYPES.PROPERTY_WILD,
                isRainbow: true,
                color: 'multi',
                currentColor: 'red'
            }
        ];

        const sets = getSets(properties);
        const redSet = sets.find(s => s.color === 'red');

        expect(redSet).toBeDefined();
        expect(redSet.cards).toHaveLength(2);
    });

    it('handles rainbow wild cards that have not been assigned a color (unplayed/default)', () => {
        // Though in the playing area they should usually have a color, 
        // this edge case checks the fallback logic
        const properties = [
            { 
                id: 1, 
                name: 'Rainbow Wild', 
                type: CARD_TYPES.PROPERTY_WILD,
                isRainbow: true,
                color: 'multi',
                currentColor: 'multi' // Default
            }
        ];

        const sets = getSets(properties);
        // Should create an 'any_rainbow' set or similar based on logic
        expect(sets[0].color).toBe('any_rainbow');
    });

    it('counts houses and hotels correctly within the set', () => {
        const properties = [
            { id: 1, name: 'Blue Prop 1', color: 'blue', type: CARD_TYPES.PROPERTY },
            { id: 2, name: 'House', actionType: ACTION_TYPES.HOUSE, color: 'blue' }, // applied to blue
            { id: 3, name: 'Hotel', actionType: ACTION_TYPES.HOTEL, color: 'blue' }  // applied to blue
        ];

        const sets = getSets(properties);
        const blueSet = sets[0];

        expect(blueSet.color).toBe('blue');
        expect(blueSet.houses).toBe(1);
        expect(blueSet.hotels).toBe(1);
        expect(blueSet.cards).toHaveLength(1); // Only the property card counts as a "card" in the list usually, buildings are separate count
    });
});
