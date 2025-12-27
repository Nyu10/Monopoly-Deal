import React from 'react';
import CARD_BACK_STYLES from '../utils/cardBackStyles';

const HandCountDisplay = ({ cardCount, compact = false, accentColor }) => {
  if (cardCount === 0) return null;

  // Premium card fan layout
  const maxCardsToShow = compact ? 5 : 7;
  const cardsToDisplay = Math.min(cardCount, maxCardsToShow);
  
  // Calculate fan spread with slight arc
  const cardWidth = compact ? 24 : 32;
  const cardHeight = compact ? 36 : 48;
  const cardSpacing = compact ? 10 : 14;
  const arcHeight = compact ? 3 : 4; // Subtle arc effect
  
  return (
    <div className="flex items-center gap-2">      
      {/* Premium poker fan - horizontal spread */}
      <div 
        className="relative" 
        style={{ 
          width: `${cardsToDisplay * cardSpacing + cardWidth}px`, 
          height: `${cardHeight}px` 
        }}
      >
        {Array.from({ length: cardsToDisplay }).map((_, i) => {
          
          return (
            <div
              key={i}
              className={`absolute bg-gradient-to-br ${CARD_BACK_STYLES.gradient} rounded-md border-2 ${CARD_BACK_STYLES.border} shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-3 hover:z-30 hover:shadow-2xl`}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                bottom: '0px',
                left: `${i * cardSpacing}px`,
                zIndex: i
              }}
            >
              {/* Card back pattern */}
              <div className="absolute inset-0 opacity-90 rounded-md overflow-hidden" style={{
                backgroundImage: CARD_BACK_STYLES.patternDots,
                backgroundSize: '8px 8px'
              }}></div>
              
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-md"></div>
            </div>
          );
        })}
        
        {/* Overflow indicator */}
        {cardCount > maxCardsToShow && (
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-30 animate-pulse">
            +
          </div>
        )}
      </div>
      
      {/* Card count badge - after the fan */}
      <div 
        className={`relative overflow-hidden text-white px-2.5 py-1 rounded-md shadow-md border-2 ${CARD_BACK_STYLES.border} flex items-center gap-1.5`}
        style={{ 
          background: 'none' 
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${CARD_BACK_STYLES.gradient} -z-10`}></div>
        <svg className="w-3 h-3 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="font-black text-xs leading-none relative z-10">{cardCount}</span>
      </div>
    </div>
  );
};

export default HandCountDisplay;
