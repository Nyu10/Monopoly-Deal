import { useState, useCallback, useEffect, useRef } from 'react';
import { generateOfficialDeck, shuffleDeck } from '../utils/deckGenerator';
import { getSets, countCompleteSets } from '../utils/gameHelpers';
import { CARD_TYPES, ACTION_TYPES, GAME_RULES, COLORS } from '../constants';
import { createBot, BOT_DIFFICULTY } from '../ai/BotEngine';
import { calculateOptimalPayment } from '../utils/paymentCalculator';
import CARD_BACK_STYLES from '../utils/cardBackStyles';

/**
 * Custom hook for managing local bot game state
 * This handles the full game logic without needing a backend
 */
export const useLocalGameState = (playerCount = 4, botDifficulty = BOT_DIFFICULTY.MEDIUM, initialState = null, isMultiplayer = false) => {
  const [gameState, setGameState] = useState(initialState?.gameState || 'SETUP');
  const [deck, setDeck] = useState(initialState?.deck || []);
  const [discardPile, setDiscardPile] = useState(initialState?.discardPile || []);
  const [players, setPlayers] = useState(initialState?.players || []);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(initialState?.currentTurnIndex || 0);
  const [movesLeft, setMovesLeft] = useState(initialState?.movesLeft || 0);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(initialState?.hasDrawnThisTurn || false);
  const [winner, setWinner] = useState(initialState?.winner || null);
  const [lastRentParams, setLastRentParams] = useState(null); // { amount, targets, card }
  const [pendingRequest, setPendingRequest] = useState(null); // { type, amount, requesterId, targetId, ... }
  const [matchLog, setMatchLog] = useState(initialState?.matchLog || []); 
  
  const botsRef = useRef([]);
  const playersRef = useRef(players); // Keep a ref for internal logic checks without dependency loops
  const isEndingTurnRef = useRef(false); // Prevent duplicate end turn calls

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  /**
   * Helper: Clean up orphaned buildings (Houses/Hotels)
   * If a set is no longer complete, buildings must be moved to the bank.
   */
  const cleanupBuildings = useCallback((player) => {
    const updatedPlayer = { ...player };
    const props = updatedPlayer.properties || [];
    const sets = {};
    
    // Group to check completion
    props.forEach(card => {
      const color = card.currentColor || card.color;
      if (!color) return;
      if (!sets[color]) sets[color] = { props: [], buildings: [] };
      if (card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL) {
        sets[color].buildings.push(card);
      } else {
        sets[color].props.push(card);
      }
    });

    const toBank = [];
    const remainingProps = [];

    Object.entries(sets).forEach(([color, info]) => {
      const colorData = COLORS[color];
      const isComplete = colorData && info.props.length >= colorData.count;
      
      if (!isComplete && info.buildings.length > 0) {
        // Move buildings to bank
        toBank.push(...info.buildings);
        remainingProps.push(...info.props);
      } else {
        remainingProps.push(...info.props, ...info.buildings);
      }
    });

    updatedPlayer.properties = remainingProps;
    updatedPlayer.bank = [...(updatedPlayer.bank || []), ...toBank];
    return updatedPlayer;
  }, []);

  /**
   * Winner Check Effect
   * Monitors players state and sets the winner if anyone reaches the goal.
   */
  useEffect(() => {
    if (gameState === 'GAME_OVER' || winner) return;

    const winningPlayer = players.find(p => {
      const completeSets = countCompleteSets(p.properties);
      return completeSets >= GAME_RULES.COMPLETE_SETS_TO_WIN;
    });

    if (winningPlayer) {
      setWinner(winningPlayer);
      setGameState('GAME_OVER');
      
      setMatchLog(prev => [{
        id: Date.now(),
        player: 'System',
        action: 'GAME_OVER',
        message: `${winningPlayer.name} HAS WON THE GAME!`
      }, ...prev]);
    }
  }, [players, gameState, winner]);

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
        name: isMultiplayer ? `Player ${i + 1}` : (i === 0 ? 'You' : `Bot ${i}`),
        isHuman: isMultiplayer ? true : (i === 0),        hand: [],
        bank: [],
        properties: [],
      });
    }

    // Deal initial hands
    for (let i = 0; i < GAME_RULES.STARTING_HAND_SIZE; i++) {
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

    // Helper to safely draw cards (with reshuffling)
    const drawFromDeck = (count, currentDeck, currentDiscard) => {
      let drawn = [];
      let deckCopy = [...currentDeck];
      let discardCopy = [...currentDiscard];

      for (let i = 0; i < count; i++) {
        if (deckCopy.length === 0) {
          if (discardCopy.length === 0) break; // Truly out of cards
          // Reshuffle discard into deck
          deckCopy = shuffleDeck(discardCopy);
          discardCopy = [];
          
          setMatchLog(prev => [{
            id: Date.now(),
            player: 'System',
            action: 'RESHUFFLE',
            message: 'Deck empty! Reshuffling discard pile...'
          }, ...prev]);
        }
        drawn.push(deckCopy.pop());
      }
      return { drawn, newDeck: deckCopy, newDiscard: discardCopy };
    };

    const currentPlayerIndexRef = currentTurnIndex;
    const currentPlayer = players[currentPlayerIndexRef];
    const drawCount = (currentPlayer.hand && currentPlayer.hand.length === 0) 
      ? GAME_RULES.EMPTY_HAND_DRAW_COUNT 
      : GAME_RULES.NORMAL_DRAW_COUNT;
    
    const { drawn, newDeck, newDiscard } = drawFromDeck(drawCount, deck, discardPile);

    setDeck(newDeck);
    setDiscardPile(newDiscard);
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[currentPlayerIndexRef] };
      player.hand = [...(player.hand || []), ...drawn];
      newPlayers[currentPlayerIndexRef] = player;
      return newPlayers;
    });

    setHasDrawnThisTurn(true);
    setMovesLeft(GAME_RULES.MAX_ACTIONS_PER_TURN);
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

    // RESET COMBO: If a player does anything other than play Double Rent, the Rent combo window closes.
    if (card.actionType !== ACTION_TYPES.DOUBLE_RENT) {
      setLastRentParams(null);
    }

    // VALIDATION: Property cards cannot be banked
    if (destination === 'BANK') {
      // Standard Property cards cannot be banked.
      // BUT Wild Properties, Houses, and Hotels CAN be banked as money cards.
      if (card.type === CARD_TYPES.PROPERTY) {
        console.error('Standard Property cards cannot be banked! They must be played to your property area.');
        setMatchLog(prev => [{
          id: Date.now(),
          player: 'System',
          action: 'ERROR',
          message: 'Property cards cannot be banked!'
        }, ...prev]);
        setMovesLeft(m => m - 1); // Safety: Burn a move
        return; 
      }
    }

    // Handle Pass Go Action: Draw 2 cards
    let drawnCards = [];
    if (card.actionType === ACTION_TYPES.PASS_GO) {
      // Inline draw with reshuffle logic
      let deckCopy = [...deck];
      let discardCopy = [...discardPile];
      
      for (let i = 0; i < 2; i++) {
        if (deckCopy.length === 0) {
          if (discardCopy.length === 0) break;
          deckCopy = shuffleDeck(discardCopy);
          discardCopy = [];
          setMatchLog(prev => [{
            id: Date.now(), player: 'System', action: 'RESHUFFLE', message: 'Reshuffling deck...'
          }, ...prev]);
        }
        drawnCards.push(deckCopy.pop());
      }
      setDeck(deckCopy);
      setDiscardPile(discardCopy);
    }

    // Handle Debt Collector: Collect $5M from target player
    if (card.actionType === ACTION_TYPES.DEBT_COLLECTOR && targetPlayerId) {
      if (checkForJustSayNo(targetPlayerId, 'Debt Collector')) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const player = { ...newPlayers[currentTurnIndex] };
          player.hand = player.hand.filter(c => c.id !== cardId);
          newPlayers[currentTurnIndex] = player;
          return newPlayers;
        });
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }
      
      const targetPlayer = players.find(p => p.id === targetPlayerId);
      if (targetPlayer) {
        const availableCards = [...(targetPlayer.bank || []), ...(targetPlayer.properties || [])];
        
        if (targetPlayer.isHuman && availableCards.length > 0) {
          // Human needs to choose payment
          setPendingRequest({
            type: 'DEBT',
            amount: GAME_RULES.DEBT_COLLECTOR_AMOUNT,
            requesterId: currentPlayer.id,
            targetId: targetPlayerId,
            cardId: cardId,
            card: card
          });
          setGameState('REQUEST_PAYMENT');
          
          setMatchLog(prev => [{
            id: Date.now(), player: currentPlayer.name, action: 'DEBT_COLLECTOR',
            message: `demanded $5M from ${targetPlayer.name}`, card: card
          }, ...prev]);
          
          return;
        }

        if (targetPlayer.isHuman && availableCards.length === 0) {
          setMatchLog(prev => [{
            id: Date.now(), player: 'System', action: 'INFO',
            message: `${targetPlayer.name} had no assets to pay ${currentPlayer.name}'s Debt Collector!`
          }, ...prev]);
          // Proceed to bot-like logic (which will handle 0 cards correctly)
        }

        const paymentCards = calculateOptimalPayment(availableCards, GAME_RULES.DEBT_COLLECTOR_AMOUNT, targetPlayer.properties);
        const paymentIds = paymentCards.map(c => c.id);
        const paymentSummary = paymentCards.length > 0 
          ? paymentCards.map(c => c.name || `$${c.value}M`).join(', ') 
          : 'nothing';

        setPlayers(prev => {
          const newPlayers = [...prev];
          const receiver = { ...newPlayers[currentTurnIndex] };
          const victimIdx = newPlayers.findIndex(p => p.id === targetPlayerId);
          const victim = { ...newPlayers[victimIdx] };
          
          victim.bank = (victim.bank || []).filter(c => !paymentIds.includes(c.id));
          victim.properties = (victim.properties || []).filter(c => !paymentIds.includes(c.id));
          const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
          const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
          receiver.bank = [...(receiver.bank || []), ...paysMoney];
          receiver.properties = [...(receiver.properties || []), ...paysProp];
          receiver.hand = receiver.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = cleanupBuildings(receiver);
          newPlayers[victimIdx] = cleanupBuildings(victim);
          return newPlayers;
        });
        
        setMatchLog(prev => [{
          id: Date.now(), player: currentPlayer.name, action: 'DEBT_COLLECTOR',
          message: `collected ${paymentSummary} from ${targetPlayer.name}`, card: card
        }, ...prev]);
        
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }
    }

    // Handle Birthday: Collect $2M from all other players
    if (card.actionType === ACTION_TYPES.BIRTHDAY) {
      const birthdayPayments = [];
      const newPlayersState = [...players];
      const receiverIdx = currentTurnIndex;
      const receiver = { ...newPlayersState[receiverIdx] };
      receiver.hand = receiver.hand.filter(c => c.id !== cardId);
      newPlayersState[receiverIdx] = receiver;

      players.forEach((player, idx) => {
        if (idx === receiverIdx) return;
        
        // Handle Human Interaction: Set pending request for human players
        if (player.isHuman) {
          const availableCards = [...(player.bank || []), ...(player.properties || [])];
          if (availableCards.length > 0) {
            setPendingRequest({
              type: 'BIRTHDAY',
              amount: GAME_RULES.BIRTHDAY_AMOUNT_PER_PLAYER,
              requesterId: currentPlayer.id,
              targetId: player.id,
              cardId: cardId,
              card: card
            });
            setGameState('REQUEST_PAYMENT');
            birthdayPayments.push({ player: player.name, note: 'pending payment...' });
            return;
          }
          if (availableCards.length === 0) {
            birthdayPayments.push({ player: player.name, note: 'had no assets' });
            return;
          }
        }

        // Handle Bots: Auto-calculate and check for Just Say No
        // Check hand for JSN locally on the player object from the current state iteration
        const jsnCard = player.hand.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);
        if (jsnCard) {
          birthdayPayments.push({ player: player.name, note: 'said NO!' });
          const victim = { ...newPlayersState[idx] };
          victim.hand = victim.hand.filter(c => c.id !== jsnCard.id);
          newPlayersState[idx] = victim;
          setDiscardPile(prev => [...prev, jsnCard]);
          return;
        }

        const availableCards = [...(player.bank || []), ...(player.properties || [])];
        const paymentCards = calculateOptimalPayment(availableCards, GAME_RULES.BIRTHDAY_AMOUNT_PER_PLAYER, player.properties);
        const paymentIds = paymentCards.map(c => c.id);
        
        const victim = { ...newPlayersState[idx] };
        victim.bank = (victim.bank || []).filter(c => !paymentIds.includes(c.id));
        victim.properties = (victim.properties || []).filter(c => !paymentIds.includes(c.id));
        newPlayersState[idx] = victim;

        const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
        const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
        receiver.bank = [...(receiver.bank || []), ...paysMoney];
        receiver.properties = [...(receiver.properties || []), ...paysProp];
        
        birthdayPayments.push({ 
          player: player.name, 
          cards: paymentCards.map(c => c.name || `$${c.value}M`) 
        });
      });

      // Update state with bot payments (Human payment is handled later via confirmPayment)
      setPlayers(prev => {
         const updatedPlayers = [...newPlayersState];
         // Apply cleanup to all affected players
         updatedPlayers.forEach((p, idx) => {
           updatedPlayers[idx] = cleanupBuildings(updatedPlayers[idx]);
         });
         return updatedPlayers;
      });
      
      const paymentSummary = birthdayPayments
        .map(p => `${p.player}: ${p.note || (p.cards.length > 0 ? p.cards.join(', ') : 'nothing')}`)
        .join('; ');

      setMatchLog(prev => [{
        id: Date.now(), player: currentPlayer.name, action: 'BIRTHDAY',
        message: `collected from everyone: ${paymentSummary}`, card: card
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
      
      // Calculate effective properties (accounting for intended color usage)
      let effectiveProperties = charger.properties;
      
      // If we provided a target color, we should treat any wild cards of that color 
      // as currently being that color for the purpose of rent calculation.
      // This solves the issue where a player flips a card and plays rent immediately.
      if (selectedColor) {
        effectiveProperties = charger.properties.map(p => {
          if ((p.type === CARD_TYPES.PROPERTY_WILD || p.isRainbow) && 
               p.colors && p.colors.includes(selectedColor)) {
            return { ...p, currentColor: selectedColor };
          }
          return p;
        });
      }
      
      const sets = getSets(effectiveProperties);
      
      if (card.type === CARD_TYPES.RENT_WILD) {
        // For Rainbow Rent, we use the effective properties too, but we might want to be smarter? 
        // Usually Rainbow rent is played on a specific color chosen by User. 
        // If targetCardId is provided, we use that. If not (generic play), we find max.
        if (selectedColor) {
           const set = sets.find(s => s.color === selectedColor);
           rentAmount = set ? set.rent : 0;
           // If the user selected a color, we should respect it even for Rainbow Rent if valid.
        } else {
           const maxRentSet = sets.reduce((max, set) => (set.rent > (max?.rent || 0) ? set : max), null);
           rentAmount = maxRentSet ? maxRentSet.rent : 0;
        }
      } else {
        const set = sets.find(s => s.color === selectedColor);
        rentAmount = set ? set.rent : 0;
      }

      if (rentAmount > 0) {
        const targetPlayers = targetPlayerId 
          ? [players.find(p => p.id === targetPlayerId)] 
          : players.filter((p, i) => i !== currentTurnIndex);

        targetPlayers.forEach(target => {
          if (!target) return;
          
          if (checkForJustSayNo(target.id, 'Rent')) {
            rentPayments.push({ player: target.name, note: 'said NO!' });
            // Ensure hand is updated in our local state too (to sync with JSN hook effect)
            const jsnCard = target.hand.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);
            if (jsnCard) {
               const targetIdx = newPlayersState.findIndex(p => p.id === target.id);
               const victim = { ...newPlayersState[targetIdx] };
               victim.hand = victim.hand.filter(c => c.id !== jsnCard.id);
               newPlayersState[targetIdx] = victim;
            }
            return;
          }

          const availableCards = [...(target.bank || []), ...(target.properties || [])];
          if (target.isHuman && availableCards.length > 0) {
             setPendingRequest({
               type: 'RENT',
               amount: rentAmount,
               requesterId: charger.id,
               targetId: target.id,
               cardId: cardId,
               card: card
             });
             setGameState('REQUEST_PAYMENT');
             rentPayments.push({ player: target.name, note: 'pending payment...' });
             return;
          }

          if (target.isHuman && availableCards.length === 0) {
             rentPayments.push({ player: target.name, note: 'had no assets' });
             return; 
          }

          const targetIdx = newPlayersState.findIndex(p => p.id === target.id);
          const payer = { ...newPlayersState[targetIdx] };
          
          const paymentCards = calculateOptimalPayment(availableCards, rentAmount, target.properties);
          const paymentIds = paymentCards.map(c => c.id);
          
          payer.bank = (payer.bank || []).filter(c => !paymentIds.includes(c.id));
          payer.properties = (payer.properties || []).filter(c => !paymentIds.includes(c.id));
          newPlayersState[targetIdx] = payer;

          const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
          const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
          const currentReceiver = newPlayersState[receiverIdx]; // Refresh current receiver state
          currentReceiver.bank = [...(currentReceiver.bank || []), ...paysMoney];
          currentReceiver.properties = [...(currentReceiver.properties || []), ...paysProp];
          newPlayersState[receiverIdx] = currentReceiver;
          
          rentPayments.push({ 
            player: target.name, 
            cards: paymentCards.map(c => c.name || `$${c.value}M`) 
          });
        });
      }

      setPlayers(prev => {
         const updatedPlayers = [...newPlayersState];
         // Run cleanup on all players
         updatedPlayers.forEach((p, idx) => {
           updatedPlayers[idx] = cleanupBuildings(updatedPlayers[idx]);
         });
         return updatedPlayers;
      });

      const paymentSummary = rentPayments.length > 0 
        ? rentPayments.map(p => `${p.player}: ${p.note || (p.cards && p.cards.length > 0 ? p.cards.join(', ') : 'nothing')}`).join('; ')
        : 'No rent collected (0 value or no targets)';

      setMatchLog(prev => [{
        id: Date.now(), player: charger.name, action: 'RENT',
        message: `charged $${rentAmount}M rent. Payments: ${paymentSummary}`, card: card
      }, ...prev]);

      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      
      // Store rent params for potential Double Rent combo
      setLastRentParams({ 
        amount: rentAmount, 
        targetPlayerId: targetPlayerId || null, 
        cardId, 
        turnIndex: currentTurnIndex 
      });
      return;
    }

    // Handle Sly Deal: Steal 1 property (non-set)
    if (card.actionType === ACTION_TYPES.SLY_DEAL) {
      // Validation: Ensure targets are provided
      if (!targetPlayerId || !targetCardId) {
        console.error('Sly Deal Error: Missing target information', { targetPlayerId, targetCardId });
        setMatchLog(prev => [{
            id: Date.now(), player: 'System', action: 'ERROR',
            message: 'Sly Deal failed: No target selected.'
        }, ...prev]);
        return;
      }

      // Check for Just Say No
      if (checkForJustSayNo(targetPlayerId, 'Sly Deal')) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const player = { ...newPlayers[currentTurnIndex] };
          // Remove card from hand as it was played
          player.hand = player.hand.filter(c => c.id !== cardId);
          newPlayers[currentTurnIndex] = player;
          return newPlayers;
        });
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }

      // Execute Steal
      const victimIdx = players.findIndex(p => p.id === targetPlayerId);
      const victim = players[victimIdx];
      const stolenCard = victim?.properties.find(c => c.id === targetCardId);

      if (victim && stolenCard) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const thief = { ...newPlayers[currentTurnIndex] };
          const vic = { ...newPlayers[victimIdx] };
          
          vic.properties = vic.properties.filter(c => c.id !== targetCardId);
          thief.properties = [...thief.properties, stolenCard];
          thief.hand = thief.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = cleanupBuildings(thief);
          newPlayers[victimIdx] = cleanupBuildings(vic);
          return newPlayers;
        });
        
        setMatchLog(prev => [{
          id: Date.now(), player: currentPlayer.name, action: 'SLY_DEAL',
          message: `stole ${stolenCard.name} from ${victim.name}`, card: card
        }, ...prev]);
        
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
      } else {
        // Error handling if card/victim not found
        console.error('Sly Deal Error: Card not found on victim', { 
            victimName: victim?.name, 
            targetCardId, 
            victimProps: victim?.properties?.map(p => p.id) 
        });
        setMatchLog(prev => [{
           id: Date.now(), player: 'System', action: 'ERROR',
           message: `Sly Deal failed: Could not find card on ${victim?.name || 'unknown'}.`
        }, ...prev]);
      }
      return;
    }

    // Handle Deal Breaker: Steal a full set
    if (card.actionType === ACTION_TYPES.DEAL_BREAKER && targetPlayerId && targetCardId) {
      if (checkForJustSayNo(targetPlayerId, 'Deal Breaker')) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const player = { ...newPlayers[currentTurnIndex] };
          player.hand = player.hand.filter(c => c.id !== cardId);
          newPlayers[currentTurnIndex] = player;
          return newPlayers;
        });
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }

      const victimIdx = players.findIndex(p => p.id === targetPlayerId);
      const victim = players[victimIdx];
      const targetCard = victim?.properties.find(c => c.id === targetCardId);

      if (victim && targetCard) {
        const targetColor = targetCard.currentColor || targetCard.color;
        const stolenCards = victim.properties.filter(c => (c.currentColor || c.color) === targetColor);

        setPlayers(prev => {
          const newPlayers = [...prev];
          const thief = { ...newPlayers[currentTurnIndex] };
          const vic = { ...newPlayers[victimIdx] };
          
          vic.properties = vic.properties.filter(c => (c.currentColor || c.color) !== targetColor);
          thief.properties = [...thief.properties, ...stolenCards];
          thief.hand = thief.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = cleanupBuildings(thief);
          newPlayers[victimIdx] = cleanupBuildings(vic);
          return newPlayers;
        });
        
        setMatchLog(prev => [{
          id: Date.now(), player: currentPlayer.name, action: 'DEAL_BREAKER',
          message: `stole a complete ${targetColor.replace('_', ' ')} set from ${victim.name}`, card: card
        }, ...prev]);
        
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
      }
      return;
    }

    // Handle Forced Deal: Swap properties
    if (card.actionType === ACTION_TYPES.FORCED_DEAL && targetPlayerId && targetCardId) {
      if (checkForJustSayNo(targetPlayerId, 'Forced Deal')) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const player = { ...newPlayers[currentTurnIndex] };
          player.hand = player.hand.filter(c => c.id !== cardId);
          newPlayers[currentTurnIndex] = player;
          return newPlayers;
        });
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
        return;
      }

      const victimIdx = players.findIndex(p => p.id === targetPlayerId);
      const victim = players[victimIdx];
      const myProp = currentPlayer.properties.find(p => p.id === destination) || currentPlayer.properties[0];
      const theirProp = victim?.properties.find(p => p.id === targetCardId);

      if (victim && myProp && theirProp) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const swapper = { ...newPlayers[currentTurnIndex] };
          const vic = { ...newPlayers[victimIdx] };
          
          swapper.properties = swapper.properties.filter(p => p.id !== myProp.id);
          vic.properties = vic.properties.filter(p => p.id !== theirProp.id);
          swapper.properties.push(theirProp);
          vic.properties.push(myProp);
          swapper.hand = swapper.hand.filter(c => c.id !== cardId);
          
          newPlayers[currentTurnIndex] = cleanupBuildings(swapper);
          newPlayers[victimIdx] = cleanupBuildings(vic);
          return newPlayers;
        });
        
        setMatchLog(prev => [{
          id: Date.now(), player: currentPlayer.name, action: 'FORCED_DEAL',
          message: `swapped ${myProp.name} for ${theirProp.name} with ${victim.name}`, card: card
        }, ...prev]);
        
        setDiscardPile(p => [...p, card]);
        setMovesLeft(m => m - 1);
      }
      return;
    }

    // Handle Double Rent
    if (card.actionType === ACTION_TYPES.DOUBLE_RENT) {
      if (!lastRentParams || lastRentParams.turnIndex !== currentTurnIndex) {
        console.warn('Double Rent played without a preceding Rent card!');
        setMatchLog(prev => [{
          id: Date.now(), player: currentPlayer.name, action: 'ERROR',
          message: 'Double Rent must be played immediately after a Rent card!'
        }, ...prev]);
        return; // Do not consume move? Or consume and fail? Let's consume to prevent loops. 
        // Actually, better to just return and let user try again.
        // But for Bots, this might hang if we don't consume? 
        // Bots shouldn't play it unless allowed. 
        // Let's consume move to be safe against bad plays.
      }

      const { amount, targetPlayerId: originalTargetId } = lastRentParams;
      const rentAmount = amount; // Double it by charging again

      // Execute Charge (Re-using Rent Logic simplified)
      const rentPayments = [];
      const newPlayersState = [...players];
      const receiverIdx = currentTurnIndex;
      let receiver = { ...newPlayersState[receiverIdx] };
      
      // Remove played Double Rent card
      receiver.hand = receiver.hand.filter(c => c.id !== cardId);
      newPlayersState[receiverIdx] = receiver;

      if (rentAmount > 0) {
        const targetPlayers = originalTargetId 
          ? [players.find(p => p.id === originalTargetId)] 
          : players.filter((p, i) => i !== currentTurnIndex);

        targetPlayers.forEach(target => {
          if (!target) return;
          
          if (checkForJustSayNo(target.id, 'Double Rent')) {
            rentPayments.push({ player: target.name, note: 'said NO!' });
            // JSN logic handles hand update
             const jsnCard = target.hand.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);
             if (jsnCard) {
                const targetIdx = newPlayersState.findIndex(p => p.id === target.id);
                const victim = { ...newPlayersState[targetIdx] };
                victim.hand = victim.hand.filter(c => c.id !== jsnCard.id);
                newPlayersState[targetIdx] = victim;
             }
            return;
          }

          const availableCards = [...(target.bank || []), ...(target.properties || [])];
          
          // Human Interaction Check
          if (target.isHuman && availableCards.length > 0) {
             setPendingRequest({
               type: 'RENT_DOUBLED', // Distinct type for UI context
               amount: rentAmount,
               requesterId: currentPlayer.id,
               targetId: target.id,
               cardId: cardId, // This is the Double Rent card
               card: card
             });
             setGameState('REQUEST_PAYMENT');
             rentPayments.push({ player: target.name, note: 'pending payment...' });
             return;
          }

          if (target.isHuman && availableCards.length === 0) {
             rentPayments.push({ player: target.name, note: 'had no assets' });
             return; 
          }

          const targetIdx = newPlayersState.findIndex(p => p.id === target.id);
          const payer = { ...newPlayersState[targetIdx] };
          
          const paymentCards = calculateOptimalPayment(availableCards, rentAmount, target.properties);
          const paymentIds = paymentCards.map(c => c.id);
          
          payer.bank = (payer.bank || []).filter(c => !paymentIds.includes(c.id));
          payer.properties = (payer.properties || []).filter(c => !paymentIds.includes(c.id));
          newPlayersState[targetIdx] = payer;

          const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
          const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
          const currentReceiver = newPlayersState[receiverIdx];
          currentReceiver.bank = [...(currentReceiver.bank || []), ...paysMoney];
          currentReceiver.properties = [...(currentReceiver.properties || []), ...paysProp];
          newPlayersState[receiverIdx] = currentReceiver;
          
          rentPayments.push({ 
            player: target.name, 
            cards: paymentCards.map(c => c.name || `$${c.value}M`) 
          });
        });
      }

      setPlayers(prev => {
         const updatedPlayers = [...newPlayersState];
         updatedPlayers.forEach((p, idx) => {
           updatedPlayers[idx] = cleanupBuildings(updatedPlayers[idx]);
         });
         return updatedPlayers;
      });

      const paymentSummary = rentPayments.length > 0 
        ? rentPayments.map(p => `${p.player}: ${p.note || (p.cards && p.cards.length > 0 ? p.cards.join(', ') : 'nothing')}`).join('; ')
        : 'No extra rent collected';

      setMatchLog(prev => [{
        id: Date.now(), player: currentPlayer.name, action: 'DOUBLE_RENT',
        message: `doubled the rent! Collected additional $${rentAmount}M. Payments: ${paymentSummary}`, card: card
      }, ...prev]);

      setDiscardPile(p => [...p, card]);
      setMovesLeft(m => m - 1);
      setLastRentParams(null); // Consume the combo
      return;
    }

    // Handle House/Hotel Validation (only when playing on properties, not when banking)
    if ((card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL) && destination === 'PROPERTIES') {
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
        // For Wild Cards, use the selected color if provided
        if (playedCard.type === CARD_TYPES.PROPERTY_WILD && targetCardId) {
             playedCard.currentColor = targetCardId;
        }

        player.properties = [...player.properties, playedCard];
      }
      // 'DISCARD' is handled separately below

      const finalPlayer = cleanupBuildings(player);
      newPlayers[currentTurnIndex] = finalPlayer;
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
    // Prevent duplicate calls
    if (isEndingTurnRef.current) {
      console.warn('endTurn already in progress, ignoring duplicate call');
      return;
    }
    
    isEndingTurnRef.current = true;
    const turningPlayerIndex = currentTurnIndex;
    
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[turningPlayerIndex] };

      // Rule: Hand limit 7 cards at end of turn
      if (player.hand && player.hand.length > GAME_RULES.MAX_HAND_SIZE_END_OF_TURN) {
        const sorted = [...player.hand].sort((a, b) => (a.value || 0) - (b.value || 0));
        const toDiscard = sorted.slice(0, player.hand.length - GAME_RULES.MAX_HAND_SIZE_END_OF_TURN);
        player.hand = sorted.slice(player.hand.length - GAME_RULES.MAX_HAND_SIZE_END_OF_TURN);
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
    setDoubleRentActive(false);
    setGameState('DRAW');

    setMatchLog(prev => [{
      id: Date.now(),
      player: players[turningPlayerIndex].name,
      action: 'END_TURN',
      message: 'ended their turn'
    }, ...prev]);
    
    // Reset guard after a short delay to allow state updates to complete
    setTimeout(() => {
      isEndingTurnRef.current = false;
    }, 100);
  }, [currentTurnIndex, playerCount, players]);

  /**
   * Bot turn automation
   * CRITICAL: Only trigger bot actions when it's actually the bot's turn
   */
  useEffect(() => {
    if (gameState === 'GAME_OVER') return;
    
    const currentPlayer = players[currentTurnIndex];
    // IMPORTANT: Return early if current player is human OR doesn't exist OR in multiplayer mode
    if (!currentPlayer || currentPlayer.isHuman || isMultiplayer) return;

    const bot = botsRef.current[currentTurnIndex];
    if (!bot) return;

    let timerId;

    // Bot draws - ONLY if it's this bot's turn
    if (gameState === 'DRAW' && !hasDrawnThisTurn) {
      timerId = setTimeout(() => drawCards(), 1000);
    }

    // Bot plays - ONLY if it's this bot's turn
    else if (gameState === 'PLAYING' && movesLeft > 0) {
      timerId = setTimeout(() => {
        const decision = bot.decideMove(currentPlayer.hand, {
          players,
          currentPlayerIndex: currentTurnIndex,
          doubleRentActive: doubleRentActive,
          movesLeft: movesLeft
        });

        if (decision.action === 'PLAY_PROPERTY' && decision.card) {
          playCard(decision.card.id, 'PROPERTIES', null, decision.targetCard?.id);
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

          const destination = decision.destination || 'DISCARD';
          playCard(decision.card.id, destination, targetId, rentColor || targetCardId);
        } else if (decision.action === 'FLIP_WILD' && decision.card) {
          // Free action, doesn't consume moves
          setPlayers(prev => {
            const newPlayers = [...prev];
            const p = { ...newPlayers[currentTurnIndex] };
            const cardIdx = p.properties.findIndex(c => c.id === decision.card.id);
            if (cardIdx !== -1) {
              const card = { ...p.properties[cardIdx] };
              if (card.colors && card.colors.length === 2) {
                const nextColor = card.colors.find(c => c !== card.currentColor) || card.colors[0];
                card.currentColor = nextColor;
                p.properties = [...p.properties];
                p.properties[cardIdx] = card;
                newPlayers[currentTurnIndex] = p;
                
                setMatchLog(old => [{
                  id: Date.now(), player: p.name, action: 'FLIP',
                  message: `flipped ${card.name} to ${COLORS[nextColor]?.name || nextColor}`,
                  card: card
                }, ...old]);
              }
            }
            return newPlayers;
          });
        } else if (decision.action === 'END_TURN') {
          endTurn();
        }
      }, 1500);
    }

    // Bot ends turn when out of moves - ONLY if it's this bot's turn
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

    let victimName = '';
    let requesterName = '';
    const paymentNames = paymentCards.map(c => c.name || `$${c.value}M`).join(', ');

    setPlayers(prev => {
      const newPlayers = [...prev];
      const victimIdx = newPlayers.findIndex(p => p.id === pendingRequest.targetId);
      const requesterIdx = newPlayers.findIndex(p => p.id === pendingRequest.requesterId);
      
      if (victimIdx === -1 || requesterIdx === -1) return prev;
      
      const victim = { ...newPlayers[victimIdx] };
      const requester = { ...newPlayers[requesterIdx] };
      victimName = victim.name;
      requesterName = requester.name;
      
      const paymentIds = paymentCards.map(c => c.id);
      const jsnCard = paymentCards.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);

      if (jsnCard) {
        // Just Say No case: Remove JSN card from victim's hand, do NOT transfer any other assets
        victim.hand = (victim.hand || []).filter(c => c.id !== jsnCard.id);
        setDiscardPile(prev => [...prev, jsnCard]);
      } else {
        // Regular payment case: Transfer cards
        victim.bank = (victim.bank || []).filter(c => !paymentIds.includes(c.id));
        victim.properties = (victim.properties || []).filter(c => !paymentIds.includes(c.id));
        const paysMoney = paymentCards.filter(c => c.type !== CARD_TYPES.PROPERTY && c.type !== CARD_TYPES.PROPERTY_WILD);
        const paysProp = paymentCards.filter(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
        requester.bank = [...(requester.bank || []), ...paysMoney];
        requester.properties = [...(requester.properties || []), ...paysProp];
      }
      
      // If it was the requester's turn and they played a card, remove it from hand if not already done
      if (pendingRequest.cardId) {
        requester.hand = (requester.hand || []).filter(c => c.id !== pendingRequest.cardId);
      }
      
      newPlayers[victimIdx] = cleanupBuildings(victim);
      newPlayers[requesterIdx] = cleanupBuildings(requester);
      return newPlayers;
    });

    const isJSN = paymentCards.some(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);

    setMatchLog(prev => [{
      id: Date.now(),
      player: victimName,
      action: isJSN ? 'JUST_SAY_NO' : 'PAYMENT',
      message: isJSN 
        ? `said NO! to ${pendingRequest.type}` 
        : `paid ${paymentNames || 'nothing'} to ${requesterName} for ${pendingRequest.type}`,
      card: isJSN ? paymentCards.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO) : pendingRequest.card
    }, ...prev]);

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
           
           // Log it UNLESS suppressed (by checking argument)
           // We can't change the signature easily, so let's just log it.
           // Ideally, the caller should handle suppression, but here we are.
           // Maybe we can check a flag on the card? No.
           // Update: The caller in Game.jsx calls this. If we want to suppress logs, we'd need to change this function signature.
           // Let's change the signature to accept a 'suppressLog' flag.
           // However, playCard also calls log.
           
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
    
    // Setters for external sync
    setGameState,
    setDeck,
    setDiscardPile,
    setPlayers,
    setCurrentTurnIndex,
    setMovesLeft,
    setHasDrawnThisTurn,
    setWinner,
    setMatchLog,
    setPendingRequest
  };
};

