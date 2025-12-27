import React, { useState } from 'react';
import { X } from 'lucide-react';
import Card from './Card';
import { COLORS, getSets } from '../utils/gameHelpers';

/**
 * Dialog for selecting which property set to add a wild card to
 * Shows existing sets and option to play as new set
 */
const WildCardSetSelectionDialog = ({ card, player, onSelect, onCancel }) => {
  if (!card) return null;

  // Get player's current property sets
  const sets = getSets(player.properties || []);
  
  // Determine which colors this wild card can be
  const availableColors = card.isRainbow 
    ? Object.keys(COLORS).filter(c => c !== 'any_rainbow') // Rainbow can be any color
    : (card.colors || []); // Dual-color wild has specific colors

  // Filter sets to only show ones that match the wild card's available colors
  const compatibleSets = sets.filter(set => availableColors.includes(set.color));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 max-h-[85vh] overflow-y-auto ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Where to Play Wild Card?
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        {/* Show the wild card */}
        <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex justify-center mb-2">
            <Card card={card} size="sm" enableHover={false} showDescription={true} />
          </div>
          <p className="text-xs text-slate-500 text-center font-medium">
            {card.isRainbow 
              ? 'This rainbow wild card can be added to any color set or played individually'
              : `This wild card can be ${availableColors.map(c => COLORS[c]?.name).join(' or ')}`
            }
          </p>
        </div>

        <div className="space-y-2">


          {/* Option to play as new individual set */}
          <button
            onClick={() => onSelect({ asNewSet: true, color: card.isRainbow ? availableColors[0] : card.colors[0] })}
            className="w-full group relative flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg hover:shadow-purple-500/30"
          >
            <div className="flex flex-col text-left">
              <span className="font-black uppercase tracking-wider text-sm">
                Play as New Set
              </span>
              <span className="text-purple-100 text-xs font-medium">
                Start a new property collection
              </span>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-xl">✨</span>
            </div>
          </button>

          {/* Show existing compatible sets */}
          {compatibleSets.length > 0 && (
            <>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2 px-1">
                Add to Existing Set:
              </div>
              {compatibleSets.map((set) => {
                const colorData = COLORS[set.color];
                const isComplete = set.isComplete;
                
                return (
                  <button
                    key={set.color}
                    onClick={() => onSelect({ asNewSet: false, color: set.color })}
                    className="w-full group relative flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 rounded-lg transition-all hover:scale-[1.02] shadow-sm hover:shadow-md"
                  >
                    {/* Color indicator */}
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md"
                      style={{ backgroundColor: colorData?.hex || '#94a3b8' }}
                    >
                      {set.cards.length}
                    </div>
                    
                    {/* Set info */}
                    <div className="flex-1 text-left">
                      <div className="font-black text-sm text-slate-800">
                        {colorData?.name || set.color} Set
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {set.cards.length}/{colorData?.count || 3} properties
                        {isComplete && (
                          <span className="ml-2 text-green-600 font-black">✓ Complete</span>
                        )}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* If rainbow wild, show all color options for new set */}
          {card.isRainbow && (
            <>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2 px-1">
                Or Choose Color for New Set:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableColors.map((color) => {
                  const colorData = COLORS[color];
                  const existingSet = sets.find(s => s.color === color);
                  
                  return (
                    <button
                      key={color}
                      onClick={() => onSelect({ asNewSet: true, color })}
                      className="flex items-center gap-2 p-2 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 rounded-lg transition-all hover:scale-[1.02] shadow-sm"
                    >
                      <div 
                        className="w-8 h-8 rounded flex-shrink-0"
                        style={{ backgroundColor: colorData?.hex || '#94a3b8' }}
                      />
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {colorData?.name}
                        </div>
                        {existingSet && (
                          <div className="text-[10px] text-slate-500">
                            {existingSet.cards.length} owned
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WildCardSetSelectionDialog;
