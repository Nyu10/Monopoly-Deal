import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalGameState } from '../useLocalGameState';
import { ACTION_TYPES, CARD_TYPES } from '../../utils/gameHelpers';

describe('useLocalGameState - Action Card Logic', () => {
  it('should handle Debt Collector ($5M collection)', () => {
    const initialState = {
      players: [
        { id: 'p0', name: 'P1', hand: [{ id: 'dc-1', actionType: ACTION_TYPES.DEBT_COLLECTOR, type: CARD_TYPES.ACTION, value: 5 }], bank: [], properties: [] },
        { id: 'p1', name: 'P2', hand: [], bank: [{ id: 'm5', type: CARD_TYPES.MONEY, value: 5 }], properties: [] }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('dc-1', 'DISCARD', 'p1');
    });

    // P1 should now have the $5M in their bank
    expect(result.current.players[0].bank).toHaveLength(1);
    expect(result.current.players[0].bank[0].id).toBe('m5');
    
    // P2 should have an empty bank
    expect(result.current.players[1].bank).toHaveLength(0);
    
    // Moves left should be 2
    expect(result.current.movesLeft).toBe(2);
  });

  it('should handle Sly Deal (stealing a property)', () => {
    const initialState = {
      players: [
        { id: 'p0', name: 'P1', hand: [{ id: 'sly-1', actionType: ACTION_TYPES.SLY_DEAL, type: CARD_TYPES.ACTION, value: 3 }], bank: [], properties: [] },
        { id: 'p1', name: 'P2', hand: [], bank: [], properties: [{ id: 'prop-1', type: CARD_TYPES.PROPERTY, color: 'dark_blue', value: 3 }] }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('sly-1', 'DISCARD', 'p1', 'prop-1');
    });

    expect(result.current.players[0].properties).toHaveLength(1);
    expect(result.current.players[0].properties[0].id).toBe('prop-1');
    expect(result.current.players[1].properties).toHaveLength(0);
  });

  it('should handle Just Say No (cancelling Sly Deal)', () => {
    const initialState = {
      players: [
        { id: 'p0', name: 'P1', hand: [{ id: 'sly-1', actionType: ACTION_TYPES.SLY_DEAL, type: CARD_TYPES.ACTION, value: 3 }], bank: [], properties: [] },
        { id: 'p1', name: 'Bot', isHuman: false, hand: [{ id: 'jsn-1', actionType: ACTION_TYPES.JUST_SAY_NO, type: CARD_TYPES.ACTION, value: 4 }], bank: [], properties: [{ id: 'prop-1', type: CARD_TYPES.PROPERTY, color: 'dark_blue', value: 3 }] }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('sly-1', 'DISCARD', 'p1', 'prop-1');
    });

    // The property should NOT have been stolen because the bot played Just Say No
    expect(result.current.players[0].properties).toHaveLength(0);
    expect(result.current.players[1].properties).toHaveLength(1);
    expect(result.current.players[1].hand).toHaveLength(0); // JSN was used
    
    // Sly Deal was still played (lost a move)
    expect(result.current.movesLeft).toBe(2);
  });

  it('should handle Rent with Double Rent', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', name: 'P1', 
          hand: [
            { id: 'dr-1', actionType: ACTION_TYPES.DOUBLE_RENT, type: CARD_TYPES.ACTION, value: 1 },
            { id: 'rent-1', type: CARD_TYPES.RENT, colors: [ 'dark_blue', 'green'], value: 1 }
          ], 
          bank: [], 
          properties: [{ id: 'b1', type: CARD_TYPES.PROPERTY, color: 'dark_blue', value: 4 }] // Blue rent for 1 is $3M
        },
        { id: 'p1', name: 'P2', hand: [], bank: [{ id: 'm10', type: CARD_TYPES.MONEY, value: 10 }], properties: [] }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      // Step 1: Play Double Rent
      result.current.playCard('dr-1', 'DISCARD');
    });
    
    expect(result.current.movesLeft).toBe(2);

    act(() => {
      // Step 2: Play Rent Card for blue (id: 'b1')
      // Note: blue rent for 1 card is $3M (from COLORS.dark_blue). 
      // Doubled it should be $6M.
      result.current.playCard('rent-1', 'DISCARD', null, 'dark_blue');
    });

    // P1 should have $6M (the money card m10 is worth 10, so P2 overpays or pays exact?)
    // Actually the logic uses calculateOptimalPayment. $6M from $10M will result in $10M being paid as it's the only card.
    expect(result.current.players[0].bank).toHaveLength(1);
    expect(result.current.players[0].bank[0].value).toBe(10);
    expect(result.current.players[1].bank).toHaveLength(0);
  });
});
