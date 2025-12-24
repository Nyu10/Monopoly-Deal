import React from 'react';
import BankDisplay from './BankDisplay';
import PropertySetDisplay from './PropertySetDisplay';
import HandCountDisplay from './HandCountDisplay';

const OpponentCard = ({ 
  player, 
  isCurrentTurn = false, 
  isTargetable = false,
  onSelect,
  compact = false 
}) => {
  const handleClick = () => {
    if (isTargetable && onSelect) {
      onSelect(player);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg border-4 p-4 transition-all duration-300
        ${isCurrentTurn ? 'border-green-400 shadow-green-200' : 'border-slate-300'}
        ${isTargetable ? 'cursor-pointer hover:border-yellow-400 hover:shadow-yellow-200 hover:scale-105' : ''}
        ${compact ? 'w-64' : 'w-80'}
      `}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
            {player.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="font-black text-slate-800">{player.name || 'Player'}</span>
        </div>
        
        {isCurrentTurn && (
          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            TURN
          </div>
        )}
        
        {isTargetable && (
          <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            TARGET
          </div>
        )}
      </div>

      {/* Bank */}
      <div className="mb-3">
        <BankDisplay cards={player.bank || []} compact={compact} />
      </div>

      {/* Properties */}
      <div className="mb-3">
        <PropertySetDisplay properties={player.properties || []} compact={compact} />
      </div>

      {/* Hand */}
      <div>
        <HandCountDisplay cardCount={player.hand?.length || 0} compact={compact} />
      </div>
    </div>
  );
};

export default OpponentCard;
