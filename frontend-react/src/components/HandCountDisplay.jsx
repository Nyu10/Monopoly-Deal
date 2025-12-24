import React from 'react';

const HandCountDisplay = ({ cardCount, compact = false }) => {
  if (cardCount === 0) return null;

  // Poker-style fan layout
  const maxCardsToShow = 7;
  const cardsToDisplay = Math.min(cardCount, maxCardsToShow);
  
  // Calculate fan spread
  const spreadAngle = 40; // Total spread in degrees
  const cardWidth = 28;
  const cardHeight = 40;
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-bold text-white/80">Hand: {cardCount}</div>
      
      {/* Poker fan */}
      <div className="relative" style={{ width: `${cardsToDisplay * 12 + 20}px`, height: `${cardHeight + 10}px` }}>
        {Array.from({ length: cardsToDisplay }).map((_, i) => {
          const totalCards = cardsToDisplay;
          const startAngle = -spreadAngle / 2;
          const angleStep = totalCards > 1 ? spreadAngle / (totalCards - 1) : 0;
          const rotation = startAngle + (i * angleStep);
          const translateY = Math.abs(rotation) * 0.3; // Slight arc
          
          return (
            <div
              key={i}
              className="absolute bg-gradient-to-br from-red-800 to-red-900 rounded border-2 border-white shadow-lg transition-transform hover:scale-110 hover:-translate-y-2"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                bottom: '0px',
                left: `${i * 12}px`,
                transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                transformOrigin: 'bottom center',
                zIndex: i
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-black opacity-40">
                M
              </div>
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
