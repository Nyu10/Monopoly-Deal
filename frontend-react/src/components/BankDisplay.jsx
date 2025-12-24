import React from 'react';

const BankDisplay = ({ cards, compact = false }) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  const totalValue = cards.reduce((sum, card) => sum + (card.value || 0), 0);
  const cardCount = cards.length;

  // Visual card stack - show cards stacked with slight offset
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-bold text-white/80">Bank: ${totalValue}M</div>
      
      {/* Card stack visualization */}
      <div className="relative" style={{ width: '50px', height: `${Math.min(cardCount * 3 + 40, 80)}px` }}>
        {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-12 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded border-2 border-white shadow-lg"
            style={{
              bottom: `${i * 3}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: i
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-50">
              $
            </div>
          </div>
        ))}
        
        {/* Card count badge if more than 10 */}
        {cardCount > 10 && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-20">
            {cardCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDisplay;
