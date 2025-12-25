import React, { useState } from 'react';

const COLORS = {
  brown: { hex: '#5D4037', name: 'Brown', count: 2, rent: [1, 2] },
  cyan: { hex: '#00BCD4', name: 'Light Blue', count: 3, rent: [1, 2, 3] },
  pink: { hex: '#D81B60', name: 'Pink', count: 3, rent: [1, 2, 4] },
  orange: { hex: '#EF6C00', name: 'Orange', count: 3, rent: [1, 3, 5] },
  red: { hex: '#C62828', name: 'Red', count: 3, rent: [2, 3, 6] },
  yellow: { hex: '#FBC02D', name: 'Yellow', count: 3, rent: [2, 4, 6] },
  green: { hex: '#2E7D32', name: 'Green', count: 3, rent: [2, 4, 7] },
  blue: { hex: '#1565C0', name: 'Dark Blue', count: 2, rent: [3, 8] },
  railroad: { hex: '#212121', name: 'Railroad', count: 4, rent: [1, 2, 3, 4] },
  utility: { hex: '#9E9D24', name: 'Utility', count: 2, rent: [1, 2] }
};

const PropertySetDisplay = ({ properties, compact = false, onCardClick }) => {
  const [expandedSet, setExpandedSet] = useState(null);

  if (!properties || properties.length === 0) {
    return null;
  }

  // Group properties by color
  const sets = {};
  properties.forEach(card => {
    const color = card.currentColor || card.color;
    if (!color) return;
    
    if (!sets[color]) {
      sets[color] = [];
    }
    sets[color].push(card);
  });

  // Calculate completion status
  const setStatuses = Object.entries(sets).map(([color, cards]) => {
    const colorData = COLORS[color];
    const required = colorData?.count || 2;
    const current = cards.length;
    const isComplete = current >= required;
    
    return {
      color,
      cards,
      current,
      required,
      isComplete,
      colorData
    };
  });

  const completedSets = setStatuses.filter(s => s.isComplete).length;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs font-bold text-slate-600">
        Properties: {completedSets}/{setStatuses.length} complete
      </div>
      
      {/* Visual property cards */}
      <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
        {setStatuses.map(({ color, cards, current, required, isComplete, colorData }) => (
          <div key={color} className="relative">
            {/* Property card stack */}
            <div 
              className="relative cursor-pointer transition-transform hover:scale-110"
              onClick={() => {
                if (onCardClick && cards.length > 0) {
                  onCardClick(cards[0]);
                }
                setExpandedSet(expandedSet === color ? null : color);
              }}
              style={{ width: '32px', height: '44px' }}
            >
              {/* Show stacked cards */}
              {cards.slice(0, 3).map((card, i) => (
                <div
                  key={i}
                  className="absolute rounded border-2 border-white shadow-lg"
                  style={{
                    width: '32px',
                    height: '44px',
                    backgroundColor: colorData?.hex,
                    left: `${i * 2}px`,
                    top: `${i * 2}px`,
                    zIndex: i
                  }}
                >
                  {i === cards.length - 1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-xs font-black opacity-70">
                        {current}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Completion indicator */}
              {isComplete && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white z-10">
                  ✓
                </div>
              )}
            </div>
            
            {/* Expanded details */}
            {expandedSet === color && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/90 text-white p-3 rounded-lg shadow-2xl z-50 min-w-[150px]">
                <div className="text-xs font-bold mb-2">{colorData?.name} Set</div>
                <div className="text-xs space-y-1">
                  <div>Cards: {current}/{required}</div>
                  <div>Status: {isComplete ? '✓ Complete' : 'In Progress'}</div>
                  {isComplete && colorData?.rent && (
                    <div>Rent: ${colorData.rent[colorData.rent.length - 1]}M</div>
                  )}
                </div>
                <div className="text-xs mt-2 text-gray-400">Click to close</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertySetDisplay;
