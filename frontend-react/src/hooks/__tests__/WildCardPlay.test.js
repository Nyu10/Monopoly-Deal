
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalGameState } from '../useLocalGameState';
import { ACTION_TYPES, CARD_TYPES } from '../../constants';

describe('useLocalGameState - Wild Card Play', () => {
  it('should set currentColor when playing a rainbow wild card', () => {
    const rainbowCard = {
      id: 'rainbow-1',
      name: 'Rainbow Wild',
      isRainbow: true,
      value: 0,
      type: CARD_TYPES.PROPERTY_WILD,
      colors: [] // Rainbows might have empty colors or rely on isRainbow
    };

    const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 0, // Human turn
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [rainbowCard],
          bank: [],
          properties: []
        },
        {
          id: 'player-1',
          name: 'Bot 1',
          isHuman: false,
          hand: [],
          bank: [],
          properties: []
        }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
      // playCard(cardId, destination, targetPlayerId, targetCardId/color)
      result.current.playCard('rainbow-1', 'PROPERTIES', null, 'blue');
    });

    const playerProps = result.current.players[0].properties;
    expect(playerProps.length).toBe(1);
    expect(playerProps[0].id).toBe('rainbow-1');
    expect(playerProps[0].currentColor).toBe('blue');
  });

  it('should set currentColor when playing a dual wild card', () => {
    const dualCard = {
      id: 'dual-1',
      name: 'Blue/Green Wild',
      isRainbow: false,
      value: 4,
      type: CARD_TYPES.PROPERTY_WILD,
      colors: ['blue', 'green']
    };

    const initialState = {
      gameState: 'PLAYING',
      currentTurnIndex: 0,
      movesLeft: 3,
      players: [
        {
          id: 'player-0',
          name: 'You',
          isHuman: true,
          hand: [dualCard],
          bank: [],
          properties: []
        },
        {
          id: 'player-1',
          name: 'Bot 1',
          isHuman: false,
          hand: [],
          bank: [],
          properties: []
        }
      ]
    };

    const { result } = renderHook(() => useLocalGameState(2, 'MEDIUM', initialState));

    act(() => {
        // Play as 'green'
      result.current.playCard('dual-1', 'PROPERTIES', null, 'green');
    });

    const playerProps = result.current.players[0].properties;
    expect(playerProps.length).toBe(1);
    expect(playerProps[0].id).toBe('dual-1');
    expect(playerProps[0].currentColor).toBe('green');
  });
});
