/**
 * Shared card back styling constants
 * DRY principle: All card backs use these same values
 */

export const CARD_BACK_STYLES = {
  // Main gradient colors (Standard Blue Deal Deck)
  gradient: 'from-blue-500 to-blue-700',
  
  // Border color (White to match deck)
  border: 'border-white',
  
  // Accent color (White for text/logos)
  accent: '#ffffff', 
  accentLight: '#bfdbfe', // blue-200
  
  // Pattern overlay (White dots)
  patternColor: 'rgba(255, 255, 255, 0.1)',
  patternDots: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)',
  patternSize: '16px 16px',
  
  // Text colors
  textPrimary: 'text-white',
  textSecondary: 'text-blue-100',
  
  // Shadow
  shadow: 'shadow-lg shadow-blue-900/20',
};

export default CARD_BACK_STYLES;
