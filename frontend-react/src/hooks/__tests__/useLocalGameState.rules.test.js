import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalGameState } from '../useLocalGameState';
import { CARD_TYPES } from '../../constants';

describe('useLocalGameState - Rule Validation', () => {
  it('should not allow banking a Property card', () => {
    const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 0,
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [
            { id: 'prop-1', type: CARD_TYPES.PROPERTY, name: 'Boardwalk', value: 4, color: 'dark_blue' }
          ],
          bank: [],
          properties: []
        },
        { id: 'player-1', name: 'Bot', isHuman: false, hand: [], bank: [], properties: [] }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('prop-1', 'BANK');
    });

    const player = result.current.players[0];
    // Bank should be empty because property cards cannot be banked
    expect(player.bank).toHaveLength(0);
    // Player should lose a move as penalty (current implementation)
    expect(result.current.movesLeft).toBe(2);
    
    // Check match log for error
    const errorLog = result.current.matchLog.find(l => l.action === 'ERROR');
    expect(errorLog).toBeDefined();
    expect(errorLog.message).toContain('Property cards cannot be banked');
  });

  it('should not allow banking a Duo Wild Property card', () => {
    const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 0,
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [
             { 
                id: 'wild-1', 
                type: CARD_TYPES.PROPERTY_WILD, 
                name: 'Blue/Green Wild', 
                value: 4, 
                colors: ['dark_blue', 'green'] 
             }
          ],
          bank: [],
          properties: []
        },
        { id: 'player-1', name: 'Bot', isHuman: false, hand: [], bank: [], properties: [] }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      // Attempt to play Duo Wild to Bank
      result.current.playCard('wild-1', 'BANK');
    });

    const player = result.current.players[0];
    // Bank should be empty
    expect(player.bank).toHaveLength(0);
    // Player should lose a move
    expect(result.current.movesLeft).toBe(2);

    // Check match log for error
    const errorLog = result.current.matchLog.find(l => l.action === 'ERROR');
    expect(errorLog).toBeDefined();
    expect(errorLog.message).toContain('Property cards cannot be banked');
  });

  it('should not allow banking a Rainbow Wild card', () => {
    const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 0,
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [
             { 
                id: 'wild-rainbow', 
                type: CARD_TYPES.PROPERTY_WILD, 
                name: 'Rainbow Wild', 
                value: 0, 
                colors: ['any'],
                isRainbow: true
             }
          ],
          bank: [],
          properties: []
        },
        { id: 'player-1', name: 'Bot', isHuman: false, hand: [], bank: [], properties: [] }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
       result.current.playCard('wild-rainbow', 'BANK');
    });

    const player = result.current.players[0];
    expect(player.bank).toHaveLength(0);
    const errorLog = result.current.matchLog.find(l => l.action === 'ERROR');
    expect(errorLog).toBeDefined();
  });

  it('should allow banking a Money card', () => {
      const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 0,
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [
            { id: 'money-1', type: CARD_TYPES.MONEY, name: '$10M', value: 10 }
          ],
          bank: [],
          properties: []
        },
        { id: 'player-1', name: 'Bot', isHuman: false, hand: [], bank: [], properties: [] }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('money-1', 'BANK');
    });

    const player = result.current.players[0];
    expect(player.bank).toHaveLength(1);
    expect(player.bank[0].id).toBe('money-1');
  });
  
  it('should allow banking an Action card', () => {
     const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 0,
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [
            { id: 'action-1', type: CARD_TYPES.ACTION, name: 'Pass Go', value: 1, actionType: 'PASS_GO' }
          ],
          bank: [],
          properties: []
        },
        { id: 'player-1', name: 'Bot', isHuman: false, hand: [], bank: [], properties: [] }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      result.current.playCard('action-1', 'BANK');
    });

    const player = result.current.players[0];
    expect(player.bank).toHaveLength(1);
    expect(player.bank[0].id).toBe('action-1');
  });
});
