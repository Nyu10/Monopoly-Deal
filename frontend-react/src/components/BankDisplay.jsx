import MiniCard from './MiniCard';

const BankDisplay = ({ cards, compact = false, onCardClick }) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  const totalValue = cards.reduce((sum, card) => sum + (card.value || 0), 0);
  const cardCount = cards.length;

  // Visual card stack - show cards stacked with slight offset
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-bold text-slate-600">Bank: ${totalValue}M</div>
      
      {/* Card stack visualization using actual cards */}
      <div 
        className="relative cursor-pointer transition-transform hover:scale-110" 
        onClick={() => onCardClick && onCardClick(cards[0])}
        style={{ width: '48px', height: `${Math.min(cardCount * 3 + 72, 100)}px` }}
      >
        {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              bottom: `${i * 3}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: i
            }}
          >
            <MiniCard 
              card={cards[i] || cards[0]} 
              scale={0.3} 
              onClick={() => onCardClick && onCardClick(cards[i] || cards[0])}
            />
          </div>
        ))}
        
        {/* Card count badge if more than 10 */}
        {cardCount > 10 && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-20">
            {cardCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDisplay;
