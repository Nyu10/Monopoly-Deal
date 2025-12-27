import { useEffect, useRef } from 'react';

/**
 * Hook to sync local game state across multiple tabs using BroadcastChannel
 * @param {Object} game - The object returned by useLocalGameState
 * @param {boolean} enabled - Whether syncing is enabled
 */
export const useLocalMultiplayerSync = (game, enabled = false) => {
  const isUpdatingFromSync = useRef(false);
  
  useEffect(() => {
    if (!enabled) return;

    // Create a broadcast channel for the game state
    const channel = new BroadcastChannel('monopoly-deal-local-multiplayer');

    // Listen for messages from other tabs
    const handleMessage = (event) => {
      const { type, state } = event.data;
      
      if (type === 'STATE_UPDATE') {
        isUpdatingFromSync.current = true;
        
        console.log('Received sync update', state);
        
        // Update local state using setters exposed by useLocalGameState
        if (state.gameState !== undefined && state.gameState !== game.gameState) game.setGameState(state.gameState);
        if (state.players !== undefined) game.setPlayers(state.players);
        if (state.currentTurnIndex !== undefined && state.currentTurnIndex !== game.currentTurnIndex) game.setCurrentTurnIndex(state.currentTurnIndex);
        if (state.movesLeft !== undefined && state.movesLeft !== game.movesLeft) game.setMovesLeft(state.movesLeft);
        if (state.hasDrawnThisTurn !== undefined && state.hasDrawnThisTurn !== game.hasDrawnThisTurn) game.setHasDrawnThisTurn(state.hasDrawnThisTurn);
        if (state.deck !== undefined) game.setDeck(state.deck);
        if (state.discardPile !== undefined) game.setDiscardPile(state.discardPile);
        if (state.winner !== undefined && state.winner !== game.winner) game.setWinner(state.winner);
        if (state.matchLog !== undefined) game.setMatchLog(state.matchLog);
        if (state.nextLogId !== undefined) game.setNextLogId(state.nextLogId);
        if (state.pendingRequest !== undefined) game.setPendingRequest(state.pendingRequest);
        
        // Reset flag after a short delay to allow React to process updates
        setTimeout(() => {
          isUpdatingFromSync.current = false;
        }, 100);
      } else if (type === 'REQUEST_STATE') {
         // Another tab is asking for the state (new joiner)
         // We should broadcast our current state if we have a valid game running
         if (game.gameState !== 'SETUP' && game.players.length > 0) {
            channel.postMessage({
                type: 'STATE_UPDATE',
                state: {
                    gameState: game.gameState,
                    players: game.players,
                    currentTurnIndex: game.currentTurnIndex,
                    movesLeft: game.movesLeft,
                    hasDrawnThisTurn: game.hasDrawnThisTurn,
                    deck: game.deck,
                    discardPile: game.discardPile,
                    winner: game.winner,
                    matchLog: game.matchLog,
                    nextLogId: game.nextLogId,
                    pendingRequest: game.pendingRequest
                }
            });
         }
      }
    };

    channel.addEventListener('message', handleMessage);
    
    // Also request state on mount, just in case we missed the local storage window or it's stale
    channel.postMessage({ type: 'REQUEST_STATE' });
    
    // Fallback: Listen to storage events (e.g. if another tab saves to localStorage)
    const handleStorageChange = (e) => {
        if (e.key === 'monopoly_deal_sync_state' && e.newValue) {
            try {
                const state = JSON.parse(e.newValue);
                // Trigger update
                isUpdatingFromSync.current = true;
                 if (state.gameState !== undefined) game.setGameState(state.gameState);
                 if (state.players !== undefined) game.setPlayers(state.players);
                 if (state.currentTurnIndex !== undefined) game.setCurrentTurnIndex(state.currentTurnIndex);
                 if (state.movesLeft !== undefined) game.setMovesLeft(state.movesLeft);
                 if (state.hasDrawnThisTurn !== undefined) game.setHasDrawnThisTurn(state.hasDrawnThisTurn);
                 if (state.deck !== undefined) game.setDeck(state.deck);
                 if (state.discardPile !== undefined) game.setDiscardPile(state.discardPile);
                 if (state.winner !== undefined) game.setWinner(state.winner);
                 if (state.matchLog !== undefined) game.setMatchLog(state.matchLog);
                 if (state.nextLogId !== undefined) game.setNextLogId(state.nextLogId);
                 if (state.pendingRequest !== undefined) game.setPendingRequest(state.pendingRequest);
                 
                setTimeout(() => { isUpdatingFromSync.current = false; }, 100);
            } catch (err) {
                console.error('Failed to parse storage update', err);
            }
        }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
      channel.close();
    };
  }, [enabled]); // Dependencies removed to run this setup once on mount/enable

  // Monitor state changes and broadcast
  useEffect(() => {
    if (!enabled) return;
    
    // Skip broadcast if this update was triggered by an incoming sync
    if (isUpdatingFromSync.current) return;
    
    // Skip broadcast if game is in initial setup state (don't overwrite established games with empty state)
    if (game.gameState === 'SETUP' && game.players.length === 0) return;
    
    // Debounce broadcast
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
            nextLogId: game.nextLogId,
            pendingRequest: game.pendingRequest
          };
          
          const channel = new BroadcastChannel('monopoly-deal-local-multiplayer');
          channel.postMessage({ type: 'STATE_UPDATE', state: stateToSync });
          localStorage.setItem('monopoly_deal_sync_state', JSON.stringify(stateToSync));
          channel.close();
    }, 50);

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
