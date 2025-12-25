import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';

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

const CardWrapper = ({ children, onClick, size, selected, className, style, layoutId, enableHover = true }) => {
  const orientations = {
    xs: { w: 'w-12', h: 'h-18', rounded: 'rounded-md' },
    sm: { w: 'w-20', h: 'h-30', rounded: 'rounded-lg' },
    md: { w: 'w-32', h: 'h-48', rounded: 'rounded-xl' },
    lg: { w: 'w-40', h: 'h-60', rounded: 'rounded-2xl' },
    xl: { w: 'w-56', h: 'h-84', rounded: 'rounded-3xl' }
  };

  const o = orientations[size] || orientations.lg;

  const WrapperComponent = layoutId ? motion.div : 'div';
  const hoverProps = enableHover ? { whileHover: { y: -5, scale: 1.02 } } : {};

  return (
    <WrapperComponent
      layoutId={layoutId}
      {...hoverProps}
      onClick={() => onClick && onClick()}
      className={`${o.w} ${o.h} ${o.rounded} shadow-xl relative overflow-hidden flex flex-col ${
        selected ? 'ring-4 ring-blue-500 shadow-blue-500/50' : ''
      } ${className}`}
      style={style}
    >
      {children}
    </WrapperComponent>
  );
};

// ============================================================================
// CARD BACK
// ============================================================================

const CardBack = ({ size = 'lg', onClick, className, style, layoutId }) => {
  return (
    <CardWrapper size={size} onClick={onClick} className={`bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300 ${className}`} style={style} layoutId={layoutId}>
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 10px 10px, #64748b 2px, transparent 0)',
        backgroundSize: '20px 20px'
      }}></div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Large circle with M */}
        <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-slate-300">
          <div className="text-center">
            <div className="text-6xl font-black text-slate-700" style={{ fontFamily: 'Impact, sans-serif' }}>
              M
            </div>
          </div>
        </div>
        
        {/* Text below */}
        <div className="mt-4 text-center">
          <div className="text-sm font-black text-slate-600 uppercase tracking-widest">
            Monopoly Deal
          </div>
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
      
      <div className="flex-1 flex flex-col items-center pt-10">
        <div className="relative w-28 h-28 flex items-center justify-center">
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

      <div className="px-5 pb-6 text-center">
        <p className="text-[10px] font-black text-slate-900/40 uppercase tracking-[0.2em] mb-1">Rent Value</p>
        <div className="flex justify-center gap-1.5">
          {rentValues.map((rent, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: bgColor }} />
              <span className="text-[10px] font-black text-slate-900">${rent}M</span>
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

const WildPropertyCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId }) => {
  const color1Data = COLORS[card.colors[0]] || { hex: '#666', name: 'Unknown' };
  const color2Data = COLORS[card.colors[1]] || { hex: '#666', name: 'Unknown' };
  const color1 = color1Data.hex;
  const color2 = color2Data.hex;
  const text1 = color1Data.text === 'black' ? 'text-slate-900' : 'text-white';
  const text2 = color2Data.text === 'black' ? 'text-slate-900' : 'text-white';
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      {/* Top Header Hook (Color 1) */}
      <div className="absolute top-0 left-0 right-0 h-10 z-10" style={{ backgroundColor: color1 }}>
        <div className="h-full w-full flex items-center justify-end pr-4">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${text1}`}>Wild Card</span>
        </div>
      </div>

      {/* Bottom Header Hook (Color 2 - Rotated) */}
      <div className="absolute bottom-0 left-0 right-0 h-10 z-10" style={{ backgroundColor: color2 }}>
        <div className="h-full w-full flex items-center justify-end pr-4 transform rotate-180">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${text2}`}>Wild Card</span>
        </div>
      </div>

      <ValueBadge value={card.value} size={size} />
      
      <div className="absolute inset-x-0 top-10 bottom-10 flex">
        {/* Color 1 Column (White Aesthetic) */}
        <div className="w-1/2 h-full flex flex-col p-2 pt-4 items-center border-r border-slate-100 bg-white">
          <div className="text-[8px] font-black uppercase tracking-wider mb-3 text-center" style={{ color: color1 }}>
            {color1Data.name}
          </div>
          <div className="space-y-1 w-full">
            {color1Data.rent?.map((rent, i) => (
              <div key={i} className="flex items-center justify-between px-1.5 py-1 rounded border w-full gap-2" style={{ borderColor: color1 + '33' }}>
                <div className="flex gap-0.5">
                  {Array.from({length: i+1}).map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: color1 }} />
                  ))}
                </div>
                <div className="text-[8px] font-black italic whitespace-nowrap" style={{ color: color1 }}>${rent}M</div>
              </div>
            ))}
          </div>
        </div>

        {/* Color 2 Column (White Aesthetic - Rotated) */}
        <div className="w-1/2 h-full flex flex-col p-2 pt-4 items-center border-l border-slate-100 transform rotate-180 bg-white">
          <div className="text-[8px] font-black uppercase tracking-wider mb-3 text-center" style={{ color: color2 }}>
            {color2Data.name}
          </div>
          <div className="space-y-1 w-full">
            {color2Data.rent?.map((rent, i) => (
              <div key={i} className="flex items-center justify-between px-1.5 py-1 rounded border w-full gap-2" style={{ borderColor: color2 + '33' }}>
                <div className="flex gap-0.5">
                  {Array.from({length: i+1}).map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: color2 }} />
                  ))}
                </div>
                <div className="text-[8px] font-black italic whitespace-nowrap" style={{ color: color2 }}>${rent}M</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

// ============================================================================
// RAINBOW WILD PROPERTY CARD
// ============================================================================

const RainbowWildCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId }) => {
  const rainbowColors = [
    { hex: '#795548', name: 'Brown' },
    { hex: '#03A9F4', name: 'Lt Blue' },
    { hex: '#C2185B', name: 'Pink' },
    { hex: '#EF6C00', name: 'Orange' },
    { hex: '#D32F2F', name: 'Red' },
    { hex: '#FBC02D', name: 'Yellow' },
    { hex: '#2E7D32', name: 'Green' },
    { hex: '#0D47A1', name: 'Dk Blue' },
    { hex: '#212121', name: 'Railroad' },
    { hex: '#AFB42B', name: 'Utility' }
  ];
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-3">🌈</div>
        
        <div className="text-center mb-4">
          <div className="text-2xl font-black text-slate-900 italic leading-none mb-1">WILD</div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">Any Color</div>
        </div>
        
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {rainbowColors.map((color, i) => (
            <div 
              key={i}
              className="w-5 h-5 rounded-md shadow-sm border border-white"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
      
      <div className="px-4 pb-4 text-center">
        <p className="text-[10px] text-slate-700 font-medium leading-snug">
          Can be used as any color property
        </p>
      </div>
    </CardWrapper>
  );
};

// ============================================================================
// ACTION CARD
// ============================================================================

const ActionCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId }) => {
  const getActionStyle = (actionType) => {
    switch(actionType) {
      case ACTION_TYPES.PASS_GO:
        return { icon: '🎲', color: '#F59E0B' };
      case ACTION_TYPES.DEAL_BREAKER:
        return { icon: '🤝', color: '#9333EA' };
      case ACTION_TYPES.JUST_SAY_NO:
        return { icon: '🚫', color: '#3B82F6' };
      case ACTION_TYPES.SLY_DEAL:
        return { icon: '🏃', color: '#10B981' };
      case ACTION_TYPES.FORCED_DEAL:
        return { icon: '📋', color: '#14B8A6' };
      case ACTION_TYPES.DEBT_COLLECTOR:
        return { icon: '👆', color: '#6B7280' };
      case ACTION_TYPES.BIRTHDAY:
        return { icon: '🎂', color: '#EC4899' };
      case ACTION_TYPES.HOUSE:
        return { icon: '🏠', color: '#84CC16' };
      case ACTION_TYPES.HOTEL:
        return { icon: '🏨', color: '#0EA5E9' };
      case ACTION_TYPES.DOUBLE_RENT:
        return { icon: '×2', color: '#F97316' };
      default:
        return { icon: '⚡', color: '#64748B' };
    }
  };

  const actionStyle = getActionStyle(card.actionType);

  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="relative w-32 h-32">
          <div 
            className="absolute inset-0 rounded-full opacity-10"
            style={{ backgroundColor: actionStyle.color }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {card.actionType === ACTION_TYPES.DOUBLE_RENT ? (
                <div className="text-5xl font-black italic" style={{ color: actionStyle.color }}>×2</div>
              ) : (
                <div className="text-6xl drop-shadow-lg">{actionStyle.icon}</div>
              )}
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <div 
              className="text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-xl max-w-full italic"
              style={{ backgroundColor: actionStyle.color }}
            >
              <div className="truncate">{card.name}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-6 text-center">
        <p className="text-[11px] leading-snug text-slate-900 font-medium">
          {card.description}
        </p>
      </div>
    </CardWrapper>
  );
};

// ============================================================================
// RENT CARD
// ============================================================================

const RentCard = ({ card, size = 'lg', onClick, selected, className, style, layoutId }) => {
  const isWild = card.type === CARD_TYPES.RENT_WILD;
  const colors = isWild ? Object.keys(COLORS).filter(c => c !== 'multi') : (card.colors || []);
  
  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-white border-2 border-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <ValueBadge value={card.value} size={size} />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-32 h-32">
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
                />
                <path
                  d="M 95 50 A 45 45 0 0 1 5 50 L 30 50 A 20 20 0 0 0 70 50 Z"
                  fill={COLORS[colors[1]]?.hex || '#666'}
                  stroke="white"
                  strokeWidth="1"
                />
              </>
            )}
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
              <span className="text-base font-black text-slate-900 leading-none">Rent</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-6 text-center">
        <p className="text-[11px] leading-snug text-slate-900 font-medium">
          {isWild 
            ? "Force any player to pay you rent for any property you own"
            : `All players pay you rent for properties you own in one of these colors`
          }
        </p>
      </div>
    </CardWrapper>
  );
};

// ============================================================================
// MAIN CARD COMPONENT (Router)
// ============================================================================

const Card = ({ card, onClick, size = 'lg', faceDown = false, selected = false, className = '', style = {}, layoutId, enableHover = true }) => {
  if (!card && !faceDown) return null;

  if (faceDown) {
    return <CardBack size={size} onClick={onClick} className={className} style={style} layoutId={layoutId} />;
  }

  const cardType = card.type;
  const isRainbow = card.isRainbow;
  const isWildProperty = cardType === CARD_TYPES.PROPERTY_WILD;

  if (isRainbow) {
    return <RainbowWildCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
  }

  if (isWildProperty && card.colors?.length === 2) {
    return <WildPropertyCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
  }

  if (cardType === CARD_TYPES.PROPERTY || isWildProperty) {
    return <PropertyCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
  }

  if (cardType === CARD_TYPES.MONEY) {
    return <MoneyCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
  }

  if (cardType === CARD_TYPES.ACTION) {
    return <ActionCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
  }

  if (cardType === CARD_TYPES.RENT || cardType === CARD_TYPES.RENT_WILD) {
    return <RentCard card={card} size={size} onClick={onClick} selected={selected} className={className} style={style} layoutId={layoutId} />;
  }

  return (
    <CardWrapper size={size} onClick={onClick} selected={selected} className={`bg-slate-200 ${className}`} style={style} layoutId={layoutId}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-slate-600 text-xs">Unknown Card</div>
      </div>
    </CardWrapper>
  );
};

export default Card;
