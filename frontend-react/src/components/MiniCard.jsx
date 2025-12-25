import React from 'react';
import Card from './Card';

/**
 * A modular scaled-down version of any card.
 * This ensures we see the actual card design but at a smaller size.
 * It uses CSS transforms to scale the full-size card, maintaining perfect fidelity.
 */
export const MiniCard = ({ card, onClick, scale = 0.4, className = "" }) => {
  if (!card) return null;
  
  // Base dimensions of the "lg" card in Card.jsx (w-48 h-72)
  // Tailwind w-48 = 192px, h-72 = 288px
  const baseWidth = 192; 
  const baseHeight = 288;
  
  return (
    <div 
      className={`relative inline-block overflow-visible group ${className}`}
      style={{ 
        width: baseWidth * scale, 
        height: baseHeight * scale,
      }}
    >
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left',
          width: baseWidth,
          height: baseHeight,
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'pointer'
        }}
        className="transition-all duration-200 group-hover:z-50 group-hover:scale-[0.45] active:scale-[0.38]"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(card);
        }}
      >
        <Card card={card} size="lg" enableHover={false} />
      </div>
    </div>
  );
};

// Map old component names to new implementation for backward compatibility or explicit usage
export const BankCardMini = (props) => <MiniCard {...props} />;
export const PropertyCardMini = ({ property, ...props }) => <MiniCard card={property} {...props} />;

export default MiniCard;
