import { useState, useCallback, useEffect, useRef } from 'react';
import { generateOfficialDeck, shuffleDeck } from '../utils/deckGenerator';
import { CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';
import { createBot, BOT_DIFFICULTY } from '../ai/BotEngine';

/**
 * Custom hook for managing local bot game state
 * This handles the full game logic without needing a backend
 */
export const useLocalGameState = (playerCount = 4, botDifficulty = BOT_DIFFICULTY.MEDIUM) => {
  const [gameState, setGameState] = useState('SETUP');
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [movesLeft, setMovesLeft] = useState(0);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [winner, setWinner] = useState(null);
  
  const botsRef = useRef([]);

  /**
   * Initialize game
   */
  const startGame = useCallback(() => {
    const newDeck = shuffleDeck(generateOfficialDeck());
    const newPlayers = [];

    // Create players
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: `player-${i}`,
        name: i === 0 ? 'You' : `Bot ${i}`,
        isHuman: i === 0,
        hand: [],
        bank: [],
        properties: [],
      });
    }

    // Deal initial hands (5 cards each)
    for (let i = 0; i < 5; i++) {
      newPlayers.forEach(player => {
        if (newDeck.length > 0) {
          player.hand.push(newDeck.pop());
        }
      });
    }

    // Initialize bots
    botsRef.current = newPlayers.map((player, idx) =>
      player.isHuman ? null : createBot(botDifficulty, idx, newPlayers)
    );

    setDeck(newDeck);
    setPlayers(newPlayers);
    setCurrentTurnIndex(0);
    setGameState('DRAW');
    setMovesLeft(0);
    setHasDrawnThisTurn(false);
    setWinner(null);
  }, [playerCount, botDifficulty]);

  /**
   * Draw cards
   */
  const drawCards = useCallback(() => {
    if (hasDrawnThisTurn) return;

    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[currentTurnIndex] };
      const drawCount = player.hand.length === 0 ? 5 : 2;

      setDeck(prevDeck => {
        const newDeck = [...prevDeck];
        const drawnCards = [];

        for (let i = 0; i < drawCount && newDeck.length > 0; i++) {
          drawnCards.push(newDeck.pop());
        }

        player.hand = [...player.hand, ...drawnCards];
        newPlayers[currentTurnIndex] = player;
        return newDeck;
      });

      return newPlayers;
    });

    setHasDrawnThisTurn(true);
    setMovesLeft(3);
    setGameState('PLAYING');
  }, [currentTurnIndex, hasDrawnThisTurn]);

  /**
   * Play a card
   */
  const playCard = useCallback((cardId, destination, targetPlayerId = null, targetCardId = null) => {
    if (movesLeft <= 0) return;

    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[currentTurnIndex] };
      const cardIndex = player.hand.findIndex(c => c.id === cardId);
      
      if (cardIndex === -1) return prev;

      const card = player.hand[cardIndex];
      player.hand = player.hand.filter((_, i) => i !== cardIndex);

      // Handle different destinations
      if (destination === 'BANK') {
        player.bank = [...player.bank, card];
      } else if (destination === 'PROPERTIES') {
        player.properties = [...player.properties, card];
      } else if (destination === 'DISCARD') {
        setDiscardPile(p => [...p, card]);
      }

      newPlayers[currentTurnIndex] = player;
      
      // Check for win condition
      const completeSets = countCompleteSets(player.properties);
      if (completeSets >= 3) {
        setWinner(player);
        setGameState('GAME_OVER');
      }

      return newPlayers;
    });

    setMovesLeft(m => m - 1);
  }, [currentTurnIndex, movesLeft]);

  /**
   * End turn
   */
  const endTurn = useCallback(() => {
    // Discard down to 7 cards if needed
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[currentTurnIndex] };

      if (player.hand.length > 7) {
        // Auto-discard lowest value cards
        const sorted = [...player.hand].sort((a, b) => (a.value || 0) - (b.value || 0));
        const toDiscard = sorted.slice(0, player.hand.length - 7);
        player.hand = sorted.slice(player.hand.length - 7);
        setDiscardPile(p => [...p, ...toDiscard]);
        newPlayers[currentTurnIndex] = player;
      }

      return newPlayers;
    });

    // Move to next player
    const nextIndex = (currentTurnIndex + 1) % playerCount;
    setCurrentTurnIndex(nextIndex);
    setMovesLeft(0);
    setHasDrawnThisTurn(false);
    setGameState('DRAW');
  }, [currentTurnIndex, playerCount]);

  /**
   * Bot turn automation
   */
  useEffect(() => {
    if (gameState === 'GAME_OVER') return;
    
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer || currentPlayer.isHuman) return;

    const bot = botsRef.current[currentTurnIndex];
    if (!bot) return;

    // Bot draws
    if (gameState === 'DRAW' && !hasDrawnThisTurn) {
      setTimeout(() => drawCards(), 1000);
      return;
    }

    // Bot plays
    if (gameState === 'PLAYING' && movesLeft > 0) {
      setTimeout(() => {
        const decision = bot.decideMove(currentPlayer.hand, {
          players,
          currentPlayerIndex: currentTurnIndex,
        });

        if (decision.action === 'PLAY_PROPERTY' && decision.card) {
          playCard(decision.card.id, 'PROPERTIES');
        } else if (decision.action === 'BANK' && decision.card) {
          playCard(decision.card.id, 'BANK');
        } else if (decision.action === 'END_TURN') {
          endTurn();
        }
      }, 1500);
    }

    // Bot ends turn when out of moves
    if (gameState === 'PLAYING' && movesLeft === 0) {
      setTimeout(() => endTurn(), 1000);
    }
  }, [gameState, currentTurnIndex, hasDrawnThisTurn, movesLeft, players, drawCards, playCard, endTurn]);

  return {
    // State
    gameState,
    players,
    currentTurnIndex,
    movesLeft,
    hasDrawnThisTurn,
    deck,
    discardPile,
    winner,

    // Actions
    startGame,
    drawCards,
    playCard,
    endTurn,
  };
};

/**
 * Helper: Count complete sets
 */
function countCompleteSets(properties) {
  const sets = {};
  
  properties.forEach(prop => {
    const color = prop.currentColor || prop.color;
    if (!sets[color]) sets[color] = [];
    sets[color].push(prop);
  });

  const setSizes = {
    brown: 2, dark_blue: 2, blue: 2, green: 3, yellow: 3,
    orange: 3, pink: 3, red: 3, light_blue: 3, cyan: 3,
    utility: 2, railroad: 4
  };

  return Object.entries(sets).filter(([color, cards]) => {
    const needed = setSizes[color] || 3;
    return cards.length >= needed;
  }).length;
}
