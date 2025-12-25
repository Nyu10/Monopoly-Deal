import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Wifi, WifiOff, Trophy } from 'lucide-react';
import StadiumLayout from '../components/StadiumLayout';
import { CardActionDialog, TargetSelectionDialog, PaymentSelectionDialog, DiscardDialog } from '../components/ActionDialogs';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useGameActions } from '../hooks/useGameActions';
import { useLocalGameState } from '../hooks/useLocalGameState';
import { BOT_DIFFICULTY } from '../ai/BotEngine';
import { ACTION_TYPES } from '../utils/gameHelpers';

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
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
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
  const matchLog = isMultiplayer ? (backendGameState?.matchLog || []) : localGame.matchLog;

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
    // Check for excess cards before ending turn
    const currentPlayer = players.find(p => p.id === 'player-0'); // Assuming 'player-0' is always human in local game
    // For multiplayer, we'd check checking against backendGameState.players[backendGameState.socketId] ?

    if (!isMultiplayer && currentPlayer && currentPlayer.hand.length > 7) {
      setShowDiscardDialog(true);
      return;
    }

    if (isMultiplayer) {
      gameActions.endTurn();
    } else {
      localGame.endTurn();
    }
  };

  const handleDiscardConfirm = (cardsToDiscard) => {
    const cardIds = cardsToDiscard.map(c => c.id);
    if (isMultiplayer) {
      // Multiplayer implementation would go here (likely a specific move type)
      // For now, assuming local game for this feature as requested context implies local play mostly
      console.warn("Multiplayer discard not fully implemented in UI layer yet");
    } else {
      localGame.discardCards(cardIds);
      localGame.endTurn();
    }
    setShowDiscardDialog(false);
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
      let destination = 'PROPERTIES';
      if (actionType === 'BANK') {
        destination = 'BANK';
      } else if (actionType === 'ACTION' || actionType === 'RENT') {
        destination = 'DISCARD';
      }
      
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
    if (isMultiplayer) {
      gameActions.selectTarget(target);
    } else {
      // Local game: handle target selection
      if (gameActions.pendingAction) {
        const card = gameActions.pendingAction;
        
        // For Debt Collector and Birthday, pass the targetPlayerId
        if (card.actionType === ACTION_TYPES.DEBT_COLLECTOR || card.actionType === ACTION_TYPES.BIRTHDAY) {
          localGame.playCard(card.id, 'DISCARD', target.playerId);
        } else {
          // Other actions would be handled here
          localGame.playCard(card.id, 'DISCARD', target.playerId, target.cardId);
        }
        
        gameActions.cancelAction();
      }
    }
  };

  const handlePaymentConfirm = (cards) => {
    gameActions.selectPayment(cards);
  };
  
  const handleFlipConfirm = () => {
    if (!selectedCard) return;
    if (isMultiplayer) {
      console.warn("Multiplayer flip not implemented");
    } else {
      localGame.flipWildCard(selectedCard.id);
    }
    setShowCardActionDialog(false);
    setSelectedCard(null);
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
            {currentTurnIndex === 0 && gameState !== 'GAME_OVER' && gameState !== 'SETUP' && (
              <button
                onClick={handleEndTurn}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                End
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
      <div className="h-[calc(100vh-80px)] relative overflow-hidden">
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
          deck={isMultiplayer ? (backendGameState?.deck || []) : localGame.deck}
          discardPile={isMultiplayer ? (backendGameState?.discardPile || []) : localGame.discardPile}
          matchLog={matchLog}
          actionConfirmation={
            showCardActionDialog && selectedCard ? (
              <CardActionDialog
                card={selectedCard}
                onConfirm={handleCardActionConfirm}
                onCancel={handleCardActionCancel}
                onFlip={handleFlipConfirm}
              />
            ) : null
          }
        />

        {/* Floating Game Controls (Bottom Right) */}
        {currentTurnIndex === 0 && gameState !== 'GAME_OVER' && gameState !== 'SETUP' && (
          <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 z-40">
            {!hasDrawnThisTurn && (
              <div className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl border-2 border-blue-400 animate-pulse font-black uppercase tracking-wider mb-2">
                Draw Cards to Move!
              </div>
            )}
            {movesLeft >= 0 && hasDrawnThisTurn && (
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 animate-bounce">
                <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-sm font-bold text-slate-700">{movesLeft} Moves Left</span>
              </div>
            )}
            <button
              onClick={handleEndTurn}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl hover:shadow-red-500/20 active:scale-95 border-b-4 border-red-900 group flex items-center gap-3"
            >
              <span>End</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Status Indicators (Bottom Left) */}
        {currentTurnIndex !== 0 && (
          <div className="absolute bottom-8 left-8 z-40">
            <div className="bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-white font-bold">{players[currentTurnIndex]?.name}'s Turn...</span>
            </div>
          </div>
        )}
      </div>

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

      {showDiscardDialog && (
        <DiscardDialog
          cards={players.find(p => p.id === 'player-0')?.hand || []}
          movesLeft={movesLeft}
          onConfirm={handleDiscardConfirm}
          onCancel={movesLeft > 0 ? () => setShowDiscardDialog(false) : undefined}
        />
      )}
    </div>
  );
};

export default Game;
