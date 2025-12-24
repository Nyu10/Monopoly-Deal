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
    xs: { w: 'w-12', h: 'h-16', text: 'text-[6px]', value: 'text-[5px]', icon: 12 },
    sm: { w: 'w-16', h: 'h-24', text: 'text-[8px]', value: 'text-[6px]', icon: 16 },
    md: { w: 'w-24', h: 'h-36', text: 'text-[10px]', value: 'text-[8px]', icon: 24 },
    lg: { w: 'w-32', h: 'h-48', text: 'text-[12px]', value: 'text-[10px]', icon: 32 },
    xl: { w: 'w-40', h: 'h-60', text: 'text-[14px]', value: 'text-[12px]', icon: 40 }
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

  // Action Card Design (orange/yellow)
  if (isAction || isRent) {
    const getActionIcon = () => {
      if (card.actionType === ACTION_TYPES.PASS_GO) return <RotateCcw size={s.icon} />;
      if (card.actionType === ACTION_TYPES.DEAL_BREAKER) return <Zap size={s.icon} />;
      if (card.actionType === ACTION_TYPES.JUST_SAY_NO) return <ShieldAlert size={s.icon} />;
      if (card.actionType === ACTION_TYPES.SLY_DEAL) return <Shuffle size={s.icon} />;
      if (card.actionType === ACTION_TYPES.DEBT_COLLECTOR) return <TrendingUp size={s.icon} />;
      if (card.actionType === ACTION_TYPES.BIRTHDAY) return <Gift size={s.icon} />;
      if (card.actionType === ACTION_TYPES.HOUSE) return <Home size={s.icon} />;
      if (card.actionType === ACTION_TYPES.HOTEL) return <Hotel size={s.icon} />;
      if (isRent) return <Repeat size={s.icon} />;
      return <Zap size={s.icon} />;
    };

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
        style={{ ...style, background: isRent ? 'linear-gradient(135deg, #E1BEE7 0%, #BA68C8 50%, #AB47BC 100%)' : 'linear-gradient(135deg, #FFE0B2 0%, #FFB74D 50%, #FFA726 100%)' }}
      >
        {/* Value Badge (top-left red circle) */}
        <div className={`absolute top-2 left-2 rounded-full bg-red-500 border-2 border-white font-black text-white flex items-center justify-center shadow-lg ${size === 'xs' || size === 'sm' ? 'w-6 h-6 text-[8px]' : size === 'md' ? 'w-8 h-8 text-[10px]' : 'w-10 h-10 text-[12px]'}`}>
          ${card.value}M
        </div>

        {/* Card Name */}
        <div className="h-[25%] flex items-center justify-center px-2 bg-gradient-to-r from-orange-600 to-orange-500">
          <span className="text-white font-black uppercase tracking-tight text-center ${s.text}">
            {card.name}
          </span>
        </div>

        {/* Icon and Description */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
          <div className="text-orange-800 opacity-40 mb-2">
            {getActionIcon()}
          </div>
          {card.description && size !== 'xs' && size !== 'sm' && (
            <p className="text-[8px] text-gray-800 text-center leading-tight font-semibold max-w-[90%]">
              {card.description}
            </p>
          )}
        </div>

        {/* Bottom stripe */}
        <div className="h-[15%] bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
          <span className="text-white font-black text-[8px] uppercase tracking-wider">Action Card</span>
        </div>

        {selected && (
          <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none border-4 border-yellow-400"></div>
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
