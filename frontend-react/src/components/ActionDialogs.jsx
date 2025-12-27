import React from 'react';
import { X } from 'lucide-react';
import Card from './Card';
import { COLORS, CARD_TYPES, ACTION_TYPES, calculateBankTotal } from '../utils/gameHelpers';
import RentColorSelectionDialog from './RentColorSelectionDialog';

// ============================================================================
// CARD ACTION DIALOG
// ============================================================================

export const CardActionDialog = ({ card, onConfirm, onCancel, onFlip, isInHand = false, rentOptions = null }) => {
  if (!card) return null;

  const isAction = card.type === CARD_TYPES.ACTION || card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD;
  const isProperty = card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD;
  const isMoney = card.type === CARD_TYPES.MONEY;
  const isBuilding = card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-[280px] w-full p-3 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-end mb-2">
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center mb-3">
          <div className="shadow-xl rounded-xl">
            <Card card={card} size="md" enableHover={false} showDescription={true} />
          </div>
        </div>

        <div className="space-y-2">
          {/* RENT BUTTONS - Show specific color options if provided */}
          {card.type === CARD_TYPES.RENT && card.colors && rentOptions ? (
            <div className="space-y-2">
              {rentOptions.map((option) => (
                <button
                  key={option.color}
                  onClick={() => onConfirm({ type: 'RENT', color: option.color, requiresFlip: option.requiresFlip })}
                  style={{
                    backgroundColor: COLORS[option.color]?.hex || '#2563eb',
                    color: COLORS[option.color]?.text || 'white'
                  }}
                  className="w-full group relative flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl hover:brightness-110"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                       {option.requiresFlip ? `Flip & Rent: ${option.colorName}` : `Rent: ${option.colorName}`}
                    </span>
                    <span className="text-xs font-medium opacity-90">
                      {option.requiresFlip ? 'Flip cards to this color & collect' : 'Collect on your properties'}
                    </span>
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-lg font-black font-mono">
                    ${option.rent}M
                  </div>
                </button>
              ))}
            </div>
          ) : (
             /* STANDARD PLAY ACTION / PROPERTY BUTTON */
             (isAction || isProperty) && isInHand && (
            <button
              onClick={() => onConfirm(isProperty ? 'PROPERTY' : (isBuilding ? 'PROPERTY' : 'ACTION'))}
              className="w-full group relative flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg hover:shadow-blue-500/30"
            >
              <div className="flex flex-col text-left">
                <span className="font-black uppercase tracking-wider text-sm">
                  {isProperty ? 'Play Property' : (isBuilding ? 'Add to Set' : 'Play Action')}
                </span>
                <span className="text-blue-100 text-xs font-medium">
                  {isProperty ? 'Add to your collection' : (isBuilding ? 'Bonus Rent on Full Set' : 'Use card effect')}
                </span>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-xl">
                  {isProperty ? '🏠' : (isBuilding ? (card.actionType === ACTION_TYPES.HOUSE ? '🏠' : '🏨') : '⚡')}
                </span>
              </div>
            </button>
          ))}

          {/* FLIP BUTTON (For Wild Properties) */}
          {card.type === CARD_TYPES.PROPERTY_WILD && card.colors?.length === 2 && onFlip && !isInHand && (
             <button
              onClick={onFlip}
              className="w-full group relative flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg hover:shadow-orange-500/30"
            >
              <div className="flex flex-col text-left">
                <span className="font-black uppercase tracking-wider text-sm">
                  Flip Card
                </span>
                <span className="text-orange-100 text-xs font-medium">
                  Change active color
                </span>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-xl">↻</span>
              </div>
            </button>
          )}

          {/* BANK BUTTON - Only show for non-property cards in hand */}
          {!isProperty && isInHand && (
            <button
              onClick={() => onConfirm('BANK')}
              className="w-full group relative flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/30"
            >
              <div className="flex flex-col text-left">
                <span className="font-black uppercase tracking-wider text-sm">
                  Bank It
                </span>
                <span className="text-emerald-100 text-xs font-medium">
                  Save as money
                </span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-lg font-black font-mono">
                ${card.value}M
              </div>
            </button>
          )}

          {/* CANCEL BUTTON */}
          <div className="pt-2 mt-1 border-t border-slate-100">
            <button
              onClick={onCancel}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg font-bold transition-colors text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TARGET SELECTION DIALOG
// ============================================================================

export const TargetSelectionDialog = ({ card, targetType, players, currentPlayerId, onSelect, onCancel }) => {
  if (!card) return null;

  // New state for Forced Deal (Swap)
  const [swapState, setSwapState] = React.useState({ 
    myCardId: null, 
    opponentId: null, 
    opponentCardId: null 
  });

  const getInstructions = () => {
    switch (targetType) {
      case 'PROPERTY':
        return 'Select a property to steal';
      case 'COMPLETE_SET':
        return 'Select a complete set to steal';
      case 'OWN_COMPLETE_SET':
        return 'Select your set for this building';
      case 'PLAYER':
        return card.actionType === ACTION_TYPES.DEBT_COLLECTOR 
          ? 'Select a player to collect $5M from'
          : 'Select a player to target';
      case 'ALL_PLAYERS':
        return 'All players will pay you $2M';
      case 'PROPERTY_SWAP':
        return 'Select one of YOUR properties and one OPPONENT property to swap.';
      default:
        return 'Select a target';
    }
  };

  // Helper to check for complete sets
  const getPlayerSets = (player) => {
    if (!player.properties) return [];
    
    // Group by color
    const sets = {};
    player.properties.forEach(p => {
      const color = p.currentColor || p.color;
      if (!sets[color]) sets[color] = [];
      sets[color].push(p);
    });

    return Object.entries(sets).map(([color, cards]) => {
      const colorData = COLORS[color] || {};
      const required = colorData.count || 3;
      const isComplete = cards.length >= required;
      return { color, cards, isComplete, required };
    });
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const opponents = players.filter(p => p.id !== currentPlayerId);

  // Helper to render property list for a player (used in Swap UI)
  const renderProperties = (player, selectedId, onSelectCard, isMyProperty) => {
     const playerSets = getPlayerSets(player);
     
     if (!player.properties || player.properties.length === 0) {
        return <div className="text-xs text-slate-400 italic text-center py-4 col-span-2">No properties available</div>;
     }
     
     return (
       <>
         {player.properties.map(prop => {
            const propColor = prop.currentColor || prop.color;
            const parentSet = playerSets.find(s => s.color === propColor);
            // Cannot swap cards that are part of a completed set
            const isProtected = parentSet?.isComplete; 
            const isSelected = selectedId === prop.id;

            return (
              <button
                key={prop.id}
                onClick={() => !isProtected && onSelectCard(prop.id)}
                disabled={isProtected}
                className={`transform transition-all duration-200 rounded-lg relative group overflow-hidden ${
                  isProtected 
                    ? 'opacity-40 grayscale cursor-not-allowed' 
                    : isSelected
                      ? 'ring-4 ring-blue-500 scale-95 z-10 shadow-lg'
                      : 'hover:scale-105 hover:z-10 cursor-pointer hover:shadow-md'
                }`}
              >
                <div className={isSelected ? 'bg-blue-50/50 p-1 rounded h-full' : ''}>
                    <Card card={prop} size="xs" enableHover={false} />
                </div>
                
                {isProtected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
                     <span className="bg-slate-900/90 text-white text-[9px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wider">Completed Set</span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-white animate-in zoom-in">
                    <span className="text-xs font-black">✓</span>
                  </div>
                )}
              </button>
            );
         })}
       </>
     );
  };

  // =========================================================================
  // SPECIAL UI FOR FORCED DEAL (SWAP)
  // =========================================================================
  if (targetType === 'PROPERTY_SWAP') {
      return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden ring-1 ring-white/20">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                        <span className="text-2xl">🤝</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                           Forced Deal
                        </h2>
                        <p className="text-sm text-slate-500 font-bold">Select one of <span className="text-blue-600 underline decoration-2 underline-offset-2">your properties</span> and one from <span className="text-red-600 underline decoration-2 underline-offset-2">an opponent</span> to swap.</p>
                    </div>
                 </div>
                 <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                    <X size={24} />
                 </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
                 <div className="grid grid-cols-2 gap-8 h-full">
                    
                    {/* LEFT COLUMN: MY PROPERTIES */}
                    <div className={`flex flex-col h-full overflow-hidden rounded-2xl border-2 transition-colors ${swapState.myCardId ? 'bg-blue-50/30 border-blue-200' : 'bg-white border-slate-200'} shadow-sm`}>
                       <div className="p-4 border-b border-inherit sticky top-0 bg-inherit backdrop-blur-sm z-10">
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  Your Property
                              </span>
                              {swapState.myCardId ? (
                                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-lg font-bold">SELECTED</span> 
                              ) : (
                                  <span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-1 rounded-lg font-bold">CHOOSE ONE</span>
                              )}
                           </h3>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                              {renderProperties(currentPlayer, swapState.myCardId, (id) => setSwapState(s => ({...s, myCardId: id})), true)}
                           </div>
                       </div>
                    </div>

                    {/* RIGHT COLUMN: OPPONENT PROPERTIES */}
                    <div className={`flex flex-col h-full overflow-hidden rounded-2xl border-2 transition-colors ${swapState.opponentCardId ? 'bg-red-50/30 border-red-200' : 'bg-white border-slate-200'} shadow-sm`}>
                       <div className="p-4 border-b border-inherit sticky top-0 bg-inherit backdrop-blur-sm z-10">
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                  Opponent's Property
                              </span>
                               {swapState.opponentCardId ? (
                                  <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-lg font-bold">SELECTED</span> 
                              ) : (
                                  <span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-1 rounded-lg font-bold">CHOOSE ONE</span>
                              )}
                           </h3>
                       </div>

                       <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                           {opponents.map(opp => (
                             <div key={opp.id} className="relative">
                                {/* Opponent Header */}
                                <div className="flex items-center gap-2 mb-3 pl-1 sticky top-0 bg-inherit z-10">
                                   <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">{opp.name}</div>
                                   <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                   {renderProperties(opp, swapState.opponentCardId, (id) => setSwapState(s => ({...s, opponentCardId: id, opponentId: opp.id})), false)}
                                </div>
                             </div>
                           ))}
                       </div>
                    </div>

                 </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                 <div className="text-xs text-slate-400 font-medium hidden sm:block">
                    Completing this action uses 1 move.
                 </div>
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                     <button onClick={onCancel} className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase text-xs tracking-wider flex-1 sm:flex-none">
                        Cancel Action
                     </button>
                     <button 
                        onClick={() => onSelect({ 
                           opponentId: swapState.opponentId, 
                           opponentCardId: swapState.opponentCardId, 
                           myCardId: swapState.myCardId 
                        })}
                        disabled={!swapState.myCardId || !swapState.opponentCardId}
                        className={`px-8 py-4 rounded-xl font-black text-white shadow-lg transition-all uppercase tracking-wider text-xs flex justify-center items-center gap-2 flex-1 sm:flex-none ${
                           (!swapState.myCardId || !swapState.opponentCardId) 
                           ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                           : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 hover:shadow-indigo-500/30'
                        }`}
                     >
                        Confirm Swap
                     </button>
                 </div>
              </div>
           </div>
        </div>
      );
  }

  // =========================================================================
  // STANDARD TARGET SELECTION (EXISTING)
  // =========================================================================
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 max-h-[85vh] overflow-y-auto ring-1 ring-black/5 flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Select Target</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 shrink-0 bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex justify-center mb-2">
            <Card card={card} size="xs" enableHover={false} />
          </div>
          <p className="text-xs text-slate-500 text-center font-medium px-2">{getInstructions()}</p>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {targetType === 'ALL_PLAYERS' ? (
            <div className="p-4 text-center">
              <button
                onClick={() => onSelect({})}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white p-4 rounded-xl font-black uppercase tracking-wider shadow-lg hover:shadow-pink-500/30 transition-all scale-105"
              >
                Charge Everyone $2M!
              </button>
            </div>
          ) : (
            players
              .filter(p => targetType === 'OWN_COMPLETE_SET' ? p.id === currentPlayerId : p.id !== currentPlayerId)
              .map(player => {
                const playerSets = getPlayerSets(player);
                
                return (
                  <div key={player.id} className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                    <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {player.name}
                    </h3>
                    
                    {targetType === 'PLAYER' ? (
                      <div className="space-y-2">
                        {/* Show Bank Value */}
                        <div className="flex items-center justify-between text-[10px] px-2">
                          <span className="text-slate-500 font-bold">Bank:</span>
                          <span className="text-green-600 font-black">
                            ${calculateBankTotal(player.bank)}M
                          </span>
                        </div>
                        
                        {/* Show Properties Count */}
                        <div className="flex items-center justify-between text-[10px] px-2 mb-3">
                          <span className="text-slate-500 font-bold">Properties:</span>
                          <span className="text-blue-600 font-black">
                            {player.properties?.length || 0}
                          </span>
                        </div>
                        
                        {/* Select Button */}
                        <button
                          onClick={() => onSelect({ playerId: player.id })}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs px-4 py-3 rounded-lg font-black transition-all uppercase tracking-wider shadow-md hover:shadow-lg"
                        >
                          Select {player.name}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5">
                        {targetType === 'OWN_COMPLETE_SET' ? (
                          // Render by Sets for Building Placement
                          playerSets.length > 0 ? playerSets.map((set) => {
                             const representativeCard = set.cards[0];
                             const canSelect = set.isComplete;
                             
                             return (
                               <button
                                 key={set.color}
                                 onClick={() => canSelect && onSelect({ playerId: player.id, cardId: representativeCard.id })}
                                 disabled={!canSelect}
                                 className={`col-span-4 flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                                   canSelect 
                                    ? 'hover:bg-slate-50 border-slate-200 cursor-pointer hover:border-blue-300' 
                                    : 'opacity-50 grayscale cursor-not-allowed border-transparent bg-slate-50'
                                 }`}
                               >
                                 <div className="flex -space-x-1">
                                    {set.cards.map((c, i) => (
                                      <div key={c.id} className="w-6 h-8 rounded bg-slate-200 border border-white shadow-sm overflow-hidden relative" style={{zIndex: i}}>
                                         <div className="absolute inset-0" style={{backgroundColor: COLORS[c.currentColor || c.color]?.hex}}></div>
                                      </div>
                                    ))}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="text-[10px] font-black uppercase text-slate-700 truncate">
                                     {COLORS[set.color]?.name || set.color} Set
                                   </div>
                                   <div className="text-[9px] text-slate-400 font-bold">
                                     {canSelect ? 'Complete' : `${set.cards.length}/${set.required}`}
                                   </div>
                                 </div>
                                 {canSelect && <div className="text-blue-500 font-black text-xs">SELECT</div>}
                               </button>
                             );
                          }) : (
                            <div className="col-span-4 text-[10px] text-slate-400 italic text-center py-2">No sets available</div>
                          )
                        ) : (
                          // Standard Property Selection
                          playerSets.length > 0 ? player.properties?.map(prop => {
                            const isRestrictedAction = card.actionType === ACTION_TYPES.SLY_DEAL || card.actionType === ACTION_TYPES.FORCED_DEAL;
                            const propColor = prop.currentColor || prop.color;
                            const parentSet = playerSets.find(s => s.color === propColor);
                            const isProtected = isRestrictedAction && parentSet?.isComplete;

                            return (
                              <button
                                key={prop.id}
                                onClick={() => !isProtected && onSelect({ playerId: player.id, cardId: prop.id })}
                                disabled={isProtected}
                                className={`transition-transform rounded-md relative ${
                                  isProtected 
                                    ? 'opacity-40 grayscale cursor-not-allowed ring-2 ring-red-100' 
                                    : 'hover:scale-105 hover:ring-2 ring-blue-500 cursor-pointer'
                                }`}
                                title={isProtected ? "Cannot steal from complete set" : undefined}
                              >
                                <Card card={prop} size="xs" enableHover={false} />
                                {isProtected && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-slate-900/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                                      Protected
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          }) : (
                            <div className="col-span-4 text-[10px] text-slate-400 italic text-center py-2">No properties</div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-4 py-2.5 rounded-lg font-bold transition-colors shrink-0 uppercase tracking-wider"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// PAYMENT SELECTION DIALOG
// ============================================================================

export const PaymentSelectionDialog = ({ amount, player, onConfirm, onCancel }) => {
  const [selectedCards, setSelectedCards] = React.useState([]);

  const availableCards = [
    ...(player.bank || []),
    ...(player.properties || []),
  ];

  const totalPossibleValue = availableCards.reduce((sum, card) => sum + (card.value || 0), 0);
  const totalSelectedValue = selectedCards.reduce((sum, card) => sum + (card.value || 0), 0);
  
  // Rule: You must pay the full amount OR if you can't afford it, you must pay EVERYTHING you have.
  const canPay = totalSelectedValue >= amount || (totalSelectedValue === totalPossibleValue && totalPossibleValue > 0); 
  const remainingValue = Math.max(0, amount - totalSelectedValue);

  // Check if player has a "Just Say No" card in hand
  const jsnCard = (player.hand || []).find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);

  const toggleCard = (card) => {
    setSelectedCards(prev =>
      prev.find(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Pay ${amount}M</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {jsnCard && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg flex items-center justify-between">
            <div>
              <div className="font-black uppercase tracking-wider text-sm">Just Say No!</div>
              <div className="text-xs text-purple-100 font-medium">You have a Just Say No card. Use it to cancel this payment?</div>
            </div>
            <button 
              onClick={() => onConfirm([jsnCard])}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-black uppercase tracking-wider text-[10px] shadow-md hover:bg-purple-50 transition-all hover:scale-105"
            >
              Use Card
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Debt</div>
            <div className="text-2xl font-black text-slate-900">${amount}M</div>
          </div>
          <div className={`p-4 rounded-xl border-2 transition-colors ${totalSelectedValue >= amount ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Selected</div>
            <div className={`text-2xl font-black ${totalSelectedValue >= amount ? 'text-green-600' : 'text-blue-600'}`}>
              ${totalSelectedValue}M
            </div>
          </div>
        </div>

        {totalPossibleValue < amount && (
           <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="text-xs text-amber-800 font-bold leading-relaxed">
                You don't have enough assets to pay the full ${amount}M. 
                <br/>
                <span className="font-black">Game Rule:</span> You must give up all your Bank and Property cards to fulfill the debt.
              </div>
           </div>
        )}

        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider italic">Your Assets (Bank & Properties)</h3>
          <span className="text-[10px] font-bold text-slate-400">Click cards to select</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-6 p-1">
          {availableCards.map(card => {
            const isSelected = selectedCards.find(c => c.id === card.id);
            return (
              <button
                key={card.id}
                onClick={() => toggleCard(card)}
                className={`relative group transition-all duration-200 ${
                  isSelected
                    ? 'scale-95'
                    : 'hover:scale-105 hover:-translate-y-1'
                }`}
              >
                <Card card={card} size="xs" enableHover={false} selected={isSelected} />
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20">
                    <span className="text-[10px] font-black">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-xl font-bold transition-colors uppercase tracking-wider text-xs"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onConfirm(selectedCards)}
            disabled={!canPay}
            className={`flex-1 px-6 py-4 rounded-xl font-black transition-all uppercase tracking-wider text-xs shadow-xl ${
              canPay
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {totalPossibleValue < amount ? 'Confirm Give All Assets' : `Confirm Payment ($${totalSelectedValue}M)`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DISCARD DIALOG
// ============================================================================

export const DiscardDialog = ({ cards, movesLeft, onConfirm, onCancel }) => {
  const [selectedCards, setSelectedCards] = React.useState([]);

  const excessCount = Math.max(0, cards.length - 7);
  const selectedCount = selectedCards.length;
  const remainingCount = cards.length - selectedCount;
  const isValid = remainingCount <= 7;
  const cardsToDiscard = Math.max(0, remainingCount - 7);

  const toggleCard = (card) => {
    setSelectedCards(prev =>
      prev.find(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-100 rounded-lg text-red-600">
               <X size={24} />
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-900">Too Many Cards!</h2>
               <p className="text-sm text-slate-500 font-bold">You have {cards.length} cards in hand</p>
             </div>
          </div>
          {movesLeft > 0 && onCancel && (
            <button
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center -mr-2 -mt-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="mb-6 p-4 bg-red-50 rounded-xl border-2 border-red-100">
          <div className="text-center">
             {!isValid ? (
               <>
                 <span className="text-red-600 font-bold block mb-1">Limit is 7 cards</span>
                 <span className="text-slate-700 text-sm">Please select <span className="font-black text-red-600">{cardsToDiscard}</span> more cards to discard.</span>
               </>
             ) : (
                <span className="text-green-600 font-black flex items-center justify-center gap-2">
                  <span className="text-xl">✓</span>
                  Ready to End Turn
                </span>
             )}
          </div>
        </div>
        
        {movesLeft > 0 && (
           <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100 flex items-center justify-between">
              <div>
                 <span className="text-blue-800 font-bold block mb-1">Wait! You have {movesLeft} moves left.</span>
                 <span className="text-blue-600/80 text-xs font-bold uppercase tracking-wider">You can play cards instead of discarding!</span>
              </div>
              <button 
                onClick={onCancel}
                className="px-4 py-2 bg-white text-blue-600 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Keep Playing
              </button>
           </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 p-1">
          {cards.map(card => {
             const isSelected = selectedCards.find(c => c.id === card.id);
             return (
              <button
                key={card.id}
                onClick={() => toggleCard(card)}
                className={`relative group transition-all duration-200 ${
                  isSelected
                    ? 'scale-90 opacity-50 grayscale'
                    : 'hover:scale-105 hover:-translate-y-2 hover:z-10'
                }`}
              >
                <div className={`transition-transform duration-200 ${isSelected ? 'translate-y-4' : ''}`}>
                   <Card card={card} size="xs" enableHover={false} selected={isSelected} />
                </div>
                
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-red-600 text-white p-2 rounded-full shadow-lg scale-110">
                      <X size={20} strokeWidth={3} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          {movesLeft > 0 && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-xl font-bold transition-colors uppercase tracking-wider text-xs"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onConfirm(selectedCards)}
            disabled={!isValid}
            className={`flex-1 px-6 py-4 rounded-xl font-black transition-all uppercase tracking-wider text-xs shadow-lg ${
              isValid
                ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Discard {selectedCount} Cards & End Turn
          </button>
        </div>
      </div>
    </div>
  );
};

export { RentColorSelectionDialog };
export default { CardActionDialog, TargetSelectionDialog, PaymentSelectionDialog, DiscardDialog, RentColorSelectionDialog };
