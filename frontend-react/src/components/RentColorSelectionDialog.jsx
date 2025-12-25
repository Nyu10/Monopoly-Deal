import React from 'react';
import { X } from 'lucide-react';
import Card from './Card';
import { COLORS, CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';
import { getSets } from '../utils/gameHelpers';

// ============================================================================
// RENT COLOR SELECTION DIALOG
// ============================================================================

export const RentColorSelectionDialog = ({ card, player, onSelect, onCancel }) => {
  if (!card) return null;

  const sets = getSets(player.properties || []);
  const availableColors = card.type === CARD_TYPES.RENT_WILD 
    ? sets.filter(s => s.cards.length > 0)
    : sets.filter(s => card.colors?.includes(s.color) && s.cards.length > 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">
            Select Rent Color
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex justify-center">
          <Card card={card} size="sm" enableHover={false} />
        </div>

        {availableColors.length === 0 ? (
          <div className="p-6 text-center bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm font-bold text-amber-900 mb-1">No Properties to Charge Rent</p>
            <p className="text-xs text-amber-700">
              You don't have any properties matching this rent card's colors.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-600 mb-4 text-center font-medium">
              Choose which property set to charge rent for:
            </p>

            <div className="space-y-2 mb-6">
              {availableColors.map(set => {
                const colorData = COLORS[set.color] || {};
                const rentValue = set.rent || 0;
                
                return (
                  <button
                    key={set.color}
                    onClick={() => onSelect(set.color)}
                    className="w-full group relative flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-xl transition-all border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md"
                        style={{ backgroundColor: colorData.hex }}
                      >
                        {set.cards.length}
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm text-slate-900 uppercase tracking-wide">
                          {colorData.name || set.color}
                        </div>
                        <div className="text-xs text-slate-500 font-bold">
                          {set.cards.length}/{colorData.count || 3} Properties
                          {set.isComplete && <span className="ml-2 text-green-600">✓ Complete</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-green-600">
                        ${rentValue}M
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        Rent
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={onCancel}
          className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors text-sm uppercase tracking-wider"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RentColorSelectionDialog;
