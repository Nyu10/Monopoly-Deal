import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Wifi, WifiOff, Trophy } from 'lucide-react';
import StadiumLayout from '../components/StadiumLayout';
import { CardActionDialog, TargetSelectionDialog, PaymentSelectionDialog } from '../components/ActionDialogs';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useGameActions } from '../hooks/useGameActions';
import { useLocalGameState } from '../hooks/useLocalGameState';
import { BOT_DIFFICULTY } from '../ai/BotEngine';

/**
 * Main Game Component
 * Supports three modes:
 * 1. Multiplayer (/game/:roomId) - Connect to backend
 * 2. Bot Game (/stadium) - Local game with AI bots
 * 3. Demo (fallback) - Testing only
 */
const Game = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [showCardActionDialog, setShowCardActionDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Determine game mode
  const isMultiplayer = !!roomId;
  const isBotGame = !roomId; // /stadium route

  // Multiplayer mode: Connect to backend
  const { gameState: backendGameState, connected, error, sendMove, startGame: startMultiplayerGame } = useGameWebSocket(roomId);

  // Bot game mode: Local game state with AI
  const localGame = useLocalGameState(4, BOT_DIFFICULTY.MEDIUM);

  // Use appropriate game state based on mode
  const players = isMultiplayer ? (backendGameState?.players || []) : localGame.players;
  const currentTurnIndex = isMultiplayer ? (backendGameState?.currentTurnIndex || 0) : localGame.currentTurnIndex;
  const hasDrawnThisTurn = isMultiplayer ? (backendGameState?.hasDrawnThisTurn || false) : localGame.hasDrawnThisTurn;
  const gameState = isMultiplayer ? (backendGameState?.gameState || 'SETUP') : localGame.gameState;
  const movesLeft = isMultiplayer ? (backendGameState?.movesLeft || 0) : localGame.movesLeft;
  const winner = isMultiplayer ? backendGameState?.winner : localGame.winner;

  // Initialize game actions hook
  const gameActions = useGameActions(backendGameState, sendMove, !isMultiplayer);

  // Auto-start bot game on mount
  useEffect(() => {
    if (isBotGame && gameState === 'SETUP') {
      localGame.startGame();
    }
  }, [isBotGame, gameState, localGame]);

  const handleDraw = () => {
    if (isMultiplayer) {
      gameActions.drawCards();
    } else {
      localGame.drawCards();
    }
  };

  const handleEndTurn = () => {
    if (isMultiplayer) {
      gameActions.endTurn();
    } else {
      localGame.endTurn();
    }
  };

  const handleCardClick = (card) => {
    // Only allow human player to click cards
    if (currentTurnIndex !== 0) return;
    if (gameState !== 'PLAYING') return;
    if (movesLeft <= 0) return;

    setSelectedCard(card);
    
    // If card requires target, skip confirmation dialog
    if (gameActions.requiresTarget(card)) {
      gameActions.playCard(card);
    } else {
      // Show confirmation dialog for other cards
      setShowCardActionDialog(true);
    }
  };

  const handleCardActionConfirm = (actionType) => {
    if (!selectedCard) return;
    
    if (isMultiplayer) {
      gameActions.playCard(selectedCard, actionType);
    } else {
      // Local game: determine destination
      const destination = actionType === 'BANK' ? 'BANK' : 'PROPERTIES';
      localGame.playCard(selectedCard.id, destination);
    }
    
    setShowCardActionDialog(false);
    setSelectedCard(null);
  };

  const handleCardActionCancel = () => {
    setShowCardActionDialog(false);
    setSelectedCard(null);
  };

  const handleTargetSelect = (target) => {
    gameActions.selectTarget(target);
  };

  const handlePaymentConfirm = (cards) => {
    gameActions.selectPayment(cards);
  };

  const handleNewGame = () => {
    if (isBotGame) {
      localGame.startGame();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            Back to Lobby
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900">Monopoly Deal</h1>
            {isMultiplayer && (
              <div className="flex items-center gap-2 justify-center mt-1">
                <p className="text-xs text-slate-500">Room: {roomId}</p>
                {connected ? (
                  <Wifi size={14} className="text-green-500" title="Connected" />
                ) : (
                  <WifiOff size={14} className="text-red-500" title="Disconnected" />
                )}
              </div>
            )}
            {isBotGame && (
              <div className="flex items-center gap-2 justify-center mt-1">
                <p className="text-xs text-blue-600">Bot Game</p>
                {movesLeft > 0 && currentTurnIndex === 0 && (
                  <span className="text-xs text-slate-500">• {movesLeft} moves left</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isMultiplayer && !backendGameState && connected && (
              <button
                onClick={startMultiplayerGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
              >
                Start Game
              </button>
            )}
            {isBotGame && gameState === 'SETUP' && (
              <button
                onClick={handleNewGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
              >
                Start Game
              </button>
            )}
            {gameState === 'PLAYING' && currentTurnIndex === 0 && movesLeft === 0 && (
              <button
                onClick={handleEndTurn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
              >
                End Turn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4">
          <p className="font-bold">Connection Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Win Screen */}
      {winner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <Trophy size={64} className="mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {winner.name} Wins!
            </h2>
            <p className="text-slate-600 mb-6">
              Completed 3 full property sets
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleNewGame}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                New Game
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stadium Layout */}
      <div className="h-[calc(100vh-80px)]">
        <StadiumLayout
          players={players}
          currentPlayerId="player-0"
          currentTurnIndex={currentTurnIndex}
          hasDrawnThisTurn={hasDrawnThisTurn}
          onDraw={handleDraw}
          onOpponentSelect={(player) => {
            console.log('Selected opponent:', player.name);
          }}
          onCardClick={handleCardClick}
        />
      </div>

      {/* Action Dialogs */}
      {showCardActionDialog && selectedCard && (
        <CardActionDialog
          card={selectedCard}
          onConfirm={handleCardActionConfirm}
          onCancel={handleCardActionCancel}
        />
      )}

      {gameActions.targetSelectionMode && (
        <TargetSelectionDialog
          card={gameActions.pendingAction}
          targetType={gameActions.targetSelectionMode.type}
          players={players}
          currentPlayerId="player-0"
          onSelect={handleTargetSelect}
          onCancel={gameActions.cancelAction}
        />
      )}

      {gameActions.paymentSelectionMode && (
        <PaymentSelectionDialog
          amount={gameActions.paymentSelectionMode.amount}
          player={players.find(p => p.id === 'player-0')}
          onConfirm={handlePaymentConfirm}
          onCancel={gameActions.cancelAction}
        />
      )}
    </div>
  );
};

export default Game;
