import { useState, useCallback } from 'react';
import { ACTION_TYPES, CARD_TYPES } from '../utils/gameHelpers';

/**
 * Custom hook for managing game actions and state
 * Handles card playing, action execution, and game flow
 */
export const useGameActions = (gameState, sendMove, isDemo) => {
  const [pendingAction, setPendingAction] = useState(null);
  const [targetSelectionMode, setTargetSelectionMode] = useState(null);
  const [paymentSelectionMode, setPaymentSelectionMode] = useState(null);

  /**
   * Check if a card requires target selection
   */
  const requiresTarget = useCallback((card) => {
    if (!card) return false;
    
    const targetActions = [
      ACTION_TYPES.SLY_DEAL,
      ACTION_TYPES.FORCED_DEAL,
      ACTION_TYPES.DEAL_BREAKER,
      ACTION_TYPES.DEBT_COLLECTOR,  // Needs player selection
      ACTION_TYPES.BIRTHDAY,         // Targets all players but needs confirmation
    ];
    
    const buildingActions = [ACTION_TYPES.HOUSE, ACTION_TYPES.HOTEL];
    
    return (
      targetActions.includes(card.actionType) ||
      buildingActions.includes(card.actionType) ||
      card.type === CARD_TYPES.RENT_WILD
    );
  }, []);

  /**
   * Play a card from hand
   */
  const playCard = useCallback((card, targetType = 'AUTO') => {
    if (!card) return;

    // Money cards always go to bank
    if (card.type === CARD_TYPES.MONEY) {
      if (isDemo) {
        console.log('Banking money card:', card.name);
        setPendingAction(null);
      } else {
        sendMove({
          type: 'PLAY_CARD',
          cardId: card.id,
          destination: 'BANK',
        });
      }
      return;
    }

    // Property cards go to properties
    if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
      if (isDemo) {
        console.log('Playing property:', card.name);
        setPendingAction(null);
      } else {
        sendMove({
          type: 'PLAY_CARD',
          cardId: card.id,
          destination: 'PROPERTIES',
        });
      }
      return;
    }

    // Action cards that need targets (unless being banked)
    if (requiresTarget(card) && targetType !== 'BANK') {
      setPendingAction(card);
      setTargetSelectionMode({
        card,
        type: getTargetType(card),
      });
      return;
    }

    // Simple action cards (Pass Go, Birthday, Debt Collector)
    if (card.type === CARD_TYPES.ACTION) {
      if (isDemo) {
        console.log('Playing action:', card.name);
        setPendingAction(null);
      } else {
        sendMove({
          type: 'PLAY_CARD',
          cardId: card.id,
          actionType: card.actionType,
        });
      }
      return;
    }

    // Rent cards
    if (card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD) {
      // Both types need selection - color for regular, player for wild
      setPendingAction(card);
      setTargetSelectionMode({
        card,
        type: card.type === CARD_TYPES.RENT_WILD ? 'PLAYER' : 'RENT_COLOR',
      });
      return;
    }

    // Bank any other card
    if (targetType === 'BANK') {
      if (isDemo) {
        console.log('Banking card:', card.name);
        setPendingAction(null);
      } else {
        sendMove({
          type: 'PLAY_CARD',
          cardId: card.id,
          destination: 'BANK',
        });
      }
    }
  }, [isDemo, sendMove, requiresTarget]);

  /**
   * Get the type of target needed for a card
   */
  const getTargetType = (card) => {
    if (!card) return null;

    if (card.actionType === ACTION_TYPES.SLY_DEAL) return 'PROPERTY';
    if (card.actionType === ACTION_TYPES.FORCED_DEAL) return 'PROPERTY_SWAP';
    if (card.actionType === ACTION_TYPES.DEAL_BREAKER) return 'COMPLETE_SET';
    if (card.actionType === ACTION_TYPES.DEBT_COLLECTOR) return 'PLAYER';
    if (card.actionType === ACTION_TYPES.BIRTHDAY) return 'ALL_PLAYERS';
    if (card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL) {
      return 'OWN_COMPLETE_SET';
    }
    if (card.type === CARD_TYPES.RENT_WILD) return 'PLAYER';

    return null;
  };

  /**
   * Handle target selection (for Sly Deal, Deal Breaker, Rent, etc.)
   */
  const selectTarget = useCallback((target) => {
    if (!pendingAction || !targetSelectionMode) return;

    const { card, type } = targetSelectionMode;

    if (isDemo) {
      console.log('Selected target:', target, 'for card:', card.name);
      setPendingAction(null);
      setTargetSelectionMode(null);
    } else {
      // For rent color selection, target is just the color string
      if (type === 'RENT_COLOR') {
        sendMove({
          type: 'PLAY_CARD',
          cardId: card.id,
          actionType: 'RENT',
          targetCardId: target, // target is the color string
        });
      } else {
        sendMove({
          type: 'PLAY_CARD',
          cardId: card.id,
          actionType: card.actionType,
          targetPlayerId: target.playerId,
          targetCardId: target.cardId,
          targetSetColor: target.setColor,
        });
      }
      setPendingAction(null);
      setTargetSelectionMode(null);
    }
  }, [pendingAction, targetSelectionMode, isDemo, sendMove]);

  /**
   * Cancel pending action
   */
  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setTargetSelectionMode(null);
    setPaymentSelectionMode(null);
  }, []);

  /**
   * Handle payment selection
   */
  const selectPayment = useCallback((cards) => {
    if (!paymentSelectionMode) return;

    if (isDemo) {
      console.log('Selected payment cards:', cards);
      setPaymentSelectionMode(null);
    } else {
      sendMove({
        type: 'PAY',
        cardIds: cards.map(c => c.id),
      });
      setPaymentSelectionMode(null);
    }
  }, [paymentSelectionMode, isDemo, sendMove]);

  /**
   * Draw cards
   */
  const drawCards = useCallback(() => {
    if (isDemo) {
      console.log('Drawing cards (demo mode)');
    } else {
      sendMove({ type: 'DRAW' });
    }
  }, [isDemo, sendMove]);

  /**
   * End turn
   */
  const endTurn = useCallback(() => {
    if (isDemo) {
      console.log('Ending turn (demo mode)');
    } else {
      sendMove({ type: 'END_TURN' });
    }
  }, [isDemo, sendMove]);

  /**
   * Say no to an action
   */
  const sayNo = useCallback(() => {
    if (isDemo) {
      console.log('Saying no (demo mode)');
    } else {
      sendMove({ type: 'SAY_NO' });
    }
  }, [isDemo, sendMove]);

  return {
    // Actions
    playCard,
    selectTarget,
    selectPayment,
    drawCards,
    endTurn,
    sayNo,
    cancelAction,

    // State
    pendingAction,
    targetSelectionMode,
    paymentSelectionMode,

    // Helpers
    requiresTarget,
  };
};
