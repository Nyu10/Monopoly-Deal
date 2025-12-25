# Banking Rules Regression Tests

## Overview
This document describes the regression tests added to ensure that **property cards cannot be banked** in the Monopoly Deal game.

## Rule
**Property cards (both `PROPERTY` and `PROPERTY_WILD` types) CANNOT be banked. They must be played to the property area.**

Other card types (Money, Action, Rent) CAN be banked for their monetary value.

## Tests Added

### Frontend Tests (JavaScript/React)
**Location:** `/frontend-react/src/hooks/__tests__/useLocalGameState.test.jsx`

Two test suites were added:

1. **`should identify property cards that cannot be banked`**
   - Tests a helper function that validates which card types can be banked
   - Verifies that:
     - Regular property cards return `false` for `canBeBanked()`
     - Wild property cards return `false` for `canBeBanked()`
     - Money cards return `true` for `canBeBanked()`
     - Action cards return `true` for `canBeBanked()`

2. **`should validate destination for different card types`**
   - Tests a validation function that checks if a card can be played to a specific destination
   - Covers multiple scenarios:
     - Property cards → BANK: ❌ Not allowed
     - Wild property cards → BANK: ❌ Not allowed
     - Property cards → PROPERTIES: ✅ Allowed
     - Money cards → BANK: ✅ Allowed
     - Action cards → BANK: ✅ Allowed

**Test Results:**
```
✓ Banking Rules - Property Cards (2)
  ✓ should identify property cards that cannot be banked
  ✓ should validate destination for different card types
```

### Backend Tests (Java)
**Location:** `/backend-java/src/test/java/com/game/service/BankingRulesTest.java`

Four comprehensive test cases:

1. **`testPropertyCardCannotBeBanked`**
   - Verifies that regular property cards go to the properties collection, not the bank
   - Asserts bank size remains unchanged after playing a property card

2. **`testWildPropertyCardCannotBeBanked`**
   - Verifies that wild property cards go to the properties collection, not the bank
   - Tests with a dual-color wild card (Green/Railroad)

3. **`testMoneyCardCanBeBanked`**
   - Confirms that money cards CAN be added to the bank
   - Validates the positive case

4. **`testActionCardCanBeBanked`**
   - Documents current behavior for action cards
   - Notes that action cards are typically played for their effect (go to discard)

**Test Results:**
```
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## Implementation Status

### Backend (Java)
✅ **Correctly implemented and tested**
- The `GameEngine.handlePlayCard()` method properly routes cards based on type:
  - `PROPERTY` and `PROPERTY_WILD` → `player.getProperties()`
  - `MONEY` → `player.getBank()`
  - Other types handled appropriately
- Comprehensive regression tests in `BankingRulesTest.java`

### Frontend (React)
✅ **Validation implemented and tested**
- Added validation in `useLocalGameState.js` in the `playCard` function
- Property cards are now blocked from being banked
- Error message logged to match log when attempted
- Regression tests verify the validation logic

## Validation Code (Frontend)

The following validation was added to `useLocalGameState.js`:

```javascript
// VALIDATION: Property cards cannot be banked
if (destination === 'BANK') {
  if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
    console.error('Property cards cannot be banked! They must be played to your property area.');
    setMatchLog(prev => [{
      id: Date.now(),
      player: 'System',
      action: 'ERROR',
      message: 'Property cards cannot be banked!'
    }, ...prev]);
    return; // Prevent the action
  }
}
```

## Future Enhancements

Optional UI improvements to make this rule more obvious to users:

1. **Visual feedback in UI:**
   - Disable bank drop zone when dragging a property card
   - Show tooltip: "Property cards must be played to your property area"
   - Highlight the property area when dragging a property card

2. **Tutorial/Help:**
   - Add this rule to the game tutorial
   - Include in the help/rules section

## Testing Commands

### Frontend
```bash
cd frontend-react
npm test
```

### Backend
```bash
cd backend-java
mvn test -Dtest=BankingRulesTest
```

## References
- Official Monopoly Deal Rules: Property cards are played to build sets, not banked
- Game balance: Allowing property banking would break the set-building mechanic
