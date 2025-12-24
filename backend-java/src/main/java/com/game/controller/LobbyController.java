package com.game.controller;

import com.game.model.LobbyGame;
import com.game.model.UserSession;
import com.game.service.LobbyService;
import com.game.service.SessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for lobby operations
 * Separate from WebSocket - won't interfere with existing game
 */
@RestController
@RequestMapping("/api/lobby")
@CrossOrigin(origins = "*")
public class LobbyController {
    
    @Autowired
    private SessionManager sessionManager;
    
    @Autowired
    private LobbyService lobbyService;
    
    /**
     * Create a guest session (no auth required)
     */
    @PostMapping("/session")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, String> request) {
        String username = request.getOrDefault("username", "Guest" + System.currentTimeMillis() % 10000);
        UserSession session = sessionManager.createGuestSession(username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getSessionId());
        response.put("username", session.getUsername());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current session info
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String sessionId) {
        UserSession session = sessionManager.getSession(sessionId);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getSessionId());
        response.put("username", session.getUsername());
        response.put("currentGameId", session.getCurrentGameId());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * List all available lobbies
     */
    @GetMapping("/games")
    public ResponseEntity<List<LobbyGame>> listGames() {
        return ResponseEntity.ok(lobbyService.getAvailableLobbies());
    }
    
    /**
     * Create a new game lobby
     */
    @PostMapping("/games")
    public ResponseEntity<LobbyGame> createGame(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestBody Map<String, Object> request) {
        
        String gameName = (String) request.getOrDefault("gameName", "New Game");
        int maxPlayers = (int) request.getOrDefault("maxPlayers", 4);
        
        try {
            LobbyGame lobby = lobbyService.createLobby(sessionId, gameName, maxPlayers);
            return ResponseEntity.ok(lobby);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Join an existing lobby
     */
    @PostMapping("/games/{roomId}/join")
    public ResponseEntity<LobbyGame> joinGame(
            @RequestHeader("X-Session-Id") String sessionId,
            @PathVariable String roomId) {
        
        try {
            LobbyGame lobby = lobbyService.joinLobby(sessionId, roomId);
            return ResponseEntity.ok(lobby);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Leave a lobby
     */
    @PostMapping("/games/{roomId}/leave")
    public ResponseEntity<Void> leaveGame(
            @RequestHeader("X-Session-Id") String sessionId,
            @PathVariable String roomId) {
        
        lobbyService.leaveLobby(sessionId, roomId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get lobby details
     */
    @GetMapping("/games/{roomId}")
    public ResponseEntity<LobbyGame> getGame(@PathVariable String roomId) {
        LobbyGame lobby = lobbyService.getLobby(roomId);
        if (lobby == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(lobby);
    }
}
