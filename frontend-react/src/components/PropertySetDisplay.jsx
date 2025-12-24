import React from 'react';

const COLORS = {
  brown: { hex: '#5D4037', name: 'Brown', count: 2 },
  cyan: { hex: '#00BCD4', name: 'Light Blue', count: 3 },
  pink: { hex: '#D81B60', name: 'Pink', count: 3 },
  orange: { hex: '#EF6C00', name: 'Orange', count: 3 },
  red: { hex: '#C62828', name: 'Red', count: 3 },
  yellow: { hex: '#FBC02D', name: 'Yellow', count: 3 },
  green: { hex: '#2E7D32', name: 'Green', count: 3 },
  blue: { hex: '#1565C0', name: 'Dark Blue', count: 2 },
  railroad: { hex: '#212121', name: 'Railroad', count: 4 },
  utility: { hex: '#9E9D24', name: 'Utility', count: 2 }
};

const PropertySetDisplay = ({ properties, compact = false }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="text-xs text-gray-500">
        🏠 No properties
      </div>
    );
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

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="text-xs font-bold text-gray-700">
          🏠 Properties ({completedSets}/{setStatuses.length} complete)
        </div>
        <div className="flex flex-wrap gap-1">
          {setStatuses.map(({ color, current, required, isComplete, colorData }) => (
            <div
              key={color}
              className="flex items-center gap-1 px-2 py-1 rounded-md border-2"
              style={{
                backgroundColor: `${colorData?.hex}20`,
                borderColor: colorData?.hex
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colorData?.hex }}
              />
              <span className="text-xs font-bold">
                {isComplete ? '✓' : `${current}/${required}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-slate-800">🏠 Properties</span>
        <span className="text-xs font-bold text-slate-600">
          {completedSets}/{setStatuses.length} complete
        </span>
      </div>
      
      <div className="space-y-2">
        {setStatuses.map(({ color, cards, current, required, isComplete, colorData }) => (
          <div
            key={color}
            className={`p-2 rounded-md border-2 ${
              isComplete ? 'bg-green-50 border-green-400' : 'bg-white border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: colorData?.hex }}
                />
                <span className="text-xs font-bold">{colorData?.name}</span>
              </div>
              <span className="text-xs font-bold">
                {isComplete ? (
                  <span className="text-green-600">✓ Complete</span>
                ) : (
                  <span className="text-slate-600">{current}/{required}</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertySetDisplay;
