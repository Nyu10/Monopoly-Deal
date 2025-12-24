package com.game.service;

import com.game.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service responsible for validating and dispatching player moves
 * Handles move validation and routing to appropriate handlers
 */
@Service
public class MoveProcessor {
    
    private static final Logger log = LoggerFactory.getLogger(MoveProcessor.class);
    
    private final TurnManager turnManager;
    
    public MoveProcessor(TurnManager turnManager) {
        this.turnManager = turnManager;
    }
    
    /**
     * Validate a move before processing
     */
    public MoveResult validateMove(GameState state, Move move) {
        // Validate room exists (handled by caller)
        
        // Validate player's turn
        if (!turnManager.isPlayersTurn(state, move.getPlayerId())) {
            return MoveResult.failure(
                ErrorCodes.NOT_PLAYERS_TURN,
                "It's not player " + move.getPlayerId() + "'s turn"
            );
        }
        
        // Validate move type
        String moveType = move.getType().toUpperCase();
        if (!isValidMoveType(moveType)) {
            return MoveResult.failure(
                ErrorCodes.INVALID_MOVE_TYPE,
                "Invalid move type: " + move.getType()
            );
        }
        
        // Validate card exists if needed
        if (requiresCard(moveType) && move.getCardUid() == null) {
            return MoveResult.failure(
                ErrorCodes.CARD_NOT_FOUND,
                "Card UID required for move type: " + moveType
            );
        }
        
        // Validate actions remaining for card plays
        if (moveType.equals("PLAY_CARD") && state.getTurnContext().getActionsRemaining() <= 0) {
            return MoveResult.failure(
                ErrorCodes.NO_ACTIONS_REMAINING,
                "No actions remaining"
            );
        }
        
        return MoveResult.success(state);
    }
    
    /**
     * Check if move type is valid
     */
    private boolean isValidMoveType(String moveType) {
        return moveType.equals("DRAW") ||
               moveType.equals("PLAY_CARD") ||
               moveType.equals("END_TURN") ||
               moveType.equals("REACT");
    }
    
    /**
     * Check if move type requires a card
     */
    private boolean requiresCard(String moveType) {
        return moveType.equals("PLAY_CARD") || moveType.equals("REACT");
    }
    
    /**
     * Get move type enum
     */
    public MoveType getMoveType(Move move) {
        return MoveType.valueOf(move.getType().toUpperCase());
    }
    
    /**
     * Enum for move types
     */
    public enum MoveType {
        DRAW,
        PLAY_CARD,
        END_TURN,
        REACT
    }
}
