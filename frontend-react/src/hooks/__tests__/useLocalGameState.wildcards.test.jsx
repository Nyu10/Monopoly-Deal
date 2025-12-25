import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalGameState } from '../useLocalGameState';
import { CARD_TYPES } from '../../utils/gameHelpers';

describe('useLocalGameState - Wildcard Logic', () => {
  it('should flip a dual-color wild property on the field', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', 
          name: 'P1', 
          hand: [], 
          bank: [], 
          properties: [
            { 
              id: 'wild-1', 
              type: CARD_TYPES.PROPERTY_WILD, 
              colors: ['blue', 'green'], 
              currentColor: 'blue', 
              name: 'Blue/Green Wild' 
            }
          ] 
        }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(1, 'MEDIUM', initialState));

    // Flip the wildcard
    act(() => {
      result.current.flipWildCard('wild-1');
    });

    // currentColor should have changed to 'green'
    expect(result.current.players[0].properties[0].currentColor).toBe('green');
    
    // Moves left should still be 3 (flipping doesn't consume a move)
    expect(result.current.movesLeft).toBe(3);
  });

  it('should not flip a dual-color wild card if it is in hand', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', 
          name: 'P1', 
          hand: [
            { 
              id: 'wild-in-hand', 
              type: CARD_TYPES.PROPERTY_WILD, 
              colors: ['blue', 'green'], 
              currentColor: 'blue', 
              name: 'Blue/Green Wild' 
            }
          ], 
          bank: [], 
          properties: [] 
        }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(1, 'MEDIUM', initialState));

    // Attempt to flip the wildcard in hand
    act(() => {
      result.current.flipWildCard('wild-in-hand');
    });

    // currentColor should NOT have changed (it shouldn't even find the card)
    expect(result.current.players[0].hand[0].currentColor).toBe('blue');
    expect(result.current.movesLeft).toBe(3);
  });

  it('should cycle back to the first color when flipping multiple times', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', 
          name: 'P1', 
          hand: [], 
          bank: [], 
          properties: [
            { 
              id: 'wild-1', 
              type: CARD_TYPES.PROPERTY_WILD, 
              colors: ['blue', 'green'], 
              currentColor: 'blue', 
              name: 'Blue/Green Wild' 
            }
          ] 
        }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(1, 'MEDIUM', initialState));

    // Flip 1st time
    act(() => {
      result.current.flipWildCard('wild-1');
    });
    expect(result.current.players[0].properties[0].currentColor).toBe('green');

    // Flip 2nd time
    act(() => {
      result.current.flipWildCard('wild-1');
    });
    expect(result.current.players[0].properties[0].currentColor).toBe('blue');
  });

  it('should not flip a rainbow wild property (multi-color)', () => {
    const initialState = {
      players: [
        { 
          id: 'p0', 
          name: 'P1', 
          hand: [], 
          bank: [], 
          properties: [
            { 
              id: 'rainbow-1', 
              type: CARD_TYPES.PROPERTY_WILD, 
              colors: ['any'], 
              currentColor: 'multi', 
              name: 'Rainbow Wild' 
            }
          ] 
        }
      ],
      currentTurnIndex: 0,
      movesLeft: 3,
      gameState: 'PLAYING'
    };

    const { result } = renderHook(() => useLocalGameState(1, 'MEDIUM', initialState));

    act(() => {
      result.current.flipWildCard('rainbow-1');
    });

    // currentColor should NOT change for rainbow wild (as it is not a duo-wild)
    expect(result.current.players[0].properties[0].currentColor).toBe('multi');
  });
});
