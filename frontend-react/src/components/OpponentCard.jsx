import React from 'react';
import BankDisplay from './BankDisplay';
import PropertySetDisplay from './PropertySetDisplay';
import HandCountDisplay from './HandCountDisplay';

const OpponentCard = ({ 
  player, 
  isCurrentTurn = false, 
  isTargetable = false,
  onSelect,
  onCardClick,
  compact = true,
  showHand = true,
  tooltipDirection = 'top',
  tooltipAlign = 'center'
}) => {
  const handleClick = () => {
    if (isTargetable && onSelect) {
      onSelect(player);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl p-2 transition-all duration-300 border-2
        ${isCurrentTurn ? 'border-blue-600 shadow-lg shadow-blue-500/20' : 'border-slate-200'}
        ${isTargetable ? 'cursor-pointer hover:border-blue-400 hover:shadow-blue-500/20 hover:scale-105' : ''}
      `}
      onClick={handleClick}
      style={{ width: '200px' }}
    >
      {/* Player name header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xs border-2 border-white shadow">
            {player.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="font-black text-slate-900 text-xs">{player.name || 'Player'}</span>
        </div>
        
        {isCurrentTurn && (
          <div className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            TURN
          </div>
        )}
      </div>

      {/* Game state - stacked vertically */}
      <div className="space-y-2">
        {/* Bank */}
        <BankDisplay cards={player.bank || []} onCardClick={(card) => onCardClick && onCardClick(card, player.id)} />

        {/* Properties */}
        <PropertySetDisplay 
          properties={player.properties || []} 
          onCardClick={(card) => onCardClick && onCardClick(card, player.id)} 
          tooltipDirection={tooltipDirection}
          tooltipAlign={tooltipAlign}
        />

        {/* Hand - only show if showHand is true */}
        {showHand && <HandCountDisplay cardCount={player.hand?.length || 0} />}
      </div>
    </div>
  );
};

export default OpponentCard;
