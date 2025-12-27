import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            Wild Card Placement
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Card Preview with Text Below */}
          <div className="flex flex-col items-center">
             <div className="mb-4">
               <Card card={card} size="md" enableHover={false} showDescription={false} />
             </div>
             
             {/* Helper text below card */}
             <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 max-w-sm">
                <p className="text-center text-slate-700 text-sm font-medium leading-relaxed">
                   Choose a color set below.
                </p>
             </div>
          </div>

          <div className="space-y-3">
            {/* Generate list of all available options, sorted by Existing Sets first */}
            {availableColors.sort((a, b) => {
               // Custom sort: sets that exist come before sets that don't
               const hasSetA = sets.some(s => s.color === a);
               const hasSetB = sets.some(s => s.color === b);
               return (hasSetA === hasSetB) ? 0 : hasSetA ? -1 : 1;
            }).map(color => {
               const colorData = COLORS[color];
               const existingSet = sets.find(s => s.color === color);
               
               // Rainbow wilds cannot start a specific color set alone (must be 'Wild' or join existing)
               if (card.isRainbow && !existingSet && color !== 'multi') {
                 return null;
               }

               const isComplete = existingSet?.isComplete;
               
               return (
                  <button
                    key={color}
                    onClick={() => onSelect({ asNewSet: !existingSet, color: color })}
                    className="w-full group relative flex items-center gap-4 p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 rounded-xl transition-all hover:scale-[1.02] shadow-sm hover:shadow-md"
                  >
                    {/* Color Indicator */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0"
                      style={{ backgroundColor: colorData?.hex || '#94a3b8' }}
                    >
                       {/* Show existing count or "+" for new */}
                       {existingSet ? existingSet.cards.length : '+'}
                    </div>
                    
                    {/* Text Info */}
                    <div className="flex-1 text-left">
                       <div className="font-black text-slate-800 text-base flex items-center gap-2">
                          {existingSet ? `Add to ${colorData?.name} Set` : `Start ${colorData?.name} Set`}
                          {isComplete && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Complete</span>}
                       </div>
                       <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {existingSet 
                            ? `Currently holds ${existingSet.cards.length}/${colorData?.count} cards`
                            : 'Create a new collection'
                          }
                       </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                       <ArrowRight size={20} />
                    </div>
                  </button>
               );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onCancel}
            className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WildCardSetSelectionDialog;
