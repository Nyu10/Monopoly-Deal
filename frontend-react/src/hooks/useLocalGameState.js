import { useState, useCallback, useEffect, useRef } from 'react';
import { generateOfficialDeck, shuffleDeck } from '../utils/deckGenerator';
import { CARD_TYPES, ACTION_TYPES, COLORS, getSets } from '../utils/gameHelpers';
import { createBot, BOT_DIFFICULTY } from '../ai/BotEngine';
import { calculateOptimalPayment } from '../utils/paymentCalculator';
import CARD_BACK_STYLES from '../utils/cardBackStyles';

/**
 * Custom hook for managing local bot game state
 * This handles the full game logic without needing a backend
 */
export const useLocalGameState = (playerCount = 4, botDifficulty = BOT_DIFFICULTY.MEDIUM, initialState = null) => {
  const [gameState, setGameState] = useState(initialState?.gameState || 'SETUP');
  const [deck, setDeck] = useState(initialState?.deck || []);
  const [discardPile, setDiscardPile] = useState(initialState?.discardPile || []);
  const [players, setPlayers] = useState(initialState?.players || []);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(initialState?.currentTurnIndex || 0);
  const [movesLeft, setMovesLeft] = useState(initialState?.movesLeft || 0);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(initialState?.hasDrawnThisTurn || false);
  const [winner, setWinner] = useState(initialState?.winner || null);
  const [doubleRentActive, setDoubleRentActive] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null); // { type, amount, requesterId, targetId, ... }
  const [matchLog, setMatchLog] = useState(initialState?.matchLog || []); 
  
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
    setMatchLog([{
      id: Date.now(),
      player: 'System',
      action: 'GAME_START',
      message: 'Game Started!'
    }]);
  }, [playerCount, botDifficulty]);

  /**
   * Draw cards
   */
  const drawCards = useCallback(() => {
    if (hasDrawnThisTurn) return;

    const currentPlayerIndexRef = currentTurnIndex;
    const currentPlayer = players[currentPlayerIndexRef];
    const drawCount = (currentPlayer.hand && currentPlayer.hand.length === 0) ? 5 : 2;
    
    // Compute new deck and hand
    const newDeck = [...deck];
    const drawnCards = [];
    for (let i = 0; i < drawCount && newDeck.length > 0; i++) {
      drawnCards.push(newDeck.pop());
    }

    setDeck(newDeck);
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[currentPlayerIndexRef] };
      player.hand = [...(player.hand || []), ...drawnCards];
      newPlayers[currentPlayerIndexRef] = player;
      return newPlayers;
    });

    setHasDrawnThisTurn(true);
    setMovesLeft(3);
    setGameState('PLAYING');

    setMatchLog(prev => [{
      id: Date.now(),
      player: currentPlayer.name,
      action: 'DRAW',
      message: `drew ${drawCount} cards`,
      isPrivate: true
    }, ...prev]);
  }, [currentTurnIndex, hasDrawnThisTurn, deck, players]);

  /**
   * Helper: Check if target can use Just Say No
   */
  const checkForJustSayNo = useCallback((targetId, actionName) => {
    const targetIdx = players.findIndex(p => p.id === targetId);
    if (targetIdx === -1) return false;
    
    const target = players[targetIdx];
    const jsnCard = target.hand.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);
    
    if (jsnCard) {
      // For Bots: Always use it
      if (!target.isHuman) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const t = { ...newPlayers[targetIdx] };
          t.hand = t.hand.filter(c => c.id !== jsnCard.id);
          newPlayers[targetIdx] = t;
          return newPlayers;
        });
        
        setDiscardPile(prev => [...prev, jsnCard]);
        setMatchLog(prev => [{
          id: Date.now(),
          player: target.name,
          action: 'JUST_SAY_NO',
          message: `said NO to ${actionName}!`,
          card: jsnCard
        }, ...prev]);
        
        return true; 
      }
      // For Humans: We should technically prompt, but for now let's assume if they have it they might want to use it.
      // In a real FE, this would trigger a "REACTION" phase.
    }
    
    return false;
  }, [players]);

  /**
   * Play a card
   */
  /*
   * Play a card
   */
  const playCard = useCallback((cardId, destination, targetPlayerId = null, targetCardId = null) => {
    if (movesLeft <= 0) return;

    // Get current player and card to determine action type
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer) return;
    
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return;

    // VALIDATION: Property cards cannot be banked
    if (destination === 'BANK') {
      if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
        console.error('Property cards cannot be banked! They must be played to your property area.');
        setMatchLog(prev => [{
          id: Date.now(),
          player: 'System',
          action: 'ERROR',
          message: 'Property cards cannot be banked!'
        }, ...prev]);
        setMovesLeft(m => m - 1); // Safety: Burn a move on invalid action to prevent bot loops
        return; 
      }
    }

    // Handle Pass Go Action: Draw 2 cards
    let drawnCards = [];
    if (card.actionType === ACTION_TYPES.PASS_GO) {
      const newDeck = [...deck];
      for (let i = 0; i < 2; i++) {
        if (newDeck.length > 0) {
          drawnCards.push(newDeck.pop());
        }
      }
      setDeck(newDeck);
      // Logic continues to state update below
    }

    // Handle Debt Collector: Collect $5M from target player
    if (card.actionType === ACTION_TYPES.DEBT_COLLECTOR && targetPlayerId) {
      if (checkForJustSayNo(targetPlayerId, 'Debt Collector')) {
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }
      
      const targetPlayer = players.find(p => p.id === targetPlayerId);
      if (targetPlayer) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const receiver = { ...newPlayers[currentTurnIndex] };
          const victimIdx = newPlayers.findIndex(p => p.id === targetPlayerId);
          const victim = { ...newPlayers[victimIdx] };

          if (victim.isHuman) {
            // Human needs to choose payment
            setPendingRequest({
              type: 'DEBT',
              amount: 5,
              requesterId: currentPlayer.id,
              targetId: targetPlayerId,
              cardId: cardId
            });
            setGameState('REQUEST_PAYMENT');
            return prev;
          }
          
          const availableCards = [...(victim.bank || []), ...(victim.properties || [])];
          const paymentCards = calculateOptimalPayment(availableCards, 5);
          const paymentIds = paymentCards.map(c => c.id);
          
          victim.bank = (victim.bank || []).filter(c => !paymentIds.includes(c.id));
          victim.properties = (victim.properties || []).filter(c => !paymentIds.includes(c.id));
          const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
          const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
          receiver.bank = [...(receiver.bank || []), ...paysMoney];
          receiver.properties = [...(receiver.properties || []), ...paysProp];
          receiver.hand = receiver.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = receiver;
          newPlayers[victimIdx] = victim;
          return newPlayers;
        });
        
        setMatchLog(prev => [{
          id: Date.now(), player: currentPlayer.name, action: 'DEBT_COLLECTOR',
          message: `collected from ${targetPlayer.name}`, card: card
        }, ...prev]);
        
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }
    }

    // Handle Birthday: Collect $2M from all other players
    if (card.actionType === ACTION_TYPES.BIRTHDAY) {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const receiver = { ...newPlayers[currentTurnIndex] };
        receiver.hand = receiver.hand.filter(c => c.id !== cardId);
        
        newPlayers.forEach((player, idx) => {
          if (idx === currentTurnIndex) return;
          
          // Check for Just Say No
          if (checkForJustSayNo(player.id, 'Birthday')) {
            return;
          }

          const availableCards = [...(player.bank || []), ...(player.properties || [])];
          const paymentCards = calculateOptimalPayment(availableCards, 2);
          const paymentIds = paymentCards.map(c => c.id);
          
          player.bank = (player.bank || []).filter(c => !paymentIds.includes(c.id));
          player.properties = (player.properties || []).filter(c => !paymentIds.includes(c.id));
          const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
          const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
          receiver.bank = [...(receiver.bank || []), ...paysMoney];
          receiver.properties = [...(receiver.properties || []), ...paysProp];
          newPlayers[idx] = { ...player };
        });
        
        newPlayers[currentTurnIndex] = receiver;
        return newPlayers;
      });
      
      setMatchLog(prev => [{
        id: Date.now(), player: currentPlayer.name, action: 'BIRTHDAY',
        message: `collected $2M from everyone`, card: card
      }, ...prev]);
      
      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      return;
    }

    // Handle Rent Cards
    if (card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD) {
      const charger = players[currentTurnIndex];
      const selectedColor = targetCardId; 
      
      let rentAmount = 0;
      const sets = getSets(charger.properties);
      
      if (card.type === CARD_TYPES.RENT_WILD) {
        const maxRentSet = sets.reduce((max, set) => (set.rent > (max?.rent || 0) ? set : max), null);
        rentAmount = maxRentSet ? maxRentSet.rent : 0;
      } else {
        const set = sets.find(s => s.color === selectedColor);
        rentAmount = set ? set.rent : 0;
      }

      if (doubleRentActive) {
        rentAmount *= 2;
        setDoubleRentActive(false);
      }

      if (rentAmount > 0) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const receiver = { ...newPlayers[currentTurnIndex] };
          const targets = targetPlayerId ? [newPlayers.find(p => p.id === targetPlayerId)] : newPlayers.filter((p, i) => i !== currentTurnIndex);

          targets.forEach(target => {
            if (!target) return;
            
            // Check for Just Say No for EACH target
            if (checkForJustSayNo(target.id, 'Rent')) {
              return; // This player cancels but others might still pay
            }

            if (target.isHuman) {
               // Human needs to choose payment
               setPendingRequest({
                 type: 'RENT',
                 amount: rentAmount,
                 requesterId: charger.id,
                 targetId: target.id,
                 cardId: cardId
               });
               setGameState('REQUEST_PAYMENT');
               return;
            }

            const targetIdx = newPlayers.findIndex(p => p.id === target.id);
            const playerToPay = { ...newPlayers[targetIdx] };
            
            const availableCards = [
              ...(playerToPay.bank || []),
              ...(playerToPay.properties || [])
            ];
            
            const paymentCards = calculateOptimalPayment(availableCards, rentAmount);
            const paymentIds = paymentCards.map(c => c.id);
            
            // Remove from payer
            playerToPay.bank = (playerToPay.bank || []).filter(c => !paymentIds.includes(c.id));
            playerToPay.properties = (playerToPay.properties || []).filter(c => !paymentIds.includes(c.id));
            
            // Add to receiver
            const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
            const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
            receiver.bank = [...(receiver.bank || []), ...paysMoney];
            receiver.properties = [...(receiver.properties || []), ...paysProp];
            newPlayers[targetIdx] = playerToPay;
          });

          newPlayers[currentTurnIndex] = receiver;
          return newPlayers;
        });

        setMatchLog(prev => [{
          id: Date.now(), player: charger.name, action: 'RENT',
          message: `charged $${rentAmount}M rent`, card: card
        }, ...prev]);
      }

      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      return;
    }

    // Handle Sly Deal: Steal 1 property (non-set)
    if (card.actionType === ACTION_TYPES.SLY_DEAL && targetPlayerId && targetCardId) {
      if (checkForJustSayNo(targetPlayerId, 'Sly Deal')) {
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }

      setPlayers(prev => {
        const newPlayers = [...prev];
        const thief = { ...newPlayers[currentTurnIndex] };
        const victimIdx = newPlayers.findIndex(p => p.id === targetPlayerId);
        const victim = { ...newPlayers[victimIdx] };
        
        const stolenCard = victim.properties.find(c => c.id === targetCardId);
        if (stolenCard) {
          victim.properties = victim.properties.filter(c => c.id !== targetCardId);
          thief.properties = [...thief.properties, stolenCard];
          thief.hand = thief.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = thief;
          newPlayers[victimIdx] = victim;
        }
        return newPlayers;
      });
      
      setMatchLog(prev => [{
        id: Date.now(), player: currentPlayer.name, action: 'SLY_DEAL',
        message: `stole a property`, card: card
      }, ...prev]);
      
      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      return;
    }

    // Handle Deal Breaker: Steal a full set
    if (card.actionType === ACTION_TYPES.DEAL_BREAKER && targetPlayerId && targetCardId) {
      if (checkForJustSayNo(targetPlayerId, 'Deal Breaker')) {
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }

      setPlayers(prev => {
        const newPlayers = [...prev];
        const thief = { ...newPlayers[currentTurnIndex] };
        const victimIdx = newPlayers.findIndex(p => p.id === targetPlayerId);
        const victim = { ...newPlayers[victimIdx] };
        
        const targetCard = victim.properties.find(c => c.id === targetCardId);
        if (targetCard) {
          const targetColor = targetCard.currentColor || targetCard.color;
          const stolenCards = victim.properties.filter(c => (c.currentColor || c.color) === targetColor);
          
          victim.properties = victim.properties.filter(c => (c.currentColor || c.color) !== targetColor);
          thief.properties = [...thief.properties, ...stolenCards];
          thief.hand = thief.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = thief;
          newPlayers[victimIdx] = victim;
        }
        return newPlayers;
      });
      
      setMatchLog(prev => [{
        id: Date.now(), player: currentPlayer.name, action: 'DEAL_BREAKER',
        message: `stole a complete set`, card: card
      }, ...prev]);
      
      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      return;
    }

    // Handle Forced Deal: Swap properties
    if (card.actionType === ACTION_TYPES.FORCED_DEAL && targetPlayerId && targetCardId) {
      if (checkForJustSayNo(targetPlayerId, 'Forced Deal')) {
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }

      setPlayers(prev => {
        const newPlayers = [...prev];
        const swapper = { ...newPlayers[currentTurnIndex] };
        const victimIdx = newPlayers.findIndex(p => p.id === targetPlayerId);
        const victim = { ...newPlayers[victimIdx] };
        
        const myProp = swapper.properties.find(p => p.id === destination) || swapper.properties[0];
        const theirProp = victim.properties.find(p => p.id === targetCardId);
        
        if (myProp && theirProp) {
          swapper.properties = swapper.properties.filter(p => p.id !== myProp.id);
          victim.properties = victim.properties.filter(p => p.id !== theirProp.id);
          swapper.properties.push(theirProp);
          victim.properties.push(myProp);
          swapper.hand = swapper.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = swapper;
          newPlayers[victimIdx] = victim;
        }
        return newPlayers;
      });
      
      setMatchLog(prev => [{
        id: Date.now(), player: currentPlayer.name, action: 'FORCED_DEAL',
        message: `swapped properties`, card: card
      }, ...prev]);
      
      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      return;
    }

    // Handle Double Rent
    if (card.actionType === ACTION_TYPES.DOUBLE_RENT) {
      setDoubleRentActive(true);
      setPlayers(prev => {
        const newPlayers = [...prev];
        const p = { ...newPlayers[currentTurnIndex] };
        p.hand = p.hand.filter(c => c.id !== cardId);
        newPlayers[currentTurnIndex] = p;
        return newPlayers;
      });
      setMatchLog(prev => [{
        id: Date.now(), player: currentPlayer.name, action: 'DOUBLE_RENT',
        message: 'activated Double Rent', card: card
      }, ...prev]);
      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      return;
    }

    // Handle House/Hotel Validation
    if (card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL) {
      const charger = players[currentTurnIndex];
      const sets = getSets(charger.properties);
      const targetColor = targetCardId; 
      const targetSet = sets.find(s => s.color === targetColor);
      
      if (!targetSet || !targetSet.isComplete) {
        console.error('Cannot play building: Set is not complete!');
        return;
      }
      
      if (card.actionType === ACTION_TYPES.HOTEL && targetSet.houses === 0) {
        console.error('Cannot play Hotel: Must have a House first!');
        return;
      }
    }

    // Update Players State
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[currentTurnIndex] };
      
      // Remove played card
      player.hand = player.hand.filter(c => c.id !== cardId);

      // Add drawn cards (for Pass Go)
      if (drawnCards.length > 0) {
        player.hand = [...player.hand, ...drawnCards];
      }

      const playedCard = { ...card };
      // Handle different destinations
      if (destination === 'BANK') {
        player.bank = [...player.bank, playedCard];
      } else if (destination === 'PROPERTIES') {
        const color = playedCard.currentColor || playedCard.color;
        // For buildings, targetCardId is the color set they are being added to
        if (playedCard.actionType === ACTION_TYPES.HOUSE || playedCard.actionType === ACTION_TYPES.HOTEL) {
           playedCard.color = targetCardId;
        }
        player.properties = [...player.properties, playedCard];
      }
      // 'DISCARD' is handled separately below

      newPlayers[currentTurnIndex] = player;
      
      // Check for win condition
      const completeSets = countCompleteSets(player.properties);
      if (completeSets >= 3) {
        setWinner(player);
        setGameState('GAME_OVER');
      }

      return newPlayers;
    });

    // Handle Discard Pile
    // Handle Discard Pile
    if (destination === 'DISCARD') {
      setDiscardPile(p => [...p, card]);
    }

    // Add to Match Log
    setMatchLog(prev => {
      let message = '';
      let type = 'PLAY';
      
      if (destination === 'BANK') {
        if (card.type === CARD_TYPES.MONEY) {
          message = `banked $${card.value}M`;
        } else {
          message = `banked ${card.name} ($${card.value}M)`;
        }
        type = 'BANK';
      } else if (destination === 'PROPERTIES') {
        message = `played ${card.name}`;
        type = 'PROPERTY';
      } else if (destination === 'DISCARD') {
         // Could be an action card played to discard or play-as-money event maybe? 
         // Usually action cards go to discard after effect
         if (card.actionType === ACTION_TYPES.PASS_GO) {
             message = `played Pass Go (Drew 2 cards)`;
             type = 'ACTION';
         } else {
             message = `played ${card.name}`; // Generic action
             type = 'ACTION';
         }
      }

      return [{
        id: Date.now(),
        player: currentPlayer.name,
        action: type,
        card: card,
        message: message
      }, ...prev];
    });

    setMovesLeft(m => m - 1);
  }, [currentTurnIndex, movesLeft, deck, players]);

  /**
   * End turn
   */
  const endTurn = useCallback(() => {
    const turningPlayerIndex = currentTurnIndex;
    
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[turningPlayerIndex] };

      // Rule: Hand limit 7 cards at end of turn
      if (player.hand && player.hand.length > 7) {
        const sorted = [...player.hand].sort((a, b) => (a.value || 0) - (b.value || 0));
        const toDiscard = sorted.slice(0, player.hand.length - 7);
        player.hand = sorted.slice(player.hand.length - 7);
        setDiscardPile(p => [...p, ...toDiscard]);
        newPlayers[turningPlayerIndex] = player;
      }

      return newPlayers;
    });

    // Reset for next player
    const nextIndex = (turningPlayerIndex + 1) % playerCount;
    setCurrentTurnIndex(nextIndex);
    setMovesLeft(0);
    setHasDrawnThisTurn(false);
    setGameState('DRAW');

    setMatchLog(prev => [{
      id: Date.now(),
      player: players[turningPlayerIndex].name,
      action: 'END_TURN',
      message: 'ended their turn'
    }, ...prev]);
  }, [currentTurnIndex, playerCount, players]);

  /**
   * Bot turn automation
   */
  useEffect(() => {
    if (gameState === 'GAME_OVER') return;
    
    const currentPlayer = players[currentTurnIndex];
    if (!currentPlayer || currentPlayer.isHuman) return;

    const bot = botsRef.current[currentTurnIndex];
    if (!bot) return;

    let timerId;

    // Bot draws
    if (gameState === 'DRAW' && !hasDrawnThisTurn) {
      timerId = setTimeout(() => drawCards(), 1000);
    }

    // Bot plays
    else if (gameState === 'PLAYING' && movesLeft > 0) {
      timerId = setTimeout(() => {
        const decision = bot.decideMove(currentPlayer.hand, {
          players,
          currentPlayerIndex: currentTurnIndex,
        });

        if (decision.action === 'PLAY_PROPERTY' && decision.card) {
          playCard(decision.card.id, 'PROPERTIES');
        } else if (decision.action === 'BANK' && decision.card) {
          playCard(decision.card.id, 'BANK');
        } else if (decision.action === 'PLAY_ACTION' && decision.card) {
          // Determine parameters based on action type
          const targetId = decision.target?.id || null;
          const targetCardId = decision.targetCard?.id || null;
          
          // For rent cards, decision.targetCard might be the color string or a representative card
          let rentColor = targetCardId;
          if (decision.card.type === CARD_TYPES.RENT) {
             // If bot didn't specify color, pick one they have a set for
             if (!rentColor) {
               const sets = countCompleteSets(currentPlayer.properties); // This helper is basic, but let's assume decision includes color
               // Actually, let's just pick first color from their properties
               const firstProp = currentPlayer.properties[0];
               rentColor = firstProp ? (firstProp.currentColor || firstProp.color) : null;
             }
          }

          playCard(decision.card.id, 'DISCARD', targetId, rentColor || targetCardId);
        } else if (decision.action === 'END_TURN') {
          endTurn();
        }
      }, 1500);
    }

    // Bot ends turn when out of moves
    else if (gameState === 'PLAYING' && movesLeft === 0) {
      timerId = setTimeout(() => endTurn(), 1000);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [gameState, currentTurnIndex, hasDrawnThisTurn, movesLeft, players]);

  /**
   * Confirm manual payment (human)
   */
  const confirmPayment = useCallback((paymentCards) => {
    if (!pendingRequest) return;

    setPlayers(prev => {
      const newPlayers = [...prev];
      const victimIdx = newPlayers.findIndex(p => p.id === pendingRequest.targetId);
      const requesterIdx = newPlayers.findIndex(p => p.id === pendingRequest.requesterId);
      
      if (victimIdx === -1 || requesterIdx === -1) return prev;
      
      const victim = { ...newPlayers[victimIdx] };
      const requester = { ...newPlayers[requesterIdx] };
      
      const paymentIds = paymentCards.map(c => c.id);
      
      // Transfer cards
      victim.bank = (victim.bank || []).filter(c => !paymentIds.includes(c.id));
      victim.properties = (victim.properties || []).filter(c => !paymentIds.includes(c.id));
      const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
      const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
      requester.bank = [...(requester.bank || []), ...paysMoney];
      requester.properties = [...(requester.properties || []), ...paysProp];
      
      // If it was the requester's turn and they played a card, remove it from hand if not already done
      if (pendingRequest.cardId) {
        requester.hand = (requester.hand || []).filter(c => c.id !== pendingRequest.cardId);
      }
      
      newPlayers[victimIdx] = victim;
      newPlayers[requesterIdx] = requester;
      return newPlayers;
    });

    setGameState('PLAYING');
    setPendingRequest(null);
  }, [pendingRequest]);

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
    matchLog,
    pendingRequest,

    // Actions
    startGame,
    drawCards,
    playCard,
    endTurn,
    flipWildCard: useCallback((cardId) => {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const player = { ...newPlayers[currentTurnIndex] };
        
        const cardIndex = player.properties.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return prev; // Card not found
        
        const card = { ...player.properties[cardIndex] };
        
        // Handle Dual Color Wild Logic
        if (card.colors && card.colors.length === 2) {
           const nextColor = card.colors.find(c => c !== card.currentColor) || card.colors[0];
           card.currentColor = nextColor;
           
           // Update state
           player.properties = [...player.properties];
           player.properties[cardIndex] = card;
           newPlayers[currentTurnIndex] = player;
           
           // Log it
           setMatchLog(old => [{
             id: Date.now(),
             player: player.name,
             action: 'FLIP',
             message: `flipped ${card.name} to ${COLORS[nextColor]?.name || nextColor}`,
             card: card
           }, ...old]);
           
           return newPlayers;
        }
        
        return prev;
      });
    }, [currentTurnIndex]),
    discardCards: useCallback((cardIds) => {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const player = { ...newPlayers[currentTurnIndex] };
        
        const discarded = player.hand.filter(c => cardIds.includes(c.id));
        player.hand = player.hand.filter(c => !cardIds.includes(c.id));
        
        setDiscardPile(p => [...p, ...discarded]);
        newPlayers[currentTurnIndex] = player;
        return newPlayers;
      });
      
      setMatchLog(prev => [{
        id: Date.now(),
        player: players[currentTurnIndex].name,
        action: 'DISCARD',
        message: `discarded ${cardIds.length} cards`
      }, ...prev]);
    }, [currentTurnIndex, players]),
    confirmPayment,
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
