import React from 'react';
import { X } from 'lucide-react';
import Card from './Card';

/**
 * Dialog for confirming card actions
 * Shows options: Play to Properties, Bank, or Cancel
 */
export const CardActionDialog = ({ card, onConfirm, onCancel }) => {
  if (!card) return null;

  const canPlayToProperties = 
    card.type === 'PROPERTY' || 
    card.type === 'PROPERTY_WILD' ||
    card.actionType === 'HOUSE' ||
    card.actionType === 'HOTEL';

  const canBank = card.type !== 'PROPERTY' && card.type !== 'PROPERTY_WILD';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Play Card</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <Card card={card} size="md" enableHover={false} />
        </div>

        <div className="space-y-3">
          {canPlayToProperties && (
            <button
              onClick={() => onConfirm('PROPERTIES')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md"
            >
              Play to Properties
            </button>
          )}

          {card.type === 'ACTION' && (
            <button
              onClick={() => onConfirm('ACTION')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md"
            >
              Use Action
            </button>
          )}

          {(card.type === 'RENT' || card.type === 'RENT_WILD') && (
            <button
              onClick={() => onConfirm('RENT')}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md"
            >
              Charge Rent
            </button>
          )}

          {canBank && (
            <button
              onClick={() => onConfirm('BANK')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md"
            >
              Bank as Money
            </button>
          )}

          <button
            onClick={onCancel}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Dialog for selecting a target (player, property, or set)
 */
export const TargetSelectionDialog = ({ card, targetType, players, currentPlayerId, onSelect, onCancel }) => {
  if (!card) return null;

  const getInstructions = () => {
    switch (targetType) {
      case 'PROPERTY':
        return 'Select a property to steal (cannot steal from complete sets)';
      case 'COMPLETE_SET':
        return 'Select a complete set to steal';
      case 'OWN_COMPLETE_SET':
        return 'Select one of your complete sets to place this building';
      case 'PLAYER':
        return 'Select a player to target';
      case 'PROPERTY_SWAP':
        return 'Select a property to swap (cannot swap from complete sets)';
      default:
        return 'Select a target';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Select Target</h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-center mb-3">
            <Card card={card} size="sm" enableHover={false} />
          </div>
          <p className="text-sm text-slate-600 text-center">{getInstructions()}</p>
        </div>

        <div className="space-y-4">
          {players
            .filter(p => targetType === 'OWN_COMPLETE_SET' ? p.id === currentPlayerId : p.id !== currentPlayerId)
            .map(player => (
              <div key={player.id} className="border-2 border-slate-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-2">{player.name}</h3>
                
                {targetType === 'PLAYER' ? (
                  <button
                    onClick={() => onSelect({ playerId: player.id })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Select {player.name}
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {player.properties?.map(prop => (
                      <button
                        key={prop.id}
                        onClick={() => onSelect({ playerId: player.id, cardId: prop.id })}
                        className="hover:scale-105 transition-transform"
                      >
                        <Card card={prop} size="xs" enableHover={false} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-4 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/**
 * Dialog for selecting cards to pay
 */
export const PaymentSelectionDialog = ({ amount, player, onConfirm, onCancel }) => {
  const [selectedCards, setSelectedCards] = React.useState([]);

  const availableCards = [
    ...(player.hand || []),
    ...(player.bank || []),
    ...(player.properties || []),
  ];

  const totalValue = selectedCards.reduce((sum, card) => sum + (card.value || 0), 0);
  const canPay = totalValue >= amount;

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

        <div className="mb-4 p-4 bg-slate-100 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">Amount Due:</span>
            <span className="text-lg font-black text-slate-900">${amount}M</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-bold text-slate-700">Selected:</span>
            <span className={`text-lg font-black ${canPay ? 'text-green-600' : 'text-red-600'}`}>
              ${totalValue}M
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Select cards to pay. Click cards to select/deselect.
        </p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {availableCards.map(card => (
            <button
              key={card.id}
              onClick={() => toggleCard(card)}
              className={`transition-all ${
                selectedCards.find(c => c.id === card.id)
                  ? 'ring-4 ring-blue-500 scale-95'
                  : 'hover:scale-105'
              }`}
            >
              <Card card={card} size="xs" enableHover={false} />
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(selectedCards)}
            disabled={!canPay}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-colors ${
              canPay
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Pay ${totalValue}M
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default { CardActionDialog, TargetSelectionDialog, PaymentSelectionDialog };
