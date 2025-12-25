import React, { useState } from 'react';
import OpponentCard from './OpponentCard';
import HandCountDisplay from './HandCountDisplay';
import Card from './Card';
import { CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';
import { X, DollarSign, Home, Zap } from 'lucide-react';

const StadiumLayout = ({ 
  players = [], 
  currentPlayerId, 
  currentTurnIndex = 0,
  hasDrawnThisTurn = false,
  onOpponentSelect,
  onCardClick,
  deck = [],
  discardPile = [],
  onDraw
}) => {
  const [pendingCard, setPendingCard] = useState(null);
  // Filter out current player
  // Seating arrangement: Start with current player at index 0
  const humanIdx = players.findIndex(p => p.id === currentPlayerId);
  const seatedPlayers = humanIdx === -1 ? players : [
    players[humanIdx],
    ...players.slice(humanIdx + 1),
    ...players.slice(0, humanIdx)
  ];
  const currentPlayer = players[humanIdx];
  
  // Check if it's the human player's turn and they haven't drawn yet
  const isHumanTurn = players[currentTurnIndex]?.isHuman;
  const shouldShowDrawPrompt = isHumanTurn && !hasDrawnThisTurn;
  
  // Calculate position around an ellipse for player info boxes (closer to center)
  const getPlayerPosition = (index, totalOpponents) => {
    // Ellipse parameters (percentage of container)
    const centerX = 50; // Center X (%)
    const centerY = 40; // Center Y (%) - slightly higher to leave room for player at bottom
    const radiusX = 35; // Horizontal radius (%) - closer to center
    const radiusY = 25; // Vertical radius (%) - closer to center
    
    // Start from bottom and go clockwise
    // Angle in radians (π/2 = bottom)
    const startAngle = Math.PI / 2; 
    const angleStep = (2 * Math.PI) / totalOpponents;
    const angle = startAngle + (index * angleStep);
    
    // Calculate position on ellipse
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)', // Center the card on the position
      angle: angle // Pass angle for card fan positioning
    };
  };

  // Calculate position for card fans (further out, around the table)
  const getCardFanPosition = (index, totalOpponents) => {
    const centerX = 50;
    const centerY = 40;
    const radiusX = 45; // Further out from center
    const radiusY = 35; // Further out from center
    
    const startAngle = Math.PI / 2;
    const angleStep = (2 * Math.PI) / totalOpponents;
    const angle = startAngle + (index * angleStep);
    
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    // Calculate rotation so cards face the center
    const rotationDeg = (angle * 180 / Math.PI) + 90;
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`,
      angle: angle
    };
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Main game area with circular layout */}
      <div className="flex-1 relative overflow-hidden bg-slate-50">
        {/* Table background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-[80%] h-[70%] rounded-[50%] bg-white shadow-2xl border-8 border-blue-600"
            style={{
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            {/* Table texture */}
            <div className="absolute inset-0 rounded-[50%] opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle at 30% 30%, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Center logo/text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-black text-slate-100 mb-2">MONOPOLY</div>
                <div className="text-3xl font-black text-slate-100">DEAL</div>
              </div>
            </div>
            
            {/* Deck and Discard in center */}
            <div className="absolute inset-0 flex items-center justify-center gap-8">
              {/* Deck */}
              <div 
                className="flex flex-col items-center gap-2 mt-32 cursor-pointer group relative"
                onClick={onDraw}
              >
                {/* "Your Turn - Draw Cards" Prompt */}
                {shouldShowDrawPrompt && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 animate-bounce">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-2xl border-2 border-blue-400">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-black uppercase tracking-wider">Your Turn!</div>
                          <div className="text-xs font-bold opacity-90">Draw 2 Cards</div>
                        </div>
                      </div>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-700"></div>
                  </div>
                )}
                
                <div 
                  className={`w-20 h-28 bg-gradient-to-br from-red-600 to-red-700 rounded-lg border-4 border-white shadow-xl flex items-center justify-center relative transition-all ${
                    shouldShowDrawPrompt
                      ? 'group-hover:scale-110 group-hover:-translate-y-2 animate-pulse-glow' 
                      : 'group-hover:scale-105 group-hover:-translate-y-1'
                  }`}
                  style={
                    shouldShowDrawPrompt
                      ? { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)' }
                      : {}
                  }
                >
                  <div className="absolute inset-0 opacity-15 rounded-lg" style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
                    backgroundSize: '15px 15px'
                  }}></div>
                  <div className="text-white font-black text-2xl z-10">{deck.length > 0 ? 'M' : ''}</div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border transition-all ${
                  shouldShowDrawPrompt
                    ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}>
                  DECK ({deck.length})
                </span>
              </div>

              {/* Discard */}
              <div className="flex flex-col items-center gap-2 mt-32">
                <div className="w-20 h-28 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg border-4 border-white shadow-xl flex items-center justify-center">
                  {discardPile.length > 0 ? (
                    <div className="w-full h-full p-2 text-center flex items-center justify-center">
                       <span className="text-white text-[10px] font-bold uppercase">{discardPile[discardPile.length - 1].name}</span>
                    </div>
                  ) : (
                    <span className="text-white text-xs font-bold">DISCARD</span>
                  )}
                </div>
                <span className="text-slate-700 text-xs font-bold bg-white px-3 py-1.5 rounded-lg shadow-md border border-slate-200">DISCARD ({discardPile.length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Players positioned around the table */}
        {seatedPlayers.map((player, index) => {
          const infoPosition = getPlayerPosition(index, seatedPlayers.length);
          const fanPosition = getCardFanPosition(index, seatedPlayers.length);
          const isCurrentTurn = players[currentTurnIndex]?.id === player.id;
          const isMe = player.id === currentPlayerId;
          
          return (
            <React.Fragment key={player.id}>
              {/* Player info box (bank & properties) - closer to center */}
              <div
                className="absolute z-20"
                style={{
                  left: infoPosition.left,
                  top: infoPosition.top,
                  transform: infoPosition.transform
                }}
              >
                <OpponentCard
                  player={player}
                  isCurrentTurn={isCurrentTurn}
                  isTargetable={false}
                  onSelect={onOpponentSelect}
                  onCardClick={onCardClick}
                  compact={seatedPlayers.length > 3}
                  showHand={false}
                />
              </div>
              
              {/* Card fan - around table perimeter (only for bots) */}
              {!isMe && (
              <div
                className="absolute z-10"
                style={{
                  left: fanPosition.left,
                  top: fanPosition.top,
                  transform: fanPosition.transform
                }}
              >
                <HandCountDisplay 
                  cardCount={player.hand?.length || 0}
                  compact={true}
                />
              </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Empty state */}
        {seatedPlayers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-slate-700 text-xl font-bold py-12 bg-white/90 px-8 rounded-xl shadow-2xl border-2 border-slate-200">
              Waiting for opponents...
            </div>
          </div>
        )}
      </div>

      {/* Current Player Area at bottom */}
      {currentPlayer && (
        <div className="bg-white p-6 border-t-4 border-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto">
            {/* Top Section: Bank and Properties */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Bank */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-green-800 uppercase tracking-wider">💰 Bank</h3>
                  <div className="text-2xl font-black text-green-600">
                    ${currentPlayer.bank?.reduce((sum, c) => sum + (c.value || 0), 0) || 0}M
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[80px]">
                  {currentPlayer.bank?.length > 0 ? (
                    currentPlayer.bank.map((card, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg border-2 border-green-300 shadow-md flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => onCardClick && onCardClick(card)}
                      >
                        <div className="text-green-800 font-black text-lg">${card.value}M</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-green-600/50 text-sm italic w-full text-center py-6">No money in bank</div>
                  )}
                </div>
              </div>
              
              {/* Properties */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-blue-800 uppercase tracking-wider">🏠 Properties</h3>
                  <div className="text-2xl font-black text-blue-600">
                    {currentPlayer.properties?.length || 0}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[80px]">
                  {currentPlayer.properties?.length > 0 ? (
                    currentPlayer.properties.map((prop, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-24 rounded-lg border-2 border-white shadow-md flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                        style={{
                          backgroundColor: prop.currentColor ? (prop.currentColor === 'multi' ? '#fff' : prop.currentColor) : (prop.color || '#666')
                        }}
                        onClick={() => onCardClick && onCardClick(prop)}
                      >
                        <div className="text-white font-black text-xs text-center px-1 drop-shadow-lg">
                          {prop.name?.substring(0, 8) || '?'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-blue-600/50 text-sm italic w-full text-center py-6">No properties</div>
                  )}
                </div>
              </div>
            </div>

            {/* Hand Cards */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">🃏 Hand ({currentPlayer.hand?.length || 0} cards)</h3>
              <div className="flex justify-center -space-x-12 h-56 py-1 overflow-x-visible">
                {currentPlayer.hand?.map((card, idx) => (
                  <div 
                    key={card.uid || card.id || idx}
                    className="flex-shrink-0 transition-all hover:-translate-y-24 hover:z-[100] hover:px-12"
                    style={{ zIndex: 50 + idx }}
                  >
                    <Card 
                      card={card} 
                      size="lg"
                      onClick={() => {
                        console.log('Card clicked in Stadium:', card.name);
                        setPendingCard(card);
                      }}
                      className="cursor-pointer shadow-2xl border-4 border-white hover:border-blue-500"
                    />
                  </div>
                ))}
                {currentPlayer.hand?.length === 0 && (
                  <div className="text-slate-400 font-bold italic py-8 text-center w-full">Hand is empty - Draw cards to begin!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Play Confirmation Overlay */}
      {pendingCard && (
        <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Play Card</h2>
              <button
                onClick={() => setPendingCard(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            {/* Card Display */}
            <div className="flex justify-center py-4">
              <Card card={pendingCard} size="xl" enableHover={false} />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              {/* Bank Option */}
              {pendingCard.type !== CARD_TYPES.PROPERTY && pendingCard.type !== CARD_TYPES.PROPERTY_WILD && (
                <button
                  onClick={() => {
                    if (onCardClick) onCardClick(pendingCard, 'BANK');
                    setPendingCard(null);
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:scale-105 transition-all shadow-md hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-black text-green-800 text-sm uppercase tracking-wider">Bank It</div>
                    <div className="text-xs text-green-600 mt-1">Add to bank</div>
                  </div>
                </button>
              )}

              {/* Property Option */}
              {(pendingCard.type === CARD_TYPES.PROPERTY || pendingCard.type === CARD_TYPES.PROPERTY_WILD) && (
                <button
                  onClick={() => {
                    if (onCardClick) onCardClick(pendingCard, 'PROPERTY');
                    setPendingCard(null);
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl hover:scale-105 transition-all shadow-md hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Home size={24} className="text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-black text-blue-800 text-sm uppercase tracking-wider">Play Property</div>
                    <div className="text-xs text-blue-600 mt-1">Add to properties</div>
                  </div>
                </button>
              )}

              {/* Action Option */}
              {(pendingCard.type === CARD_TYPES.ACTION || pendingCard.type === CARD_TYPES.RENT || pendingCard.type === CARD_TYPES.RENT_WILD) && (
                <button
                  onClick={() => {
                    if (onCardClick) onCardClick(pendingCard, 'ACTION');
                    setPendingCard(null);
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl hover:scale-105 transition-all shadow-md hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-black text-purple-800 text-sm uppercase tracking-wider">Use Action</div>
                    <div className="text-xs text-purple-600 mt-1">Play card effect</div>
                  </div>
                </button>
              )}
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setPendingCard(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StadiumLayout;

