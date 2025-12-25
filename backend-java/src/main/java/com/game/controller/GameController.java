package com.game.controller;

import com.game.model.GameState;
import com.game.model.Move;
import com.game.service.GameEngine;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {

    private final GameEngine gameEngine;

    public GameController(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
    }

    @MessageMapping("/game/{roomId}/move")
    @SendTo("/topic/game/{roomId}")
    public GameState handleMove(@DestinationVariable String roomId, Move move) {
        gameEngine.processMove(roomId, move);
        return gameEngine.getGameState(roomId);
    }
    
    @MessageMapping("/game/{roomId}/start")
    @SendTo("/topic/game/{roomId}")
    public GameState startGame(@DestinationVariable String roomId) {
        return gameEngine.createGame(roomId);
    }
    
    @MessageMapping("/game/{roomId}/state")
    @SendTo("/topic/game/{roomId}")
    public GameState getState(@DestinationVariable String roomId) {
        return gameEngine.getGameState(roomId);
    }
}
