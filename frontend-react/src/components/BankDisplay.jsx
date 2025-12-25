import MiniCard from './MiniCard';

const BankDisplay = ({ cards, compact = false, onCardClick, hideValue = true }) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  const totalValue = cards.reduce((sum, card) => sum + (card.value || 0), 0);
  const cardCount = cards.length;
  const topCard = cards[cards.length - 1];

  // Visual card stack - show cards stacked with slight offset
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Total value hidden for opponents by default */}
      {!hideValue && <div className="text-xs font-bold text-slate-600">Bank: ${totalValue}M</div>}
      
      <div 
        className="relative cursor-pointer" 
        onClick={() => onCardClick && onCardClick(topCard)}
        style={{ 
          width: `${192 * 0.5}px`, 
          height: `${272 * 0.5 + (Math.min(cardCount, 5) - 1) * 8}px` 
        }}
      >
        {/* Visual card stack: show top cards as a vertical stack */}
        {[...cards].slice(-5).map((card, i, arr) => (
          <div
            key={card.id || i}
            className="absolute shadow-lg rounded-lg overflow-hidden transition-all duration-300"
            style={{
              bottom: `${i * 8}px`,
              left: '0',
              zIndex: i
            }}
          >
            <MiniCard 
              card={card} 
              scale={0.5} 
              onClick={() => onCardClick && onCardClick(card)}
            />
          </div>
        ))}
        
        {/* Card count badge */}
        <div className="absolute -top-3 -right-3 bg-emerald-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-[60] shadow-md animate-in zoom-in duration-300">
           {cardCount}
        </div>
      </div>
    </div>
  );
};

export default BankDisplay;
