/**
 * Shared card back styling constants
 * DRY principle: All card backs use these same values
 */

export const CARD_BACK_STYLES = {
  // Main gradient colors (Deepest Obsidian)
  gradient: 'from-slate-950 via-slate-900 to-slate-950',
  
  // Border color (Sleek and thin)
  border: 'border-slate-800',
  
  // Accent color (Electric Cyan)
  accent: '#06b6d4', // Cyan 500
  accentLight: '#22d3ee', // Cyan 400
  
  // Pattern overlay (Subtle technical grid)
  patternColor: 'rgba(6, 182, 212, 0.05)',
  patternDots: 'linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)',
  patternSize: '20px 20px',
  
  // Text colors
  textPrimary: 'text-cyan-400',
  textSecondary: 'text-slate-500',
  
  // Shadow
  shadow: 'shadow-2xl shadow-cyan-950/20',
};

export default CARD_BACK_STYLES;
