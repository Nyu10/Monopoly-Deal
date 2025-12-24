import React from 'react';

const BankDisplay = ({ cards, compact = false }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
        💰 Bank: $0M
      </div>
    );
  }

  const totalValue = cards.reduce((sum, card) => sum + (card.value || 0), 0);
  const topCard = [...cards].sort((a, b) => (b.value || 0) - (a.value || 0))[0];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold">💰 ${totalValue}M</span>
        <span className="text-xs text-gray-500">({cards.length})</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border-2 border-emerald-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-emerald-800">💰 Bank</span>
        <span className="text-lg font-black text-emerald-700">${totalValue}M</span>
      </div>
      
      {/* Top card preview */}
      <div className="bg-white rounded-md p-2 border-2 border-emerald-300 shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-black text-emerald-600">${topCard.value}M</div>
          <div className="text-xs text-gray-500">Top Card</div>
        </div>
      </div>
      
      {cards.length > 1 && (
        <div className="text-xs text-center text-gray-600 mt-1">
          + {cards.length - 1} more card{cards.length - 1 !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default BankDisplay;
