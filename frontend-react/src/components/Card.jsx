import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShieldAlert, MapPin, Repeat, Zap, Heart, Home, Hotel, RotateCcw, Gift, TrendingUp, Shuffle } from 'lucide-react';
import { COLORS, CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';

const Card = ({ card, onClick, size = 'md', faceDown = false, selected = false, className = '', style = {}, layoutId }) => {
  const isProp = card?.type === CARD_TYPES.PROPERTY;
  const isWild = card?.type === CARD_TYPES.PROPERTY_WILD;
  const isMoney = card?.type === CARD_TYPES.MONEY;
  const isAction = card?.type === CARD_TYPES.ACTION;
  const isRent = card?.type === CARD_TYPES.RENT || card?.type === CARD_TYPES.RENT_WILD;

  const sizes = {
    xs: { w: 'w-12', h: 'h-16', text: 'text-[7px]', value: 'text-[6px]', icon: 16, circle: 'w-14 h-14', emoji: 'text-xl' },
    sm: { w: 'w-16', h: 'h-24', text: 'text-[9px]', value: 'text-[7px]', icon: 24, circle: 'w-18 h-18', emoji: 'text-2xl' },
    md: { w: 'w-24', h: 'h-36', text: 'text-[13px]', value: 'text-[10px]', icon: 36, circle: 'w-28 h-28', emoji: 'text-5xl' },
    lg: { w: 'w-32', h: 'h-48', text: 'text-[16px]', value: 'text-[12px]', icon: 48, circle: 'w-36 h-36', emoji: 'text-6xl' },
    xl: { w: 'w-40', h: 'h-60', text: 'text-[20px]', value: 'text-[14px]', icon: 60, circle: 'w-44 h-44', emoji: 'text-7xl' }
  };

  const s = sizes[size] || sizes.md;

  // Card back design
  if (faceDown) {
    return (
      <motion.div
        layoutId={layoutId}
        className={`${s.w} ${s.h} bg-gradient-to-br from-red-700 via-red-800 to-red-950 rounded-xl shadow-2xl border-4 border-white flex items-center justify-center cursor-pointer overflow-hidden ${className}`}
        whileHover={{ scale: 1.05 }}
        onClick={() => onClick && onClick(card)}
        style={style}
      >
        <div className="w-[85%] h-[85%] border-4 border-white/40 rounded-lg flex flex-col items-center justify-center relative">
          {/* Monopoly Man silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] bg-center bg-no-repeat bg-contain"></div>
          </div>
          <span className="text-white font-black italic tracking-tighter transform -rotate-12 text-center leading-none uppercase z-10" style={{ fontSize: size === 'xs' ? '0.6rem' : size === 'sm' ? '0.8rem' : size === 'md' ? '1.2rem' : size === 'lg' ? '1.5rem' : '2rem' }}>
            MONOPOLY<br/>DEAL
          </span>
        </div>
      </motion.div>
    );
  }

  // Property Card Design (authentic Monopoly Deal style)
  if (isProp || isWild) {
    const cardColor = card.isRainbow ? COLORS.multi : COLORS[card.currentColor || card.color];
    const bgColor = cardColor?.hex || '#fff';
    const textColor = cardColor?.text === 'black' ? '#000' : '#fff';

    return (
      <motion.div
        layoutId={layoutId}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -15, scale: 1.05, zIndex: 50 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick && onClick(card)}
        className={`
          ${s.w} ${s.h} rounded-xl shadow-2xl border-4 border-white cursor-pointer 
          relative overflow-hidden flex flex-col select-none
          ${selected ? 'ring-4 ring-yellow-400 scale-105 z-40' : ''}
          ${className}
        `}
        style={{ ...style, backgroundColor: '#fff' }}
      >
        {/* Top Color Bar */}
        {isWild && card.colors?.length === 2 ? (
          <div className="h-[30%] w-full flex">
            <div className="w-1/2 h-full" style={{ backgroundColor: COLORS[card.colors[0]]?.hex }}></div>
            <div className="w-1/2 h-full" style={{ backgroundColor: COLORS[card.colors[1]]?.hex }}></div>
          </div>
        ) : (
          <div className="h-[30%] w-full" style={{ backgroundColor: bgColor }}></div>
        )}

        {/* Property Name on Color Bar */}
        <div className="absolute top-0 left-0 right-0 h-[30%] flex items-center justify-center px-2">
          <span className={`font-black uppercase tracking-tight drop-shadow-lg ${s.text}`} style={{ color: textColor }}>
            {card.name}
          </span>
        </div>

        {/* White Content Area */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-2 relative">
          {/* Value Circle (top-left) */}
          <div className={`absolute top-2 left-2 rounded-full bg-white border-2 border-gray-800 font-black flex items-center justify-center ${size === 'xs' || size === 'sm' ? 'w-6 h-6 text-[8px]' : size === 'md' ? 'w-8 h-8 text-[10px]' : 'w-10 h-10 text-[12px]'}`}>
            <span>${card.value}M</span>
          </div>

          {/* Property Icon/Illustration */}
          <div className="flex-1 flex items-center justify-center">
            <MapPin size={s.icon} className="text-gray-300" />
          </div>

          {/* Rent Values (if property) */}
          {isProp && !isWild && (
            <div className="w-full px-2 pb-1">
              <div className="text-center text-[7px] font-bold text-gray-700">
                RENT: ${cardColor?.rent?.[0] || 1}M - ${cardColor?.rent?.[cardColor?.rent?.length - 1] || 2}M
              </div>
            </div>
          )}

          {isWild && (
            <div className="text-center text-[7px] font-black text-gray-500 uppercase">
              Wild Card
            </div>
          )}
        </div>

        {/* Bottom value (mirrored) */}
        <div className={`absolute bottom-2 right-2 font-black text-gray-400 ${s.value} transform rotate-180`}>
          ${card.value}M
        </div>

        {selected && (
          <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none border-4 border-yellow-400"></div>
        )}
      </motion.div>
    );
  }

  // Money Card Design (green bills)
  if (isMoney) {
    return (
      <motion.div
        layoutId={layoutId}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -15, scale: 1.05, zIndex: 50 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick && onClick(card)}
        className={`
          ${s.w} ${s.h} rounded-xl shadow-2xl border-4 border-white cursor-pointer 
          relative overflow-hidden flex flex-col select-none
          ${selected ? 'ring-4 ring-yellow-400 scale-105 z-40' : ''}
          ${className}
        `}
        style={{ ...style, background: 'linear-gradient(135deg, #C8E6C9 0%, #81C784 50%, #66BB6A 100%)' }}
      >
        {/* Money Card Header */}
        <div className="h-[25%] bg-gradient-to-r from-green-700 to-green-600 flex items-center justify-center">
          <span className="text-white font-black uppercase tracking-wider text-[10px]">Monopoly Money</span>
        </div>

        {/* Main Money Display */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-br from-green-100 to-green-200">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.05) 10px, rgba(0,0,0,.05) 20px)' }}></div>
          </div>

          {/* Dollar Sign */}
          <DollarSign size={s.icon * 1.5} className="text-green-700 opacity-30 absolute" />

          {/* Value */}
          <div className="z-10 text-center">
            <div className="font-black text-green-800" style={{ fontSize: size === 'xs' ? '1.5rem' : size === 'sm' ? '2rem' : size === 'md' ? '2.5rem' : size === 'lg' ? '3rem' : '4rem' }}>
              ${card.value}M
            </div>
            <div className="text-[8px] font-bold text-green-700 uppercase tracking-widest">
              Million
            </div>
          </div>
        </div>

        {/* Bottom value */}
        <div className="h-[15%] bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
          <span className="text-white font-black text-[10px]">${card.value}M</span>
        </div>

        {selected && (
          <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none border-4 border-yellow-400"></div>
        )}
      </motion.div>
    );
  }

  // Action Card Design (professional circular layout with color-coding)
  if (isAction || isRent) {
    // Color-coded action styles (from CardGallery - superior design)
    const getActionStyle = (actionType) => {
      if (isRent) {
        return { bg: 'from-purple-50 to-violet-100', border: 'border-purple-200', icon: '🎯', color: '#9333EA', name: 'Rent Card' };
      }
      switch(actionType) {
        case ACTION_TYPES.PASS_GO:
          return { bg: 'from-yellow-50 to-amber-100', border: 'border-yellow-200', icon: '🎲', color: '#F59E0B', name: 'Pass Go' };
        case ACTION_TYPES.DEAL_BREAKER:
          return { bg: 'from-purple-50 to-violet-100', border: 'border-purple-200', icon: '💥', color: '#9333EA', name: 'Deal Breaker' };
        case ACTION_TYPES.JUST_SAY_NO:
          return { bg: 'from-blue-50 to-cyan-100', border: 'border-blue-200', icon: '🚫', color: '#3B82F6', name: 'Just Say No' };
        case ACTION_TYPES.SLY_DEAL:
          return { bg: 'from-green-50 to-emerald-100', border: 'border-green-200', icon: '🏃', color: '#10B981', name: 'Sly Deal' };
        case ACTION_TYPES.FORCED_DEAL:
          return { bg: 'from-teal-50 to-cyan-100', border: 'border-teal-200', icon: '🔄', color: '#14B8A6', name: 'Forced Deal' };
        case ACTION_TYPES.DEBT_COLLECTOR:
          return { bg: 'from-gray-50 to-slate-100', border: 'border-gray-300', icon: '💰', color: '#6B7280', name: 'Debt Collector' };
        case ACTION_TYPES.BIRTHDAY:
          return { bg: 'from-pink-50 to-rose-100', border: 'border-pink-200', icon: '🎂', color: '#EC4899', name: 'Birthday' };
        case ACTION_TYPES.HOUSE:
          return { bg: 'from-lime-50 to-green-100', border: 'border-lime-200', icon: '🏠', color: '#84CC16', name: 'House' };
        case ACTION_TYPES.HOTEL:
          return { bg: 'from-sky-50 to-blue-100', border: 'border-sky-200', icon: '🏨', color: '#0EA5E9', name: 'Hotel' };
        case ACTION_TYPES.DOUBLE_RENT:
          return { bg: 'from-orange-50 to-amber-100', border: 'border-orange-200', icon: '×2', color: '#F97316', name: 'Double Rent' };
        default:
          return { bg: 'from-slate-50 to-gray-100', border: 'border-slate-300', icon: '⚡', color: '#64748B', name: 'Action' };
      }
    };

    const actionStyle = getActionStyle(card.actionType);

    return (
      <motion.div
        layoutId={layoutId}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -15, scale: 1.05, zIndex: 50 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick && onClick(card)}
        className={`
          ${s.w} ${s.h} rounded-xl shadow-2xl border-4 ${actionStyle.border} cursor-pointer 
          relative overflow-hidden flex flex-col select-none
          bg-gradient-to-br ${actionStyle.bg}
          ${selected ? 'ring-4 ring-yellow-400 scale-105 z-40' : ''}
          ${className}
        `}
        style={{ 
          ...style,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0,0,0,0.03) 10px,
              rgba(0,0,0,0.03) 20px
            )`
          }}>
        </div>

        {/* Enhanced Value Badge (top-left red circle with glow) */}
        <div className={`absolute top-2 left-2 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-3 border-white font-black text-white flex items-center justify-center shadow-2xl ring-2 ring-red-400/50 z-20 ${size === 'xs' || size === 'sm' ? 'w-6 h-6 text-[8px]' : size === 'md' ? 'w-9 h-9 text-[11px]' : 'w-11 h-11 text-[13px]'}`}
          style={{ boxShadow: '0 4px 12px rgba(239, 68, 68, 0.6)' }}>
          ${card.value}M
        </div>

        {/* Circular Icon Design (CardGallery's superior layout) */}
        <div className="flex-1 flex items-center justify-center py-4">
          <div className={`relative ${s.circle}`}>
            {/* Colored background circle */}
            <div className="absolute inset-0 rounded-full opacity-20"
              style={{ backgroundColor: actionStyle.color }} />
            
            {/* Icon/Emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {card.actionType === ACTION_TYPES.DOUBLE_RENT ? (
                  <div className={`${s.emoji} font-black`} style={{ color: actionStyle.color }}>×2</div>
                ) : (
                  <div className={s.emoji}>{actionStyle.icon}</div>
                )}
              </div>
            </div>
            
            {/* Card name badge integrated into circle */}
            {size !== 'xs' && (
              <div className="absolute inset-0 flex items-end justify-center pb-1">
                <div className="text-xs font-black uppercase tracking-wide px-2 py-1 rounded-full text-white shadow-lg max-w-full"
                  style={{ 
                    backgroundColor: actionStyle.color,
                    fontSize: size === 'sm' ? '6px' : size === 'md' ? '8px' : size === 'lg' ? '10px' : '12px'
                  }}>
                  <div className="truncate">{card.name}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description with improved readability */}
        {card.description && size !== 'xs' && size !== 'sm' && (
          <div className="px-3 pb-4 text-center">
            <p className="text-center leading-snug font-bold text-slate-900 max-w-[90%] mx-auto"
              style={{
                fontSize: size === 'md' ? '10px' : size === 'lg' ? '12px' : '14px',
                textShadow: '0 1px 2px rgba(255,255,255,0.3)'
              }}>
              {card.description}
            </p>
          </div>
        )}

        {/* Selection overlay */}
        {selected && (
          <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none border-4 border-yellow-400 rounded-xl"></div>
        )}
      </motion.div>
    );
  }

  // Fallback
  return (
    <div className={`${s.w} ${s.h} bg-gray-200 rounded-xl border-4 border-white ${className}`} style={style}>
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Unknown Card
      </div>
    </div>
  );
};

export default Card;
