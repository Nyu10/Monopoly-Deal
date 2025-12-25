package com.game.controller;

import com.game.dto.CreateGameRequest;
import com.game.dto.CreateSessionRequest;
import com.game.dto.SessionResponse;
import com.game.model.LobbyGame;
import com.game.model.UserSession;
import com.game.service.LobbyService;
import com.game.service.SessionManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for lobby operations
 * Separate from WebSocket - won't interfere with existing game
 */
@RestController
@RequestMapping("/api/lobby")
@CrossOrigin(origins = "*")
public class LobbyController {
    
    private final SessionManager sessionManager;
    private final LobbyService lobbyService;
    
    public LobbyController(SessionManager sessionManager, LobbyService lobbyService) {
        this.sessionManager = sessionManager;
        this.lobbyService = lobbyService;
    }
    
    /**
     * Create a guest session (no auth required)
     */
    @PostMapping("/session")
    public ResponseEntity<SessionResponse> createSession(@RequestBody CreateSessionRequest request) {
        String username = request.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = "Guest" + System.currentTimeMillis() % 10000;
        }
        
        UserSession session = sessionManager.createGuestSession(username);
        SessionResponse response = new SessionResponse(session.getSessionId(), session.getUsername());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current session info
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable String sessionId) {
        UserSession session = sessionManager.getSession(sessionId);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        
        SessionResponse response = new SessionResponse(
            session.getSessionId(),
            session.getUsername(),
            session.getCurrentGameId()
        );
        
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
            @RequestBody CreateGameRequest request) {
        
        try {
            LobbyGame lobby = lobbyService.createLobby(
                sessionId,
                request.getGameName(),
                request.getMaxPlayers()
            );
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
