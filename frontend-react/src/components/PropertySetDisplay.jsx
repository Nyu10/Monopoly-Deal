import React, { useState } from 'react';
import { COLORS, ACTION_TYPES, getSets } from '../utils/gameHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import MiniCard from './MiniCard';
import Card from './Card';

const PropertySetDisplay = ({ properties, compact = false, onCardClick, tooltipDirection = 'top', tooltipAlign = 'center', horizontal = false }) => {
  const [expandedSet, setExpandedSet] = useState(null);
  const [hoveredColor, setHoveredColor] = useState(null);

  if (!properties || properties.length === 0) {
    return null;
  }

  const setStatuses = getSets(properties).map(set => ({
    ...set,
    current: set.cards.length,
    required: COLORS[set.color]?.count || 2,
    colorData: COLORS[set.color]
  }));

  const completedSets = setStatuses.filter(s => s.isComplete).length;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        Sets: {completedSets}/{setStatuses.length}
      </div>
      
      {/* Visual property cards */}
      <div className={`flex gap-2 w-full py-2 ${horizontal ? 'flex-row' : 'flex-wrap justify-center'}`}>
        {setStatuses.map(({ color, cards, houses, hotels, current, required, isComplete, colorData }) => (
          <div 
            key={color} 
            className="relative"
            onMouseEnter={() => setHoveredColor(color)}
            onMouseLeave={() => setHoveredColor(null)}
          >
            {/* House/Hotel floating indicators */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 z-30">
              {Array.from({ length: houses }).map((_, i) => (
                <div key={`h-${i}`} className="w-5 h-5 bg-emerald-500 rounded-sm border-2 border-white shadow-lg flex items-center justify-center text-[10px] animate-in zoom-in duration-300">🏠</div>
              ))}
              {Array.from({ length: hotels }).map((_, i) => (
                <div key={`ht-${i}`} className="w-5 h-5 bg-red-500 rounded-sm border-2 border-white shadow-lg flex items-center justify-center text-[10px] animate-in zoom-in duration-300">🏨</div>
              ))}
            </div>

            {/* Property card stack using actual cards */}
            <div 
              className="relative cursor-pointer transition-all duration-300 hover:z-50"
              onClick={() => {
                if (onCardClick && cards.length > 0) {
                  onCardClick(cards[0]);
                }
                setExpandedSet(expandedSet === color ? null : color);
              }}
              style={{ 
                width: `${192 * 0.25}px`, 
                height: `${288 * 0.25 + (cards.length - 1) * 10}px`,
                minHeight: `${288 * 0.25}px`
              }}
            >
              {/* Show stacked cards - Front to Back fanning */}
              {[...cards].reverse().map((card, i, arr) => {
                const actualIndex = arr.length - 1 - i;
                const offset = actualIndex * 10;
                
                return (
                  <div
                    key={card.id || i}
                    className="absolute transition-all duration-300 group"
                    style={{
                      left: '0px',
                      top: `${offset}px`,
                      zIndex: actualIndex
                    }}
                  >
                    <MiniCard 
                      card={card} 
                      scale={0.25} 
                      onClick={() => {
                        if (onCardClick) onCardClick(card);
                      }}
                      className={`shadow-md border border-black/5 rounded overflow-hidden transition-all duration-300 ${
                        actualIndex === 0 ? 'ring-1 ring-white/50' : 'brightness-[0.9]'
                      } group-hover:brightness-100 group-hover:shadow-lg group-hover:-translate-y-1`}
                    />
                  </div>
                );
              })}
              
              {/* Completion indicator */}
              {isComplete && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-[100] shadow-lg animate-bounce">
                  ✓
                </div>
              )}
            </div>
            
            {/* Hover details tooltip */}
            <AnimatePresence>
              {hoveredColor === color && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className={`absolute ${tooltipDirection === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} ${
                    tooltipAlign === 'left' ? 'left-0' : 
                    tooltipAlign === 'right' ? 'right-0' : 
                    'left-1/2 -translate-x-1/2'
                  } z-[100] pointer-events-none`}
                >
                  <div className="bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-xl shadow-2xl border border-white/20 flex flex-col items-center gap-2">
                    <div className="flex -space-x-8 px-4">
                      {cards.map((card, idx) => (
                        <div 
                          key={card.uid || idx} 
                          className="relative"
                          style={{ zIndex: idx }}
                        >
                          <Card 
                            card={card} 
                            size="sm" 
                            enableHover={false}
                            className="shadow-xl border border-white/40"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-white text-[9px] font-black uppercase tracking-widest opacity-80">
                      {colorData?.name} SET • {current}/{required}
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className={`absolute ${tooltipDirection === 'top' ? 'top-full -mt-1 border-t-slate-900/95' : 'bottom-full -mb-1 border-b-slate-900/95'} ${
                    tooltipAlign === 'left' ? 'left-5 -translate-x-1/2' : 
                    tooltipAlign === 'right' ? 'right-5 translate-x-1/2' : 
                    'left-1/2 -translate-x-1/2'
                  } w-0 h-0 border-l-[6px] border-r-[6px] border-[6px] border-l-transparent border-r-transparent ${tooltipDirection === 'top' ? 'border-b-transparent' : 'border-t-transparent'}`}></div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Expanded details (legacy mobile/click view) */}
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
