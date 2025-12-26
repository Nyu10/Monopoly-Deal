import React, { useState } from 'react';
import OpponentCard from './OpponentCard';
import HandCountDisplay from './HandCountDisplay';
import Card from './Card';
import { CARD_TYPES, ACTION_TYPES, COLORS, calculateBankTotal } from '../utils/gameHelpers';
import { X, DollarSign, Home, Zap, ArrowDown, Layers } from 'lucide-react';
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
  onEndTurn,
  movesLeft = 3,
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
  
  // Check if it's the local player's turn and they haven't drawn yet
  const isMyTurn = players[currentTurnIndex]?.id === currentPlayerId;
  const shouldShowDrawPrompt = isMyTurn && !hasDrawnThisTurn;
  
  // Calculate position around an ellipse for player info boxes (closer to center)
  const getPlayerPosition = (index, totalOpponents) => {
    // Ellipse parameters (percentage of container)
    const centerX = 50; // Center X (%)
    const centerY = 50; // Center Y (%) - centered vertically, moved up from 58
    const radiusX = 38; // Horizontal radius (%) - moved slightly further out
    const radiusY = 26; // Vertical radius (%) - reduced from 30 to keep bots higher
    
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
    const centerY = 50; // Aligned with player info, moved up from 58
    const radiusX = 46; // Further out from center
    const radiusY = 32; // Reduced from 36 to match the adjusted vertical positioning
    
    const startAngle = Math.PI / 2;
    const angleStep = (2 * Math.PI) / totalOpponents;
    const angle = startAngle + (index * angleStep);
    
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%)`,
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

      {/* CENTER: Game Board + Hand */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden border-r border-slate-200">
        
        {/* Quick Rules Modal */}
        <QuickRules isOpen={showRules} onClose={() => setShowRules(false)} />

        {/* Main Game Board (Circular Layout) */}
        <div className="flex-1 relative bg-slate-50">
          {/* Spotlight Overlay - Only affects game board, not hand */}

          {/* Table background */}
          <div className="absolute inset-0 flex items-center justify-center translate-y-12">
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-4">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-black text-slate-100 mb-2">MONOPOLY</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-100">DEAL</div>
                </div>
              </div>
              
              {/* Deck and Discard in center */}
              {/* Deck and Discard in center - Shifted down significantly to avoid overlapping top player */}
              <div className="absolute inset-0 flex items-center justify-center gap-8 translate-y-20 sm:translate-y-24 pointer-events-none">
                {/* Deck */}
                <div 
                  id="tutorial-deck"
                  className="flex flex-col items-center gap-2 mt-0 cursor-pointer group relative pointer-events-auto z-50"
                  onClick={onDraw}
                >
                  <div 
                    className={`w-28 h-40 bg-gradient-to-br ${CARD_BACK_STYLES.gradient} rounded-xl border-2 ${CARD_BACK_STYLES.border} shadow-2xl flex items-center justify-center relative transition-all duration-300 ${
                      shouldShowDrawPrompt
                        ? 'group-hover:scale-105 group-hover:-translate-y-2 ring-4 ring-amber-400/50 cursor-pointer animate-pulse-glow' 
                        : 'group-hover:scale-105 group-hover:-translate-y-1'
                    }`}
                  >
                    {/* Pattern Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: CARD_BACK_STYLES.patternDots,
                      backgroundSize: '15px 15px'
                    }}></div>
                    
                    {/* Inner Decorative Border */}
                    <div className="absolute inset-3 border border-white/20 rounded-lg pointer-events-none"></div>

                    {/* Pulsing Glow Overlay when it's time to draw */}
                    {shouldShowDrawPrompt && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-300/20 animate-pulse pointer-events-none"></div>
                    )}

                    {/* Content */}
                    <div className="z-10 flex flex-col items-center justify-center pointer-events-none select-none">
                      {shouldShowDrawPrompt ? (
                        <div className="relative">
                          {/* Pulsing Halo */}
                          <div className="absolute inset-0 -m-8 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                          
                          <div className="relative flex flex-col items-center">
                            {/* Visual cue for drawing (Stack with positive energy) */}
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                              <Layers size={40} className="text-white drop-shadow-md" strokeWidth={1.5} />
                            </div>
                            
                            {/* Multi-dot pulse indicator */}
                            <div className="mt-6 flex gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 animate-bounce" style={{ animationDelay: '0s' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          {/* Centered Minimalist Logo Mark */}
                          <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-amber-400/5 blur-3xl"></div>
                            
                            {/* The Symbol - Wordless & High-end */}
                            <div className="w-16 h-16 border border-amber-400/30 rounded-full flex items-center justify-center relative">
                               <Layers size={28} className="text-amber-400/60" strokeWidth={1} />
                               
                               {/* Compass Pins */}
                               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-gradient-to-b from-amber-400/60 to-transparent"></div>
                               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-3 bg-gradient-to-t from-amber-400/60 to-transparent"></div>
                            </div>
                            
                            {/* Thin outer decorative arcs */}
                            <svg className="absolute w-24 h-24 rotate-45" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-amber-400/10" strokeWidth="0.5" strokeDasharray="20 180" />
                              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-amber-400/10" strokeWidth="0.5" strokeDasharray="20 180" transform="rotate(180, 50, 50)" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
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
                <div className="flex flex-col items-center gap-2 mt-0 pointer-events-auto">
                  {discardPile.length > 0 ? (
                    <div className="relative grayscale opacity-60">
                      <Card 
                        card={discardPile[discardPile.length - 1]} 
                        size="xs"
                        className="shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-36 bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg border-3 border-white shadow-lg flex items-center justify-center opacity-60">
                      <span className="text-white text-[10px] font-bold">DISCARD</span>
                    </div>
                  )}
                  <span className="text-slate-600 text-xs font-bold bg-white px-3 py-1.5 rounded-lg shadow-md border border-slate-200">DISCARD ({discardPile.length})</span>
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
            const topPos = parseFloat(infoPosition.top);
            const tooltipAlign = leftPos < 30 ? 'left' : leftPos > 70 ? 'right' : 'center';
            
            // Top bots (top < 30%) should use horizontal layout
            const isTopBot = topPos < 30;

            const isCurrentTurn = players[currentTurnIndex]?.id === player.id;
            const isMe = player.id === currentPlayerId;
            
            return (
              <React.Fragment key={player.id}>
                {/* Player info box (bank & properties & hand) - closer to center */}
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
                      showHand={true}
                      tooltipDirection={parseInt(infoPosition.top) < 40 ? 'bottom' : 'top'}
                      tooltipAlign={tooltipAlign}
                      layout={isTopBot ? 'horizontal' : 'vertical'}
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
          {!isMyTurn && (
            <div className="absolute bottom-8 left-8 z-[100]">
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

        {/* Current Player Area at bottom - HAND ONLY */}
        {currentPlayer && (
          <div className="bg-white/95 backdrop-blur-sm p-3 border-t-4 border-blue-600 shadow-2xl relative z-50">
            <div className="max-w-7xl mx-auto relative px-4">
              {/* Inline Action Confirmation - Floating above hand */}
              {actionConfirmation && (
                <div className="absolute -top-36 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-auto">
                  {actionConfirmation}
                </div>
              )}

              <div id="tutorial-hand" className="bg-white/50 rounded-xl p-3 border border-slate-100 relative">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Hand</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-black text-base">{currentPlayer.hand?.length || 0}</span>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-200">
                      Cards
                    </span>
                  </div>
                </div>
                <div className="flex justify-center h-60 py-1 overflow-x-visible">
                  {currentPlayer.hand?.map((card, idx) => {
                    const handSize = currentPlayer.hand.length;
                    // Calculate overlap based on hand size
                    // 7 cards or less: -40px overlap
                    // 8 cards: -50px
                    // 9 cards: -60px  
                    // 10 cards: -70px
                    let marginLeft = '0px';
                    if (idx > 0) {
                      if (handSize <= 7) marginLeft = '-40px';
                      else if (handSize === 8) marginLeft = '-50px';
                      else if (handSize === 9) marginLeft = '-60px';
                      else marginLeft = '-70px';
                    }
                    
                    return (
                      <div 
                        key={card.uid || card.id || idx}
                        className="transition-all duration-300 hover:-translate-y-20 hover:z-[100]"
                        style={{ 
                          zIndex: 50 + idx,
                          flexShrink: 0,
                          marginLeft: marginLeft
                        }}
                      >
                        <Card 
                          card={card} 
                          size="md"
                          onClick={() => {
                            if (onCardClick) onCardClick(card);
                          }}
                          className="cursor-pointer shadow-2xl border-4 border-white hover:border-blue-500"
                        />
                      </div>
                    );
                  })}
                  {currentPlayer.hand?.length === 0 && (
                    <div className="text-slate-400 font-bold italic py-8 text-center w-full">Hand is empty - Draw cards to begin!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: Your Assets (Bank & Properties) */}
      <div className="w-80 h-full flex-shrink-0 bg-white border-l border-slate-200 z-50 flex flex-col shadow-xl relative">
        {/* Floating Rules Tab (Sticks out from sidebar) */}
        <button 
          onClick={() => setShowRules(true)}
          className="absolute -left-10 top-1/2 -translate-y-1/2 bg-white border border-slate-200 border-r-0 rounded-l-xl p-2.5 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] text-slate-400 hover:text-blue-600 hover:shadow-[-4px_0_15px_rgba(0,0,0,0.1)] transition-all flex flex-col items-center gap-2 group z-0"
          title="See Rules"
        >
          <HelpCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-widest">Rules</span>
        </button>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-sm flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Your Assets</h3>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
            {currentPlayer?.properties?.length || 0} Properties
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {currentPlayer && (
            <>
              {/* Bank Section */}
              <div id="tutorial-bank" className="group">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bank</h4>
                  <div className="text-lg font-black text-green-600 drop-shadow-sm">
                    ${calculateBankTotal(currentPlayer.bank)}M
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl p-4 border border-green-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-green-200">
                  <div className="flex items-center min-h-[210px] justify-center pt-8">
                    {currentPlayer.bank?.length > 0 ? (
                      <div className="flex -space-x-24 hover:-space-x-8 transition-all duration-500">
                        {currentPlayer.bank.map((card, idx) => (
                          <div 
                            key={card.id || idx} 
                            className="transition-transform duration-300 hover:-translate-y-8 hover:z-50"
                            style={{ zIndex: idx }}
                          >
                           <Card 
                             card={card} 
                             size="sm" 
                             onClick={() => onCardClick && onCardClick(card)}
                             className="shadow-xl ring-2 ring-white"
                           />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-green-600/50 text-[10px] font-bold uppercase tracking-widest w-full text-center py-6">Empty Bank</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Properties Section */}
              <div id="tutorial-properties" className="group">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Properties</h4>
                  <div className="text-lg font-black text-blue-600 drop-shadow-sm">
                    {currentPlayer.properties?.length || 0}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50/50 to-sky-50/50 rounded-2xl p-4 border border-blue-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-blue-200">
                  <div className="flex flex-col gap-4 min-h-[200px]">
                    <PropertySetDisplay 
                      properties={currentPlayer.properties}
                      tooltipDirection="left"
                      onCardClick={onCardClick}
                    />
                    {(!currentPlayer.properties || currentPlayer.properties.length === 0) && (
                      <div className="text-blue-600/30 text-[10px] font-bold uppercase tracking-wider w-full text-center py-12">
                        No properties owned
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* End Turn Button - Bottom of Sidebar */}
              {isMyTurn && hasDrawnThisTurn && (
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={onEndTurn}
                    className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                    <div className="flex items-center justify-center gap-4 px-4 py-3 relative">
                      {/* Move dots - Left side */}
                      <div className="absolute left-4 flex flex-col gap-1">
                        <span className="text-white/60 text-[8px] font-bold uppercase tracking-wider">Moves</span>
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i < (3 - movesLeft) 
                                  ? 'bg-white/20 scale-90' 
                                  : 'bg-white shadow-lg shadow-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Centered "END TURN" */}
                      <span className="text-white font-black text-lg uppercase tracking-wider">End Turn</span>
                      
                      {/* Arrow - Right side */}
                      <svg className="absolute right-4 w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StadiumLayout;
