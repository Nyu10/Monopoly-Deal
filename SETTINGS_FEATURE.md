# Settings Page Feature

## Overview
Added a comprehensive settings page that allows players to customize their game experience, with a primary focus on controlling the visibility of opponents' bank information.

## Key Features

### 1. **Bank Visibility Controls**
- **Show Bank Values**: Toggle to show/hide the total money value in opponents' banks
  - When disabled, displays "???" instead of the actual value
  - Adds strategic depth by requiring players to manually track opponents' wealth
  
- **Show Bank Cards**: Toggle to show/hide individual cards in opponents' banks
  - When disabled, shows a card back placeholder instead of actual cards
  - Maintains privacy while still showing card count

### 2. **Additional Settings**
- **Sound Effects**: Enable/disable game sound effects
- **Animations**: Toggle smooth animations (useful for performance on slower devices)
- **Auto End Turn**: Automatically end turn when no moves remain

### 3. **Persistence**
- All settings are automatically saved to localStorage
- Settings persist across browser sessions
- Reset button to restore default settings

## Implementation Details

### Files Created
1. `/frontend-react/src/hooks/useSettings.js`
   - Settings context provider
   - localStorage integration
   - Settings hook for components

2. `/frontend-react/src/pages/SettingsPage.jsx`
   - Beautiful, modern settings UI
   - Toggle switches for each setting
   - Organized into logical sections

### Files Modified
1. `/frontend-react/src/main.jsx`
   - Wrapped app with SettingsProvider
   - Added /settings route

2. `/frontend-react/src/components/BankDisplay.jsx`
   - Added `isOpponent` prop
   - Respects settings for visibility
   - Shows card backs when cards are hidden
   - Shows "???" when values are hidden

3. `/frontend-react/src/components/OpponentCard.jsx`
   - Passes `isOpponent={true}` to BankDisplay

4. `/frontend-react/src/pages/LandingPage.jsx`
   - Added settings button in header

5. `/frontend-react/src/pages/Game.jsx`
   - Added settings button in game header

## Usage

### Accessing Settings
- Click the "Settings" button on the landing page
- Click the settings icon (gear) in the game header
- Navigate directly to `/settings`

### Changing Settings
1. Navigate to the settings page
2. Toggle any setting on/off
3. Changes are saved automatically
4. Return to game to see changes take effect

### Resetting Settings
- Click the "Reset" button in the settings page header
- All settings will return to their default values

## Design Philosophy

### Visual Excellence
- Modern, gradient-based design
- Smooth animations and transitions
- Clear visual feedback for all interactions
- Organized into logical sections with visual separators

### User Experience
- Instant feedback on toggle changes
- No "Save" button needed (auto-save)
- Clear descriptions for each setting
- Accessible from anywhere in the app

### Privacy & Strategy
The bank visibility settings add a new strategic dimension:
- **Competitive Play**: Disable bank visibility for a more challenging experience
- **Learning Mode**: Keep visibility on while learning the game
- **Custom Difficulty**: Mix and match settings to create your preferred experience

## Future Enhancements
Potential additions to the settings system:
- Bot difficulty selection
- Card back style customization
- Color theme selection (dark mode)
- Animation speed control
- Keyboard shortcuts configuration
