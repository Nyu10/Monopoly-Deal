import React from 'react';
import CARD_BACK_STYLES from '../utils/cardBackStyles';

const HandCountDisplay = ({ cardCount, compact = false }) => {
  if (cardCount === 0) return null;

  // Poker-style fan layout
  const maxCardsToShow = 7;
  const cardsToDisplay = Math.min(cardCount, maxCardsToShow);
  
  // Calculate fan spread - horizontal spread
  const cardWidth = 28;
  const cardHeight = 40;
  const cardSpacing = 12; // Horizontal spacing between cards
  
  return (
    <div className="flex flex-col items-center gap-1">      
      {/* Poker fan - horizontal spread */}
      <div className="relative" style={{ width: `${cardsToDisplay * cardSpacing + cardWidth}px`, height: `${cardHeight}px` }}>
        {Array.from({ length: cardsToDisplay }).map((_, i) => {
          return (
            <div
              key={i}
              className={`absolute bg-gradient-to-br ${CARD_BACK_STYLES.gradient} rounded border-2 ${CARD_BACK_STYLES.border} shadow-lg transition-transform hover:scale-110 hover:-translate-y-2`}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                bottom: '0px',
                left: `${i * cardSpacing}px`,
                zIndex: i
              }}
            >
              <div className="absolute inset-0 opacity-100" style={{
                backgroundImage: CARD_BACK_STYLES.patternDots,
                backgroundSize: '10px 10px'
              }}></div>
            </div>
          );
        })}
        
        {/* Count badge if more cards */}
        {cardCount > maxCardsToShow && (
          <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-20">
            {cardCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default HandCountDisplay;
