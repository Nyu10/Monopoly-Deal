import React from 'react';
import OpponentCard from './OpponentCard';

const StadiumLayout = ({ 
  players = [], 
  currentPlayerId, 
  currentTurnIndex = 0,
  onOpponentSelect 
}) => {
  // Filter out current player
  const opponents = players.filter(p => p.id !== currentPlayerId);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  // Determine layout based on number of opponents
  const getLayoutClass = (opponentCount) => {
    switch (opponentCount) {
      case 1:
        return 'grid-cols-1 place-items-center';
      case 2:
        return 'grid-cols-2 gap-6';
      case 3:
        return 'grid-cols-3 gap-4';
      case 4:
      case 5:
        return 'grid-cols-3 gap-4';
      default:
        return 'grid-cols-3 gap-4';
    }
  };

  // Special positioning for specific player counts
  const getOpponentPosition = (index, total) => {
    if (total === 1) return 'col-span-1';
    if (total === 2) return 'col-span-1';
    if (total === 3) return 'col-span-1';
    if (total === 4) {
      // 1 top center, 2 middle, 1 bottom center
      if (index === 0) return 'col-start-2'; // Top center
      if (index === 1 || index === 2) return 'col-span-1'; // Middle left/right
      if (index === 3) return 'col-start-2'; // Bottom center (rare, but handled)
    }
    return 'col-span-1';
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Opponent Area */}
      <div className="flex-1 bg-gradient-to-b from-slate-800 to-slate-700 p-6 rounded-t-3xl">
        <div className={`grid ${getLayoutClass(opponents.length)} max-w-6xl mx-auto`}>
          {opponents.map((opponent, index) => (
            <div 
              key={opponent.id} 
              className={getOpponentPosition(index, opponents.length)}
            >
              <OpponentCard
                player={opponent}
                isCurrentTurn={players[currentTurnIndex]?.id === opponent.id}
                isTargetable={false} // Will be set based on game state
                onSelect={onOpponentSelect}
                compact={opponents.length > 3}
              />
            </div>
          ))}
        </div>
        
        {opponents.length === 0 && (
          <div className="text-center text-white text-xl font-bold py-12">
            Waiting for opponents...
          </div>
        )}
      </div>

      {/* Center Area - Deck & Discard */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 py-4 px-6">
        <div className="flex items-center justify-center gap-8 max-w-4xl mx-auto">
          {/* Deck */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-32 bg-gradient-to-br from-red-800 to-red-900 rounded-xl border-4 border-white shadow-2xl flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
                backgroundSize: '20px 20px'
              }}></div>
              <div className="text-white font-black text-3xl z-10">M</div>
            </div>
            <span className="text-white text-sm font-bold">DECK</span>
          </div>

          {/* Discard */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-32 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl border-4 border-white shadow-2xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">DISCARD</span>
            </div>
            <span className="text-white text-sm font-bold">PILE</span>
          </div>
        </div>
      </div>

      {/* Current Player Info (Compact) */}
      {currentPlayer && (
        <div className="bg-gradient-to-b from-slate-700 to-slate-800 p-4 rounded-b-3xl">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-black">
                  {currentPlayer.name?.[0]?.toUpperCase() || 'Y'}
                </div>
                <div>
                  <div className="font-black text-lg">{currentPlayer.name || 'You'}</div>
                  <div className="text-sm text-slate-300">Your Turn</div>
                </div>
              </div>
              
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-slate-400">Bank:</span>{' '}
                  <span className="font-bold">${currentPlayer.bank?.reduce((sum, c) => sum + (c.value || 0), 0) || 0}M</span>
                </div>
                <div>
                  <span className="text-slate-400">Properties:</span>{' '}
                  <span className="font-bold">{currentPlayer.properties?.length || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Hand:</span>{' '}
                  <span className="font-bold">{currentPlayer.hand?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StadiumLayout;
