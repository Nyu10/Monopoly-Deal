import React from 'react';
import { X } from 'lucide-react';
import Card from './Card';
import { COLORS, CARD_TYPES, ACTION_TYPES, calculateBankTotal } from '../utils/gameHelpers';
import RentColorSelectionDialog from './RentColorSelectionDialog';

// ============================================================================
// CARD ACTION DIALOG
// ============================================================================

export const CardActionDialog = ({ card, onConfirm, onCancel, onFlip, isInHand = false, rentOptions = null, hand = [], movesLeft = 0 }) => {
  if (!card) return null;

  const [useDoubleRent, setUseDoubleRent] = React.useState(false);

  const isAction = card.type === CARD_TYPES.ACTION || card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD;
  const isProperty = card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD;
  const isMoney = card.type === CARD_TYPES.MONEY;
  const isBuilding = card.actionType === ACTION_TYPES.HOUSE || card.actionType === ACTION_TYPES.HOTEL;

  // Double Rent Logic
  const doubleRentCard = isInHand && hand.find(c => c.actionType === ACTION_TYPES.DOUBLE_RENT);
  const canDouble = doubleRentCard && movesLeft >= 2;

  // Reset toggle if invalid
  React.useEffect(() => {
     if (useDoubleRent && !canDouble) {
         setUseDoubleRent(false);
     }
  }, [canDouble, useDoubleRent]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
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
          {/* RENT BUTTONS - Show specific color options if provided */}
          {card.type === CARD_TYPES.RENT && card.colors && rentOptions ? (
            <div className="space-y-2">
              {(() => {
                 const hasValidRentOption = rentOptions.some(r => r.rent > 0);
                 const canDouble = doubleRentCard && movesLeft >= 2 && hasValidRentOption;
                 
                 return (
                  <>
                    {/* DOUBLE RENT TOGGLE */}
                    {doubleRentCard && (
                        <div className={`mb-3 p-3 rounded-lg border-2 transition-all ${canDouble ? (useDoubleRent ? 'bg-purple-100 border-purple-400' : 'bg-purple-50 border-purple-200') : 'bg-slate-100 border-slate-200'}`}>
                            <label className={`flex items-start gap-3 ${canDouble ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                                <div className="relative flex items-center mt-0.5">
                                  <input 
                                      type="checkbox" 
                                      checked={useDoubleRent} 
                                      onChange={(e) => canDouble && setUseDoubleRent(e.target.checked)}
                                      disabled={!canDouble}
                                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-purple-600 checked:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100"
                                  />
                                  <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                
                                <div className="flex-1">
                                    <div className={`text-sm font-black uppercase tracking-wider ${canDouble ? 'text-purple-900' : 'text-slate-500'}`}>
                                        Double It!
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
                                        {canDouble 
                                          ? "Combine with 'Double The Rent'" 
                                          : (!hasValidRentOption ? "No rent to double" : "Not enough moves (needs 2)")}
                                    </div>
                                    {canDouble && (
                                      <div className="text-[9px] text-purple-600 font-bold mt-1 bg-white/50 inline-block px-1.5 py-0.5 rounded">
                                          Total Cost: 2 Moves
                                      </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    )}

                    {rentOptions.map((option) => {
                      const finalRent = useDoubleRent ? option.rent * 2 : option.rent;
                      const canPlay = option.rent > 0;
                      
                      return (
                      <button
                        key={option.color}
                        onClick={() => canPlay && onConfirm({ type: 'RENT', color: option.color, requiresFlip: option.requiresFlip, useDoubleRent })}
                        disabled={!canPlay}
                        style={canPlay ? {
                          backgroundColor: COLORS[option.color]?.hex || '#2563eb',
                          color: COLORS[option.color]?.text || 'white'
                        } : {
                           backgroundColor: '#e2e8f0',
                           color: '#94a3b8'
                        }}
                        className={`w-full group relative flex items-center justify-between p-3 rounded-lg transition-all ${
                           canPlay 
                           ? 'hover:scale-[1.02] shadow-lg hover:shadow-xl hover:brightness-110 cursor-pointer' 
                           : 'opacity-60 cursor-not-allowed shadow-none border border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                             {option.requiresFlip ? `Flip & Rent: ${option.colorName}` : `Rent: ${option.colorName}`}
                          </span>
                          <span className={`text-xs font-medium ${canPlay ? 'opacity-90' : 'opacity-70'}`}>
                            {canPlay 
                              ? (option.requiresFlip ? 'Flip cards to this color & collect' : 'Collect on your properties')
                              : 'No properties owned'}
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-lg font-black font-mono transition-transform ${
                           canPlay 
                             ? (useDoubleRent ? 'bg-purple-600 text-white scale-110 shadow-lg ring-2 ring-white/30' : 'bg-white/20')
                             : 'bg-slate-300 text-slate-500' 
                        }`}>
                          ${finalRent}M
                        </div>
                      </button>
                    )})}
                  </>
                 );
              })()}
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
      case 'PROPERTY': return 'Steal a property';
      case 'COMPLETE_SET': return 'Steal a complete set';
      case 'OWN_COMPLETE_SET': return 'Choose your set';
      case 'PLAYER': return card.actionType === ACTION_TYPES.DEBT_COLLECTOR ? 'Collect $5M from...' : 'Select target player';
      case 'ALL_PLAYERS': return 'Collect $2M from all';
      case 'PROPERTY_SWAP': return 'Select properties to swap';
      default: return 'Select target';
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
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
                        onClick={() => onSelect({ action: 'BANK' })}
                        className="px-6 py-4 rounded-xl font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:scale-[1.02] transition-all uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none border border-emerald-200"
                      >
                        <span className="text-lg">💰</span>
                        Bank It (${card.value}M)
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
  // SPECIAL UI FOR SLY DEAL (STEAL PROPERTY)
  // =========================================================================
  if (targetType === 'PROPERTY') {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-white/20">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 shadow-sm -rotate-3 text-2xl">
                        🧤
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                           Sly Deal
                           <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold tracking-wide border border-slate-200">Steal a Property</span>
                        </h2>
                        <p className="text-slate-500 font-bold text-xs sm:text-sm mt-0.5">Select any single property card from an opponent to steal.</p>
                    </div>
                 </div>
                 <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                    <X size={24} />
                 </button>
              </div>

              {/* Main Content - Opponent Columns */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/50 p-6 custom-scrollbar">
                 <div className="flex h-full gap-6 min-w-max mx-auto px-2">
                    {players
                      .filter(p => p.id !== currentPlayerId)
                      .map(player => {
                        const playerSets = getPlayerSets(player);
                        const hasProperties = player.properties && player.properties.length > 0;
                        
                        return (
                           <div key={player.id} className="w-[280px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                              {/* Player Header */}
                              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 font-black shadow-sm text-sm">
                                       {player.name.charAt(0)}
                                    </div>
                                    <div>
                                       <div className="font-black text-slate-800 uppercase tracking-wide text-xs">{player.name}</div>
                                       <div className="text-[10px] text-slate-500 font-bold">{player.properties?.length || 0} Properties</div>
                                    </div>
                                 </div>
                              </div>

                              {/* Properties Grid */}
                              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-slate-50/30">
                                 {!hasProperties ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2 opacity-60">
                                       <div className="text-4xl grayscale">👻</div>
                                       <div className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">No Properties<br/>to Steal</div>
                                    </div>
                                 ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                       {player.properties?.map(prop => {
                                          const propColor = prop.currentColor || prop.color;
                                          const parentSet = playerSets.find(s => s.color === propColor);
                                          const isProtected = parentSet?.isComplete;
                                          
                                          return (
                                             <button
                                                key={prop.id}
                                                onClick={() => !isProtected && onSelect({ playerId: player.id, cardId: prop.id })}
                                                disabled={isProtected}
                                                className={`relative group transition-all duration-300 ${
                                                   isProtected 
                                                   ? 'opacity-50 grayscale cursor-not-allowed' 
                                                   : 'hover:scale-[1.05] hover:shadow-xl hover:z-20 cursor-pointer hover:-rotate-1'
                                                }`}
                                             >
                                                <Card card={prop} size="xs" enableHover={false} />
                                                
                                                {/* Overlay for protected/selection */}
                                                {isProtected ? (
                                                   <div className="absolute inset-x-0 bottom-6 flex justify-center z-20">
                                                      <span className="bg-slate-900/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider backdrop-blur-sm border border-white/20">Full Set</span>
                                                   </div>
                                                ) : (
                                                   <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/20 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                                                      <div className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-1 border border-emerald-400">
                                                         <span>✋</span> STEAL
                                                      </div>
                                                   </div>
                                                )}
                                             </button>
                                          );
                                       })}
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                      })}
                 </div>
              </div>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                 <div className="text-xs text-slate-400 font-medium hidden sm:block">
                    choose a property to add to your collection.
                 </div>
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                     <button onClick={onCancel} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase text-xs tracking-wider flex-1 sm:flex-none">
                        Cancel Action
                     </button>
                     <button 
                        onClick={() => onSelect({ action: 'BANK' })}
                        className="px-6 py-3 rounded-xl font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:scale-[1.02] transition-all uppercase text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none border border-emerald-200"
                      >
                        <span className="text-lg">💰</span>
                        Or Bank It (${card.value}M)
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Select Target</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Card info area */}
        <div className="flex flex-col items-center bg-slate-50 border-b border-slate-100 p-6 shrink-0">
          <div className="relative mb-4 drop-shadow-xl hover:scale-105 transition-transform duration-300">
            <Card card={card} size="sm" enableHover={false} showDescription={false} />
          </div>
          <p className="text-center text-slate-600 text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 max-w-[80%]">
             {getInstructions()}
          </p>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {targetType === 'ALL_PLAYERS' ? (
             // ALL PLAYERS - Single Action Button
            <div className="flex flex-col gap-4 py-4 px-2">
               <div className="text-center text-slate-500 text-xs font-medium px-4">
                  By clicking confirm, you will effectively charge <span className="font-bold text-slate-800">every single player</span> $2M.
               </div>
              <button
                onClick={() => onSelect({})}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white p-5 rounded-2xl font-black uppercase tracking-wider shadow-lg hover:shadow-pink-500/30 transition-all active:scale-[0.98] group"
              >
                <div className="text-2xl mb-1 group-hover:-translate-y-1 transition-transform">💸</div>
                Charge Everyone $2M
              </button>
            </div>
          ) : (
            // LIST OPPONENTS OR PROPERTIES
            players
              .filter(p => targetType === 'OWN_COMPLETE_SET' ? p.id === currentPlayerId : p.id !== currentPlayerId)
              .map(player => {
                const playerSets = getPlayerSets(player);
                
                // --- PLAYER SELECTION (Debt Collector / Deal Breaker base) ---
                if (targetType === 'PLAYER') {
                   return (
                     <button
                       key={player.id}
                       onClick={() => onSelect({ playerId: player.id })}
                       className="w-full group relative overflow-hidden bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-blue-400 rounded-xl transition-all hover:scale-[1.02] shadow-sm hover:shadow-md text-left"
                     >
                        <div className="p-4 flex items-center gap-4">
                           {/* Avatar / Icon */}
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors font-bold text-sm">
                              {player.name.charAt(0)}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                              <div className="font-black text-slate-800 text-sm mb-1">{player.name}</div>
                              <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
                                 <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    ${calculateBankTotal(player.bank)}M Bank
                                 </span>
                                 <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {player.properties?.length || 0} Props
                                 </span>
                              </div>
                           </div>

                           {/* Arrow */}
                           <div className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                           </div>
                        </div>
                     </button>
                   );
                }

                // --- PROPERTY / SET SELECTION ---
                return (
                  <div key={player.id} className="space-y-2">
                    <div className="bg-slate-100/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                       <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{player.name}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
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
                                 className={`col-span-2 group relative p-3 rounded-xl border-2 text-left transition-all ${
                                   canSelect 
                                    ? 'bg-white hover:bg-slate-50 border-slate-100 hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-md'
                                    : 'bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed'
                                 }`}
                               >
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <div className="text-xs font-black uppercase text-slate-700 mb-0.5">
                                         {COLORS[set.color]?.name || set.color} Set
                                       </div>
                                       <div className="text-[10px] text-slate-400 font-bold">
                                         {canSelect ? 'Ready for House/Hotel' : `${set.cards.length}/${set.required} Cards`}
                                       </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: COLORS[set.color]?.hex }}>
                                       {set.cards.length}
                                    </div>
                                 </div>
                               </button>
                             );
                          }) : (
                            <div className="col-span-2 text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg">No sets available</div>
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
                                className={`relative group transition-all duration-200 ${
                                  isProtected 
                                    ? 'opacity-40 grayscale cursor-not-allowed' 
                                    : 'hover:scale-[1.03] hover:z-10 cursor-pointer'
                                }`}
                              >
                                <Card card={prop} size="xs" enableHover={false} />
                                {isProtected && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px] rounded-lg">
                                    <div className="bg-slate-900/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                                      Locked
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          }) : (
                            <div className="col-span-2 text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg">No properties</div>
                          )
                        )}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Footer - Bank It Option */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-2">
           <button
             onClick={onCancel}
             className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm hover:shadow active:scale-[0.98] text-xs uppercase tracking-wider"
           >
             Cancel
           </button>
           
           {!['PROPERTY_SWAP', 'ALL_PLAYERS'].includes(targetType) && (
              <button
                onClick={() => onSelect({ action: 'BANK' })}
                className="w-full py-2 text-emerald-600/70 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-wider transition-colors"
                title="Don't use the action, just bank it as money"
              >
                Or just Bank It (${card.value}M)
              </button>
           )}
        </div>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
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
