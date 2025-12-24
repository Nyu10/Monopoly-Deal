import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShieldAlert, MapPin, Repeat, Zap, Heart, Home, Hotel, RotateCcw } from 'lucide-react';
import { COLORS, CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';

const Card = ({ card, onClick, size = 'md', faceDown = false, selected = false, className = '', style = {}, layoutId }) => {
  const isProp = card?.type === CARD_TYPES.PROPERTY;
  const isWild = card?.type === CARD_TYPES.PROPERTY_WILD;
  const isMoney = card?.type === CARD_TYPES.MONEY;
  const isAction = card?.type === CARD_TYPES.ACTION;
  const isRent = card?.type === CARD_TYPES.RENT || card?.type === CARD_TYPES.RENT_WILD;

  const getCardColors = () => {
    if (card?.isRainbow) return { bg: COLORS.multi.hex, text: COLORS.multi.text };
    if (isProp || (isWild && card.currentColor)) {
      const c = COLORS[card.currentColor || card.color];
      return { bg: c?.hex || '#ccc', text: c?.text || 'white' };
    }
    if (isMoney) return { bg: '#E8F5E9', text: '#2E7D32', accent: '#4CAF50' };
    if (isAction) return { bg: '#FFF3E0', text: '#E65100', accent: '#FF9800' };
    if (isRent) return { bg: '#F3E5F5', text: '#4A148C', accent: '#9C27B0' };
    return { bg: '#fff', text: '#333' };
  };

  const colors = getCardColors();

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 48 : 32;
    if (isMoney) return <DollarSign size={iconSize} className="opacity-20" />;
    if (isAction) {
        if (card.actionType === ACTION_TYPES.PASS_GO) return <RotateCcw size={iconSize} className="opacity-20" />;
        if (card.actionType === ACTION_TYPES.DEAL_BREAKER) return <Zap size={iconSize} className="opacity-20" />;
        if (card.actionType === ACTION_TYPES.HOUSE) return <Home size={iconSize} className="opacity-20" />;
        if (card.actionType === ACTION_TYPES.HOTEL) return <Hotel size={iconSize} className="opacity-20" />;
        return <ShieldAlert size={iconSize} className="opacity-20" />;
    }
    if (isProp || isWild) return <MapPin size={iconSize} className="opacity-20" />;
    if (isRent) return <Repeat size={iconSize} className="opacity-20" />;
    return null;
  };

  const sizes = {
    sm: 'w-16 h-24 text-[8px]',
    md: 'w-32 h-48 text-[12px]',
    lg: 'w-52 h-80 text-[16px]'
  };

  if (faceDown) {
    return (
      <motion.div
        layoutId={layoutId}
        className={`${sizes[size]} bg-gradient-to-br from-red-600 to-red-900 rounded-xl shadow-2xl border-4 border-white flex items-center justify-center cursor-pointer overflow-hidden ${className}`}
        whileHover={{ scale: 1.05, rotateY: 5 }}
        onClick={() => onClick && onClick(card)}
      >
        <div className="w-[85%] h-[85%] border-2 border-white/30 rounded-lg flex flex-col items-center justify-center">
            <span className="text-white font-black italic tracking-tighter transform -rotate-12 text-center leading-none uppercase" style={{ fontSize: size === 'sm' ? '0.8rem' : size === 'md' ? '1.5rem' : '2.5rem' }}>
                Monopoly<br/>Deal
            </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -15, scale: 1.05, zIndex: 50, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick && onClick(card)}
      className={`
        ${sizes[size]} rounded-xl shadow-lg border-2 border-white/80 cursor-pointer 
        relative overflow-hidden flex flex-col select-none transition-all duration-300
        ${selected ? 'ring-4 ring-yellow-400 ring-offset-4 scale-105 z-40' : ''}
        ${className}
      `}
      style={{ ...style, background: isMoney || isAction || isRent ? colors.bg : '#fff' }}
    >
      {/* Header for Properties */}
      {(isProp || isWild) && !card.isRainbow && (
        <div className="h-[25%] w-full relative">
            {isWild && card.colors?.length === 2 ? (
                <div className="flex h-full w-full">
                    <div className="w-1/2 h-full" style={{ backgroundColor: COLORS[card.colors[0]]?.hex }}></div>
                    <div className="w-1/2 h-full" style={{ backgroundColor: COLORS[card.colors[1]]?.hex }}></div>
                </div>
            ) : (
                <div className="h-full w-full" style={{ background: colors.bg }}></div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold drop-shadow-md uppercase text-center px-1" style={{ fontSize: size === 'sm' ? '6px' : '10px' }}>
                    {card.name}
                </span>
            </div>
        </div>
      )}

      {/* Rainbow Wild Special Header */}
      {card.isRainbow && (
        <div className="h-[25%] w-full" style={{ background: COLORS.multi.hex }}>
            <div className="h-full w-full flex items-center justify-center">
                 <span className="text-white font-black italic drop-shadow-lg uppercase" style={{ fontSize: size === 'sm' ? '6px' : '10px' }}>WILD</span>
            </div>
        </div>
      )}

      {/* Value Badge Top Left */}
      <div className={`absolute top-1 left-1 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 font-bold text-slate-800 ${size === 'sm' ? 'w-4 h-4 text-[6px]' : 'w-7 h-7 text-[10px]'}`}>
        ${card.value}M
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col items-center justify-center p-2 text-center relative ${isMoney || isAction || isRent ? '' : 'bg-white/50'}`}>
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
            {renderIcon()}
        </div>
        
        <div className="z-10 flex flex-col items-center">
            <span className={`font-black uppercase tracking-tight text-slate-800 ${size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[11px]' : 'text-[18px]'}`}>
                {card.name}
            </span>
            {card.description && size !== 'sm' && (
                <p className="text-[7px] text-slate-500 mt-1 max-w-[90%] leading-tight font-medium">
                    {card.description}
                </p>
            )}
        </div>
      </div>

      {/* Footer / Value Badge Bottom Right */}
      <div className={`absolute bottom-1 right-1 font-mono font-bold text-slate-400 ${size === 'sm' ? 'text-[5px]' : 'text-[8px]'}`}>
        ${card.value}M
      </div>

      {/* Selection Overlay */}
      {selected && (
        <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none flex items-center justify-center">
             <div className="bg-yellow-400 text-white rounded-full p-1 border-2 border-white shadow-lg">
                <Zap size={16} fill="white" />
             </div>
        </div>
      )}
    </motion.div>
  );
};

export default Card;
