import { useState } from 'react';
import MiniCard from './MiniCard';
import { useSettings } from '../hooks/useSettings.jsx';
import { calculateBankTotal } from '../utils/gameHelpers';
import Card from './Card';

const BankDisplay = ({ cards, compact = false, onCardClick, hideValue = false, horizontal = false, isOpponent = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get settings with fallback for when provider isn't available
  let settings = { showBankValues: true, showBankCards: true };
  try {
    const settingsContext = useSettings();
    settings = settingsContext.settings;
  } catch (e) {
    // Settings provider not available, use defaults
  }

  const totalValue = calculateBankTotal(cards);
  const cardCount = cards?.length || 0;
  const topCard = cards?.[cards.length - 1];

  // Determine if we should hide values based on settings and opponent status
  const shouldHideValue = isOpponent && !settings.showBankValues;
  const shouldHideCards = isOpponent && !settings.showBankCards;

  // Horizontal layout for top/bot
  if (horizontal) {
    if (!cards || cards.length === 0) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              💰 BANK
            </div>
            <div className="text-sm font-black text-emerald-600">
              {shouldHideValue ? '???' : '$0M'}
            </div>
          </div>
          <div className="text-[9px] text-slate-400 italic px-2">Empty</div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-2">
        {/* BANK Label with value */}
        <div className="flex items-center gap-2 px-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
            💰 BANK
          </div>
          <div className="text-sm font-black text-emerald-600">
            {shouldHideValue ? '???' : `$${totalValue}M`}
          </div>
        </div>
        
        {/* Horizontal card display */}
        <div 
          className="relative" 
          style={{ 
            width: `${192 * 0.35 + Math.min(cardCount - 1, 4) * 20}px`, 
            height: `${272 * 0.35}px`,
            minWidth: `${192 * 0.35}px`
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Always show card back */}
          <div className="absolute shadow-lg rounded-lg overflow-hidden">
            <div 
              className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-4 border-blue-700 rounded-lg flex items-center justify-center"
              style={{ 
                width: `${192 * 0.35}px`, 
                height: `${272 * 0.35}px` 
              }}
            >
              <div className="text-white text-xs font-black opacity-50">💰</div>
            </div>
          </div>
          
          {/* Card count badge */}
          {cardCount > 1 && (
            <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white z-[60] shadow-md">
              {cardCount}
            </div>
          )}
          
          {/* Hover tooltip - only show if showBankCards is ON */}
          {isHovered && !shouldHideCards && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] pointer-events-none">
              <div className="bg-slate-900/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20 min-w-[140px]">
                {/* Summary Card */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-emerald-400 text-3xl">💰</div>
                  <div className="text-white text-sm font-bold">
                    {cardCount} Card{cardCount !== 1 ? 's' : ''}
                  </div>
                  <div className="w-full h-px bg-white/20"></div>
                  <div className="text-emerald-400 text-2xl font-black">
                    ${totalValue}M
                  </div>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute top-full -mt-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900/95"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default vertical layout
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            💰 BANK
          </div>
          <div className="text-xs font-black text-emerald-600">
            {shouldHideValue ? '???' : '$0M'}
          </div>
        </div>
        <div className="text-[9px] text-slate-400 italic">Empty</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center gap-1">
      {/* BANK Label with value */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          💰 BANK
        </div>
        <div className="text-xs font-black text-emerald-600">
          {shouldHideValue ? '???' : `$${totalValue}M`}
        </div>
      </div>
      
      <div 
        className="relative cursor-pointer" 
        onClick={() => onCardClick && onCardClick(topCard)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          width: `${192 * 0.4}px`, 
          height: `${272 * 0.4}px` 
        }}
      >
        {/* Always show card back */}
        <div className="absolute shadow-lg rounded-lg overflow-hidden">
          <div 
            className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-4 border-blue-700 rounded-lg flex items-center justify-center"
            style={{ 
              width: `${192 * 0.4}px`, 
              height: `${272 * 0.4}px` 
            }}
          >
            <div className="text-white text-sm font-black opacity-50">💰</div>
          </div>
        </div>
        
        {/* Card count badge */}
        <div className="absolute -top-3 -right-3 bg-emerald-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-[60] shadow-md animate-in zoom-in duration-300">
           {cardCount}
        </div>
        
        {/* Hover tooltip - only show if showBankCards is ON */}
        {isHovered && !shouldHideCards && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20 min-w-[140px]">
              {/* Summary Card */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-emerald-400 text-3xl">💰</div>
                <div className="text-white text-sm font-bold">
                  {cardCount} Card{cardCount !== 1 ? 's' : ''}
                </div>
                <div className="w-full h-px bg-white/20"></div>
                <div className="text-emerald-400 text-2xl font-black">
                  ${totalValue}M
                </div>
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full -mt-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900/95"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDisplay;
