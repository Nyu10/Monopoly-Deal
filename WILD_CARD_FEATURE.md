# Wild Card Set Selection Feature

## Summary
Implemented a new feature that allows players to choose which property set to add wild cards to when playing them from their hand. Previously, wild cards could only be played with a single "Play Action" option. Now players have full control over where their wild cards go.

## Changes Made

### 1. New Component: WildCardSetSelectionDialog.jsx
- Created a new dialog component that displays when a player clicks on a wild card in their hand
- Shows all compatible property sets the wild card can be added to
- Allows players to:
  - Add the wild card to an existing compatible property set
  - Play the wild card as a new individual set
  - Bank the wild card for its monetary value (strategic option)
- For rainbow wild cards, shows all available color options
- For dual-color wild cards, only shows compatible sets

### 2. Updated Game.jsx
- Added state management for the wild card set selection dialog
- Modified `handleCardClick` to detect wild property cards and show the new dialog
- Created `handleWildCardSetSelect` handler that:
  - Sets the wild card's `currentColor` property before playing it
  - Plays the card to the bank if the player chooses to bank it
  - Plays the card to properties with the selected color if playing as property
- Integrated the new dialog into the JSX render

### 3. How It Works
1. Player clicks on a wild card in their hand
2. The wild card set selection dialog appears
3. Player chooses one of the options:
   - Bank it for money
   - Play as new set (choosing a color)
   - Add to an existing compatible set
4. The card's `currentColor` is set to the chosen color
5. The card is played to properties (or bank)
6. The existing `playCard` function in `useLocalGameState.js` preserves the `currentColor`

## User Experience Improvements
- **More Strategic Control**: Players can now make informed decisions about where to place wild cards
- **Visual Clarity**: Shows existing sets with their completion status
- **Flexibility**: Option to bank wild cards if needed for money
- **Rainbow Wild Support**: Shows all color options for rainbow wild cards
- **Dual-Color Wild Support**: Only shows compatible sets for dual-color wilds

## Technical Notes
- The implementation uses a two-step process: first setting the `currentColor` in the player's hand, then playing the card
- This ensures the color is preserved when the card moves from hand to properties
- The existing game logic in `useLocalGameState.js` already supports `currentColor` preservation (line 762)
- No changes to the backend game logic were required
