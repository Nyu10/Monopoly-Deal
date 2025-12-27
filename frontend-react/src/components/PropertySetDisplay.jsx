import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { COLORS, ACTION_TYPES, getSets } from '../utils/gameHelpers';
import { motion, AnimatePresence } from 'framer-motion';

import Card from './Card';

// Internal component for handling smart positioning
// This measures itself after render and adjusts position to stay on screen
const SmartTooltip = ({ targetRect, direction, align, children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState(null); // { top, left, initialOffset }

  useLayoutEffect(() => {
    if (!ref.current || !targetRect) return;

    const { width, height } = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 12;
    const margin = 16; // Safety edge margin

    let top = 0;
    let left = 0;
    let initialX = 0;
    let initialY = 0;

    // Helper: Clamp value between min and max
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    if (direction === 'left') {
      // Position: Left of target
      left = targetRect.left - width - gap;
      
      // Vertical Center (Ideal)
      const idealTop = targetRect.top + (targetRect.height / 2) - (height / 2);
      // Clamp Vertical
      top = clamp(idealTop, margin, vh - height - margin);

      initialX = 10; // Slide in from right
    } else if (direction === 'right') {
      // Position: Right of target
      left = targetRect.right + gap;
      
      // Vertical Center (Ideal)
      const idealTop = targetRect.top + (targetRect.height / 2) - (height / 2);
      // Clamp Vertical
      top = clamp(idealTop, margin, vh - height - margin);

      initialX = -10; // Slide in from left
    } else if (direction === 'bottom') {
      // Position: Below target
      top = targetRect.bottom + gap;

      // Horizontal Alignment
      let idealLeft;
      if (align === 'left') idealLeft = targetRect.left;
      else if (align === 'right') idealLeft = targetRect.right - width;
      else idealLeft = targetRect.left + (targetRect.width / 2) - (width / 2); // Center

      // Clamp Horizontal
      left = clamp(idealLeft, margin, vw - width - margin);

      initialY = -10; // Slide down
    } else {
      // Default: Top
      top = targetRect.top - height - gap;

      // Horizontal Alignment
      let idealLeft;
      if (align === 'left') idealLeft = targetRect.left;
      else if (align === 'right') idealLeft = targetRect.right - width;
      else idealLeft = targetRect.left + (targetRect.width / 2) - (width / 2); // Center

      // Clamp Horizontal
      left = clamp(idealLeft, margin, vw - width - margin);

      initialY = 10; // Slide up
    }

    setPosition({ top, left, initialX, initialY });
  }, [targetRect, direction, align]);

  // Initial invisible render to measure dimensions
  const finalStyle = position ? {
    top: position.top,
    left: position.left,
    position: 'fixed',
    zIndex: 9999,
    pointerEvents: 'none'
  } : {
    opacity: 0,
    position: 'fixed', 
    top: 0, 
    left: 0,
    pointerEvents: 'none'
  };

  return createPortal(
    <motion.div
      ref={ref}
      style={finalStyle}
      initial={position ? { opacity: 0, scale: 0.95, x: position.initialX, y: position.initialY } : false}
      animate={position ? { opacity: 1, scale: 1, x: 0, y: 0 } : false}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>,
    document.body
  );
};

const PropertySetDisplay = ({ properties, compact = false, onCardClick, tooltipDirection = 'top', tooltipAlign = 'center', horizontal = false, accentColor, showMiniCardPreviews = false, isCurrentPlayer = false }) => {
  const [hoveredState, setHoveredState] = useState(null); // { color, cards, rect }

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

  const handleMouseEnter = (e, color, cards) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredState({ color, cards, rect });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  return (
    <>
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
              onMouseEnter={(e) => handleMouseEnter(e, color, cards)}
              onMouseLeave={handleMouseLeave}
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
                    className="absolute -top-3 -left-3 bg-green-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white z-[100] shadow-lg"
                  >
                    ✓
                  </div>
                )}
                
                {/* Wild Card Badges */}
                {(() => {
                  const hasRainbowWild = cards.some(card => card.isRainbow);
                  const dualWilds = cards.filter(card => 
                    card.type === 'PROPERTY_WILD' && 
                    card.colors?.length === 2 && 
                    !card.isRainbow
                  );
                  
                  if (hasRainbowWild && color !== 'any_rainbow') {
                    return (
                      <div 
                        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-[101] shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #EF5350 0%, #FFA726 20%, #FFEB3B 40%, #66BB6A 60%, #42A5F5 80%, #AB47BC 100%)'
                        }}
                        title="Contains Rainbow Wild Card"
                      >
                        <span className="text-white text-[9px] font-black drop-shadow-md">🌈</span>
                      </div>
                    );
                  }
                  
                  if (dualWilds.length > 0) {
                    const wildCard = dualWilds[0];
                    const color1Data = COLORS[wildCard.colors[0]];
                    const color2Data = COLORS[wildCard.colors[1]];
                    
                    return (
                      <>
                        <div 
                          className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white z-[101] shadow-lg overflow-hidden"
                          title={`Contains ${dualWilds.length} ${color1Data?.name}/${color2Data?.name} Wild Card${dualWilds.length > 1 ? 's' : ''}`}
                        >
                          <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full" style={{ backgroundColor: color1Data?.hex || '#666' }} />
                            <div className="w-1/2 h-full" style={{ backgroundColor: color2Data?.hex || '#666' }} />
                          </div>
                          <span className="relative z-10 text-white text-[10px] font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">W</span>
                        </div>
                        
                        {dualWilds.length > 1 && (
                          <>
                            {dualWilds.slice(1, 3).map((_, idx) => (
                              <div 
                                key={idx}
                                className="absolute -top-2 -left-2 w-7 h-7 rounded-full border-2 border-white shadow-lg overflow-hidden"
                                style={{
                                  transform: `translate(${-(idx + 1) * 4}px, ${(idx + 1) * 4}px)`,
                                  zIndex: 101 - (idx + 1)
                                }}
                              >
                                <div className="absolute inset-0 flex">
                                  <div className="w-1/2 h-full opacity-90" style={{ backgroundColor: color1Data?.hex || '#666' }} />
                                  <div className="w-1/2 h-full opacity-90" style={{ backgroundColor: color2Data?.hex || '#666' }} />
                                </div>
                              </div>
                            ))}
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
      
      {/* Smart Tooltip Portal */}
      <AnimatePresence>
        {hoveredState && (
          <SmartTooltip 
            key={hoveredState.color}
            targetRect={hoveredState.rect} 
            direction={tooltipDirection}
            align={tooltipAlign}
          >
            <div className="bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl shadow-2xl border border-white/20">
              <div className="flex -space-x-8 px-4">
                {hoveredState.cards.map((card, idx) => (
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
          </SmartTooltip>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertySetDisplay;
