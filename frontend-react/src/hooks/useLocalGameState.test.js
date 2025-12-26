import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalGameState } from './useLocalGameState';
import { ACTION_TYPES, CARD_TYPES } from '../constants';

describe('useLocalGameState - 0 Assets Behavior', () => {
  it('should automatically skip payment request if human has 0 assets (Debt Collector)', () => {
    const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 1, // Bot 1 turn
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [],
          bank: [],
          properties: []
        },
        {
          id: 'player-1',
          name: 'Bot 1',
          isHuman: false,
          hand: [
            { id: 'dc-1', actionType: ACTION_TYPES.DEBT_COLLECTOR, name: 'Debt Collector', value: 3, type: CARD_TYPES.ACTION }
          ],
          bank: [],
          properties: []
        }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('dc-1', 'DISCARD', 'player-0');
    });

    // Verify it didn't enter REQUEST_PAYMENT state
    expect(result.current.gameState).not.toBe('REQUEST_PAYMENT');
    expect(result.current.gameState).toBe('PLAYING');
    
    // Verify it logged the information somewhere in the match log
    const infoLog = result.current.matchLog.find(l => l.action === 'INFO');
    expect(infoLog, "INFO log should exist").toBeDefined();
    expect(infoLog.message).toContain('had no assets');
  });

  it('should automatically skip payment request if human has 0 assets (Rent)', () => {
    const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 1, // Bot 1 turn
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [],
          bank: [],
          properties: [] // 0 assets
        },
        {
          id: 'player-1',
          name: 'Bot 1',
          isHuman: false,
          hand: [
            { id: 'rent-wild', type: CARD_TYPES.RENT_WILD, name: 'Wild Rent', value: 3 }
          ],
          bank: [],
          properties: [
            { id: 'prop-1', name: 'Park Place', color: 'dark_blue', value: 4, type: CARD_TYPES.PROPERTY }
          ]
        }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      // For Wild Rent, it calculates max rent. Bot has 1 property.
      result.current.playCard('rent-wild', 'DISCARD');
    });

    // Verify it didn't enter REQUEST_PAYMENT state
    expect(result.current.gameState).not.toBe('REQUEST_PAYMENT');
    
    // Check match log for the specific "had no assets" note in the RENT log
    const rentLog = result.current.matchLog.find(l => l.action === 'RENT');
    if (!rentLog) {
      console.log('Match Log:', JSON.stringify(result.current.matchLog, null, 2));
    }
    expect(rentLog, "RENT log should exist").toBeDefined();
    expect(rentLog.message).toContain('had no assets');
  });
});
