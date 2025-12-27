import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, CARD_TYPES, ACTION_TYPES } from '../constants';
import { createPortal } from 'react-dom';
import CARD_BACK_STYLES from '../utils/cardBackStyles';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const ValueBadge = ({ value, size = 'lg' }) => {
  const badgeSizes = {
    xs: 'top-1 left-1 px-1 py-0.5 rounded border text-[8px]',
    sm: 'top-1.5 left-1.5 px-1.5 py-0.5 rounded-lg border-2 text-[10px]',
    md: 'top-2 left-2 px-2 py-1 rounded-lg border-2 text-xs',
    lg: 'top-2.5 left-2.5 px-2.5 py-1.5 rounded-xl border-2 text-sm',
    xl: 'top-3 left-3 px-3 py-2 rounded-2xl border-2 text-base'
  };

  return (
    <div className={`absolute ${badgeSizes[size]} bg-white border-slate-900 shadow-sm z-20`}>
      <span className="font-black text-slate-900 leading-none">{value}M</span>
    </div>
  );
};

const CardWrapper = ({ children, onClick, size, selected, className, style, layoutId, enableHover = true, onHoverStart, onHoverEnd }) => {
  const orientations = {
    micro: { w: 'w-[40px]', h: 'h-[60px]', rounded: 'rounded' },   // 40x60 (1.5 ratio) - MINI preview
    xs: { w: 'w-24', h: 'h-36', rounded: 'rounded-lg' },   // 96x144 (1.5 ratio)
    sm: { w: 'w-32', h: 'h-48', rounded: 'rounded-xl' },   // 128x192 (1.5 ratio)
    md: { w: 'w-40', h: 'h-60', rounded: 'rounded-2xl' },  // 160x240 (1.5 ratio)
    lg: { w: 'w-48', h: 'h-72', rounded: 'rounded-3xl' },  // 192x288 (1.5 ratio)
    xl: { w: 'w-64', h: 'h-96', rounded: 'rounded-[2.5rem]' } // 256x384 (1.5 ratio)
  };

  const o = orientations[size] || orientations.lg;

  const WrapperComponent = (layoutId || enableHover) ? motion.div : 'div';
  
  const hoverProps = enableHover ? { 
    whileHover: { y: -15, scale: 1.05, zIndex: 50 },
    onHoverStart: onHoverStart,
    onHoverEnd: onHoverEnd,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  } : {};

  const commonProps = {
    className: `${o.w} ${o.h} ${o.rounded} shadow-xl relative overflow-hidden flex flex-col flex-shrink-0 flex-grow-0 ${
      selected ? 'ring-4 ring-blue-500 shadow-blue-500/50' : ''
    } ${className}`,
    style: style,
    onClick: () => onClick && onClick()
  };

  if (layoutId || enableHover) {
    return (
      <WrapperComponent
        layoutId={layoutId}
        {...hoverProps}
        {...commonProps}
      >
        {children}
      </WrapperComponent>
    );
  }

  return (
    <div {...commonProps}>
      {children}
    </div>
  );
};

// ============================================================================
// CARD BACK
// ============================================================================

const CardBack = ({ size = 'lg', onClick, className, style, layoutId }) => {
  return (
    <CardWrapper 
      size={size} 
      onClick={onClick} 
      className={`bg-gradient-to-br ${CARD_BACK_STYLES.gradient} border ${CARD_BACK_STYLES.border} ${CARD_BACK_STYLES.shadow} ${className}`} 
      style={style} 
      layoutId={layoutId} 
      enableHover={false}
    >
      {/* Technical Grid Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: CARD_BACK_STYLES.patternDots,
        backgroundSize: CARD_BACK_STYLES.patternSize
      }}></div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Modern Geometric Square with M */}
        <div className="w-28 h-28 rounded-3xl bg-indigo-950/40 backdrop-blur-md shadow-2xl flex items-center justify-center border border-indigo-400/30 relative overflow-hidden group">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50"></div>
          
          <div className="text-center relative z-10">
            <div className="text-6xl font-black tracking-tighter" style={{ color: CARD_BACK_STYLES.accent, fontFamily: 'serif' }}>
              M
            </div>
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: CARD_BACK_STYLES.accent }}></div>
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: CARD_BACK_STYLES.accent }}></div>
        </div>
        
        {/* Text Area */}
        <div className="mt-6 text-center">
          <div className={`text-[10px] font-black uppercase tracking-[0.4em] ${CARD_BACK_STYLES.textPrimary}`}>
            Monopoly Deal
          </div>
          <div className="w-16 h-0.5 mx-auto mt-2 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
        </div>
      </div>
    </CardWrapper>
  );
};

// ============================================================================
// MONEY CARD
// ============================================================================

const MoneyCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId }) => {
  const moneyColors = {
    1: { accent: '#FFB74D', name: 'One' },
    2: { accent: '#EF5350', name: 'Two' },
    3: { accent: '#66BB6A', name: 'Three' },
    4: { accent: '#42A5F5', name: 'Four' },
    5: { accent: '#AB47BC', name: 'Five' },
    10: { accent: '#FFA726', name: 'Ten' }
  };
  
  const colors = moneyColors[card.value] || moneyColors[1];
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 ${className}`} style={{ ...style, borderColor: colors.accent }} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-2 relative">
        <div className="relative z-10 text-center">
          <div className={`${size === 'xs' ? 'text-2xl' : size === 'sm' ? 'text-4xl' : 'text-6xl'} font-black leading-none italic`} style={{ color: colors.accent }}>
            {card.value}M
          </div>
        </div>
      </div>
      
      <div className={`${size === 'xs' ? 'h-1' : 'h-2'} w-full`} style={{ backgroundColor: colors.accent }} />
    </CardWrapper>
  );
};

// ============================================================================
// PROPERTY CARD (Regular)
// ============================================================================

const PropertyCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId }) => {
  const cCode = card.currentColor || card.color;
  const colorData = COLORS[cCode] || {};
  const bgColor = colorData.hex || '#666';
  const rentValues = colorData.rent || [];

  // Size adjustments for smaller cards
  const isTiny = size === 'xs';
  const isSmall = size === 'sm';
  const isMedium = size === 'md';
  const pt = isTiny ? 'pt-5' : isSmall ? 'pt-7' : isMedium ? 'pt-10' : 'pt-14';
  const circleSize = isTiny ? 'w-16 h-16' : isSmall ? 'w-20 h-20' : isMedium ? 'w-24 h-24' : 'w-28 h-28';
  const pb = isTiny ? 'pb-1' : isSmall ? 'pb-2' : 'pb-6';
  const px = isTiny ? 'px-1' : isSmall ? 'px-2' : 'px-5';
  const rentTitleClass = isTiny
    ? "hidden"
    : (isSmall || isMedium)
    ? "text-[8px] font-black text-slate-900/40 uppercase tracking-[0.2em] mb-0.5" 
    : "text-[10px] font-black text-slate-900/40 uppercase tracking-[0.2em] mb-1";
  const rentTextSize = isTiny ? 'text-[8px]' : isSmall ? 'text-[9px]' : 'text-[10px]';
  const titleFontSize = isTiny ? 'text-[9px]' : isSmall ? 'text-[11px]' : 'text-sm';
  const headerHeight = isTiny ? 'h-5' : isSmall ? 'h-7' : 'h-10';
  const headerFontSize = isTiny ? 'text-[7px]' : isSmall ? 'text-[9px]' : 'text-[11px]';
  const textContrast = colorData.text === 'black' ? 'text-slate-900' : 'text-white';

  return (
    <CardWrapper 
      size={size} 
      onClick={onClick} 
      selected={selected} 
      className={`bg-white border-2 ${className}`} 
      style={{ ...style, borderColor: bgColor }} 
      layoutId={layoutId}
    >
      <div className={`absolute top-0 left-0 right-0 ${headerHeight} z-10 flex items-center justify-end pr-3`} style={{ backgroundColor: bgColor }}>
        <span className={`${headerFontSize} font-black uppercase tracking-widest italic ${textContrast}`}>Property</span>
      </div>

      <ValueBadge value={card.value} size={size} />
      
      <div className={`flex-1 flex flex-col items-center ${pt} pt-12`}>
        <div className={`relative ${circleSize} flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rotate-[-90deg]">
            <circle cx="50" cy="50" r="40" fill="none" stroke={bgColor} strokeWidth="2" strokeDasharray="188 251" strokeLinecap="round" />
          </svg>
          <div className="text-center z-10 px-3">
            <h3 className={`${titleFontSize} font-black uppercase leading-tight italic text-slate-900`}>
              {card.name}
            </h3>
          </div>
        </div>
      </div>

      <div className={`${px} ${pb} text-center`}>
        <p className={rentTitleClass}>Rent Value</p>
        <div className="flex justify-center gap-1.5">
          {rentValues.map((rent, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: bgColor }} />
              <span className={`${rentTextSize} font-black text-slate-900`}>${rent}M</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-2 w-full" style={{ backgroundColor: bgColor }} />
    </CardWrapper>
  );
};

// ============================================================================
// WILD PROPERTY CARD (Dual Color)
// ============================================================================

const WildPropertyCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId, showDescription = false }) => {
  // Determine which color is currently active
  const currentColor = card.currentColor || card.colors[0];
  
  // Swap colors so the active one is always on top
  const isFlipped = currentColor === card.colors[1];
  const topColor = isFlipped ? card.colors[1] : card.colors[0];
  const bottomColor = isFlipped ? card.colors[0] : card.colors[1];
  
  const color1Data = COLORS[topColor] || { hex: '#666', name: 'Unknown' };
  const color2Data = COLORS[bottomColor] || { hex: '#666', name: 'Unknown' };
  const color1 = color1Data.hex;
  const color2 = color2Data.hex;
  const text1 = color1Data.text === 'black' ? 'text-slate-900' : 'text-white';
  const text2 = color2Data.text === 'black' ? 'text-slate-900' : 'text-white';
  
  // Helper to get darker version of color for better text contrast
  const getTextColor = (hexColor, colorKey) => {
    // For yellow and other light colors, use a much darker shade for text
    if (colorKey === 'yellow') return '#B8860B'; // Dark goldenrod
    if (colorKey === 'utility') return '#9E9D24'; // Dark lime
    if (colorKey === 'light_blue') return '#0277BD'; // Dark cyan
    return hexColor; // Use original color for other colors
  };

  const textColor1 = getTextColor(color1, topColor);
  const textColor2 = getTextColor(color2, bottomColor);
  
  const isTiny = size === 'xs';
  const isSmallSize = size === 'sm';
  const headerHeight = isTiny ? 'h-4' : isSmallSize ? 'h-7' : 'h-10';
  const headerFontSize = isTiny ? 'text-[5px]' : isSmallSize ? 'text-[7px]' : 'text-[10px]';
  const contentTop = isTiny ? 'top-4' : isSmallSize ? 'top-7' : 'top-10';
  const contentBottom = isTiny ? 'bottom-4' : isSmallSize ? 'bottom-7' : 'bottom-10';

  return (
    <CardWrapper 
      size={size} 
      onClick={onClick} 
      selected={selected} 
      className={`bg-white ${className}`} 
      style={style} 
      layoutId={layoutId}
    >
      {/* Top Header Hook (Active Color) */}
      <div className={`absolute top-0 left-0 right-0 ${headerHeight} z-10 border-t-2 border-x-2`} style={{ backgroundColor: color1, borderColor: color1 }}>
        <div className="h-full w-full flex items-center justify-end pr-3">
          <span className={`${headerFontSize} font-black uppercase tracking-[0.2em] italic ${text1}`}>Wild Card</span>
        </div>
      </div>

      {/* Bottom Header Hook (Inactive Color - Rotated) */}
      <div className={`absolute bottom-0 left-0 right-0 ${headerHeight} z-10 border-b-2 border-x-2`} style={{ backgroundColor: color2, borderColor: color2 }}>
        <div className="h-full w-full flex items-center justify-end pr-3 transform rotate-180">
          <span className={`${headerFontSize} font-black uppercase tracking-[0.2em] italic ${text2}`}>Wild Card</span>
        </div>
      </div>

      <ValueBadge value={card.value} size={size} />
      
      {!showDescription && (
      <div className={`absolute inset-x-0 ${contentTop} ${contentBottom} flex`}>
        {/* Active Color Column (White Aesthetic) */}
        <div className="w-1/2 h-full flex flex-col p-1 pt-1.5 items-center border-r border-slate-100 bg-white overflow-hidden border-l-2" style={{ borderLeftColor: color1 }}>
          <div className={`${isTiny ? 'text-[5px] mb-1' : 'text-[8px] mb-2'} font-black uppercase tracking-wider text-center`} style={{ color: textColor1 }}>
            {color1Data.name}
          </div>
          <div className={`${isTiny ? 'space-y-0.5' : 'space-y-1'} w-full`}>
            {color1Data.rent?.map((rent, i) => (
              <div key={i} className={`flex items-center justify-between ${isTiny ? 'px-0.5 py-0.5' : 'px-1 py-1'} rounded border w-full gap-1`} style={{ borderColor: color1 + '33' }}>
                <div className="flex gap-0.5">
                  {Array.from({length: isTiny ? 1 : i+1}).map((_, j) => (
                    <div key={j} className={`${isTiny ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full`} style={{ backgroundColor: color1 }} />
                  ))}
                </div>
                <div className={`${isTiny ? 'text-[5px]' : 'text-[8px]'} font-black italic whitespace-nowrap`} style={{ color: textColor1 }}>${rent}M</div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Color Column (White Aesthetic - Bottom half orientation) */}
        <div className="w-1/2 h-full flex flex-col p-1 pt-1.5 items-center border-l border-slate-100 bg-white overflow-hidden justify-end border-r-2" style={{ borderRightColor: color2 }}>
          <div className={`${isTiny ? 'space-y-0.5' : 'space-y-1'} w-full mb-1`}>
            {[...(color2Data.rent || [])].reverse().map((rent, i, arr) => (
              <div key={i} className={`flex items-center justify-between ${isTiny ? 'px-0.5 py-0.5' : 'px-1 py-1'} rounded border w-full gap-1`} style={{ borderColor: color2 + '33' }}>
                <div className={`${isTiny ? 'text-[5px]' : 'text-[8px]'} font-black italic whitespace-nowrap`} style={{ color: textColor2 }}>${rent}M</div>
                <div className="flex gap-0.5">
                  {Array.from({length: isTiny ? 1 : arr.length - i}).map((_, j) => (
                    <div key={j} className={`${isTiny ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full`} style={{ backgroundColor: color2 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={`${isTiny ? 'text-[5px] mt-1' : 'text-[8px] mt-1'} font-black uppercase tracking-wider text-center`} style={{ color: textColor2 }}>
            {color2Data.name}
          </div>
        </div>
      </div>
      )}

      {/* Show Description Overlay */}
      {showDescription && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-20 bg-white/50 backdrop-blur-[1px]">
          <p className="text-[10px] text-center font-bold text-slate-800 leading-tight">
            This card can be used as part of any property set of the colors shown. 
            <br/><br/>
            <span className="text-blue-600">Click anytime during your turn to flip and swap sets.</span>
          </p>
        </div>
      )}
    </CardWrapper>
  );
};

// ============================================================================
// RAINBOW WILD PROPERTY CARD
// ============================================================================

const RainbowWildCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId, showDescription = false }) => {
  const isTiny = size === 'xs';
  const isSmall = size === 'sm' || size === 'md';
  const circleSize = isTiny ? 'w-8 h-8' : isSmall ? 'w-24 h-24' : 'w-32 h-32';
  const padding = isTiny ? 'p-1' : 'p-4';
  
  const rainbowColors = [
    '#EF5350', '#FFA726', '#FFEB3B', '#66BB6A', '#42A5F5', '#AB47BC'
  ];
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className={`flex-1 flex flex-col items-center justify-center ${padding}`}>
        <div className={`relative ${circleSize} flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rotate-[-90deg]">
            {rainbowColors.map((color, i) => {
              const segment = 251 / rainbowColors.length;
              return (
                <circle 
                  key={i}
                  cx="50" cy="50" r="40" fill="none" 
                  stroke={color} strokeWidth="3" 
                  strokeDasharray={`${segment-2} 251`} strokeLinecap="round"
                  transform={`rotate(${i * (360/rainbowColors.length)}, 50, 50)`}
                />
              );
            })}
          </svg>
          
          <div className="text-center z-10">
            <div className={`${isTiny ? 'text-[6px]' : 'text-xl'} font-black text-slate-900 italic leading-none`}>WILD</div>
          </div>
        </div>
      </div>
      
      {!isTiny && (
        <div className="px-4 pb-4 text-center">
          <p className="text-[10px] text-slate-700 font-medium leading-snug">
            Use as any color property
          </p>
        </div>
      )}
      {showDescription && (
        <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
          <p className="text-[10px] font-bold text-slate-800">
             Universal Wild Card
             <br/><br/>
             <span className="text-blue-600">Place in any set anytime.</span>
          </p>
        </div>
      )}
    </CardWrapper>
  );
};

// ============================================================================
// ACTION CARD
// ============================================================================

const ActionCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId, showDescription = false }) => {
  const getActionStyle = (actionType) => {
    switch(actionType) {
      case ACTION_TYPES.PASS_GO: return { borderColor: '#F59E0B', iconColor: '#D97706' };
      case ACTION_TYPES.DEAL_BREAKER: return { borderColor: '#C084FC', iconColor: '#9333EA' };
      case ACTION_TYPES.JUST_SAY_NO: return { borderColor: '#FCA5A5', iconColor: '#EF4444' };
      case ACTION_TYPES.SLY_DEAL: return { borderColor: '#86EFAC', iconColor: '#10B981' };
      case ACTION_TYPES.FORCED_DEAL: return { borderColor: '#5EEAD4', iconColor: '#14B8A6' };
      case ACTION_TYPES.DEBT_COLLECTOR: return { borderColor: '#CBD5E1', iconColor: '#64748B' };
      case ACTION_TYPES.BIRTHDAY: return { borderColor: '#FBCFE8', iconColor: '#EC4899' };
      case ACTION_TYPES.HOUSE: return { borderColor: '#10B981', iconColor: '#059669' };
      case ACTION_TYPES.HOTEL: return { borderColor: '#3B82F6', iconColor: '#1D4ED8' };
      case ACTION_TYPES.DOUBLE_RENT: return { borderColor: '#FED7AA', iconColor: '#F97316' };
      default: return { borderColor: '#CBD5E1', iconColor: '#64748B' };
    }
  };

  const actionStyle = getActionStyle(card.actionType);
  const isSmall = size === 'sm';
  const isTiny = size === 'xs';

  const ActionIcon = () => {
    const iconSize = isTiny ? 24 : isSmall ? 36 : 48;
    const strokeWidth = 2.5;
    
    switch(card.actionType) {
      case ACTION_TYPES.PASS_GO:
        return (
          <div className="flex flex-col items-center justify-center w-full h-full text-center relative">
            <div className="flex flex-col items-center" style={{ transform: 'translate(-4px, -3px)' }}>
              <div className={`text-[30px] font-black italic tracking-tighter leading-none ${isSmall ? 'text-2xl' : isTiny ? 'text-[9px]' : ''}`} style={{ color: actionStyle.iconColor }}>PASS</div>
              <div className={`text-[46px] font-black italic tracking-tighter leading-[0.75] ${isSmall ? 'text-4xl' : isTiny ? 'text-[13px]' : ''}`} style={{ color: actionStyle.iconColor }}>GO</div>
            </div>
            {!isTiny && (
              <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-black uppercase tracking-[2px] bg-slate-900 text-white px-3 py-1 rounded-full shadow-lg z-20">
                Draw 2
              </div>
            )}
          </div>
        );
      case ACTION_TYPES.DEAL_BREAKER:
        return (
          <div className="flex items-center justify-center">
            <svg width={iconSize + 8} height={iconSize + 8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" fillOpacity="0.1" />
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        );
      case ACTION_TYPES.JUST_SAY_NO:
        return (
          <div className="flex items-center justify-center">
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
        );
      case ACTION_TYPES.SLY_DEAL:
        return (
          <div className="flex items-center justify-center">
             <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14z" opacity="0.5" />
                <path d="M2.5 12h5" />
                <path d="M5.5 15l-3-3 3-3" />
             </svg>
          </div>
        );
      case ACTION_TYPES.FORCED_DEAL:
        return (
          <div className="flex items-center justify-center">
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2.1l4 4-4 4" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <path d="M7 21.9l-4-4 4-4" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </div>
        );
      case ACTION_TYPES.DEBT_COLLECTOR:
        return (
          <div className="flex items-center justify-center">
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
               <rect x="2" y="6" width="20" height="12" rx="2" />
               <circle cx="12" cy="12" r="2" />
               <path d="M12 10v4" />
               <path d="M12 8v0" /> {/* Dot? No, just the line implies $ */}
            </svg>
          </div>
        );
      case ACTION_TYPES.BIRTHDAY:
        return (
          <div className="flex items-center justify-center">
             <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12v10H4V12" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
        );
      case ACTION_TYPES.HOUSE:
        return (
          <div className="flex items-center justify-center">
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
               <path d="M3 10l9-7 9 7" />
               <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
               <path d="M10 21v-6h4v6" />
            </svg>
          </div>
        );
      case ACTION_TYPES.HOTEL:
        return (
          <div className="flex items-center justify-center">
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }} strokeLinecap="round" strokeLinejoin="round">
               <path d="M6 21V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15" />
               <path d="M10 8h4" />
               <path d="M10 12h4" />
               <path d="M10 16h4" />
               <path d="M3 21h18" />
            </svg>
          </div>
        );
      case ACTION_TYPES.DOUBLE_RENT:
        return (
          <div className="flex flex-col items-center justify-center">
             <div className="text-[40px] font-black italic tracking-tighter leading-none" style={{ color: actionStyle.iconColor }}>x2</div>
          </div>
        );
      default:
        return <div className="text-4xl text-slate-300">⚡</div>;
    }
  };

  const circleSize = isTiny ? 'w-16 h-16' : isSmall ? 'w-24 h-24' : 'w-32 h-32';

  return (
    <CardWrapper 
      size={size} onClick={onClick} selected={selected} 
      className={`bg-white border-2 border-slate-200 ${className}`} 
      style={style} layoutId={layoutId}
    >
      <ValueBadge value={card.value} size={size} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-3">
        <div className={`relative ${circleSize} flex flex-col items-center justify-center`}>
          {/* Circular Frame matching Property Arch style */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rotate-[-90deg]">
             <circle 
               cx="50" cy="50" r="42" fill="none" 
               stroke={actionStyle.borderColor} strokeWidth="1.5" 
               strokeDasharray="200 264" strokeLinecap="round" 
             />
          </svg>

          {/* Card Title inside the circle at the top - ABSOLUTE to stay out of center flow */}
          {!isTiny && card.actionType !== ACTION_TYPES.PASS_GO && (
            <div className="absolute top-[12%] left-0 right-0 z-20 text-center px-4">
              <h3 className={`font-black text-slate-800 uppercase tracking-tight leading-none ${isSmall ? 'text-[8.5px]' : 'text-[11px]'}`}>
                {card.name}
              </h3>
            </div>
          )}

          {/* Illustration perfectly centered */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <ActionIcon />
          </div>
        </div>
      </div>

      {isTiny && card.actionType !== ACTION_TYPES.PASS_GO && (
         <div className="border-t py-0.5 flex items-center justify-center bg-slate-50">
           <span className="text-[6px] font-black text-slate-600 uppercase tracking-tighter truncate px-1">{card.name}</span>
         </div>
      )}

      {showDescription && (
        <div className="absolute inset-x-0 bottom-0 top-[60%] bg-white/95 backdrop-blur-sm p-3 text-center flex flex-col justify-center border-t border-slate-100 z-20">
           <p className="text-[10px] font-bold text-slate-800 leading-tight">
             {card.description}
           </p>
        </div>
      )}
    </CardWrapper>
  );
};

// ============================================================================
// RENT CARD
// ============================================================================

const RentCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId, showDescription = false }) => {
  const isWild = card.type === CARD_TYPES.RENT_WILD;
  const colors = isWild ? Object.keys(COLORS).filter(c => c !== 'multi') : (card.colors || []);
  
  const isTiny = size === 'xs';
  const containerSize = isTiny ? 'w-10 h-10' : 'w-28 h-28';
  const innerCircleSize = isTiny ? 'w-6 h-6' : 'w-14 h-14';

  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className={`flex-1 flex items-center justify-center ${isTiny ? 'p-1' : 'p-2'}`}>
        <div className={`relative ${containerSize}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {isWild ? (
              ['brown', 'light_blue', 'pink', 'orange', 'red', 'yellow', 'green', 'dark_blue', 'railroad', 'utility'].map((color, i) => {
                const segmentAngle = 36;
                const startAngle = i * segmentAngle - 90;
                const endAngle = (i + 1) * segmentAngle - 90;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const innerRadius = 30;
                const outerRadius = 45;
                const x1 = 50 + innerRadius * Math.cos(startRad);
                const y1 = 50 + innerRadius * Math.sin(startRad);
                const x2 = 50 + outerRadius * Math.cos(startRad);
                const y2 = 50 + outerRadius * Math.sin(startRad);
                const x3 = 50 + outerRadius * Math.cos(endRad);
                const y3 = 50 + outerRadius * Math.sin(endRad);
                const x4 = 50 + innerRadius * Math.cos(endRad);
                const y4 = 50 + innerRadius * Math.sin(endRad);
                return (
                  <path
                    key={color}
                    d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`}
                    fill={COLORS[color]?.hex || '#666'}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })
            ) : (
              <>
                <path
                  d="M 5 50 A 45 45 0 0 1 95 50 L 70 50 A 20 20 0 0 0 30 50 Z"
                  fill={COLORS[colors[0]]?.hex || '#666'}
                  stroke="white"
                  strokeWidth="1"
                  className="opacity-90"
                />
                <path
                  d="M 95 50 A 45 45 0 0 1 5 50 L 30 50 A 20 20 0 0 0 70 50 Z"
                  fill={COLORS[colors[1]]?.hex || '#666'}
                  stroke="white"
                  strokeWidth="1"
                  className="opacity-90"
                />
              </>
            )}
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`bg-white rounded-full ${innerCircleSize} flex items-center justify-center shadow-lg border-2 border-slate-50`}>
              <span className={`${isTiny ? 'text-[6px]' : 'text-base'} font-black text-slate-900 leading-none`}>Rent</span>
            </div>
          </div>
        </div>
      </div>
      
      {showDescription && (
        <div className="px-4 pb-4 text-center">
          <p className="text-[10px] leading-snug text-slate-900 font-medium">
            {isWild 
              ? "Force any player to pay you rent for any property you own"
              : `All players pay you rent for properties you own in one of these colors`
            }
          </p>
        </div>
      )}
    </CardWrapper>
  );
};

// ============================================================================
// MAIN CARD COMPONENT (Router)
// ============================================================================

// ============================================================================
// MAIN CARD COMPONENT (Router)
// ============================================================================

const Card = ({ card, onClick, size = 'lg', faceDown = false, selected = false, className = '', style = {}, layoutId, enableHover = true, showDescription = false }) => {
  if (!card && !faceDown) return null;

  if (faceDown) {
    return <CardBack size={size} onClick={onClick} className={className} style={style} layoutId={layoutId} />;
  }

  // Render content logic
  const renderCardContent = (forceShowDesc = false) => {
    const cardType = card.type;
    const isRainbow = card.isRainbow;
    const isWildProperty = cardType === CARD_TYPES.PROPERTY_WILD;

    // Merge showDescription prop with forceShowDesc flag
    const shouldShowDesc = showDescription || forceShowDesc;

    if (isRainbow) {
      return <RainbowWildCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} showDescription={shouldShowDesc} />;
    }

    if (isWildProperty && card.colors?.length === 2) {
      return <WildPropertyCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} showDescription={shouldShowDesc} />;
    }

    if (cardType === CARD_TYPES.PROPERTY || isWildProperty) {
      return <PropertyCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
    }

    if (cardType === CARD_TYPES.MONEY) {
      return <MoneyCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
    }

    if (cardType === CARD_TYPES.ACTION) {
      return <ActionCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} showDescription={shouldShowDesc} />;
    }

    if (cardType === CARD_TYPES.RENT || cardType === CARD_TYPES.RENT_WILD) {
      return <RentCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} showDescription={shouldShowDesc} />;
    }

    return (
      <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-slate-200 ${className}`} style={style} layoutId={layoutId}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-slate-600 text-xs">Unknown Card</div>
        </div>
      </CardWrapper>
    );
  };

  return renderCardContent(false);
};

export default Card;
