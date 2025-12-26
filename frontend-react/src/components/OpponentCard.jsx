import React from 'react';
import BankDisplay from './BankDisplay';
import PropertySetDisplay from './PropertySetDisplay';
import HandCountDisplay from './HandCountDisplay';

// Distinct color schemes for each bot to make identification instant
const BOT_COLORS = {
  'Bot 1': {
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-300',
    borderActive: 'border-violet-500',
    text: 'text-violet-700',
    shadow: 'shadow-violet-500/20',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    ring: 'ring-violet-400/50',
    accent: '#8b5cf6'
  },
  'Bot 2': {
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    borderActive: 'border-teal-500',
    text: 'text-teal-700',
    shadow: 'shadow-teal-500/20',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    ring: 'ring-teal-400/50',
    accent: '#14b8a6'
  },
  'Bot 3': {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    borderActive: 'border-orange-500',
    text: 'text-orange-700',
    shadow: 'shadow-orange-500/20',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    ring: 'ring-orange-400/50',
    accent: '#f97316'
  },
  // Fallback for any other players
  default: {
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    borderActive: 'border-blue-500',
    text: 'text-blue-700',
    shadow: 'shadow-blue-500/20',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    ring: 'ring-blue-400/50',
    accent: '#3b82f6'
  }
};

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
  // Get the color scheme for this bot
  const colors = BOT_COLORS[player.name] || BOT_COLORS.default;
  
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
          rounded-xl p-3 transition-all duration-300 border-3 backdrop-blur-sm
          ${colors.bg}
          ${isCurrentTurn ? `${colors.borderActive} shadow-lg ${colors.shadow} ring-2 ${colors.ring}` : colors.border}
          ${isTargetable ? `cursor-pointer hover:${colors.borderActive} hover:${colors.shadow} hover:scale-105` : ''}
        `}
        onClick={handleClick}
        style={{ minWidth: '400px', maxWidth: '600px', borderWidth: '3px' }}
      >
        {/* Player name header - always visible */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-lg`}>
              {player.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-sm">{player.name || 'Player'}</span>
              <span className={`text-[9px] font-bold ${colors.text} opacity-70`}>Opponent</span>
            </div>
          </div>
          
          {isCurrentTurn && (
            <div className={`bg-gradient-to-r ${colors.gradient} text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg animate-pulse`}>
              ⚡ TURN
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
              <div className={`text-[10px] font-black uppercase tracking-widest ${colors.badge} px-2 py-1 rounded-lg border w-fit`}>
                🏠 PROPERTIES
              </div>
              {(player.properties && player.properties.length > 0) ? (
                <PropertySetDisplay 
                  properties={player.properties || []} 
                  onCardClick={(card) => onCardClick && onCardClick(card, player.id)} 
                  tooltipDirection={tooltipDirection}
                  tooltipAlign={tooltipAlign}
                  horizontal={true}
                  accentColor={colors.accent}
                />
              ) : (
                <div className={`text-[9px] ${colors.text} opacity-50 italic px-2`}>No properties yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Hand count at bottom if needed */}
        {showHand && (
          <div className={`mt-2 pt-2 border-t ${colors.border}`}>
            <HandCountDisplay cardCount={player.hand?.length || 0} accentColor={colors.accent} />
          </div>
        )}
      </div>
    );
  }

  // Default vertical layout
  return (
    <div
      className={`
        rounded-xl p-2.5 transition-all duration-300 border-3 backdrop-blur-sm
        ${colors.bg}
        ${isCurrentTurn ? `${colors.borderActive} shadow-lg ${colors.shadow} ring-2 ${colors.ring}` : colors.border}
        ${isTargetable ? `cursor-pointer hover:${colors.borderActive} hover:${colors.shadow} hover:scale-105` : ''}
      `}
      onClick={handleClick}
      style={{ width: '210px', borderWidth: '3px' }}
    >
      {/* Player name header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-7 h-7 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-lg`}>
            {player.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 text-xs">{player.name || 'Player'}</span>
            <span className={`text-[8px] font-bold ${colors.text} opacity-60`}>Opponent</span>
          </div>
        </div>
        
        {isCurrentTurn && (
          <div className={`bg-gradient-to-r ${colors.gradient} text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-lg animate-pulse`}>
            ⚡
          </div>
        )}
      </div>

      {/* Game state - stacked vertically */}
      <div className="space-y-1.5">
        {/* Bank */}
        <BankDisplay cards={player.bank || []} onCardClick={(card) => onCardClick && onCardClick(card, player.id)} isOpponent={true} />

        {/* Properties */}
        <div className="flex flex-col items-center gap-1">
          <div className={`text-[9px] font-black uppercase tracking-widest ${colors.badge} px-2 py-0.5 rounded border`}>
            🏠 PROPERTIES
          </div>
          {(player.properties && player.properties.length > 0) ? (
            <PropertySetDisplay 
              properties={player.properties || []} 
              onCardClick={(card) => onCardClick && onCardClick(card, player.id)} 
              tooltipDirection={tooltipDirection}
              tooltipAlign={tooltipAlign}
              accentColor={colors.accent}
            />
          ) : (
            <div className={`text-[9px] ${colors.text} opacity-50 italic`}>No properties yet</div>
          )}
        </div>

        {/* Hand - only show if showHand is true */}
        {showHand && <HandCountDisplay cardCount={player.hand?.length || 0} accentColor={colors.accent} />}
      </div>
    </div>
  );
};

export default OpponentCard;
