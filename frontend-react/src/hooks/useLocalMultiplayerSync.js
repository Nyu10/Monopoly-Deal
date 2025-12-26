import { useEffect } from 'react';

/**
 * Hook to sync local game state across multiple tabs using BroadcastChannel
 * @param {Object} game - The object returned by useLocalGameState
 * @param {boolean} enabled - Whether syncing is enabled
 */
export const useLocalMultiplayerSync = (game, enabled = false) => {
  useEffect(() => {
    if (!enabled) return;

    // Create a broadcast channel for the game state
    const channel = new BroadcastChannel('monopoly-deal-local-multiplayer');

    // Function to broadcast current state
    const broadcastState = () => {
      const stateToSync = {
        gameState: game.gameState,
        players: game.players,
        currentTurnIndex: game.currentTurnIndex,
        movesLeft: game.movesLeft,
        hasDrawnThisTurn: game.hasDrawnThisTurn,
        deck: game.deck,
        discardPile: game.discardPile,
        winner: game.winner,
        matchLog: game.matchLog,
        pendingRequest: game.pendingRequest
      };
      
      // Save to localStorage as a persistent backup
      localStorage.setItem('monopoly_deal_sync_state', JSON.stringify(stateToSync));
      
      // Broadcast to other tabs
      channel.postMessage({ type: 'STATE_UPDATE', state: stateToSync });
    };

    // Listen for messages from other tabs
    const handleMessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        const newState = event.data.state;
        
        // Update local state using setters exposed by useLocalGameState
        if (newState.gameState !== undefined) game.setGameState(newState.gameState);
        if (newState.players !== undefined) game.setPlayers(newState.players);
        if (newState.currentTurnIndex !== undefined) game.setCurrentTurnIndex(newState.currentTurnIndex);
        if (newState.movesLeft !== undefined) game.setMovesLeft(newState.movesLeft);
        if (newState.hasDrawnThisTurn !== undefined) game.setHasDrawnThisTurn(newState.hasDrawnThisTurn);
        if (newState.deck !== undefined) game.setDeck(newState.deck);
        if (newState.discardPile !== undefined) game.setDiscardPile(newState.discardPile);
        if (newState.winner !== undefined) game.setWinner(newState.winner);
        if (newState.matchLog !== undefined) game.setMatchLog(newState.matchLog);
        if (newState.pendingRequest !== undefined) game.setPendingRequest(newState.pendingRequest);
      }
    };

    channel.addEventListener('message', handleMessage);

    // Patch action functions to broadcast state after they are called
    // We wrap them in a small delay to allow state updates to settle if they use multiple setters
    const originalStartGame = game.startGame;
    const originalDrawCards = game.drawCards;
    const originalPlayCard = game.playCard;
    const originalEndTurn = game.endTurn;
    const originalConfirmPayment = game.confirmPayment;
    const originalFlipWildCard = game.flipWildCard;

    // This is a bit hacky but effective for this local-only mode
    const wrapAndBroadcast = (fn) => (...args) => {
      const res = fn(...args);
      setTimeout(broadcastState, 50); // Small delay to let React process the state change
      return res;
    };

    // We can't easily re-bind the hook's internal functions from outside without changing the hook
    // But since the UI calls these functions, we can provide wrapped versions
    
    // Initial sync: Load from localStorage if available
    const savedState = localStorage.getItem('monopoly_deal_sync_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            // Only load if we are not the one who just started (actually, all tabs should sync on mount)
            // But we don't want to overwrite if we are the master player who just initialized.
            // For now, let's just sync everything on mount if it's there.
        } catch (e) {
            console.error('Failed to parse saved state', e);
        }
    }

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [enabled, game]);

  // Return wrapped actions that trigger broadcast
  const wrap = (fn) => (...args) => {
    fn(...args);
    // Broadcast is handled by a separate effect monitoring state changes to be more reliable
  };

  // Improved sync: Monitor state changes and broadcast
  useEffect(() => {
    if (!enabled) return;
    
    // Debounce broadcast to avoid overwhelming the channel
    const timerId = setTimeout(() => {
        const stateToSync = {
            gameState: game.gameState,
            players: game.players,
            currentTurnIndex: game.currentTurnIndex,
            movesLeft: game.movesLeft,
            hasDrawnThisTurn: game.hasDrawnThisTurn,
            deck: game.deck,
            discardPile: game.discardPile,
            winner: game.winner,
            matchLog: game.matchLog,
            pendingRequest: game.pendingRequest
          };
          
          const channel = new BroadcastChannel('monopoly-deal-local-multiplayer');
          channel.postMessage({ type: 'STATE_UPDATE', state: stateToSync });
          localStorage.setItem('monopoly_deal_sync_state', JSON.stringify(stateToSync));
          channel.close();
    }, 100);

    return () => clearTimeout(timerId);
  }, [
    enabled,
    game.gameState,
    game.players,
    game.currentTurnIndex,
    game.movesLeft,
    game.hasDrawnThisTurn,
    game.deck,
    game.discardPile,
    game.winner,
    game.matchLog,
    game.pendingRequest
  ]);
};
