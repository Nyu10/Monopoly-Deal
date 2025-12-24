import React from 'react';

const HandCountDisplay = ({ cardCount, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold">🎴 {cardCount}</span>
      </div>
    );
  }

  // Fan layout - create card positions
  const cards = Array.from({ length: Math.min(cardCount, 7) }, (_, i) => {
    const totalCards = Math.min(cardCount, 7);
    const spreadAngle = 30; // degrees
    const startAngle = -spreadAngle / 2;
    const angleStep = totalCards > 1 ? spreadAngle / (totalCards - 1) : 0;
    const rotation = startAngle + (i * angleStep);
    
    return {
      rotation,
      translateY: Math.abs(rotation) * 0.5 // Slight arc
    };
  });

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-3 border-2 border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-slate-800">🎴 Hand</span>
        <span className="text-lg font-black text-slate-700">{cardCount}</span>
      </div>
      
      {/* Fan visualization */}
      <div className="relative h-16 flex items-end justify-center">
        {cards.map((card, i) => (
          <div
            key={i}
            className="absolute bottom-0 w-8 h-12 bg-gradient-to-br from-red-800 to-red-900 rounded border-2 border-white shadow-md transition-transform hover:scale-110"
            style={{
              transform: `rotate(${card.rotation}deg) translateY(${card.translateY}px)`,
              left: `calc(50% - 16px + ${(i - cards.length / 2) * 12}px)`,
              zIndex: i
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-xs font-black opacity-40">M</div>
            </div>
          </div>
        ))}
        
        {cardCount > 7 && (
          <div className="absolute -top-2 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            +{cardCount - 7}
          </div>
        )}
      </div>
      
      {cardCount === 0 && (
        <div className="text-xs text-center text-gray-500 py-4">
          No cards in hand
        </div>
      )}
    </div>
  );
};

export default HandCountDisplay;
