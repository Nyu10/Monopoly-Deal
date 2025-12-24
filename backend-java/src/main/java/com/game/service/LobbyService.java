package com.game.service;

import com.game.model.LobbyGame;
import com.game.model.UserSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Simple in-memory lobby service for free multiplayer
 * NO DATABASE REQUIRED - All lobbies stored in memory
 */
@Service
public class LobbyService {
    private static final Logger log = LoggerFactory.getLogger(LobbyService.class);
    
    private final Map<String, LobbyGame> lobbies = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> gameParticipants = new ConcurrentHashMap<>();
    
    @Autowired
    private SessionManager sessionManager;
    
    /**
     * Create a new game lobby
     */
    public LobbyGame createLobby(String sessionId, String gameName, int maxPlayers) {
        UserSession session = sessionManager.getSession(sessionId);
        if (session == null) {
            throw new IllegalStateException("Invalid session");
        }
        
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        LobbyGame lobby = new LobbyGame(roomId, gameName, maxPlayers, session.getUsername());
        
        // Add creator as first participant
        lobby.getPlayerNames().add(session.getUsername());
        lobby.setCurrentPlayers(1);
        
        lobbies.put(roomId, lobby);
        gameParticipants.put(roomId, new HashSet<>(Collections.singletonList(sessionId)));
        
        sessionManager.joinGame(sessionId, roomId);
        
        log.info("Created lobby: {} by {}", roomId, session.getUsername());
        return lobby;
    }
    
    /**
     * Join an existing lobby
     */
    public LobbyGame joinLobby(String sessionId, String roomId) {
        UserSession session = sessionManager.getSession(sessionId);
        if (session == null) {
            throw new IllegalStateException("Invalid session");
        }
        
        LobbyGame lobby = lobbies.get(roomId);
        if (lobby == null) {
            throw new IllegalStateException("Lobby not found");
        }
        
        if (!lobby.canJoin()) {
            throw new IllegalStateException("Lobby is full or already started");
        }
        
        // Add participant
        Set<String> participants = gameParticipants.get(roomId);
        if (participants.contains(sessionId)) {
            // Already in lobby
            return lobby;
        }
        
        participants.add(sessionId);
        lobby.getPlayerNames().add(session.getUsername());
        lobby.setCurrentPlayers(participants.size());
        
        sessionManager.joinGame(sessionId, roomId);
        
        log.info("User {} joined lobby: {}", session.getUsername(), roomId);
        return lobby;
    }
    
    /**
     * Leave a lobby
     */
    public void leaveLobby(String sessionId, String roomId) {
        UserSession session = sessionManager.getSession(sessionId);
        if (session == null) {
            return;
        }
        
        LobbyGame lobby = lobbies.get(roomId);
        if (lobby == null) {
            return;
        }
        
        Set<String> participants = gameParticipants.get(roomId);
        if (participants != null) {
            participants.remove(sessionId);
            lobby.getPlayerNames().remove(session.getUsername());
            lobby.setCurrentPlayers(participants.size());
            
            // If lobby is empty, remove it
            if (participants.isEmpty()) {
                lobbies.remove(roomId);
                gameParticipants.remove(roomId);
                log.info("Removed empty lobby: {}", roomId);
            }
        }
        
        sessionManager.leaveGame(sessionId);
        log.info("User {} left lobby: {}", session.getUsername(), roomId);
    }
    
    /**
     * Get all available lobbies
     */
    public List<LobbyGame> getAvailableLobbies() {
        return lobbies.values().stream()
            .filter(LobbyGame::canJoin)
            .sorted(Comparator.comparing(LobbyGame::getCreatedAt).reversed())
            .collect(Collectors.toList());
    }
    
    /**
     * Get lobby by room ID
     */
    public LobbyGame getLobby(String roomId) {
        return lobbies.get(roomId);
    }
    
    /**
     * Start a game (change status)
     */
    public void startGame(String roomId) {
        LobbyGame lobby = lobbies.get(roomId);
        if (lobby != null) {
            lobby.setStatus("PLAYING");
            log.info("Started game: {}", roomId);
        }
    }
    
    /**
     * Get participants in a lobby
     */
    public Set<String> getParticipants(String roomId) {
        return gameParticipants.getOrDefault(roomId, new HashSet<>());
    }
    
    /**
     * Get participant usernames
     */
    public List<String> getParticipantNames(String roomId) {
        Set<String> sessionIds = gameParticipants.get(roomId);
        if (sessionIds == null) {
            return new ArrayList<>();
        }
        
        return sessionIds.stream()
            .map(sessionManager::getSession)
            .filter(Objects::nonNull)
            .map(UserSession::getUsername)
            .collect(Collectors.toList());
    }
}
