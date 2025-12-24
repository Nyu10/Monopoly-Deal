package com.game.service;

import com.game.constants.GameConstants;
import com.game.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Service responsible for handling card drawing and deck management
 * Extracted from GameEngine for Single Responsibility
 */
@Service
public class CardPlayService {
    
    private static final Logger log = LoggerFactory.getLogger(CardPlayService.class);
    
    private final TurnManager turnManager;
    
    public CardPlayService(TurnManager turnManager) {
        this.turnManager = turnManager;
    }
    
    /**
     * Handle drawing cards for a player
     */
    public void handleDraw(GameState state, int playerId) {
        Player player = state.getPlayers().get(playerId);
        int drawCount = player.getHand().isEmpty() ? 
            GameConstants.INITIAL_HAND_SIZE : 
            GameConstants.NORMAL_DRAW_COUNT;
        
        for (int i = 0; i < drawCount; i++) {
            drawOneCard(state, player);
        }
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " drew " + drawCount + " cards.",
            "info"
        ));
        
        // After drawing, set actions to max
        turnManager.setActions(state, GameConstants.ACTIONS_PER_TURN);
        
        log.info("{} drew {} cards", player.getName(), drawCount);
    }
    
    /**
     * Draw a single card, reshuffling if needed
     */
    private void drawOneCard(GameState state, Player player) {
        if (!state.getDeck().isEmpty()) {
            player.getHand().add(state.getDeck().pop());
        } else {
            // Reshuffle discard pile if deck is empty
            if (!state.getDiscardPile().isEmpty()) {
                state.getDeck().addAll(state.getDiscardPile());
                state.getDiscardPile().clear();
                Collections.shuffle(state.getDeck());
                
                state.getLogs().add(new GameState.GameLog(
                    "Deck reshuffled from discard pile!",
                    "system"
                ));
                
                if (!state.getDeck().isEmpty()) {
                    player.getHand().add(state.getDeck().pop());
                }
            }
        }
    }
    
    /**
     * Find a card in player's hand
     */
    public Card findCardInHand(Player player, String cardUid) {
        return player.getHand().stream()
            .filter(c -> c.getUid().equals(cardUid))
            .findFirst()
            .orElse(null);
    }
    
    /**
     * Remove card from player's hand
     */
    public void removeFromHand(Player player, Card card) {
        player.getHand().remove(card);
    }
    
    /**
     * Play a money card to bank
     */
    public void playMoneyCard(GameState state, Player player, Card card) {
        removeFromHand(player, card);
        player.getBank().add(card);
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " banked $" + card.getValue() + "M.",
            "info"
        ));
        
        log.info("{} banked ${}", player.getName(), card.getValue());
    }
    
    /**
     * Play a property card
     */
    public void playPropertyCard(GameState state, Player player, Card card) {
        removeFromHand(player, card);
        player.getProperties().add(card);
        
        state.getLogs().add(new GameState.GameLog(
            player.getName() + " played property: " + card.getName(),
            "event"
        ));
        
        log.info("{} played property: {}", player.getName(), card.getName());
    }
    
    /**
     * Discard a card
     */
    public void discardCard(GameState state, Card card) {
        state.getDiscardPile().add(card);
    }
}
