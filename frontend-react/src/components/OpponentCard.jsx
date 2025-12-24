import React from 'react';
import BankDisplay from './BankDisplay';
import PropertySetDisplay from './PropertySetDisplay';
import HandCountDisplay from './HandCountDisplay';

const OpponentCard = ({ 
  player, 
  isCurrentTurn = false, 
  isTargetable = false,
  onSelect,
  compact = true 
}) => {
  const handleClick = () => {
    if (isTargetable && onSelect) {
      onSelect(player);
    }
  };

  return (
    <div
      className={`
        bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 transition-all duration-300 border-2
        ${isCurrentTurn ? 'border-green-400 shadow-lg shadow-green-500/50' : 'border-slate-600'}
        ${isTargetable ? 'cursor-pointer hover:border-yellow-400 hover:shadow-yellow-500/50 hover:scale-105' : ''}
      `}
      onClick={handleClick}
      style={{ width: '220px' }}
    >
      {/* Player name header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white shadow">
            {player.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="font-black text-white text-sm">{player.name || 'Player'}</span>
        </div>
        
        {isCurrentTurn && (
          <div className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
            TURN
          </div>
        )}
      </div>

      {/* Game state - stacked vertically */}
      <div className="space-y-3">
        {/* Bank */}
        <BankDisplay cards={player.bank || []} />

        {/* Properties */}
        <PropertySetDisplay properties={player.properties || []} />

        {/* Hand */}
        <HandCountDisplay cardCount={player.hand?.length || 0} />
      </div>
    </div>
  );
};

export default OpponentCard;
