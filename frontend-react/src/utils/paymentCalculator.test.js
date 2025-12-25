import { describe, it, expect } from 'vitest';
import { calculateOptimalPayment } from '../utils/paymentCalculator';
import { CARD_TYPES } from '../utils/gameHelpers';

describe('Payment Calculator', () => {
  describe('calculateOptimalPayment', () => {
    it('should find exact match with money cards', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 1, name: '$1M' },
        { id: '2', type: CARD_TYPES.MONEY, value: 2, name: '$2M' },
        { id: '3', type: CARD_TYPES.MONEY, value: 3, name: '$3M' },
      ];
      
      const payment = calculateOptimalPayment(cards, 5);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBe(5);
      expect(payment.length).toBe(2); // Should use 2M + 3M
      expect(payment.every(c => c.type === CARD_TYPES.MONEY)).toBe(true);
    });

    it('should prioritize money cards over properties', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 3, name: '$3M' },
        { id: '2', type: CARD_TYPES.MONEY, value: 2, name: '$2M' },
        { id: '3', type: CARD_TYPES.PROPERTY, value: 4, name: 'Boardwalk' },
      ];
      
      const payment = calculateOptimalPayment(cards, 5);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBe(5);
      // Should use money cards first
      const moneyCards = payment.filter(c => c.type === CARD_TYPES.MONEY);
      expect(moneyCards.length).toBeGreaterThan(0);
    });

    it('should use properties when money is insufficient', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 2, name: '$2M' },
        { id: '2', type: CARD_TYPES.PROPERTY, value: 3, name: 'Park Place' },
      ];
      
      const payment = calculateOptimalPayment(cards, 5);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBe(5);
      expect(payment.length).toBe(2);
      expect(payment.some(c => c.type === CARD_TYPES.PROPERTY)).toBe(true);
    });

    it('should handle minimal overpayment when exact match impossible', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 10, name: '$10M' },
        { id: '2', type: CARD_TYPES.MONEY, value: 1, name: '$1M' },
      ];
      
      const payment = calculateOptimalPayment(cards, 5);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBeGreaterThanOrEqual(5);
      // Should overpay with 10M since no exact match exists
      expect(payment.some(c => c.value === 10)).toBe(true);
    });

    it('should find complex exact matches', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 1, name: '$1M' },
        { id: '2', type: CARD_TYPES.MONEY, value: 2, name: '$2M' },
        { id: '3', type: CARD_TYPES.MONEY, value: 3, name: '$3M' },
        { id: '4', type: CARD_TYPES.PROPERTY, value: 4, name: 'Boardwalk' },
      ];
      
      const payment = calculateOptimalPayment(cards, 5);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBe(5);
      // Should prefer money cards (2M + 3M) over using property
      expect(payment.every(c => c.type === CARD_TYPES.MONEY)).toBe(true);
    });

    it('should handle empty card array', () => {
      const payment = calculateOptimalPayment([], 5);
      expect(payment).toEqual([]);
    });

    it('should handle zero amount', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 5, name: '$5M' },
      ];
      
      const payment = calculateOptimalPayment(cards, 0);
      expect(payment).toEqual([]);
    });

    it('should pay exact amount for Debt Collector ($5M)', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 1, name: '$1M' },
        { id: '2', type: CARD_TYPES.MONEY, value: 2, name: '$2M' },
        { id: '3', type: CARD_TYPES.MONEY, value: 2, name: '$2M' },
        { id: '4', type: CARD_TYPES.PROPERTY, value: 3, name: 'Park Place' },
      ];
      
      const payment = calculateOptimalPayment(cards, 5);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBe(5);
      // Should use 1M + 2M + 2M = 5M
      expect(payment.length).toBe(3);
      expect(payment.every(c => c.type === CARD_TYPES.MONEY)).toBe(true);
    });

    it('should pay exact amount for Birthday ($2M)', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 1, name: '$1M' },
        { id: '2', type: CARD_TYPES.MONEY, value: 1, name: '$1M' },
        { id: '3', type: CARD_TYPES.PROPERTY, value: 2, name: 'Baltic' },
      ];
      
      const payment = calculateOptimalPayment(cards, 2);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBe(2);
      // Should use 1M + 1M = 2M
      expect(payment.length).toBe(2);
      expect(payment.every(c => c.type === CARD_TYPES.MONEY)).toBe(true);
    });

    it('should minimize property loss when paying with properties', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.PROPERTY, value: 1, name: 'Baltic' },
        { id: '2', type: CARD_TYPES.PROPERTY, value: 2, name: 'Mediterranean' },
        { id: '3', type: CARD_TYPES.PROPERTY, value: 4, name: 'Boardwalk' },
      ];
      
      const payment = calculateOptimalPayment(cards, 3);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBeGreaterThanOrEqual(3);
      // Should use 1M + 2M = 3M instead of 4M Boardwalk
      expect(payment.length).toBe(2);
      expect(payment.find(c => c.value === 4)).toBeUndefined();
    });

    it('should handle mixed card types efficiently', () => {
      const cards = [
        { id: '1', type: CARD_TYPES.MONEY, value: 1, name: '$1M' },
        { id: '2', type: CARD_TYPES.ACTION, value: 3, name: 'Sly Deal' },
        { id: '3', type: CARD_TYPES.PROPERTY, value: 2, name: 'Baltic' },
      ];
      
      const payment = calculateOptimalPayment(cards, 4);
      const total = payment.reduce((sum, c) => sum + c.value, 0);
      
      expect(total).toBeGreaterThanOrEqual(4);
      // Should prioritize money first
      expect(payment.some(c => c.type === CARD_TYPES.MONEY)).toBe(true);
    });
  });
});
