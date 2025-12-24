package com.game.service;

import com.game.model.UserSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory session manager for free multiplayer
 * NO DATABASE REQUIRED - All sessions stored in memory
 * Sessions expire after 30 minutes of inactivity
 */
@Service
public class SessionManager {
    private static final Logger log = LoggerFactory.getLogger(SessionManager.class);
    private static final long SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    
    private final Map<String, UserSession> sessions = new ConcurrentHashMap<>();
    
    /**
     * Create a new guest session (no authentication required)
     */
    public UserSession createGuestSession(String username) {
        String sessionId = UUID.randomUUID().toString();
        UserSession session = new UserSession(sessionId, username);
        sessions.put(sessionId, session);
        
        log.info("Created guest session for user: {}", username);
        return session;
    }
    
    /**
     * Get session by ID
     */
    public UserSession getSession(String sessionId) {
        UserSession session = sessions.get(sessionId);
        if (session != null) {
            if (session.isExpired(SESSION_TIMEOUT_MS)) {
                sessions.remove(sessionId);
                log.info("Session expired: {}", sessionId);
                return null;
            }
            session.updateActivity();
        }
        return session;
    }
    
    /**
     * Update session activity
     */
    public void updateActivity(String sessionId) {
        UserSession session = sessions.get(sessionId);
        if (session != null) {
            session.updateActivity();
        }
    }
    
    /**
     * Join a game
     */
    public void joinGame(String sessionId, String gameId) {
        UserSession session = sessions.get(sessionId);
        if (session != null) {
            session.setCurrentGameId(gameId);
            session.updateActivity();
        }
    }
    
    /**
     * Leave a game
     */
    public void leaveGame(String sessionId) {
        UserSession session = sessions.get(sessionId);
        if (session != null) {
            session.setCurrentGameId(null);
            session.updateActivity();
        }
    }
    
    /**
     * Remove session
     */
    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
        log.info("Removed session: {}", sessionId);
    }
    
    /**
     * Clean up expired sessions
     */
    public void cleanupExpiredSessions() {
        sessions.entrySet().removeIf(entry -> {
            boolean expired = entry.getValue().isExpired(SESSION_TIMEOUT_MS);
            if (expired) {
                log.info("Cleaning up expired session: {}", entry.getKey());
            }
            return expired;
        });
    }
    
    /**
     * Get active session count
     */
    public int getActiveSessionCount() {
        return sessions.size();
    }
}
