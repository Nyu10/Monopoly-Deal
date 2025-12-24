package com.game.service;

import com.game.constants.GameConstants;
import com.game.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service responsible for managing turn flow and progression
 * Handles turn ending, player switching, and bot turn triggering
 */
@Service
public class TurnManager {
    
    private static final Logger log = LoggerFactory.getLogger(TurnManager.class);
    
    private final BotEngine botEngine;
    
    public TurnManager(BotEngine botEngine) {
        this.botEngine = botEngine;
    }
    
    /**
     * End the current player's turn and switch to next player
     */
    public void endTurn(GameState state, int playerId) {
        Player currentPlayer = state.getPlayers().get(playerId);
        
        // Discard down to max hand size
        while (currentPlayer.getHand().size() > GameConstants.MAX_HAND_SIZE) {
            Card discarded = currentPlayer.getHand().remove(0);
            state.getDiscardPile().add(discarded);
            state.getLogs().add(new GameState.GameLog(
                currentPlayer.getName() + " discarded " + discarded.getName() + " (hand limit)",
                "info"
            ));
        }
        
        // Switch to next player
        int nextPlayerId = (playerId + 1) % state.getPlayers().size();
        state.getTurnContext().setActivePlayerId(nextPlayerId);
        state.getTurnContext().setActionsRemaining(0); // Must draw first
        
        Player nextPlayer = state.getPlayers().get(nextPlayerId);
        state.getLogs().add(new GameState.GameLog(
            nextPlayer.getName() + "'s turn. Draw 2 cards to begin.",
            "system"
        ));
        
        log.info("Turn ended. Player {} -> Player {}", playerId, nextPlayerId);
    }
    
    /**
     * Check if turn should auto-end and trigger bot if needed
     */
    public boolean shouldAutoEndTurn(GameState state) {
        return state.getTurnContext().getActionsRemaining() <= 0;
    }
    
    /**
     * Check if current player is a bot
     */
    public boolean isCurrentPlayerBot(GameState state) {
        int activePlayerId = state.getTurnContext().getActivePlayerId();
        Player activePlayer = state.getPlayers().get(activePlayerId);
        return !activePlayer.isHuman();
    }
    
    /**
     * Get the current active player
     */
    public Player getCurrentPlayer(GameState state) {
        int activePlayerId = state.getTurnContext().getActivePlayerId();
        return state.getPlayers().get(activePlayerId);
    }
    
    /**
     * Validate if it's the specified player's turn
     */
    public boolean isPlayersTurn(GameState state, int playerId) {
        return state.getTurnContext().getActivePlayerId() == playerId;
    }
    
    /**
     * Decrement actions remaining
     */
    public void decrementActions(GameState state) {
        int current = state.getTurnContext().getActionsRemaining();
        if (current > 0) {
            state.getTurnContext().setActionsRemaining(current - 1);
        }
    }
    
    /**
     * Set actions remaining (e.g., after drawing)
     */
    public void setActions(GameState state, int actions) {
        state.getTurnContext().setActionsRemaining(actions);
    }
}
