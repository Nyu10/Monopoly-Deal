/**
 * Shared card back styling constants
 * DRY principle: All card backs use these same values
 */

export const CARD_BACK_STYLES = {
  // Main gradient colors (Sophisticated Indigo/Blue)
  gradient: 'from-indigo-600 via-blue-700 to-indigo-800',
  
  // Border color (Clean indigo)
  border: 'border-indigo-400',
  
  // Accent color (Premium Gold)
  accent: '#fbbf24', // Amber 400
  accentLight: '#fde68a', // Amber 200
  
  // Pattern overlay (Subtle geometric pattern)
  patternColor: 'rgba(251, 191, 36, 0.08)',
  patternDots: 'radial-gradient(rgba(251, 191, 36, 0.15) 1px, transparent 1px)',
  patternSize: '12px 12px',
  
  // Text colors
  textPrimary: 'text-amber-300',
  textSecondary: 'text-indigo-200',
  
  // Shadow
  shadow: 'shadow-2xl shadow-indigo-900/40',
};

export default CARD_BACK_STYLES;
