import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalGameState } from '../useLocalGameState';
import { ACTION_TYPES, CARD_TYPES } from '../../utils/gameHelpers';

describe('useLocalGameState - Payment Logic (Properties as Payment)', () => {
  it('should place properties in the properties area instead of the bank when received as payment for Debt Collector', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', name: 'P1', 
          hand: [{ id: 'dc-1', actionType: ACTION_TYPES.DEBT_COLLECTOR, type: CARD_TYPES.ACTION, value: 5 }], 
          bank: [], 
          properties: [] 
        },
        { 
          id: 'p1', name: 'Bot-P2', 
          hand: [], 
          bank: [], 
          properties: [{ id: 'prop-1', type: CARD_TYPES.PROPERTY, color: 'dark_blue', value: 4 }] 
        }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      // P1 plays Debt Collector on P2
      // Bot P2 will pay with prop-1 (as it's the only card they have, even if it's not enough money, it's all তারা have)
      result.current.playCard('dc-1', 'DISCARD', 'p1');
    });

    // P1 should now have the property in their properties, NOT their bank
    expect(result.current.players[0].properties).toHaveLength(1);
    expect(result.current.players[0].properties[0].id).toBe('prop-1');
    expect(result.current.players[0].bank).toHaveLength(0);
    
    // P2 should have nothing left
    expect(result.current.players[1].properties).toHaveLength(0);
  });

  it('should handle Birthday payment with properties from multiple players', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', name: 'P1', 
          hand: [{ id: 'bday-1', actionType: ACTION_TYPES.BIRTHDAY, type: CARD_TYPES.ACTION, value: 2 }], 
          bank: [], 
          properties: [] 
        },
        { 
          id: 'p1', name: 'Bot-P2', 
          hand: [], 
          bank: [{ id: 'm2', type: CARD_TYPES.MONEY, value: 2 }], 
          properties: [] 
        },
        { 
          id: 'p2', name: 'Bot-P3', 
          hand: [], 
          bank: [], 
          properties: [{ id: 'prop-green', type: CARD_TYPES.PROPERTY, color: 'green', value: 4 }] 
        }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(3, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('bday-1', 'DISCARD');
    });

    // P1 (receiver)
    // Should have $2M in bank (from P2)
    // Should have Green Property in properties (from P3)
    expect(result.current.players[0].bank).toHaveLength(1);
    expect(result.current.players[0].bank[0].id).toBe('m2');
    expect(result.current.players[0].properties).toHaveLength(1);
    expect(result.current.players[0].properties[0].id).toBe('prop-green');
  });

  it('should handle manual confirmPayment with properties', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', name: 'P1', hand: [{ id: 'dc-1', actionType: ACTION_TYPES.DEBT_COLLECTOR, type: CARD_TYPES.ACTION, value: 5 }], bank: [], properties: [] 
        },
        { 
          id: 'p1', name: 'Human-P2', isHuman: true, hand: [], bank: [], properties: [{ id: 'prop-red', type: CARD_TYPES.PROPERTY, color: 'red', value: 3 }] 
        }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      // P1 plays Debt Collector on Human P2
      result.current.playCard('dc-1', 'DISCARD', 'p1');
    });

    // Game state should be REQUEST_PAYMENT
    expect(result.current.gameState).toBe('REQUEST_PAYMENT');
    expect(result.current.pendingRequest).not.toBeNull();

    act(() => {
      // Human-P2 confirms payment with prop-red
      result.current.confirmPayment([{ id: 'prop-red', type: CARD_TYPES.PROPERTY, color: 'red', value: 3 }]);
    });

    // Receiver (P1) should have prop-red in properties
    expect(result.current.players[0].properties).toHaveLength(1);
    expect(result.current.players[0].properties[0].id).toBe('prop-red');
    expect(result.current.players[0].bank).toHaveLength(0);
  });
});
