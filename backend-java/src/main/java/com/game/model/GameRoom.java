package com.game.model;

import lombok.Getter;
import java.util.concurrent.locks.ReentrantLock;

public class GameRoom {
    @Getter
    private final String roomId;
    private final GameState gameState;
    private final ReentrantLock lock = new ReentrantLock();

    public GameRoom(String roomId, GameState gameState) {
        this.roomId = roomId;
        this.gameState = gameState;
    }

    public void executeWithLock(Runnable action) {
        lock.lock();
        try {
            action.run();
        } finally {
            lock.unlock();
        }
    }

    public GameState getGameState() {
        return gameState;
    }
}
