package com.game.service;

import com.game.constants.GameConstants;
import com.game.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Refactored GameEngine - Orchestration only
 * Delegates responsibilities to focused services
 * Uses constructor injection for testability
 */
@Service
public class GameEngineRefactored {
    
    private static final Logger log = LoggerFactory.getLogger(GameEngineRefactored.class);
    
    private final Map<String, GameRoom> activeGames = new ConcurrentHashMap<>();
    
    // Constructor injection for all dependencies
    private final BotEngine botEngine;
    private final RentCalculator rentCalculator;
    private final SimpMessagingTemplate messagingTemplate;
    private final TurnManager turnManager;
    private final MoveProcessor moveProcessor;
    private final CardPlayService cardPlayService;
    private final PaymentService paymentService;
    private final PropertyService propertyService;
    
    public GameEngineRefactored(
        BotEngine botEngine,
        RentCalculator rentCalculator,
        SimpMessagingTemplate messagingTemplate,
        TurnManager turnManager,
        MoveProcessor moveProcessor,
        CardPlayService cardPlayService,
        PaymentService paymentService,
        PropertyService propertyService
    ) {
        this.botEngine = botEngine;
        this.rentCalculator = rentCalculator;
        this.messagingTemplate = messagingTemplate;
        this.turnManager = turnManager;
        this.moveProcessor = moveProcessor;
        this.cardPlayService = cardPlayService;
        this.paymentService = paymentService;
        this.propertyService = propertyService;
    }
    
    /**
     * Create a new game
     */
    public GameState createGame(String roomId) {
        GameState state = initializeNewGame(roomId);
        GameRoom room = new GameRoom(roomId, state);
        activeGames.put(roomId, room);
        
        log.info("Game created: {}", roomId);
        return state;
    }
    
    /**
     * Get game state for a room
     */
    public GameState getGameState(String roomId) {
        GameRoom room = activeGames.get(roomId);
        return room != null ? room.getGameState() : null;
    }
    
    /**
     * Initialize a new game with players and deck
     */
    private GameState initializeNewGame(String roomId) {
        List<Player> players = new ArrayList<>();
        players.add(new Player(0, "You", true));
        players.add(new Player(1, "Bot Alpha", false));
        players.add(new Player(2, "Bot Beta", false));
        players.add(new Player(3, "Bot Gamma", false));
        
        Stack<Card> deck = DeckGenerator.generateDeck();
        Collections.shuffle(deck);
        
        // Deal initial cards
        for (Player p : players) {
            for (int i = 0; i < GameConstants.INITIAL_HAND_SIZE; i++) {
                if (!deck.isEmpty()) {
                    p.getHand().add(deck.pop());
                }
            }
        }
        
        return GameState.builder()
            .gameId(roomId)
            .status("PLAYING")
            .players(players)
            .deck(deck)
            .discardPile(new ArrayList<>())
            .turnContext(GameState.turnContextBuilder()
                .activePlayerId(0)
                .actionsRemaining(0) // Must draw first
                .build())
            .logs(new ArrayList<>(List.of(
                new GameState.GameLog("Property Hustle Started! Draw 2 cards to begin.", "system")
            )))
            .build();
    }
    
    /**
     * Process a player move - main orchestration method
     */
    public void processMove(String roomId, Move move) {
        GameRoom room = activeGames.get(roomId);
        if (room == null) {
            log.warn("Room not found: {}", roomId);
            broadcastError(roomId, ErrorCodes.ROOM_NOT_FOUND, "Room not found");
            return;
        }
        
        room.executeWithLock(() -> {
            GameState state = room.getGameState();
            
            // Validate move
            MoveResult validation = moveProcessor.validateMove(state, move);
            if (!validation.isSuccess()) {
                log.warn("Move validation failed: {}", validation.getErrorMessage());
                broadcastError(roomId, validation.getErrorCode(), validation.getErrorMessage());
                return;
            }
            
            // Process move based on type
            MoveProcessor.MoveType moveType = moveProcessor.getMoveType(move);
            switch (moveType) {
                case DRAW:
                    handleDraw(state, move.getPlayerId());
                    break;
                case PLAY_CARD:
                    handlePlayCard(state, move);
                    break;
                case END_TURN:
                    handleEndTurn(state, move.getPlayerId());
                    break;
                case REACT:
                    handleReaction(state, move);
                    break;
            }
            
            // Check if turn should auto-end
            if (turnManager.shouldAutoEndTurn(state)) {
                turnManager.endTurn(state, state.getTurnContext().getActivePlayerId());
            }
            
            // Trigger bot if needed
            if (turnManager.isCurrentPlayerBot(state)) {
                triggerBotTurn(roomId, state);
            }
            
            // Broadcast updated state
            broadcastGameState(roomId, state);
        });
    }
    
    /**
     * Handle drawing cards
     */
    private void handleDraw(GameState state, int playerId) {
        cardPlayService.handleDraw(state, playerId);
    }
    
    /**
     * Handle playing a card
     */
    private void handlePlayCard(GameState state, Move move) {
        Player player = state.getPlayers().get(move.getPlayerId());
        Card card = cardPlayService.findCardInHand(player, move.getCardUid());
        
        if (card == null) {
            log.warn("Card not found: {}", move.getCardUid());
            return;
        }
        
        // Decrement actions
        turnManager.decrementActions(state);
        
        // Handle based on card type
        switch (card.getType()) {
            case MONEY:
                cardPlayService.playMoneyCard(state, player, card);
                break;
            case PROPERTY:
            case PROPERTY_WILD:
                cardPlayService.playPropertyCard(state, player, card);
                checkWinCondition(state, player);
                break;
            case RENT:
            case RENT_WILD:
                // TODO: Implement rent handling
                cardPlayService.removeFromHand(player, card);
                cardPlayService.discardCard(state, card);
                break;
            case ACTION:
                // TODO: Implement action card handling
                cardPlayService.removeFromHand(player, card);
                cardPlayService.discardCard(state, card);
                break;
        }
    }
    
    /**
     * Handle ending a turn
     */
    private void handleEndTurn(GameState state, int playerId) {
        turnManager.endTurn(state, playerId);
    }
    
    /**
     * Handle reaction (Just Say No, etc.)
     */
    private void handleReaction(GameState state, Move move) {
        // TODO: Implement reaction handling
        log.info("Reaction handling not yet implemented");
    }
    
    /**
     * Check if player has won
     */
    private void checkWinCondition(GameState state, Player player) {
        int completedSets = countCompletedSets(player);
        if (completedSets >= GameConstants.SETS_TO_WIN) {
            state.setStatus("GAME_OVER");
            state.getLogs().add(new GameState.GameLog(
                player.getName() + " WINS with " + completedSets + " complete sets!",
                "system"
            ));
            log.info("{} won the game!", player.getName());
        }
    }
    
    /**
     * Count completed property sets
     */
    private int countCompletedSets(Player player) {
        // Simplified - delegate to RentCalculator in full implementation
        return 0; // TODO: Implement proper set counting
    }
    
    /**
     * Trigger bot turn asynchronously
     */
    private void triggerBotTurn(String roomId, GameState state) {
        new Thread(() -> {
            try {
                Thread.sleep(GameConstants.BOT_TURN_DELAY_MS);
                executeBotTurn(roomId, state.getTurnContext().getActivePlayerId());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Bot turn interrupted", e);
            }
        }).start();
    }
    
    /**
     * Execute a bot's turn
     */
    private void executeBotTurn(String roomId, int botId) {
        GameRoom room = activeGames.get(roomId);
        if (room == null) return;
        
        room.executeWithLock(() -> {
            GameState state = room.getGameState();
            Move botMove = botEngine.calculateBestMove(state, botId);
            
            if (botMove != null) {
                processMove(roomId, botMove);
            }
        });
    }
    
    /**
     * Broadcast game state to all clients
     */
    private void broadcastGameState(String roomId, GameState state) {
        try {
            messagingTemplate.convertAndSend("/topic/game/" + roomId, state);
        } catch (Exception e) {
            log.error("Failed to broadcast game state", e);
        }
    }
    
    /**
     * Broadcast error to clients
     */
    private void broadcastError(String roomId, String errorCode, String errorMessage) {
        try {
            Map<String, String> error = Map.of(
                "errorCode", errorCode,
                "errorMessage", errorMessage
            );
            messagingTemplate.convertAndSend("/topic/game/" + roomId + "/errors", error);
        } catch (Exception e) {
            log.error("Failed to broadcast error", e);
        }
    }
}
