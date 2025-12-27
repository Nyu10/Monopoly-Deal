import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Wifi, WifiOff, Trophy, Settings, Beaker } from 'lucide-react';
import StadiumLayout from '../components/StadiumLayout';
import { CardActionDialog, TargetSelectionDialog, PaymentSelectionDialog, DiscardDialog, RentColorSelectionDialog } from '../components/ActionDialogs';
import SettingsModal from '../components/SettingsModal';
import WildCardSetSelectionDialog from '../components/WildCardSetSelectionDialog';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useGameActions } from '../hooks/useGameActions';
import { useLocalGameState } from '../hooks/useLocalGameState';
import { useSettings } from '../hooks/useSettings';
import { useLocalMultiplayerSync } from '../hooks/useLocalMultiplayerSync';
import { BOT_DIFFICULTY } from '../ai/BotEngine';
import { ACTION_TYPES, CARD_TYPES, calculateBankTotal, getPreferredDestination, getSets, COLORS } from '../utils/gameHelpers';

/**
 * Main Game Component
 * Supports three modes:
 * 1. Multiplayer (/game/:roomId) - Connect to backend
 * 2. Bot Game (/stadium) - Local game with AI bots
 * 3. Sandbox (/sandbox) - Testing mode
 * 4. Demo (fallback) - Testing only
 */
const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, playerId } = useParams();
  const [showCardActionDialog, setShowCardActionDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showWildCardSetDialog, setShowWildCardSetDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const { settings } = useSettings();

  // Determine game mode
  const isMultiplayer = !!roomId;
  const isLocalMultiplayer = !!playerId;
  const isSandbox = location.pathname.includes('/sandbox');
  const isBotGame = (!roomId && !playerId) || isSandbox; // /stadium, /sandbox route or offline
  const playerIdentity = isLocalMultiplayer ? `player-${parseInt(playerId) - 1}` : 'player-0';

  // Multiplayer mode: Connect to backend
  const { gameState: backendGameState, connected, error, sendMove, startGame: startMultiplayerGame } = useGameWebSocket(roomId);

  // Bot game or Local Multiplayer mode: Local game state
  const loadInitialState = () => {
    if (isLocalMultiplayer) {
      const saved = localStorage.getItem('monopoly_deal_sync_state');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved state', e);
        }
      }
    }
    return null;
  };

  const localGame = useLocalGameState(4, BOT_DIFFICULTY.MEDIUM, loadInitialState(), isLocalMultiplayer, isSandbox);

  // Sync state if in local multiplayer mode
  useLocalMultiplayerSync(localGame, isLocalMultiplayer);

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

  // Auto-start game on mount
  useEffect(() => {
    if (isBotGame && gameState === 'SETUP') {
      localGame.startGame();
    }
    // In local multiplayer, only player 1 starts the game automatically
    // or if no state exists yet
    if (isLocalMultiplayer && playerId === '1' && gameState === 'SETUP') {
      const savedState = localStorage.getItem('monopoly_deal_sync_state');
      if (!savedState) {
        localGame.startGame();
      }
    }
  }, [isBotGame, isLocalMultiplayer, playerId, gameState, localGame]);

  const handleDraw = () => {
    if (isMultiplayer) {
      gameActions.drawCards();
    } else {
      localGame.drawCards();
    }
  };

  const handleEndTurn = () => {
    // Check for excess cards before ending turn
    const currentPlayer = players.find(p => p.id === playerIdentity); 

    if ((isBotGame || isLocalMultiplayer) && currentPlayer && currentPlayer.hand.length > 7 && !isSandbox) {
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
    // Only allow current player to click cards during their turn
    if (currentTurnIndex !== parseInt(playerIdentity.split('-')[1])) return;
    if (gameState !== 'PLAYING') return;

    const currentPlayer = players.find(p => p.id === playerIdentity);
    const isInHand = currentPlayer?.hand.some(c => c.id === card.id);
    const isInProperties = currentPlayer?.properties.some(c => c.id === card.id);

    // 1. If in hand, must have moves left
    if (isInHand) {
      if (movesLeft <= 0) return;
    } 
    // 2. If in properties, must be a flippable wild card
    else if (isInProperties) {
      if (card.type !== CARD_TYPES.PROPERTY_WILD || card.colors?.length !== 2) return;
    } 
    // 3. Otherwise (bank or opponent card), ignore click
    else {
      return;
    }

    setSelectedCard(card);
    
    // For local games, we want to allow banking action/rent/building cards
    const isMoney = card.type === CARD_TYPES.MONEY;
    const isSimpleProperty = card.type === CARD_TYPES.PROPERTY && !card.actionType;
    const isWildProperty = card.type === CARD_TYPES.PROPERTY_WILD;
    
    // 1. If it's a pure money card, bank it immediately UNLESS confirmation is forced
    if (isInHand && isMoney && !settings.confirmAllMoves) {
      handleCardActionConfirm('BANK', card);
      return;
    }
    
    // 2. If it's a simple property card, play it immediately UNLESS confirmation is forced
    if (isInHand && isSimpleProperty && !settings.confirmAllMoves) {
      handleCardActionConfirm('PROPERTY', card);
      return;
    }

    // 3. If it's a wild property card in hand, show the wild card set selection dialog
    if (isInHand && isWildProperty) {
      setShowWildCardSetDialog(true);
      return;
    }

    // 4. Cards that require target selection go DIRECTLY to their specialized UI
    //    The TargetSelectionDialog already has a "Bank It" option built in, so we
    //    don't need a separate "Play vs Bank" dialog first.
    if (isInHand && gameActions.requiresTarget(card)) {
      handleCardActionConfirm('ACTION', card);
      return;
    }

    // 5. For everything else (2-color Rent, Pass Go, Wild Properties in play, etc.), 
    //    show the CardActionDialog to let player choose between action and banking.
    setShowCardActionDialog(true);
  };

  const getRentOptions = (card) => {
    if (card.type !== CARD_TYPES.RENT || !card.colors) return null;
    
    const currentPlayer = players.find(p => p.id === playerIdentity);
    if (!currentPlayer) return null;

    const sets = getSets(currentPlayer.properties);
    
    return card.colors.map(color => {
      const set = sets.find(s => s.color === color);
      const currentRent = set ? set.rent : 0;
      
      let displayRent = currentRent;
      let requiresFlip = false;
      
      // If current rent is 0, check if we can flip potential cards
      if (currentRent === 0) {
        const potentialCards = currentPlayer.properties.filter(p => 
          (p.colors && p.colors.includes(color)) || p.color === color
        );
        
        if (potentialCards.length > 0) {
           const colorDef = COLORS[color];
           if (colorDef) {
               const count = potentialCards.length;
               const rentIndex = Math.min(count - 1, colorDef.rent.length - 1);
               const potentialVal = colorDef.rent[rentIndex];
               if (potentialVal > 0) {
                   displayRent = potentialVal;
                   requiresFlip = true;
               }
           }
        }
      }

      const colorData = COLORS[color];
      const colorName = colorData ? colorData.name : color;
      return { 
          color, 
          colorName, 
          rent: displayRent,
          requiresFlip
      };
    });
  };

  const handleCardActionConfirm = (action, cardOverride = null) => {
    const cardToUse = cardOverride || selectedCard;
    if (!cardToUse) return;
    
    // Handle Rent Color Selection from Dialog
    if (typeof action === 'object' && action.type === 'RENT') {
       // Note: We no longer auto-flip here manually because playCard (RENT) now handles 
       // temporary effective property calculation and persists the flip if needed.
       // This prevents duplicate log messages and race conditions.

       let auxCardId = null;
       if (action.useDoubleRent) {
          const currentPlayer = players.find(p => p.id === playerIdentity);
          const doubleRentCard = currentPlayer?.hand.find(c => c.actionType === ACTION_TYPES.DOUBLE_RENT);
          if (doubleRentCard) auxCardId = doubleRentCard.id;
       }

       if (isMultiplayer) {
          sendMove({
            type: 'PLAY_CARD', 
            cardId: cardToUse.id,
            actionType: 'RENT',
            targetCardId: action.color,
            auxiliaryCardId: auxCardId
          });
       } else {
          localGame.playCard(cardToUse.id, 'DISCARD', null, action.color, auxCardId);
       }
       setShowCardActionDialog(false);
       setSelectedCard(null);
       return;
    }

    const actionType = action;
    
    if (isMultiplayer) {
      gameActions.playCard(cardToUse, actionType);
    } else {
      // Local game logic
      const destination = getPreferredDestination(cardToUse, actionType);
      
      if (destination === 'BANK') {
        localGame.playCard(cardToUse.id, 'BANK');
      } else {
        // Not banking, so we're playing it for its effect
        if (gameActions.requiresTarget(cardToUse)) {
          // Card requires target selection (e.g., SLY_DEAL, HOUSE, etc.)
          gameActions.playCard(cardToUse, 'AUTO');
        } else {
          // Simple action card (e.g., PASS_GO)
          localGame.playCard(cardToUse.id, destination);
        }
      }
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

        // NEW: Handle "Bank It" option directly from Target Dialog
        if (target.action === 'BANK') {
           localGame.playCard(card.id, 'BANK');
           gameActions.cancelAction();
           return;
        }

        const isBuilding = card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL;
        const destination = isBuilding ? 'PROPERTIES' : 'DISCARD';
        
        // Handle Forced Deal specifically (Swap)
        if (card.actionType === ACTION_TYPES.FORCED_DEAL) {
           // For Forced Deal, we pass 'myCardId' as the destination param, as per useLocalGameState implementation
           // The target object contains { myCardId, opponentId, opponentCardId }
           localGame.playCard(card.id, target.myCardId, target.opponentId, target.opponentCardId);
        }
        // For Debt Collector and Birthday, pass the targetPlayerId
        else if (card.actionType === ACTION_TYPES.DEBT_COLLECTOR || card.actionType === ACTION_TYPES.BIRTHDAY) {
           localGame.playCard(card.id, destination, target.playerId);
        } else {
           // Other actions (Sly Deal, Deal Breaker, Rent, Buildings)
           // For buildings/rent, target.cardId will be the UID of a property or a color string
           localGame.playCard(card.id, destination, target.playerId, target.cardId);
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

  const handleWildCardSetSelect = (selection) => {
    if (!selectedCard) return;
    
    if (isMultiplayer) {
      // For multiplayer, we'd need to send this to the server
      console.warn("Multiplayer wild card placement not fully implemented");
    } else {
      // If player chose to bank the card
      if (selection.asBank) {
        localGame.playCard(selectedCard.id, 'BANK');
      } else {
        // Play directly with the selected color as the targetCardId argument
        localGame.playCard(selectedCard.id, 'PROPERTIES', null, selection.color);
      }
    }
    
    setShowWildCardSetDialog(false);
    setSelectedCard(null);
  };

  const handleNewGame = () => {
    if (isBotGame) {
      localGame.startGame();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-50 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Lobby
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monopoly Deal</h1>
            {isMultiplayer && (
              <div className="flex items-center gap-2 justify-center mt-1">
                <p className="text-xs text-slate-500 font-medium">Room: {roomId}</p>
                {connected ? (
                  <Wifi size={14} className="text-green-500" title="Connected" />
                ) : (
                  <WifiOff size={14} className="text-red-500" title="Disconnected" />
                )}
              </div>
            )}
            {isLocalMultiplayer && (
              <div className="flex items-center gap-2 justify-center mt-1">
                <p className="text-xs text-purple-600 font-bold">Local Multiplayer • {players[parseInt(playerId)-1]?.name}</p>
              </div>
            )}
            {isBotGame && (
              <div className="flex items-center gap-2 justify-center mt-1">
                {isSandbox ? (
                    <p className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Beaker size={12} /> Sandbox Mode
                    </p>
                ) : (
                    <p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Bot Game</p>
                )}
                {gameState === 'REQUEST_PAYMENT' && <span className="text-xs text-red-500 font-black animate-pulse">• PAYMENT REQUIRED</span>}
                {movesLeft > 0 && currentTurnIndex === 0 && gameState === 'PLAYING' && (
                  <span className="text-xs text-slate-500">• {movesLeft} moves left</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="group flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg font-medium transition-all border border-slate-200 hover:border-slate-300 shadow-sm"
              title="Settings"
            >
              <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            {isMultiplayer && !backendGameState && connected && (
              <button
                onClick={startMultiplayerGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
              >
                Start Game
              </button>
            )}
            {(isBotGame || (isLocalMultiplayer && playerId === '1')) && gameState === 'SETUP' && (
              <button
                onClick={handleNewGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
              >
                Start Game
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


      {/* Stadium Layout */}
      <div className="h-[calc(100vh-80px)] relative overflow-hidden">
        <StadiumLayout
          players={players}
          currentPlayerId={playerIdentity}
          currentTurnIndex={currentTurnIndex}
          isSandbox={isSandbox}
          hasDrawnThisTurn={hasDrawnThisTurn}
          onDraw={handleDraw}
          onEndTurn={handleEndTurn}
          movesLeft={movesLeft}
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
                isInHand={players.find(p => p.id === playerIdentity)?.hand.some(c => c.id === selectedCard.id)}
                rentOptions={getRentOptions(selectedCard)}
                hand={players.find(p => p.id === playerIdentity)?.hand}
                movesLeft={movesLeft}
              />
            ) : null
          }
        />

        {/* Floating Game Controls (Bottom Right) */}
        {currentTurnIndex === parseInt(playerIdentity.split('-')[1]) && gameState !== 'GAME_OVER' && gameState !== 'SETUP' && (
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
          <div className="absolute bottom-8 left-8 z-30">
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

      {gameActions.targetSelectionMode && gameActions.targetSelectionMode.type === 'RENT_COLOR' && (
        <RentColorSelectionDialog
          card={gameActions.pendingAction}
          player={players.find(p => p.id === playerIdentity)}
          onSelect={handleTargetSelect}
          onCancel={gameActions.cancelAction}
        />
      )}

      {gameActions.targetSelectionMode && gameActions.targetSelectionMode.type !== 'RENT_COLOR' && (
        <TargetSelectionDialog
          card={gameActions.pendingAction}
          targetType={gameActions.targetSelectionMode.type}
          players={players}
          currentPlayerId={playerIdentity}
          onSelect={handleTargetSelect}
          onCancel={gameActions.cancelAction}
        />
      )}

      {(gameActions.paymentSelectionMode || ((isBotGame || isLocalMultiplayer) && gameState === 'REQUEST_PAYMENT')) && (
        <PaymentSelectionDialog
          amount={isBotGame || isLocalMultiplayer ? localGame.pendingRequest?.amount : gameActions.paymentSelectionMode.amount}
          player={players.find(p => p.id === playerIdentity)}
          onConfirm={(cards) => {
            if ((isBotGame || isLocalMultiplayer) && gameState === 'REQUEST_PAYMENT') {
              localGame.confirmPayment(cards);
            } else {
              handlePaymentConfirm(cards);
            }
          }}
          onCancel={isBotGame || isLocalMultiplayer ? undefined : gameActions.cancelAction} // Cannot cancel a forced payment/debt
        />
      )}

      {showDiscardDialog && (
        <DiscardDialog
          cards={players.find(p => p.id === playerIdentity)?.hand || []}
          movesLeft={movesLeft}
          onConfirm={handleDiscardConfirm}
          onCancel={movesLeft > 0 ? () => setShowDiscardDialog(false) : undefined}
        />
      )}

      {showWildCardSetDialog && selectedCard && (
        <WildCardSetSelectionDialog
          card={selectedCard}
          player={players.find(p => p.id === playerIdentity)}
          onSelect={handleWildCardSetSelect}
          onCancel={() => {
            setShowWildCardSetDialog(false);
            setSelectedCard(null);
          }}
        />
      )}


      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Win Screen */}
      {winner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-md w-full p-10 text-center animate-in zoom-in-95 duration-500 ring-1 ring-white/20">
            <div className="relative mb-6">
              <Trophy size={80} className="mx-auto text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 -z-10"></div>
            </div>
            
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
              {winner.id === playerIdentity ? 'YOU WIN!' : `${winner.name} Wins!`}
            </h2>
            <div className="h-1.5 w-20 bg-yellow-400 mx-auto rounded-full mb-6"></div>
            
            <p className="text-slate-500 font-medium mb-10 text-lg">
              Completed 3 full property sets with master strategy!
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleNewGame}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-green-500/20 active:scale-95 border-b-4 border-green-800"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-bold transition-all hover:text-slate-900"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
