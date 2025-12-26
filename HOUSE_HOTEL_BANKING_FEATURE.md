# House and Hotel Banking Feature

## Overview
This document describes the implementation of allowing HOUSE and HOTEL cards to be played as bank cards, while maintaining proper validation when they are played on property sets.

## Changes Made

### 1. Frontend Changes

#### `useLocalGameState.js`
- **Updated**: `playCard` function to allow HOUSE and HOTEL cards to be banked
- **Change**: Added comment clarifying that houses and hotels CAN be banked as money cards
- **Validation**: Property cards still cannot be banked, but action cards (including HOUSE/HOTEL) can be

#### `useGameActions.js`
- **Updated**: Action card handling logic
- **Change**: Modified the `requiresTarget` check to skip target selection when `targetType === 'BANK'`
- **Behavior**: 
  - When banking: HOUSE/HOTEL cards go directly to bank without target selection
  - When playing on properties: HOUSE/HOTEL cards require target selection (which property set)

#### `houseHotelCards.test.js` (NEW)
- **Created**: Comprehensive test suite with 15 tests
- **Coverage**:
  - House can be banked as $3M
  - House requires complete set when played on properties
  - House cannot be placed on incomplete sets
  - Hotel can be banked as $4M
  - Hotel requires complete set with house when played on properties
  - Hotel cannot be placed without a house
  - Validation rules for both banking and property placement

### 2. Backend Changes

#### `Move.java`
- **Added**: `destination` field to support specifying where a card should be played
- **Added**: `getDestination()` and `setDestination()` methods
- **Purpose**: Allows frontend to specify if an action card should be banked vs played

#### `GameEngine.java`
- **Updated**: `handlePlayCard` method
- **Change**: Added check for ACTION cards to see if they should be banked
- **Logic**:
  ```java
  if (move.getDestination() != null && move.getDestination().equals("BANK")) {
      p.getBank().add(card);
      // Log banking action
  } else {
      handleActionCard(state, p, card, move);
  }
  ```

#### `ActionCardTest.java`
- **Added**: 6 new tests for HOUSE and HOTEL cards
- **Tests**:
  1. `testHouseCanBeBanked` - Verifies house can be banked as $3M
  2. `testHouseRequiresCompleteSet` - Documents complete set requirement
  3. `testHouseCannotBeOnIncompleteSet` - Verifies validation
  4. `testHotelCanBeBanked` - Verifies hotel can be banked as $4M
  5. `testHotelRequiresHouse` - Documents house requirement for hotels
  6. `testHotelCannotBeWithoutHouse` - Verifies validation

## Validation Rules

### House Card Rules
1. ✅ **Can be banked** as $3M money card (no restrictions)
2. ✅ **Can be played on properties** ONLY if:
   - Player has at least one complete property set
   - The house is placed on a complete set
3. ❌ **Cannot be played on incomplete sets**

### Hotel Card Rules
1. ✅ **Can be banked** as $4M money card (no restrictions)
2. ✅ **Can be played on properties** ONLY if:
   - Player has at least one complete property set
   - That complete set already has a house on it
   - The hotel is placed on a complete set with a house
3. ❌ **Cannot be played on complete sets without a house**
4. ❌ **Cannot be played on incomplete sets (even with a house)**

## Testing

### Frontend Tests
```bash
npm test -- houseHotelCards.test.js
```
**Result**: ✅ 15 tests passed

### Backend Tests
```bash
mvn test -Dtest=ActionCardTest
```
**Result**: ✅ 16 tests passed (6 new tests for HOUSE/HOTEL)

## User Experience

### Before
- Houses and hotels could only be played on property sets
- If a player had no complete sets, they couldn't use these cards
- This was frustrating as these cards have monetary value ($3M and $4M)

### After
- Houses and hotels can be banked as money cards
- Players have flexibility: use strategically on properties OR bank for money
- Validation still ensures proper game rules when playing on properties
- Better strategic options for players

## Implementation Notes

1. **Backward Compatibility**: The changes are backward compatible. Existing game logic for placing houses/hotels on properties remains unchanged.

2. **Bot Behavior**: Bots can now make strategic decisions to bank houses/hotels when they don't have complete sets or when banking provides more value.

3. **Validation Timing**: Validation only occurs when destination is 'PROPERTIES', not when destination is 'BANK'.

4. **Code Quality**: All changes include proper comments and maintain existing code style.

## Files Modified

### Frontend
- `/frontend-react/src/hooks/useLocalGameState.js`
- `/frontend-react/src/hooks/useGameActions.js`
- `/frontend-react/src/utils/houseHotelCards.test.js` (NEW)

### Backend
- `/backend-java/src/main/java/com/game/model/Move.java`
- `/backend-java/src/main/java/com/game/service/GameEngine.java`
- `/backend-java/src/test/java/com/game/mechanics/ActionCardTest.java`

## Future Considerations

1. **UI Enhancement**: Consider adding visual indicators in the UI to show that houses/hotels can be banked
2. **Bot Strategy**: Enhance bot decision-making to evaluate when banking vs playing is more valuable
3. **Tutorial**: Update game tutorial/rules to explain this dual-use capability
