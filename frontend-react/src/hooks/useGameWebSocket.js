import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom hook for managing WebSocket connection to game backend
 * Handles STOMP messaging for real-time game state updates
 */
export const useGameWebSocket = (roomId) => {
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Connected to game server');
      setConnected(true);
      setError(null);

      // Subscribe to game updates
      client.subscribe(`/topic/game/${roomId}`, (message) => {
        const state = JSON.parse(message.body);
        console.log('📦 Received game state:', state);
        setGameState(state);
      });

      // Request initial game state
      client.publish({
        destination: `/app/game/${roomId}/state`,
        body: JSON.stringify({}),
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame);
      setError('Connection error');
      setConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log('🔌 WebSocket closed');
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [roomId]);

  const sendMove = (move) => {
    if (!clientRef.current || !connected) {
      console.error('Cannot send move: not connected');
      return;
    }

    clientRef.current.publish({
      destination: `/app/game/${roomId}/move`,
      body: JSON.stringify(move),
    });
  };

  const startGame = () => {
    if (!clientRef.current || !connected) {
      console.error('Cannot start game: not connected');
      return;
    }

    clientRef.current.publish({
      destination: `/app/game/${roomId}/start`,
      body: JSON.stringify({}),
    });
  };

  return {
    gameState,
    connected,
    error,
    sendMove,
    startGame,
  };
};
