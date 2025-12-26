import { describe, it, expect } from 'vitest';
import { HardBot, BOT_DIFFICULTY, createBot } from './BotEngine';

describe('BotEngine - HardBot', () => {
    const mockPlayers = [
        { id: 'bot-0', name: 'Bot 0', hand: [], properties: [], bank: [] },
        { id: 'player-1', name: 'Player 1', hand: [], properties: [], bank: [] }
    ];

    it('should prioritize completing a set if possible', () => {
        const bot = new HardBot(0, mockPlayers);
        const hand = [
            { id: 'c1', type: 'PROPERTY', color: 'dark_blue', name: 'Boardwalk', value: 4 }
        ];
        const gameState = {
            players: [
                { id: 'bot-0', properties: [{ id: 'c2', type: 'PROPERTY', color: 'dark_blue', name: 'Park Place', value: 3 }] },
                { id: 'player-1', properties: [] }
            ]
        };

        const move = bot.decideMove(hand, gameState);
        expect(move.action).toBe('PLAY_PROPERTY');
        expect(move.card.id).toBe('c1');
    });

    it('should use Deal Breaker if opponent has a complete set', () => {
        const bot = new HardBot(0, mockPlayers);
        const hand = [
            { id: 'db1', type: 'ACTION', actionType: 'DEAL_BREAKER', name: 'Deal Breaker', value: 5 }
        ];
        const gameState = {
            players: [
                { id: 'bot-0', properties: [] },
                { 
                    id: 'player-1', 
                    properties: [
                        { id: 'p1', type: 'PROPERTY', color: 'dark_blue', name: 'Boardwalk', value: 4 },
                        { id: 'p2', type: 'PROPERTY', color: 'dark_blue', name: 'Park Place', value: 3 }
                    ] 
                }
            ]
        };

        const move = bot.decideMove(hand, gameState);
        expect(move.action).toBe('PLAY_ACTION');
        expect(move.card.actionType).toBe('DEAL_BREAKER');
        expect(move.targetCard.id).toBe('p1'); // It should target a card in the set
    });

    it('should bank high value actions if liquidity is low', () => {
        const bot = new HardBot(0, mockPlayers);
        // Hand contains no properties, just an action
        const hand = [
            { id: 'a1', type: 'ACTION', actionType: 'DEBT_COLLECTOR', name: 'Debt Collector', value: 5 }
        ];
        const gameState = {
            players: [
                { id: 'bot-0', bank: [], properties: [] },
                { id: 'player-1', bank: [], properties: [] }
            ]
        };

        const move = bot.decideMove(hand, gameState);
        // With no targets for debt collector (opponents have no money), and no properties to play, it should bank
        expect(move.action).toBe('BANK');
    });
});
