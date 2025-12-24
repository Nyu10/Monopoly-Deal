import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';

// Import the card generation function and types
const COLORS = {
  brown: { hex: '#5D4037', count: 2, name: 'Brown', rent: [1, 2] },
  blue: { hex: '#1565C0', count: 2, name: 'Dark Blue', rent: [3, 8] },
  green: { hex: '#2E7D32', count: 3, name: 'Green', rent: [2, 4, 7] },
  yellow: { hex: '#FBC02D', count: 3, name: 'Yellow', text: 'black', rent: [2, 4, 6] },
  orange: { hex: '#EF6C00', count: 3, name: 'Orange', rent: [1, 3, 5] },
  pink: { hex: '#D81B60', count: 3, name: 'Pink', rent: [1, 2, 4] },
  red: { hex: '#C62828', count: 3, name: 'Red', rent: [2, 3, 6] },
  cyan: { hex: '#00BCD4', count: 3, name: 'Light Blue', rent: [1, 2, 3] },
  utility: { hex: '#9E9D24', count: 2, name: 'Utility', text: 'black', rent: [1, 2] },
  railroad: { hex: '#212121', count: 4, name: 'Railroad', rent: [1, 2, 3, 4] },
  multi: { hex: '#fff', count: 0, name: 'Multi', text: 'black', rent: [] }
};

const CARD_TYPES = {
  PROPERTY: 'PROPERTY',
  ACTION: 'ACTION',
  MONEY: 'MONEY',
  RENT: 'RENT',
  PROPERTY_WILD: 'PROPERTY_WILD',
  RENT_WILD: 'RENT_WILD'
};

const ACTION_TYPES = {
  PASS_GO: 'PASS_GO',
  DEAL_BREAKER: 'DEAL_BREAKER',
  JUST_SAY_NO: 'JUST_SAY_NO',
  SLY_DEAL: 'SLY_DEAL',
  FORCED_DEAL: 'FORCED_DEAL',
  DEBT_COLLECTOR: 'DEBT_COLLECTOR',
  BIRTHDAY: 'BIRTHDAY',
  HOUSE: 'HOUSE',
  HOTEL: 'HOTEL',
  DOUBLE_RENT: 'DOUBLE_RENT'
};

// Reusable value badge component
const ValueBadge = ({ value, position = 'top-left', borderColor = '#000' }) => {
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2'
  };
  
  return (
    <div 
      className={`absolute ${positionClasses[position]} w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md z-10`}
      style={{borderWidth: '3px', borderStyle: 'solid', borderColor}}
    >
      <div className="text-xs font-black text-black">${value}M</div>
    </div>
  );
};

// Card Back Component
const CardBack = () => {
  return (
    <div className="w-40 h-60 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-xl border-4 border-red-800 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
      }}></div>
      
      {/* Monopoly Deal Logo */}
      <div className="relative z-10 text-center px-4">
        <div className="text-white font-black text-4xl mb-2" style={{ fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          MONOPOLY
        </div>
        <div className="text-yellow-300 font-black text-5xl mb-1" style={{ fontFamily: 'Impact, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          DEAL
        </div>
        <div className="text-white text-xs font-bold uppercase tracking-widest">
          Card Game
        </div>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-300 rounded-tl-lg"></div>
      <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-300 rounded-tr-lg"></div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-300 rounded-bl-lg"></div>
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-300 rounded-br-lg"></div>
    </div>
  );
};

// Simplified card component for gallery
const GalleryCard = ({ card, isFlipped = false }) => {
  // If flipped, show card back
  if (isFlipped) {
    return <CardBack />;
  }

  const isProp = card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD;
  const isMoney = card.type === CARD_TYPES.MONEY;
  const isRent = card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD;

  // MONEY CARD
  if (isMoney) {
    const moneyColors = {
      1: { bg: '#FEF3C7', text: '#92400E' },
      2: { bg: '#FEE2E2', text: '#991B1B' },
      3: { bg: '#D1FAE5', text: '#065F46' },
      4: { bg: '#DBEAFE', text: '#1E40AF' },
      5: { bg: '#EDE9FE', text: '#5B21B6' },
      10: { bg: '#FFEDD5', text: '#9A3412' }
    };
    
    const colors = moneyColors[card.value] || moneyColors[1];
    
    return (
      <div className="w-40 h-60 bg-white rounded-xl shadow-xl border-4 border-slate-300 relative overflow-hidden flex flex-col">
        <ValueBadge value={card.value} position="top-left" borderColor={colors.text} />
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative" style={{backgroundColor: colors.bg}}>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(0,0,0,0.2) 2px, transparent 2px)',
            backgroundSize: '30px 30px'
          }}></div>
          
          <div className="relative z-10 text-center">
            <div className="text-5xl font-black leading-none" style={{fontFamily: 'Impact, sans-serif', color: colors.text}}>
              ${card.value}M
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROPERTY CARD
  if (isProp) {
    const cCode = card.currentColor || card.color;
    const colorData = COLORS[cCode] || {};
    const bgColor = colorData.hex || '#666';
    const setCount = colorData.count || 2;
    const rentValues = colorData.rent || [];

    // Check if it's a wild card (dual color)
    const isWild = card.type === CARD_TYPES.PROPERTY_WILD && card.colors && card.colors.length === 2 && !card.isRainbow;
    const isRainbow = card.isRainbow;
    
    if (isRainbow) {
      // RAINBOW WILD CARD - All colors
      const allColors = ['brown', 'cyan', 'pink', 'orange', 'red', 'yellow', 'green', 'blue', 'railroad', 'utility'];
      
      return (
        <div className="w-40 h-60 bg-white rounded-xl shadow-xl border-4 border-slate-300 relative overflow-hidden flex flex-col">
          {/* Rainbow stripes header */}
          <div className="h-12 flex">
            {allColors.map((color, i) => (
              <div 
                key={i} 
                className="flex-1" 
                style={{ backgroundColor: COLORS[color]?.hex || '#666' }}
              />
            ))}
          </div>
          
          {/* Title */}
          <div className="px-3 py-2 text-center bg-white border-b-2 border-slate-200">
            <div className="text-xs font-black uppercase tracking-wider text-slate-900">
              Property Wild Card
            </div>
          </div>
          
          {/* Wild Card Icon */}
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              {/* Rainbow Star/Wild Symbol */}
              <div className="relative w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer star points with gradient colors */}
                  {allColors.map((color, i) => {
                    const angle = (i * 36) - 90; // 10 colors = 36° each
                    const rad = (angle * Math.PI) / 180;
                    const x = 50 + 40 * Math.cos(rad);
                    const y = 50 + 40 * Math.sin(rad);
                    
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="8"
                        fill={COLORS[color]?.hex || '#666'}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                  
                  {/* Center circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="20"
                    fill="white"
                    stroke="#333"
                    strokeWidth="3"
                  />
                  
                  {/* Wild text */}
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="black"
                    fill="#333"
                    fontFamily="Impact, sans-serif"
                  >
                    WILD
                  </text>
                </svg>
              </div>
              
              <div className="text-xs font-bold text-slate-700 max-w-[120px] leading-tight mx-auto">
                This card can be part of any property set. This card has no monetary value.
              </div>
            </div>
          </div>
          
          {/* Rainbow stripes footer (inverted) */}
          <div className="h-12 flex transform rotate-180">
            {allColors.map((color, i) => (
              <div 
                key={i} 
                className="flex-1" 
                style={{ backgroundColor: COLORS[color]?.hex || '#666' }}
              />
            ))}
          </div>
        </div>
      );
    }
    
    if (isWild) {
      // WILD PROPERTY CARD - Split design with arrows
      const color1Data = COLORS[card.colors[0]];
      const color2Data = COLORS[card.colors[1]];
      const color1 = color1Data?.hex || '#666';
      const color2 = color2Data?.hex || '#666';
      
      return (
        <div className="w-40 h-60 bg-white rounded-xl shadow-xl border-4 border-slate-300 relative overflow-hidden flex flex-col">
          {/* Value badge */}
          <div className="absolute top-2 right-2 text-xs font-mono font-black text-white px-1.5 py-0.5 rounded shadow-md z-10" style={{backgroundColor: color1}}>
            ${card.value}M
          </div>
          
          {/* Header */}
          <div className="px-2 py-1 bg-slate-800 text-white text-center">
            <div className="text-[8px] font-black uppercase tracking-wider">Wild Property</div>
            <div className="text-[7px] font-bold">Choose One Color</div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex">
            {/* Left side - Color 1 */}
            <div className="flex-1 flex flex-col" style={{backgroundColor: color1}}>
              <div className="flex-1 flex items-center justify-center p-1">
                {/* Rent table for color 1 */}
                <div className="space-y-0.5">
                  {color1Data?.rent?.map((rent, i) => (
                    <div key={i} className="flex items-center gap-1 text-white">
                      <div className="flex gap-0.5">
                        {Array.from({length: i + 1}).map((_, j) => (
                          <div key={j} className="w-2 h-2 bg-white/90 rounded-sm border border-white"></div>
                        ))}
                      </div>
                      <div className="text-[10px] font-black">${rent}M</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Center divider with arrows */}
            <div className="w-8 bg-white flex flex-col items-center justify-center gap-1 border-x-2 border-slate-300">
              {/* Up arrow */}
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-slate-700">
                <path d="M8 2 L12 6 L10 6 L10 10 L6 10 L6 6 L4 6 Z" fill="currentColor" stroke="black" strokeWidth="0.5"/>
              </svg>
              
              {/* Circular arrows icon */}
              <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M6 2 A4 4 0 0 1 10 6 L8 6 M6 10 A4 4 0 0 1 2 6 L4 6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              
              {/* Down arrow */}
              <svg width="16" height="16" viewBox="0 0 16 16" className="text-slate-700">
                <path d="M8 14 L4 10 L6 10 L6 6 L10 6 L10 10 L12 10 Z" fill="currentColor" stroke="black" strokeWidth="0.5"/>
              </svg>
            </div>
            
            {/* Right side - Color 2 */}
            <div className="flex-1 flex flex-col" style={{backgroundColor: color2}}>
              <div className="flex-1 flex items-center justify-center p-1">
                {/* Rent table for color 2 */}
                <div className="space-y-0.5">
                  {color2Data?.rent?.map((rent, i) => (
                    <div key={i} className="flex items-center gap-1 text-white">
                      <div className="flex gap-0.5">
                        {Array.from({length: i + 1}).map((_, j) => (
                          <div key={j} className="w-2 h-2 bg-white/90 rounded-sm border border-white"></div>
                        ))}
                      </div>
                      <div className="text-[10px] font-black">${rent}M</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer - inverted */}
          <div className="px-2 py-1 bg-slate-800 text-white text-center transform rotate-180">
            <div className="text-[8px] font-black uppercase tracking-wider">Wild Property</div>
            <div className="text-[7px] font-bold">Choose One Color</div>
          </div>
        </div>
      );
    }

    // REGULAR PROPERTY CARD
    const textCol = colorData.text || 'white';
    
    return (
      <div 
        className="w-40 h-60 rounded-xl shadow-xl border-4 border-white relative overflow-hidden flex flex-col"
        style={{backgroundColor: bgColor}}
      >
        {/* Value badge (top-left) - cream background with colored border */}
        <div 
          className="absolute top-2 left-2 text-sm font-black text-black bg-amber-50 px-2 py-1 rounded-md shadow-md z-10"
          style={{borderWidth: '3px', borderStyle: 'solid', borderColor: bgColor}}
        >
          ${card.value}M
        </div>

        {/* Property name and set indicators */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
          <div 
            className="font-black uppercase text-center leading-tight mb-3 text-base"
            style={{color: textCol, textShadow: textCol === 'white' ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'}}
          >
            {card.name}
          </div>

          <div className="flex gap-1 mb-2">
            {Array.from({length: setCount}).map((_, i) => (
              <div key={i} className="bg-white rounded-sm shadow-sm w-3 h-3" style={{border: '1px solid rgba(0,0,0,0.2)'}}></div>
            ))}
          </div>

          <div className="space-y-0.5">
            {rentValues.map((rent, i) => (
              <div key={i} className="flex items-center gap-1 justify-center">
                <div className="flex gap-0.5">
                  {Array.from({length: i + 1}).map((_, j) => (
                    <div key={j} className="bg-white rounded-sm w-2 h-2" style={{border: '1px solid rgba(0,0,0,0.2)'}}></div>
                  ))}
                </div>
                <div className="font-bold text-xs" style={{color: textCol, textShadow: textCol === 'white' ? '1px 1px 1px rgba(0,0,0,0.3)' : 'none'}}>
                  ${rent}M
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RENT CARD
  if (isRent) {
    const isWild = card.type === CARD_TYPES.RENT_WILD;
    const colors = isWild ? Object.keys(COLORS).filter(c => c !== 'multi') : (card.colors || []);
    
    // For wild rent, show all colors in a circle
    const renderColorRing = () => {
      if (isWild) {
        // Show all 10 colors in a circle
        const allColors = ['brown', 'cyan', 'pink', 'orange', 'red', 'yellow', 'green', 'blue', 'railroad', 'utility'];
        const segmentAngle = 360 / allColors.length;
        
        return (
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {allColors.map((color, i) => {
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
                
                const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`;
                
                return (
                  <path
                    key={color}
                    d={pathData}
                    fill={COLORS[color].hex}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900">Rent</div>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Show 2 colors in a circle (half and half)
        const color1 = COLORS[colors[0]];
        const color2 = COLORS[colors[1]];
        
        return (
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Top half circle */}
              <path
                d="M 5 50 A 45 45 0 0 1 95 50 L 70 50 A 20 20 0 0 0 30 50 Z"
                fill={color1?.hex || '#666'}
                stroke="white"
                strokeWidth="1"
              />
              {/* Bottom half circle */}
              <path
                d="M 95 50 A 45 45 0 0 1 5 50 L 30 50 A 20 20 0 0 0 70 50 Z"
                fill={color2?.hex || '#666'}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border-2 border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900">Rent</div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    };
    
    return (
      <div className="w-40 h-60 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-xl border-4 border-amber-200 relative overflow-hidden flex flex-col">
        <ValueBadge value={card.value} position="top-left" borderColor="#D97706" />
        
        {/* Color ring and Rent text */}
        <div className="flex-1 flex items-center justify-center py-4">
          {renderColorRing()}
        </div>
        
        {/* Description */}
        <div className="px-3 pb-4 text-center">
          <div className="text-[10px] leading-tight text-slate-700 font-medium">
            {isWild 
              ? "Force any player to pay you rent for any property you own"
              : `All players pay you rent for properties you own in one of these colors`
            }
          </div>
        </div>
      </div>
    );
  }

  // ACTION CARD
  // Define color schemes for different action types
  const getActionStyle = (actionType) => {
    switch(actionType) {
      case ACTION_TYPES.PASS_GO:
        return { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', icon: '🎲', color: '#F59E0B' };
      case ACTION_TYPES.DEAL_BREAKER:
        return { bg: 'from-purple-50 to-violet-50', border: 'border-purple-200', icon: '🤝', color: '#9333EA' };
      case ACTION_TYPES.JUST_SAY_NO:
        return { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', icon: '🚫', color: '#3B82F6' };
      case ACTION_TYPES.SLY_DEAL:
        return { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: '🏃', color: '#10B981' };
      case ACTION_TYPES.FORCED_DEAL:
        return { bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200', icon: '📋', color: '#14B8A6' };
      case ACTION_TYPES.DEBT_COLLECTOR:
        return { bg: 'from-gray-50 to-slate-50', border: 'border-gray-300', icon: '👆', color: '#6B7280' };
      case ACTION_TYPES.BIRTHDAY:
        return { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', icon: '🎂', color: '#EC4899' };
      case ACTION_TYPES.HOUSE:
        return { bg: 'from-lime-50 to-green-50', border: 'border-lime-200', icon: '🏠', color: '#84CC16' };
      case ACTION_TYPES.HOTEL:
        return { bg: 'from-sky-50 to-blue-50', border: 'border-sky-200', icon: '🏨', color: '#0EA5E9' };
      case ACTION_TYPES.DOUBLE_RENT:
        return { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', icon: '×2', color: '#F97316' };
      default:
        return { bg: 'from-slate-50 to-gray-50', border: 'border-slate-300', icon: '⚡', color: '#64748B' };
    }
  };

  const style = getActionStyle(card.actionType);

  return (
    <div className={`w-40 h-60 bg-gradient-to-br ${style.bg} rounded-xl shadow-xl border-4 ${style.border} relative overflow-hidden flex flex-col`}>
      <ValueBadge value={card.value} position="top-left" borderColor="#475569" />
      
      {/* Icon circle */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          {/* Circular background */}
          <div 
            className="absolute inset-0 rounded-full opacity-20"
            style={{ backgroundColor: style.color }}
          />
          
          {/* Icon/Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {card.actionType === ACTION_TYPES.DOUBLE_RENT ? (
                <div className="text-5xl font-black" style={{ color: style.color }}>×2</div>
              ) : (
                <div className="text-6xl">{style.icon}</div>
              )}
            </div>
          </div>
          
          {/* Card name in circle */}
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <div 
              className="text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: style.color }}
            >
              {card.name.length > 15 ? card.name.substring(0, 13) + '...' : card.name}
            </div>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div className="px-3 pb-4 text-center">
        <div className="text-[10px] leading-tight text-slate-700 font-medium">
          {card.description}
        </div>
      </div>
    </div>
  );
};

const generateFullDeck = () => {
  const deck = [];
  let id = 0;
  const add = (card, qty) => {
    for (let i = 0; i < qty; i++) {
      deck.push({ ...card, id: `card-${id++}`, uid: Math.random().toString(36).substr(2, 9) });
    }
  };

  // 1. Money (20)
  add({ type: CARD_TYPES.MONEY, value: 10, name: '$10M' }, 1);
  add({ type: CARD_TYPES.MONEY, value: 5, name: '$5M' }, 2);
  add({ type: CARD_TYPES.MONEY, value: 4, name: '$4M' }, 3);
  add({ type: CARD_TYPES.MONEY, value: 3, name: '$3M' }, 3);
  add({ type: CARD_TYPES.MONEY, value: 2, name: '$2M' }, 5);
  add({ type: CARD_TYPES.MONEY, value: 1, name: '$1M' }, 6);

  // 2. Properties (28 Solid)
  const props = [
    { c: 'brown', n: ['Baltic Ave', 'Mediterranean Ave'], v: 1 },
    { c: 'blue', n: ['Boardwalk', 'Park Place'], v: 4 },
    { c: 'green', n: ['NC Ave', 'Pacific Ave', 'Penn Ave'], v: 4 },
    { c: 'yellow', n: ['Marvin Gdn', 'Ventnor Ave', 'Atlantic Ave'], v: 3 },
    { c: 'orange', n: ['New York Ave', 'St. James', 'Tennessee'], v: 2 },
    { c: 'pink', n: ['St. Charles', 'Virginia Ave', 'States Ave'], v: 2 },
    { c: 'red', n: ['Kentucky', 'Indiana', 'Illinois'], v: 3 },
    { c: 'cyan', n: ['Oriental', 'Vermont', 'Connecticut'], v: 1 },
    { c: 'railroad', n: ['B&O', 'Short Line', 'Reading', 'Penn RR'], v: 2 },
    { c: 'utility', n: ['Electric', 'Water'], v: 2 }
  ];
  props.forEach(p => p.n.forEach(name => add({ type: CARD_TYPES.PROPERTY, color: p.c, name, value: p.v }, 1)));

  // 3. Wild Properties (11)
  const duals = [
    { c: ['blue', 'green'], v: 4 }, { c: ['cyan', 'brown'], v: 1 }, 
    { c: ['pink', 'orange'], v: 2 }, { c: ['pink', 'orange'], v: 2 },
    { c: ['red', 'yellow'], v: 3 }, { c: ['red', 'yellow'], v: 3 },
    { c: ['railroad', 'green'], v: 4 }, { c: ['railroad', 'cyan'], v: 4 }, { c: ['railroad', 'utility'], v: 2 }
  ];
  duals.forEach(d => add({ type: CARD_TYPES.PROPERTY_WILD, colors: d.c, value: d.v, name: `${COLORS[d.c[0]].name}/${COLORS[d.c[1]].name} Wild`, currentColor: d.c[0] }, 1));
  
  // Rainbows (2)
  add({ type: CARD_TYPES.PROPERTY_WILD, colors: ['any'], value: 0, name: 'Rainbow Wild', currentColor: 'multi', isRainbow: true }, 2);

  // 4. Action Cards (34)
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DEAL_BREAKER, value: 5, name: 'Deal Breaker', description: 'Steal a complete set' }, 2);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.JUST_SAY_NO, value: 4, name: 'Just Say No', description: 'Cancel action against you' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.SLY_DEAL, value: 3, name: 'Sly Deal', description: 'Steal a property (non-complete)' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.FORCED_DEAL, value: 3, name: 'Forced Deal', description: 'Swap properties (non-complete)' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DEBT_COLLECTOR, value: 3, name: 'Debt Collector', description: 'Force 1 player to pay $5M' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.BIRTHDAY, value: 2, name: 'It\'s My Birthday', description: 'All pay you $2M' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.PASS_GO, value: 1, name: 'Pass Go', description: 'Draw 2 cards' }, 10);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3, name: 'House', description: '+3M Rent on Full Set' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4, name: 'Hotel', description: '+4M Rent on Full Set with House' }, 2);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DOUBLE_RENT, value: 1, name: 'Double The Rent', description: '2x Rent Amount' }, 2);

  // 5. Rent Cards (13)
  const rents = [
    ['blue', 'green'], ['red', 'yellow'], ['pink', 'orange'], ['cyan', 'brown'], ['railroad', 'utility']
  ];
  rents.forEach(r => add({ type: CARD_TYPES.RENT, colors: r, value: 1, name: `${COLORS[r[0]].name}/${COLORS[r[1]].name} Rent` }, 2));
  add({ type: CARD_TYPES.RENT_WILD, colors: ['any'], value: 3, name: 'Wild Rent', description: 'Force 1 player to pay rent' }, 3);

  return deck;
};

export default function CardGallery() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [flippedCards, setFlippedCards] = useState(new Set());
  
  const allCards = generateFullDeck();
  
  const filteredCards = allCards.filter(card => {
    const matchesFilter = filter === 'ALL' || card.type === filter;
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const cardsByType = {
    MONEY: filteredCards.filter(c => c.type === CARD_TYPES.MONEY),
    PROPERTY: filteredCards.filter(c => c.type === CARD_TYPES.PROPERTY),
    WILD: filteredCards.filter(c => c.type === CARD_TYPES.PROPERTY_WILD),
    ACTION: filteredCards.filter(c => c.type === CARD_TYPES.ACTION),
    RENT: filteredCards.filter(c => c.type === CARD_TYPES.RENT || c.type === CARD_TYPES.RENT_WILD)
  };

  const toggleFlip = (cardUid) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardUid)) {
        newSet.delete(cardUid);
      } else {
        newSet.add(cardUid);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="p-8 pb-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Game
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black italic text-white mb-2">Card Gallery</h1>
              <p className="text-zinc-400 text-sm">Complete 110-Card Monopoly Deal Deck • Click cards to flip</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-amber-500">{filteredCards.length}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Cards</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input
                type="text"
                placeholder="Search cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'MONEY', 'PROPERTY', 'PROPERTY_WILD', 'ACTION', 'RENT'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    filter === f 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="max-w-7xl mx-auto space-y-12">
          {filter === 'ALL' ? (
            Object.entries(cardsByType).map(([type, cards]) => (
              cards.length > 0 && (
                <div key={type}>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-3">
                    <div className="h-1 w-12 bg-amber-500 rounded"></div>
                    {type} Cards ({cards.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {cards.map(card => (
                      <div key={card.uid} className="flex flex-col items-center gap-2">
                        {/* Simple rotation container */}
                        <div 
                          className="cursor-pointer transition-transform duration-500 ease-in-out"
                          style={{
                            transform: flippedCards.has(card.uid) ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                          onClick={() => toggleFlip(card.uid)}
                        >
                          <GalleryCard card={card} isFlipped={false} />
                        </div>
                        
                        <div className="text-xs text-zinc-500 text-center">{card.name}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(card.uid);
                          }}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wider"
                        >
                          {flippedCards.has(card.uid) ? '↻ Rotate Back' : '↻ Rotate 180°'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards.map(card => (
                <div key={card.uid} className="flex flex-col items-center gap-2">
                  {/* Simple rotation container */}
                  <div 
                    className="cursor-pointer transition-transform duration-500 ease-in-out"
                    style={{
                      transform: flippedCards.has(card.uid) ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                    onClick={() => toggleFlip(card.uid)}
                  >
                    <GalleryCard card={card} isFlipped={false} />
                  </div>
                  
                  <div className="text-xs text-zinc-500 text-center">{card.name}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFlip(card.uid);
                    }}
                    className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wider"
                  >
                    {flippedCards.has(card.uid) ? '↻ Rotate Back' : '↻ Rotate 180°'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
