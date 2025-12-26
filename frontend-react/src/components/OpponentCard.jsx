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
  tooltipAlign = 'center',
  layout = 'vertical' // 'vertical' or 'horizontal'
}) => {
  const handleClick = () => {
    if (isTargetable && onSelect) {
      onSelect(player);
    }
  };

  // Horizontal layout for top bot
  if (layout === 'horizontal') {
    return (
      <div
        className={`
          bg-white rounded-xl p-3 transition-all duration-300 border-2
          ${isCurrentTurn ? 'border-blue-600 shadow-lg shadow-blue-500/20' : 'border-slate-200'}
          ${isTargetable ? 'cursor-pointer hover:border-blue-400 hover:shadow-blue-500/20 hover:scale-105' : ''}
        `}
        onClick={handleClick}
        style={{ minWidth: '400px', maxWidth: '600px' }}
      >
        {/* Player name header - always visible */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white shadow">
              {player.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="font-black text-slate-900 text-sm">{player.name || 'Player'}</span>
          </div>
          
          {isCurrentTurn && (
            <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
              TURN
            </div>
          )}
        </div>

        {/* Horizontal layout: Bank left, Properties right */}
        <div className="flex gap-4 items-start">
          {/* Bank on the left */}
          <div className="flex-shrink-0">
            <BankDisplay cards={player.bank || []} onCardClick={(card) => onCardClick && onCardClick(card, player.id)} horizontal={true} isOpponent={true} />
          </div>

          {/* Properties in a horizontal row on the right */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 w-fit">
                🏠 PROPERTIES
              </div>
              {(player.properties && player.properties.length > 0) ? (
                <PropertySetDisplay 
                  properties={player.properties || []} 
                  onCardClick={(card) => onCardClick && onCardClick(card, player.id)} 
                  tooltipDirection={tooltipDirection}
                  tooltipAlign={tooltipAlign}
                  horizontal={true}
                />
              ) : (
                <div className="text-[9px] text-slate-400 italic px-2">Empty</div>
              )}
            </div>
          </div>
        </div>

        {/* Hand count at bottom if needed */}
        {showHand && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <HandCountDisplay cardCount={player.hand?.length || 0} />
          </div>
        )}
      </div>
    );
  }

  // Default vertical layout
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
      <div className="space-y-1.5">
        {/* Bank */}
        <BankDisplay cards={player.bank || []} onCardClick={(card) => onCardClick && onCardClick(card, player.id)} isOpponent={true} />

        {/* Properties */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            🏠 PROPERTIES
          </div>
          {(player.properties && player.properties.length > 0) ? (
            <PropertySetDisplay 
              properties={player.properties || []} 
              onCardClick={(card) => onCardClick && onCardClick(card, player.id)} 
              tooltipDirection={tooltipDirection}
              tooltipAlign={tooltipAlign}
            />
          ) : (
            <div className="text-[9px] text-slate-400 italic">Empty</div>
          )}
        </div>

        {/* Hand - only show if showHand is true */}
        {showHand && <HandCountDisplay cardCount={player.hand?.length || 0} />}
      </div>
    </div>
  );
};

export default OpponentCard;
