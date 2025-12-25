# Task: Integrate StadiumDemo with Real Game Backend

## Objective
Transform StadiumDemo from a visual mockup into a fully functional game component that connects to the backend and supports real multiplayer gameplay.

## Current State Analysis

### StadiumDemo (Current)
- **Location**: `/frontend-react/src/pages/StadiumDemo.jsx`
- **Status**: Visual demo with mock data
- **Features**: 
  - Beautiful stadium layout
  - Mock players with random cards
  - No game logic
  - No backend connection
  - No WebSocket support

### App.jsx (Current Game)
- **Location**: `/frontend-react/src/App.jsx`
- **Status**: Fully functional game
- **Features**:
  - Complete game logic (1612 lines)
  - Bot AI integration
  - Turn management
  - Card actions (Deal Breaker, Sly Deal, etc.)
  - Payment system
  - Win condition checking
  - Gemini AI commentary
  - WebSocket ready (has layout prop for stadium)

## Implementation Strategy

### Phase 1: Extract Game Logic into Hooks
**Goal**: Separate game logic from UI rendering

1. Create `/hooks/useGameState.js`
   - Extract all game state management from App.jsx
   - Include: deck, players, turnIndex, gameState, etc.

2. Create `/hooks/useGameActions.js`
   - Extract all game actions: playCard, performDraw, executeAction, etc.
   - Handle turn management, moves counting

3. Create `/hooks/useWebSocket.js` (if not exists)
   - Handle room connection
   - Sync game state with backend
   - Handle multiplayer events

### Phase 2: Update StadiumDemo
**Goal**: Replace mock data with real game logic

1. **Add URL parameter reading**
   ```javascript
   const { roomId } = useParams();
   ```

2. **Integrate game hooks**
   ```javascript
   const gameState = useGameState(roomId);
   const gameActions = useGameActions(gameState);
   const ws = useWebSocket(roomId, gameState);
   ```

3. **Replace mock data**
   - Remove `generateOfficialDeck()` call
   - Remove `createMockPlayer()` function
   - Use real players from gameState

4. **Add game controls**
   - Draw button → `gameActions.performDraw()`
   - Play card → `gameActions.playCard(card)`
   - End turn → `gameActions.endTurn()`

### Phase 3: UI Enhancements
**Goal**: Add missing game UI elements

1. **Action confirmation dialogs**
   - Sly Deal target selection
   - Deal Breaker target selection
   - Payment selection

2. **Game status indicators**
   - Current phase (DRAW, PLAYING, REACTION)
   - Moves remaining
   - Pending actions

3. **Interactive elements**
   - Clickable cards
   - Target selection mode
   - Payment selection mode

### Phase 4: Testing & Polish
1. Test single-player vs bots
2. Test multiplayer functionality
3. Ensure all card actions work
4. Verify win conditions
5. Test edge cases

## File Structure (Proposed)

```
frontend-react/src/
├── hooks/
│   ├── useGameState.js       # NEW: Game state management
│   ├── useGameActions.js     # NEW: Game actions
│   └── useWebSocket.js       # NEW/UPDATE: WebSocket logic
├── pages/
│   ├── StadiumDemo.jsx       # UPDATE: Integrate hooks
│   └── App.jsx               # REFACTOR: Use hooks
├── components/
│   ├── StadiumLayout.jsx     # KEEP: Already good
│   ├── Card.jsx              # KEEP: Already updated
│   └── ActionDialog.jsx      # NEW: Action confirmation UI
└── utils/
    ├── gameHelpers.js        # KEEP: Shared utilities
    └── deckGenerator.js      # KEEP: Deck generation
```

## Priority Tasks (In Order)

1. ✅ **Read roomId from URL** (Quick win)
2. **Extract useGameState hook** (Core logic)
3. **Extract useGameActions hook** (Core logic)
4. **Integrate hooks into StadiumDemo** (Connection)
5. **Add action dialogs** (UX)
6. **Test and debug** (Polish)

## Estimated Complexity
- **High** - Requires significant refactoring
- **Time**: 3-4 hours of focused work
- **Risk**: Medium (game logic is complex)

## Next Steps
1. Start with Phase 1, Task 1: Extract useGameState
2. Test incrementally after each extraction
3. Keep App.jsx working during refactoring
4. Use StadiumDemo as the new primary interface once complete
