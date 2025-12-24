import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const useGameSocket = (roomId) => {
    const [gameState, setGameState] = useState(null);
    const [connected, setConnected] = useState(false);
    const stompClient = useRef(null);

    useEffect(() => {
        const socket = new SockJS(`${API_URL}/ws-game`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setConnected(true);
                client.subscribe('/topic/game', (message) => {
                    if (message.body) {
                        setGameState(JSON.parse(message.body));
                    }
                });
            },
            onDisconnect: () => {
                setConnected(false);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [roomId]);

    const sendMove = (move) => {
        if (stompClient.current && connected) {
            stompClient.current.publish({
                destination: '/app/move',
                body: JSON.stringify(move),
            });
        }
    };

    return { gameState, connected, sendMove };
};

export default useGameSocket;
