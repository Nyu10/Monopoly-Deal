import React, { useState } from 'react';
import OpponentCard from './OpponentCard';
import HandCountDisplay from './HandCountDisplay';
import Card from './Card';
import { CARD_TYPES, ACTION_TYPES, COLORS } from '../utils/gameHelpers';
import { X, DollarSign, Home, Zap } from 'lucide-react';
import PropertySetDisplay from './PropertySetDisplay';
import { BankCardMini } from './MiniCard';
import QuickRules from './QuickRules';
import { HelpCircle } from 'lucide-react';
import CARD_BACK_STYLES from '../utils/cardBackStyles';

const StadiumLayout = ({ 
  players = [], 
  currentPlayerId, 
  currentTurnIndex = 0,
  hasDrawnThisTurn = false,
  onOpponentSelect,
  onCardClick,
  deck = [],
  discardPile = [],
  onDraw,
  actionConfirmation = null,
  matchLog = []
}) => {
  // Filter out current player
  // Seating arrangement: Start with current player at index 0
  const [showRules, setShowRules] = useState(false);
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
    <div className="w-full h-full flex bg-slate-50 overflow-hidden">
      
      {/* LEFT SIDEBAR: Match Log */}
      <div className="w-80 h-full flex-shrink-0 bg-white border-r border-slate-200 z-50 flex flex-col shadow-xl relative">
        {/* Background Gradient/Texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-sm flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/30"></div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Match Log</h3>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">{matchLog.length} Actions</span>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent z-10">
          {matchLog.length === 0 && (
             <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                <div className="w-12 h-12 rounded-full bg-slate-100 mb-3 flex items-center justify-center">
                  <span className="text-xl">🎲</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Game is starting...</p>
             </div>
          )}
          
          {matchLog.map((log) => {
            const cardColor = log.card ? (log.card.currentColor || log.card.color) : null;
            const colorData = cardColor ? COLORS[cardColor] : null;
            
            // Handle Multi/Rainbow color for styling
            const isMulti = cardColor === 'multi';
            const borderStyle = isMulti 
              ? { borderLeft: '4px solid #FFD700', borderImage: 'linear-gradient(to bottom, #f06, #4a90e2, #7ed321, #f5a623) 1' }
              : (colorData ? { borderLeft: `4px solid ${colorData.hex}` } : {});

            return (
              <div key={log.id} className="group relative">
                {/* Timeline connector */}
                <div className="absolute left-[6px] top-7 bottom-[-16px] w-[2px] bg-slate-200 group-last:hidden"></div>
                
                {/* Log Item */}
                <div className="relative pl-0">
                  <div 
                    className="text-sm bg-white hover:bg-slate-50 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-200 group-hover:translate-x-1 group-hover:shadow-md overflow-hidden"
                    style={borderStyle}
                  >
                    {/* Header: Avatar + Name + Time */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-3 h-3 rounded-full shadow-lg border-2 border-white box-content ${
                        log.player === 'You' || log.player === currentPlayer?.name 
                          ? 'bg-blue-500 ring-2 ring-blue-100' 
                          : 'bg-red-500 ring-2 ring-red-100'
                      }`}></div>
                      <span className={`font-bold text-xs tracking-wide ${
                        log.player === 'You' || log.player === currentPlayer?.name ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {log.player}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {new Date(log.id).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* Message */}
                    <div className="text-slate-600 text-xs leading-relaxed pl-1 font-medium">
                      {log.message}
                    </div>
                    
                    {/* Action Badge (if card involved) */}
                    {log.card && (() => {
                      // Determine styles based on card type and action
                      let badgeStyle = {};
                      let badgeClass = "mt-2.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 border transition-colors w-full ";
                      
                      if (log.action === 'BANK') {
                        badgeClass += "bg-emerald-50 text-emerald-700 border-emerald-200";
                      } else if (log.action === 'PROPERTY' && colorData) {
                        badgeStyle = {
                          backgroundColor: `${colorData.hex}15`, // Very light version of the color
                          color: colorData.hex,
                          borderColor: `${colorData.hex}40`
                        };
                      } else if (log.card.type === CARD_TYPES.ACTION) {
                        // Generic action style if not specifically handled
                        badgeClass += "bg-slate-50 text-slate-600 border-slate-200";
                      } else if ((log.card.type === CARD_TYPES.RENT || log.card.type === CARD_TYPES.RENT_WILD) && colorData) {
                        badgeStyle = {
                          backgroundColor: `${colorData.hex}15`,
                          color: colorData.hex,
                          borderColor: `${colorData.hex}40`
                        };
                      } else {
                        badgeClass += "bg-slate-50 text-slate-600 border-slate-200";
                      }

                      return (
                        <div className={badgeClass} style={badgeStyle}>
                          {log.action === 'BANK' && <DollarSign size={10} strokeWidth={3} />}
                          {(log.action === 'PROPERTY' || log.card.type === CARD_TYPES.PROPERTY || log.card.type === CARD_TYPES.PROPERTY_WILD) && <Home size={10} strokeWidth={3} />}
                          {(log.action === 'ACTION' || log.card.type === CARD_TYPES.ACTION) && <Zap size={10} strokeWidth={3} />}
                          {(log.card.type === CARD_TYPES.RENT || log.card.type === CARD_TYPES.RENT_WILD) && <DollarSign size={10} strokeWidth={3} />}
                          <span className="truncate">{log.card.name}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: Game Board + Player Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Quick Rules Button */}
        <div className="absolute top-4 right-4 z-[60]">
          <button 
            onClick={() => setShowRules(true)}
            className="group flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all hover:scale-105 active:scale-95"
          >
            <div className="bg-blue-100 text-blue-600 rounded-full p-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <HelpCircle size={16} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold pr-1">Rules</span>
          </button>
        </div>

        {/* Quick Rules Modal */}
        <QuickRules isOpen={showRules} onClose={() => setShowRules(false)} />

        {/* Main Game Board (Circular Layout) */}
        <div className="flex-1 relative bg-slate-50">
          {/* Table background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-[80%] h-[70%] rounded-[50%] bg-white shadow-2xl border-8 border-blue-600 scale-90 sm:scale-100" // Added scale for responsiveness
              style={{
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.1)'
              }}
            >
              {/* Table texture */}
              <div className="absolute inset-0 rounded-[50%] opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
                backgroundSize: '20px 20px'
              }}></div>
              
              {/* Center logo/text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-black text-slate-100 mb-2">MONOPOLY</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-100">DEAL</div>
                </div>
              </div>
              
              {/* Deck and Discard in center */}
              <div className="absolute inset-0 flex items-center justify-center gap-8">
                {/* Deck */}
                <div 
                  id="tutorial-deck"
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
                    className={`w-20 h-28 bg-gradient-to-br ${CARD_BACK_STYLES.gradient} rounded-lg border ${CARD_BACK_STYLES.border} shadow-xl flex items-center justify-center relative transition-all ${
                      shouldShowDrawPrompt
                        ? 'group-hover:scale-110 group-hover:-translate-y-2 animate-pulse-glow' 
                        : 'group-hover:scale-105 group-hover:-translate-y-1'
                    }`}
                    style={
                      shouldShowDrawPrompt
                        ? { boxShadow: `0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.3)` } // Cyan glow
                        : {}
                    }
                  >
                    <div className="absolute inset-0 opacity-20 rounded-lg" style={{
                      backgroundImage: CARD_BACK_STYLES.patternDots,
                      backgroundSize: '15px 15px'
                    }}></div>
                    <div className="font-black text-2xl z-10" style={{ color: CARD_BACK_STYLES.accent, fontFamily: 'system-ui, sans-serif' }}>{deck.length > 0 ? 'M' : ''}</div>
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
            
            // Calculate tooltip alignment based on horizontal position to prevent overflow
            const leftPos = parseFloat(infoPosition.left);
            const tooltipAlign = leftPos < 30 ? 'left' : leftPos > 70 ? 'right' : 'center';

            const isCurrentTurn = players[currentTurnIndex]?.id === player.id;
            const isMe = player.id === currentPlayerId;
            
            return (
              <React.Fragment key={player.id}>
                {/* Player info box (bank & properties) - closer to center */}
                {!isMe && (
                    <div
                      id={`tutorial-opponent-${index}`}
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
                      tooltipDirection={parseInt(infoPosition.top) < 40 ? 'bottom' : 'top'}
                      tooltipAlign={tooltipAlign}
                    />
                  </div>
                )}
                
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

        {/* Current Player Area at bottom */}
        {currentPlayer && (
          <div className="bg-white p-2 border-t-4 border-blue-600 shadow-lg relative z-30">
            <div className="max-w-7xl mx-auto relative px-4">
            {/* Inline Action Confirmation */}
            {actionConfirmation && (
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-auto">
                {actionConfirmation}
              </div>
            )}

            {/* Top Section: Bank and Properties */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                {/* Bank */}
                <div 
                  id="tutorial-bank"
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black text-green-800 uppercase tracking-wider flex items-center gap-2">
                      <span>💰 Bank</span>
                    </h3>
                    <div className="text-xl font-black text-green-600">
                      ${currentPlayer.bank?.reduce((sum, c) => sum + (c.value || 0), 0) || 0}M
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[60px]">
                    {currentPlayer.bank?.length > 0 ? (
                      currentPlayer.bank.map((card, idx) => (
                        <BankCardMini
                          key={idx}
                          card={card}
                          onClick={onCardClick}
                        />
                      ))
                    ) : (
                      <div className="text-green-600/50 text-sm italic w-full text-center py-6">No money in bank</div>
                    )}
                  </div>
                </div>
                
                {/* Properties */}
                <div 
                  id="tutorial-properties"
                  className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-3 border-2 border-blue-200 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-2">
                      <span>🏠 Properties</span>
                    </h3>
                    <div className="text-xl font-black text-blue-600">
                      {currentPlayer.properties?.length || 0}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[60px]">
                    <div className="w-full flex justify-center">
                      <PropertySetDisplay 
                        properties={currentPlayer.properties}
                        tooltipDirection="top"
                        onCardClick={null}
                      />
                    </div>
                    {(!currentPlayer.properties || currentPlayer.properties.length === 0) && (
                      <div className="text-blue-600/50 text-sm italic w-full text-center py-6">No properties</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hand Cards */}
              <div 
                id="tutorial-hand"
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border-2 border-slate-200 shadow-sm"
              >
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">🃏 Hand ({currentPlayer.hand?.length || 0} cards)</h3>
                <div className="flex justify-center -space-x-12 h-52 py-1 overflow-x-visible">
                  {currentPlayer.hand?.map((card, idx) => (
                    <div 
                      key={card.uid || card.id || idx}
                      className="flex-shrink-0 transition-all hover:-translate-y-16 hover:z-[100] hover:px-8"
                      style={{ zIndex: 50 + idx }}
                    >
                      <Card 
                        card={card} 
                        size="md"
                        onClick={() => {
                          console.log('Card clicked in Stadium:', card.name);
                          if (onCardClick) onCardClick(card);
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
      </div>
    </div>
  );
};

export default StadiumLayout;
