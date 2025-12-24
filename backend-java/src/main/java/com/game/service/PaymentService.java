package com.game.service;

import com.game.constants.GameConstants;
import com.game.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for handling payment requests and resolution
 * Extracted from GameEngine to follow Single Responsibility Principle
 */
@Service
public class PaymentService {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    
    private final BotEngine botEngine;
    
    public PaymentService(BotEngine botEngine) {
        this.botEngine = botEngine;
    }
    
    /**
     * Create a payment request from one player to another
     */
    public void createPaymentRequest(
        GameState state,
        int fromPlayerId,
        int toPlayerId,
        int amount,
        String reason,
        String relatedCardUid
    ) {
        PaymentRequest request = new PaymentRequest();
        request.setFromPlayerId(fromPlayerId);
        request.setToPlayerId(toPlayerId);
        request.setAmount(amount);
        request.setReason(reason);
        request.setCardUid(relatedCardUid);
        request.setResolved(false);
        
        state.getTurnContext().getPendingPayments().add(request);
        
        log.info("Payment request created: Player {} must pay {}M to Player {} (reason: {})",
            fromPlayerId, amount, toPlayerId, reason);
    }
    
    /**
     * Process a payment request
     */
    public void handlePayment(GameState state, PaymentRequest request) {
        if (request.isResolved()) {
            return;
        }
        
        Player payer = state.getPlayers().get(request.getFromPlayerId());
        Player receiver = state.getPlayers().get(request.getToPlayerId());
        
        log.info("Processing payment: {} pays {} to {}", 
            payer.getName(), request.getAmount(), receiver.getName());
        
        List<Card> cardsToPayWith;
        
        if (payer.isHuman()) {
            // For human players, auto-select for now
            // TODO: Allow human to choose cards via UI
            cardsToPayWith = selectCardsForPayment(payer, request.getAmount());
        } else {
            // Bot selects cards
            cardsToPayWith = botEngine.selectCardsForPayment(payer, request.getAmount());
        }
        
        if (cardsToPayWith.isEmpty()) {
            state.getLogs().add(new GameState.GameLog(
                payer.getName() + " has nothing to pay with!",
                "warning"
            ));
            request.setResolved(true);
            return;
        }
        
        // Transfer cards
        int totalPaid = processPayment(state, payer, receiver, cardsToPayWith);
        
        state.getLogs().add(new GameState.GameLog(
            payer.getName() + " paid $" + totalPaid + "M to " + receiver.getName(),
            "info"
        ));
        
        request.setResolved(true);
    }
    
    /**
     * Transfer cards from payer to receiver
     */
    private int processPayment(GameState state, Player payer, Player receiver, List<Card> cards) {
        int totalValue = 0;
        
        for (Card card : cards) {
            totalValue += card.getValue();
            
            // Remove from payer
            payer.getBank().remove(card);
            payer.getHand().remove(card);
            payer.getProperties().remove(card);
            
            // Add to receiver's bank
            receiver.getBank().add(card);
        }
        
        return totalValue;
    }
    
    /**
     * Select cards for payment (fallback for human players)
     */
    private List<Card> selectCardsForPayment(Player player, int amount) {
        List<Card> selected = new ArrayList<>();
        int total = 0;
        
        // Priority 1: Money from bank
        for (Card card : new ArrayList<>(player.getBank())) {
            if (total >= amount) break;
            if (card.getType() == CardType.MONEY) {
                selected.add(card);
                total += card.getValue();
            }
        }
        
        // Priority 2: Action cards from hand
        if (total < amount) {
            for (Card card : new ArrayList<>(player.getHand())) {
                if (total >= amount) break;
                if (card.getType() == CardType.ACTION || 
                    card.getType() == CardType.RENT || 
                    card.getType() == CardType.RENT_WILD) {
                    selected.add(card);
                    total += card.getValue();
                }
            }
        }
        
        // Priority 3: Properties (last resort)
        if (total < amount) {
            for (Card card : new ArrayList<>(player.getProperties())) {
                if (total >= amount) break;
                selected.add(card);
                total += card.getValue();
            }
        }
        
        return selected;
    }
    
    /**
     * Calculate total wealth of a player
     */
    public int calculatePlayerWealth(Player player) {
        int wealth = 0;
        wealth += player.getBank().stream().mapToInt(Card::getValue).sum();
        wealth += player.getHand().stream().mapToInt(Card::getValue).sum();
        wealth += player.getProperties().stream().mapToInt(Card::getValue).sum();
        return wealth;
    }
}
