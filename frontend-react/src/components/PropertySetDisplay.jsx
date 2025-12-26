import React, { useState } from 'react';
import { COLORS, ACTION_TYPES, getSets } from '../utils/gameHelpers';
import { motion, AnimatePresence } from 'framer-motion';

import Card from './Card';

const PropertySetDisplay = ({ properties, compact = false, onCardClick, tooltipDirection = 'top', tooltipAlign = 'center', horizontal = false, accentColor, showMiniCardPreviews = false, isCurrentPlayer = false }) => {
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
      <div 
        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
        style={accentColor ? {
          backgroundColor: `${accentColor}15`,
          color: accentColor,
          borderColor: `${accentColor}40`
        } : {
          backgroundColor: '#f1f5f9',
          color: '#64748b',
          borderColor: '#e2e8f0'
        }}
      >
        Sets: {completedSets}/{setStatuses.length}
      </div>
      
      {/* Visual property cards */}
      <div className={`flex gap-3 w-full ${showMiniCardPreviews ? 'py-2 pb-20' : 'py-2'} ${horizontal ? 'flex-row' : 'flex-wrap justify-center'}`}>
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

            {/* Show actual cards for current player */}
            {isCurrentPlayer ? (
              <div className="flex -space-x-12">
                {cards.map((card, idx) => (
                  <div 
                    key={card.uid || idx}
                    className="relative transition-transform hover:scale-110 hover:-translate-y-2 hover:z-50"
                    style={{ zIndex: idx }}
                    onClick={() => onCardClick && onCardClick(card)}
                  >
                    <Card 
                      card={card} 
                      size="xs" 
                      className="shadow-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Show colored blocks for opponents */
              <div 
                className="relative cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => {
                  if (onCardClick && cards.length > 0) {
                    onCardClick(cards[0]);
                  }
                  setExpandedSet(expandedSet === color ? null : color);
                }}
                style={{ 
                  width: `${44 + (Math.min(cards.length, 5) - 1) * 3}px`, 
                  height: `${60 + (Math.min(cards.length, 5) - 1) * 4}px`
                }}
              >
                {[...cards].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-md shadow-sm border border-black/10 transition-all"
                    style={{
                      background: color === 'any_rainbow' 
                        ? 'linear-gradient(135deg, #EF5350 0%, #FFA726 20%, #FFEB3B 40%, #66BB6A 60%, #42A5F5 80%, #AB47BC 100%)'
                        : (colorData?.hex || '#94a3b8'),
                      width: '44px',
                      height: '60px',
                      left: 0,
                      top: 0,
                      transform: `translate(${i * 3}px, ${i * 4}px)`,
                      zIndex: i
                    }}
                  />
                ))}

              {/* Top Layer Content */}
              <div 
                className="absolute flex flex-col items-center justify-center rounded-md border-t border-white/20"
                style={{
                  width: '44px',
                  height: '60px',
                  left: 0,
                  top: 0,
                  transform: `translate(${(cards.length - 1) * 3}px, ${(cards.length - 1) * 4}px)`,
                  zIndex: cards.length + 1,
                  color: colorData?.text || 'white'
                }}
              >
                  {color === 'any_rainbow' ? (
                    // Rainbow set - just show count, no progress
                    <span className="font-black text-2xl leading-none drop-shadow-md text-white">{current}</span>
                  ) : (
                    // Normal set - show progress
                    <>
                      <span className="font-black text-xl leading-none drop-shadow-md">{current}</span>
                      <div className="w-6 h-[1px] bg-current opacity-40 my-0.5"></div>
                      <span className="font-bold text-[10px] opacity-75">{required}</span>
                    </>
                  )}
              </div>

              {/* Completion indicator */}
              {isComplete && (
                <div 
                  className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white z-[100] shadow-lg animate-bounce"
                  style={{
                     transform: `translate(${(cards.length - 1) * 3}px, ${(cards.length - 1) * 4}px)`
                  }}
                >
                  ✓
                </div>
              )}
              
              {/* Wild Card Badges (Option 1) */}
              {(() => {
                // Check if this set contains any wild cards
                const hasRainbowWild = cards.some(card => card.isRainbow);
                const dualWilds = cards.filter(card => 
                  card.type === 'PROPERTY_WILD' && 
                  card.colors?.length === 2 && 
                  !card.isRainbow
                );
                
                // Only show rainbow badge if this is NOT the rainbow set itself
                if (hasRainbowWild && color !== 'any_rainbow') {
                  return (
                    <div 
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-[101] shadow-lg"
                      style={{
                        transform: `translate(${(cards.length - 1) * 3}px, ${(cards.length - 1) * 4}px)`,
                        background: 'linear-gradient(135deg, #EF5350 0%, #FFA726 20%, #FFEB3B 40%, #66BB6A 60%, #42A5F5 80%, #AB47BC 100%)'
                      }}
                      title="Contains Rainbow Wild Card"
                    >
                      <span className="text-white text-[9px] font-black drop-shadow-md">🌈</span>
                    </div>
                  );
                }
                
                if (dualWilds.length > 0) {
                  // Get the two colors from the dual wild card
                  const wildCard = dualWilds[0];
                  const color1Data = COLORS[wildCard.colors[0]];
                  const color2Data = COLORS[wildCard.colors[1]];
                  
                  return (
                    <>
                      {/* Main dual-color badge */}
                      <div 
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white z-[101] shadow-lg overflow-hidden"
                        style={{
                          transform: `translate(${(cards.length - 1) * 3}px, ${(cards.length - 1) * 4}px)`
                        }}
                        title={`Contains ${dualWilds.length} ${color1Data?.name}/${color2Data?.name} Wild Card${dualWilds.length > 1 ? 's' : ''}`}
                      >
                        {/* Split circle showing both colors */}
                        <div className="absolute inset-0 flex">
                          <div 
                            className="w-1/2 h-full" 
                            style={{ backgroundColor: color1Data?.hex || '#666' }}
                          />
                          <div 
                            className="w-1/2 h-full" 
                            style={{ backgroundColor: color2Data?.hex || '#666' }}
                          />
                        </div>
                        {/* Wild card icon */}
                        <span className="relative z-10 text-white text-[10px] font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">W</span>
                      </div>
                      
                      {/* Additional badges for multiple wilds - stacked behind */}
                      {dualWilds.length > 1 && (
                        <>
                          {dualWilds.slice(1, 3).map((_, idx) => (
                            <div 
                              key={idx}
                              className="absolute -top-1 -right-1 w-7 h-7 rounded-full border-2 border-white shadow-lg overflow-hidden"
                              style={{
                                transform: `translate(${(cards.length - 1) * 3 - (idx + 1) * 4}px, ${(cards.length - 1) * 4 + (idx + 1) * 4}px)`,
                                zIndex: 101 - (idx + 1)
                              }}
                            >
                              <div className="absolute inset-0 flex">
                                <div 
                                  className="w-1/2 h-full opacity-90" 
                                  style={{ backgroundColor: color1Data?.hex || '#666' }}
                                />
                                <div 
                                  className="w-1/2 h-full opacity-90" 
                                  style={{ backgroundColor: color2Data?.hex || '#666' }}
                                />
                              </div>
                            </div>
                          ))}
                          {/* Count badge if more than 3 */}
                          {dualWilds.length > 3 && (
                            <div 
                              className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                              style={{
                                transform: `translate(${(cards.length - 1) * 3}px, ${(cards.length - 1) * 4}px)`,
                                zIndex: 102
                              }}
                            >
                              {dualWilds.length}
                             </div>
                          )}
                        </>
                      )}
                    </>
                  );
                }
                
                return null;
              })()}
            </div>
            )}
            {/* Hover card preview (no text) */}
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
                  <div className="bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-xl shadow-2xl border border-white/20">
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
            
            {/* Expanded details (legacy mobile/click view) - REMOVED */}
            
            {/* Mini Card Previews (Option 2) */}
            {showMiniCardPreviews && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex -space-x-7 z-20">
                {cards.slice(0, 5).map((card, idx) => (
                  <div 
                    key={card.uid || idx} 
                    className="relative transition-transform hover:scale-125 hover:z-30"
                    style={{ zIndex: idx }}
                  >
                    <Card 
                      card={card} 
                      size="micro" 
                      enableHover={false}
                      className="shadow-md border border-white/60"
                    />
                  </div>
                ))}
                {cards.length > 5 && (
                  <div className="w-[40px] h-[60px] bg-slate-700 rounded border border-white/40 flex items-center justify-center text-[8px] text-white font-black shadow-md">
                    +{cards.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertySetDisplay;
