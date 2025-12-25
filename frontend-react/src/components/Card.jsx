import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';
import { createPortal } from 'react-dom';
import CARD_BACK_STYLES from '../utils/cardBackStyles';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const ValueBadge = ({ value, size = 'lg' }) => {
  const badgeSizes = {
    xs: 'top-0.5 left-0.5 px-0.5 py-0 rounded border text-[6px]',
    sm: 'top-1 left-1 px-1 py-0.5 rounded-md border text-[8px]',
    md: 'top-1.5 left-1.5 px-1.5 py-0.5 rounded-lg border-2 text-xs',
    lg: 'top-2 left-2 px-2 py-1 rounded-lg border-2 text-sm',
    xl: 'top-2.5 left-2.5 px-2.5 py-1.5 rounded-xl border-2 text-base'
  };

  return (
    <div className={`absolute ${badgeSizes[size]} bg-white border-slate-900 shadow-sm z-20`}>
      <span className="font-black text-slate-900 leading-none">{value}M</span>
    </div>
  );
};

const CardWrapper = ({ children, onClick, size, selected, className, style, layoutId, enableHover = true, onHoverStart, onHoverEnd }) => {
  const orientations = {
    xs: { w: 'w-12', h: 'h-18', rounded: 'rounded-md' },
    sm: { w: 'w-20', h: 'h-30', rounded: 'rounded-lg' },
    md: { w: 'w-32', h: 'h-48', rounded: 'rounded-xl' },
    lg: { w: 'w-40', h: 'h-60', rounded: 'rounded-2xl' },
    xl: { w: 'w-56', h: 'h-84', rounded: 'rounded-3xl' }
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
    className: `${o.w} ${o.h} ${o.rounded} shadow-xl relative overflow-hidden flex flex-col ${
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
        <div className="w-28 h-28 rounded-2xl bg-slate-900/50 backdrop-blur-md shadow-2xl flex items-center justify-center border border-slate-700/50 relative overflow-hidden group">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-50"></div>
          
          <div className="text-center relative z-10">
            <div className="text-6xl font-black tracking-tighter" style={{ color: CARD_BACK_STYLES.accent, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              M
            </div>
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l" style={{ borderColor: CARD_BACK_STYLES.accent }}></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r" style={{ borderColor: CARD_BACK_STYLES.accent }}></div>
        </div>
        
        {/* Text Area */}
        <div className="mt-6 text-center">
          <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${CARD_BACK_STYLES.textPrimary}`}>
            Monopoly Deal
          </div>
          <div className="w-12 h-0.5 mx-auto mt-2 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
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
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="relative z-10 text-center">
          <div className="text-6xl font-black leading-none italic" style={{ color: colors.accent }}>
            {card.value}M
          </div>
        </div>
      </div>
      
      <div className="h-2 w-full" style={{ backgroundColor: colors.accent }} />
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
  const isSmall = size === 'md' || size === 'sm';
  const pt = isSmall ? 'pt-4' : 'pt-10';
  const circleSize = isSmall ? 'w-20 h-20' : 'w-28 h-28';
  const pb = isSmall ? 'pb-2' : 'pb-6';
  const px = isSmall ? 'px-2' : 'px-5';
  const rentTitleClass = isSmall 
    ? "text-[8px] font-black text-slate-900/40 uppercase tracking-[0.2em] mb-0.5" 
    : "text-[10px] font-black text-slate-900/40 uppercase tracking-[0.2em] mb-1";
  const rentTextSize = isSmall ? 'text-[8px]' : 'text-[10px]';

  return (
    <CardWrapper 
      size={size} 
      onClick={onClick} 
      selected={selected} 
      className={`bg-white border-2 ${className}`} 
      style={{ ...style, borderColor: bgColor }} 
      layoutId={layoutId}
    >
      <ValueBadge value={card.value} size={size} />
      
      <div className={`flex-1 flex flex-col items-center ${pt}`}>
        <div className={`relative ${circleSize} flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rotate-[-90deg]">
            <circle cx="50" cy="50" r="40" fill="none" stroke={bgColor} strokeWidth="2" strokeDasharray="188 251" strokeLinecap="round" />
          </svg>
          <div className="text-center z-10 px-3">
            <h3 className="text-sm font-black uppercase leading-tight italic text-slate-900">
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
  const color1Data = COLORS[card.colors[0]] || { hex: '#666', name: 'Unknown' };
  const color2Data = COLORS[card.colors[1]] || { hex: '#666', name: 'Unknown' };
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

  const textColor1 = getTextColor(color1, card.colors[0]);
  const textColor2 = getTextColor(color2, card.colors[1]);
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      {/* Top Header Hook (Color 1) */}
      <div className="absolute top-0 left-0 right-0 h-10 z-10" style={{ backgroundColor: color1 }}>
        <div className="h-full w-full flex items-center justify-end pr-3">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${text1}`}>Wild Card</span>
        </div>
      </div>

      {/* Bottom Header Hook (Color 2 - Rotated) */}
      <div className="absolute bottom-0 left-0 right-0 h-10 z-10" style={{ backgroundColor: color2 }}>
        <div className="h-full w-full flex items-center justify-end pr-3 transform rotate-180">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${text2}`}>Wild Card</span>
        </div>
      </div>

      <ValueBadge value={card.value} size={size} />
      
      {!showDescription && (
      <div className="absolute inset-x-0 top-10 bottom-10 flex">
        {/* Color 1 Column (White Aesthetic) */}
        <div className="w-1/2 h-full flex flex-col p-1.5 pt-2 items-center border-r border-slate-100 bg-white">
          <div className="text-[8px] font-black uppercase tracking-wider mb-2 text-center" style={{ color: textColor1 }}>
            {color1Data.name}
          </div>
          <div className="space-y-1 w-full">
            {color1Data.rent?.map((rent, i) => (
              <div key={i} className="flex items-center justify-between px-1 py-1 rounded border w-full gap-1" style={{ borderColor: color1 + '33' }}>
                <div className="flex gap-0.5">
                  {Array.from({length: i+1}).map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color1 }} />
                  ))}
                </div>
                <div className="text-[8px] font-black italic whitespace-nowrap" style={{ color: textColor1 }}>${rent}M</div>
              </div>
            ))}
          </div>
        </div>

        {/* Color 2 Column (White Aesthetic - Rotated) */}
        <div className="w-1/2 h-full flex flex-col p-1.5 pt-2 items-center border-l border-slate-100 transform rotate-180 bg-white">
          <div className="text-[8px] font-black uppercase tracking-wider mb-2 text-center" style={{ color: textColor2 }}>
            {color2Data.name}
          </div>
          <div className="space-y-1 w-full">
            {color2Data.rent?.map((rent, i) => (
              <div key={i} className="flex items-center justify-between px-1 py-1 rounded border w-full gap-1" style={{ borderColor: color2 + '33' }}>
                <div className="flex gap-0.5">
                  {Array.from({length: i+1}).map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color2 }} />
                  ))}
                </div>
                <div className="text-[8px] font-black italic whitespace-nowrap" style={{ color: textColor2 }}>${rent}M</div>
              </div>
            ))}
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
  const isSmall = size === 'md' || size === 'sm';
  const circleSize = isSmall ? 'w-24 h-24' : 'w-32 h-32';
  
  const rainbowColors = [
    '#EF5350', '#FFA726', '#FFEB3B', '#66BB6A', '#42A5F5', '#AB47BC'
  ];
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
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
            <div className="text-xl font-black text-slate-900 italic leading-none">WILD</div>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4 text-center">
        <p className="text-[10px] text-slate-700 font-medium leading-snug">
          Use as any color property
        </p>
      </div>
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
      case ACTION_TYPES.JUST_SAY_NO: return { borderColor: '#93C5FD', iconColor: '#3B82F6' };
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
    const iconSize = isTiny ? 24 : isSmall ? 32 : 48;
    const strokeWidth = 2.5;
    
    switch(card.actionType) {
      case ACTION_TYPES.PASS_GO:
        return (
          <div className="flex flex-col items-center justify-center text-center py-2 px-1">
            <div className="text-4xl font-black italic tracking-tighter leading-none" style={{ color: actionStyle.iconColor }}>PASS</div>
            <div className="text-6xl font-black italic tracking-tighter leading-none -mt-1" style={{ color: actionStyle.iconColor }}>GO</div>
            {!isTiny && (
              <div className="text-[7.5px] font-black uppercase tracking-[0.25em] mt-3 bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-xl">
                Draw 2 Cards
              </div>
            )}
          </div>
        );
      case ACTION_TYPES.DEAL_BREAKER:
        return (
          <div className="relative flex items-center justify-center scale-110">
             <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }}>
                <path d="M12 2v20M2 12h20" strokeLinecap="round" opacity="0.1"/>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 5l2 2M17 17l2 2M17 5l-2 2M5 17l2-2" strokeLinecap="round" opacity="0.5"/>
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-16 bg-white/30 rotate-45 blur-md" />
             </div>
          </div>
        );
      case ACTION_TYPES.JUST_SAY_NO:
        return (
          <div className="p-2 bg-red-50 rounded-2xl border-4 border-red-500 shadow-lg scale-110">
            <svg width={iconSize - 12} height={iconSize - 12} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={4}>
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
            </svg>
          </div>
        );
      case ACTION_TYPES.SLY_DEAL:
        return (
          <div className="relative scale-110">
             <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
             </svg>
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-slate-900" />
          </div>
        );
      case ACTION_TYPES.FORCED_DEAL:
        return (
          <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
            <svg width={iconSize - 10} height={iconSize - 10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ color: actionStyle.iconColor }}>
              <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case ACTION_TYPES.DEBT_COLLECTOR:
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl drop-shadow-2xl">💰</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">$5M Due</div>
          </div>
        );
      case ACTION_TYPES.BIRTHDAY:
        return (
          <div className="flex flex-col items-center">
            <div className="text-6xl drop-shadow-2xl animate-bounce">🎂</div>
          </div>
        );
      case ACTION_TYPES.HOUSE:
        const houseColor = '#10B981'; // Emerald
        return (
          <div className="relative group p-4 bg-emerald-50 rounded-3xl border-2 border-emerald-200 shadow-xl">
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
              <path d="M3 10L12 3L21 10V21H3V10Z" fill={houseColor} />
              <path d="M12 3L21 10H3L12 3Z" fill="#34D399" />
              <rect x="7" y="13" width="3" height="3" fill="#065F46" opacity="0.3" />
              <rect x="14" y="13" width="3" height="3" fill="#065F46" opacity="0.3" />
              <path d="M10 21V16H14V21H10Z" fill="#064E3B" />
            </svg>
          </div>
        );
      case ACTION_TYPES.HOTEL:
        const hotelColor = '#3B82F6'; // Blue
        return (
          <div className="relative group p-4 bg-blue-50 rounded-3xl border-2 border-blue-200 shadow-xl">
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
              <path d="M6 21V3H18V21H6Z" fill={hotelColor} />
              <path d="M6 3H18L6 5V3Z" fill="#60A5FA" />
              {[6, 10, 14].map(y => (
                <React.Fragment key={y}>
                  <rect x="8" y={y} width="2.5" height="2.5" fill="white" opacity="0.5" />
                  <rect x="13.5" y={y} width="2.5" height="2.5" fill="white" opacity="0.5" />
                </React.Fragment>
              ))}
              <path d="M10 21V18H14V21H10Z" fill="#1E3A8A" />
              <path d="M4 21H20" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );
      case ACTION_TYPES.DOUBLE_RENT:
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-3xl border-2 border-orange-200 shadow-inner">
            <div className="text-6xl font-black italic tracking-tighter text-orange-600 drop-shadow-xl">x2</div>
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

          {/* Card Title inside the circle at the top */}
          {!isTiny && (
            <div className="z-10 text-center mb-1 px-4">
              <h3 className={`font-black text-slate-800 uppercase tracking-tight leading-none ${isSmall ? 'text-[9px]' : 'text-[13px]'}`}>
                {card.name}
              </h3>
            </div>
          )}

          {/* Illustration below title */}
          <div className="z-10 flex items-center justify-center flex-1 w-full">
            <ActionIcon />
          </div>
        </div>
      </div>

      {isTiny && (
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
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className="flex-1 flex items-center justify-center p-2">
        <div className="relative w-28 h-28">
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
                    fill={COLORS[color].hex}
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
            <div className="bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-2 border-slate-50">
              <span className="text-base font-black text-slate-900 leading-none">Rent</span>
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
