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
  
  // Calculate position around an ellipse
  const getPlayerPosition = (index, totalOpponents) => {
    // Ellipse parameters (percentage of container)
    const centerX = 50; // Center X (%)
    const centerY = 40; // Center Y (%) - slightly higher to leave room for player at bottom
    const radiusX = 40; // Horizontal radius (%)
    const radiusY = 30; // Vertical radius (%)
    
    // Start from top and go clockwise
    // Angle in radians (0 = right, π/2 = bottom, π = left, 3π/2 = top)
    const startAngle = -Math.PI / 2; // Start at top
    const angleStep = (2 * Math.PI) / totalOpponents;
    const angle = startAngle + (index * angleStep);
    
    // Calculate position on ellipse
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)' // Center the card on the position
    };
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Main game area with circular layout */}
      <div className="flex-1 relative overflow-hidden">
        {/* Table background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-[80%] h-[70%] rounded-[50%] bg-gradient-to-br from-green-800 via-green-700 to-green-900 shadow-2xl border-8 border-amber-900"
            style={{
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.8)'
            }}
          >
            {/* Table felt texture */}
            <div className="absolute inset-0 rounded-[50%] opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Center logo/text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-black text-white/20 mb-2">MONOPOLY</div>
                <div className="text-3xl font-black text-white/20">DEAL</div>
              </div>
            </div>
            
            {/* Deck and Discard in center */}
            <div className="absolute inset-0 flex items-center justify-center gap-8">
              {/* Deck */}
              <div className="flex flex-col items-center gap-2 mt-32">
                <div className="w-20 h-28 bg-gradient-to-br from-red-800 to-red-900 rounded-lg border-4 border-white shadow-2xl flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-20 rounded-lg" style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
                    backgroundSize: '15px 15px'
                  }}></div>
                  <div className="text-white font-black text-2xl z-10">M</div>
                </div>
                <span className="text-white text-xs font-bold bg-black/30 px-2 py-1 rounded">DECK</span>
              </div>

              {/* Discard */}
              <div className="flex flex-col items-center gap-2 mt-32">
                <div className="w-20 h-28 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg border-4 border-white shadow-2xl flex items-center justify-center">
                  <span className="text-white text-xs font-bold">DISCARD</span>
                </div>
                <span className="text-white text-xs font-bold bg-black/30 px-2 py-1 rounded">PILE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Opponents positioned around the table */}
        {opponents.map((opponent, index) => {
          const position = getPlayerPosition(index, opponents.length);
          const isCurrentTurn = players[currentTurnIndex]?.id === opponent.id;
          
          return (
            <div
              key={opponent.id}
              className="absolute z-20"
              style={position}
            >
              <OpponentCard
                player={opponent}
                isCurrentTurn={isCurrentTurn}
                isTargetable={false}
                onSelect={onOpponentSelect}
                compact={opponents.length > 3}
              />
            </div>
          );
        })}

        {/* Empty state */}
        {opponents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white text-xl font-bold py-12 bg-black/50 px-8 rounded-xl">
              Waiting for opponents...
            </div>
          </div>
        )}
      </div>

      {/* Current Player Area at bottom */}
      {currentPlayer && (
        <div className="bg-gradient-to-t from-slate-900 via-slate-800 to-transparent p-6 border-t-4 border-amber-600">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-4 border-4 border-amber-500 shadow-2xl">
              <div className="flex items-center justify-between text-white">
                {/* Player info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-lg">
                    {currentPlayer.name?.[0]?.toUpperCase() || 'Y'}
                  </div>
                  <div>
                    <div className="font-black text-xl">{currentPlayer.name || 'You'}</div>
                    <div className="text-sm text-amber-400 font-bold">
                      {players[currentTurnIndex]?.id === currentPlayerId ? '🎯 YOUR TURN' : 'Waiting...'}
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-slate-400 text-xs mb-1">Bank</div>
                    <div className="font-black text-2xl text-green-400">
                      ${currentPlayer.bank?.reduce((sum, c) => sum + (c.value || 0), 0) || 0}M
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-xs mb-1">Properties</div>
                    <div className="font-black text-2xl text-blue-400">
                      {currentPlayer.properties?.length || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-xs mb-1">Hand</div>
                    <div className="font-black text-2xl text-purple-400">
                      {currentPlayer.hand?.length || 0}
                    </div>
                  </div>
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

