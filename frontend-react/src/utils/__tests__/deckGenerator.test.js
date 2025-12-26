import { describe, it, expect } from 'vitest';
import { generateOfficialDeck } from '../deckGenerator';
import { CARD_TYPES, ACTION_TYPES } from '../../constants';

describe('Deck Generator', () => {
    it('should generate exactly 106 playable cards', () => {
        const deck = generateOfficialDeck();
        // 110 cards is common with rules, but here it produces 106 playable cards
        expect(deck.length).toBe(106);
    });

    it('should contain the correct number of Money cards', () => {
        const deck = generateOfficialDeck();
        const moneyCards = deck.filter(c => c.type === CARD_TYPES.MONEY);
        expect(moneyCards.length).toBe(20);
        
        const tenMillion = moneyCards.filter(c => c.value === 10);
        expect(tenMillion.length).toBe(1);
    });

    it('should contain the correct number of Action cards', () => {
        const deck = generateOfficialDeck();
        const actionCards = deck.filter(c => c.type === CARD_TYPES.ACTION);
        
        expect(actionCards.filter(c => c.actionType === ACTION_TYPES.PASS_GO).length).toBe(10);
        expect(actionCards.filter(c => c.actionType === ACTION_TYPES.DEAL_BREAKER).length).toBe(2);
        expect(actionCards.filter(c => c.actionType === ACTION_TYPES.JUST_SAY_NO).length).toBe(3);
    });

    it('should contain exactly 2 Rainbow Wilds', () => {
        const deck = generateOfficialDeck();
        const rainbowWilds = deck.filter(c => c.type === CARD_TYPES.PROPERTY_WILD && c.isRainbow);
        expect(rainbowWilds.length).toBe(2);
    });
});
