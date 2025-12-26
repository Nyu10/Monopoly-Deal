# 🛠️ PRACTICAL REFACTORING GUIDE
## Step-by-Step Implementation Plan

**Goal**: Transform your B+ codebase into A-grade production quality  
**Timeline**: 3 weeks (48 hours of focused work)  
**Approach**: Incremental refactoring (no big-bang rewrites)

---

## 🎯 GUIDING PRINCIPLES

1. **Never break working code** - Refactor incrementally
2. **Test after each change** - Ensure nothing breaks
3. **One concern at a time** - Don't mix refactorings
4. **Commit frequently** - Easy to rollback if needed
5. **Measure progress** - Track metrics

---

## 📅 WEEK 1: QUICK WINS (12 hours)

### Day 1-2: Extract Constants (4 hours)

#### Step 1: Create Constants Files

**Frontend:**
```bash
# Create new files
touch frontend-react/src/constants/GameRules.js
touch frontend-react/src/constants/PropertySets.js
touch frontend-react/src/constants/CardTypes.js
```

**File: `frontend-react/src/constants/GameRules.js`**
```javascript
/**
 * Game rules and magic numbers centralized
 * Single source of truth for game balance
 */
export const GAME_RULES = {
  // Hand management
  STARTING_HAND_SIZE: 5,
  NORMAL_DRAW_COUNT: 2,
  EMPTY_HAND_DRAW_COUNT: 5,
  MAX_HAND_SIZE_END_OF_TURN: 7,
  
  // Turn rules
  MAX_ACTIONS_PER_TURN: 3,
  
  // Win condition
  COMPLETE_SETS_TO_WIN: 3,
  
  // Payment amounts
  DEBT_COLLECTOR_AMOUNT: 5,
  BIRTHDAY_AMOUNT_PER_PLAYER: 2,
  
  // Building bonuses
  HOUSE_RENT_BONUS: 3,
  HOTEL_RENT_BONUS: 4,
  
  // Player limits
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  DEFAULT_PLAYER_COUNT: 4,
};

export default GAME_RULES;
```

**File: `frontend-react/src/constants/PropertySets.js`**
```javascript
/**
 * Property set definitions
 * Extracted from gameHelpers.js to eliminate duplication
 */
export const PROPERTY_SETS = {
  BROWN: {
    id: 'brown',
    color: 'brown',
    hex: '#5D4037',
    name: 'Brown',
    cardsNeeded: 2,
    rentSchedule: [1, 2],
  },
  CYAN: {
    id: 'cyan',
    color: 'cyan',
    hex: '#00BCD4',
    name: 'Light Blue',
    cardsNeeded: 3,
    rentSchedule: [1, 2, 3],
  },
  PINK: {
    id: 'pink',
    color: 'pink',
    hex: '#E91E63',
    name: 'Pink',
    cardsNeeded: 3,
    rentSchedule: [1, 2, 4],
  },
  ORANGE: {
    id: 'orange',
    color: 'orange',
    hex: '#FF9800',
    name: 'Orange',
    cardsNeeded: 3,
    rentSchedule: [1, 3, 5],
  },
  RED: {
    id: 'red',
    color: 'red',
    hex: '#F44336',
    name: 'Red',
    cardsNeeded: 3,
    rentSchedule: [2, 3, 6],
  },
  YELLOW: {
    id: 'yellow',
    color: 'yellow',
    hex: '#FFEB3B',
    name: 'Yellow',
    cardsNeeded: 3,
    rentSchedule: [2, 4, 6],
  },
  GREEN: {
    id: 'green',
    color: 'green',
    hex: '#4CAF50',
    name: 'Green',
    cardsNeeded: 3,
    rentSchedule: [2, 4, 7],
  },
  BLUE: {
    id: 'blue',
    color: 'blue',
    hex: '#2196F3',
    name: 'Dark Blue',
    cardsNeeded: 2,
    rentSchedule: [3, 8],
  },
  RAILROAD: {
    id: 'railroad',
    color: 'railroad',
    hex: '#000000',
    name: 'Railroad',
    cardsNeeded: 4,
    rentSchedule: [1, 2, 3, 4],
  },
  UTILITY: {
    id: 'utility',
    color: 'utility',
    hex: '#9E9E9E',
    name: 'Utility',
    cardsNeeded: 2,
    rentSchedule: [1, 2],
  },
};

// Helper to get property set by color
export const getPropertySet = (color) => {
  return Object.values(PROPERTY_SETS).find(set => set.color === color);
};

// Legacy export for backwards compatibility
export const COLORS = Object.values(PROPERTY_SETS).reduce((acc, set) => {
  acc[set.color] = set;
  return acc;
}, {});

export default PROPERTY_SETS;
```

#### Step 2: Update Imports

**Find all files using COLORS:**
```bash
cd frontend-react
grep -r "const COLORS" src/
```

**Replace with imports:**
```javascript
// ❌ OLD
const COLORS = {
  brown: { hex: '#5D4037', count: 2, name: 'Brown', rent: [1, 2] },
  // ...
};

// ✅ NEW
import { PROPERTY_SETS, COLORS } from '@/constants/PropertySets';
```

**Files to update:**
- `src/utils/gameHelpers.js`
- `src/components/Board.jsx`
- `src/pages/CardGallery.jsx`
- Any other files with COLORS definition

#### Step 3: Update Magic Numbers

**In `useLocalGameState.js`:**
```javascript
// ❌ OLD
const drawCount = (currentPlayer.hand && currentPlayer.hand.length === 0) ? 5 : 2;
if (completeSets >= 3) {
  setWinner(player);
}

// ✅ NEW
import { GAME_RULES } from '@/constants/GameRules';

const drawCount = (currentPlayer.hand && currentPlayer.hand.length === 0) 
  ? GAME_RULES.EMPTY_HAND_DRAW_COUNT 
  : GAME_RULES.NORMAL_DRAW_COUNT;

if (completeSets >= GAME_RULES.COMPLETE_SETS_TO_WIN) {
  setWinner(player);
}
```

#### Step 4: Backend Constants

**Create: `backend-java/src/main/java/com/game/constants/GameConstants.java`**
```java
package com.game.constants;

/**
 * Game rules and constants
 * Single source of truth for game balance
 */
public final class GameConstants {
    private GameConstants() {
        throw new AssertionError("Cannot instantiate constants class");
    }
    
    // Hand management
    public static final int STARTING_HAND_SIZE = 5;
    public static final int NORMAL_DRAW_COUNT = 2;
    public static final int EMPTY_HAND_DRAW_COUNT = 5;
    public static final int MAX_HAND_SIZE = 7;
    
    // Turn rules
    public static final int MAX_ACTIONS_PER_TURN = 3;
    
    // Win condition
    public static final int COMPLETE_SETS_TO_WIN = 3;
    
    // Payment amounts
    public static final int DEBT_COLLECTOR_AMOUNT = 5;
    public static final int BIRTHDAY_AMOUNT = 2;
    
    // Building bonuses
    public static final int HOUSE_RENT_BONUS = 3;
    public static final int HOTEL_RENT_BONUS = 4;
    
    // Player limits
    public static final int MIN_PLAYERS = 2;
    public static final int MAX_PLAYERS = 6;
    public static final int DEFAULT_PLAYER_COUNT = 4;
}
```

**Update GameEngine.java:**
```java
// ❌ OLD
if (hand.size() > 7) {
    // discard
}

// ✅ NEW
import static com.game.constants.GameConstants.*;

if (hand.size() > MAX_HAND_SIZE) {
    // discard
}
```

#### ✅ Checkpoint: Test Everything
```bash
# Frontend
cd frontend-react
npm run test
npm run dev  # Verify game still works

# Backend
cd backend-java
mvn test
mvn spring-boot:run  # Verify server starts
```

**Commit:**
```bash
git add .
git commit -m "refactor: extract magic numbers to constants"
```

---

### Day 3: Error Handling (4 hours)

#### Step 1: Create Exception Hierarchy

**Create: `backend-java/src/main/java/com/game/model/ErrorCodes.java`**
```java
package com.game.model;

public enum ErrorCodes {
    // Client errors (4xx)
    INVALID_MOVE(400, "Invalid move"),
    NOT_YOUR_TURN(403, "Not your turn"),
    GAME_NOT_FOUND(404, "Game not found"),
    PLAYER_NOT_FOUND(404, "Player not found"),
    CARD_NOT_FOUND(404, "Card not found"),
    LOBBY_FULL(409, "Lobby is full"),
    INVALID_SESSION(401, "Invalid session"),
    
    // Server errors (5xx)
    GAME_STATE_CORRUPTED(500, "Game state corrupted"),
    INTERNAL_ERROR(500, "Internal server error");
    
    private final int httpStatus;
    private final String defaultMessage;
    
    ErrorCodes(int httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }
    
    public int getHttpStatus() { return httpStatus; }
    public String getDefaultMessage() { return defaultMessage; }
}
```

**Create: `backend-java/src/main/java/com/game/exception/GameException.java`**
```java
package com.game.exception;

import com.game.model.ErrorCodes;
import java.util.HashMap;
import java.util.Map;

public class GameException extends RuntimeException {
    private final ErrorCodes errorCode;
    private final Map<String, Object> context;
    
    public GameException(ErrorCodes errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.context = new HashMap<>();
    }
    
    public GameException(ErrorCodes errorCode) {
        this(errorCode, errorCode.getDefaultMessage());
    }
    
    public GameException withContext(String key, Object value) {
        context.put(key, value);
        return this;
    }
    
    public ErrorCodes getErrorCode() { return errorCode; }
    public Map<String, Object> getContext() { return context; }
}
```

**Create: `backend-java/src/main/java/com/game/dto/ErrorResponse.java`**
```java
package com.game.dto;

import com.game.model.ErrorCodes;
import java.time.Instant;
import java.util.Map;

public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private Instant timestamp;
    private Map<String, Object> context;
    
    public ErrorResponse(ErrorCodes errorCode, String message, Map<String, Object> context) {
        this.error = errorCode.name();
        this.message = message;
        this.status = errorCode.getHttpStatus();
        this.timestamp = Instant.now();
        this.context = context;
    }
    
    // Getters and setters
}
```

**Create: `backend-java/src/main/java/com/game/exception/GlobalExceptionHandler.java`**
```java
package com.game.exception;

import com.game.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(GameException.class)
    public ResponseEntity<ErrorResponse> handleGameException(GameException e) {
        ErrorResponse response = new ErrorResponse(
            e.getErrorCode(),
            e.getMessage(),
            e.getContext()
        );
        
        return ResponseEntity
            .status(e.getErrorCode().getHttpStatus())
            .body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        // Log the error
        ErrorResponse response = new ErrorResponse(
            ErrorCodes.INTERNAL_ERROR,
            "An unexpected error occurred",
            Map.of("error", e.getMessage())
        );
        
        return ResponseEntity
            .status(500)
            .body(response);
    }
}
```

#### Step 2: Replace Exception Usage

**In GameEngine.java:**
```java
// ❌ OLD
if (session == null) {
    throw new IllegalStateException("Invalid session");
}

// ✅ NEW
import com.game.exception.GameException;
import static com.game.model.ErrorCodes.*;

if (session == null) {
    throw new GameException(INVALID_SESSION)
        .withContext("sessionId", sessionId);
}

// ❌ OLD
Player player = players.stream()
    .filter(p -> p.getId() == playerId)
    .findFirst()
    .orElse(null);

// ✅ NEW
Player player = players.stream()
    .filter(p -> p.getId() == playerId)
    .findFirst()
    .orElseThrow(() -> new GameException(PLAYER_NOT_FOUND)
        .withContext("playerId", playerId));
```

#### ✅ Checkpoint: Test Error Handling
```bash
cd backend-java
mvn test
# Test invalid moves, missing players, etc.
```

**Commit:**
```bash
git add .
git commit -m "feat: implement consistent error handling with custom exceptions"
```

---

### Day 4-5: Input Validation \u0026 Cleanup (4 hours)

#### Step 1: Add Validation DTOs

**Update: `backend-java/src/main/java/com/game/dto/CreateGameRequest.java`**
```java
package com.game.dto;

import jakarta.validation.constraints.*;

public class CreateGameRequest {
    @NotBlank(message = "Game name is required")
    @Size(min = 1, max = 50, message = "Game name must be 1-50 characters")
    private String gameName;
    
    @Min(value = 2, message = "Minimum 2 players required")
    @Max(value = 6, message = "Maximum 6 players allowed")
    private int maxPlayers;
    
    // Getters and setters
}
```

**Update LobbyController:**
```java
import jakarta.validation.Valid;

@PostMapping("/games")
public ResponseEntity<LobbyGame> createGame(
        @RequestHeader("X-Session-Id") String sessionId,
        @Valid @RequestBody CreateGameRequest request) {
    // Spring automatically validates
}
```

#### Step 2: Remove Commented Code

```bash
# Find commented code
cd frontend-react
grep -r "// OLD:" src/
grep -r "// FIXME" src/
grep -r "// TODO" src/

# Review and delete
```

#### Step 3: Add Logging

**In GameEngine.java:**
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger log = LoggerFactory.getLogger(GameEngine.class);

public GameState processMove(String roomId, Move move) {
    log.info("Processing move: type={}, player={}, room={}", 
        move.getType(), move.getPlayerId(), roomId);
    
    try {
        // ... process move
        log.debug("Move processed successfully");
        return state;
    } catch (GameException e) {
        log.error("Move failed: {}", e.getMessage(), e);
        throw e;
    }
}
```

#### ✅ Week 1 Complete!

**Commit:**
```bash
git add .
git commit -m "feat: add input validation and comprehensive logging"
```

**Metrics Check:**
- ✅ Magic numbers eliminated
- ✅ Consistent error handling
- ✅ Input validation added
- ✅ Logging improved
- ✅ Commented code removed

---

## 📅 WEEK 2-3: ARCHITECTURE REFACTORING (24 hours)

### Phase 1: Split `useLocalGameState.js` (8 hours)

#### Step 1: Create Hook Structure

```bash
cd frontend-react/src/hooks
mkdir -p game
touch game/useGameState.js
touch game/useGameActions.js
touch game/useTurnManagement.js
touch game/usePaymentSystem.js
touch game/useBotEngine.js
```

#### Step 2: Extract State Management

**File: `hooks/game/useGameState.js`**
```javascript
import { useState } from 'react';

/**
 * Pure state management - no logic
 * Single Responsibility: Manage game state
 */
export const useGameState = (initialState = null) => {
  const [gameState, setGameState] = useState(initialState?.gameState || 'SETUP');
  const [deck, setDeck] = useState(initialState?.deck || []);
  const [discardPile, setDiscardPile] = useState(initialState?.discardPile || []);
  const [players, setPlayers] = useState(initialState?.players || []);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(initialState?.currentTurnIndex || 0);
  const [movesLeft, setMovesLeft] = useState(initialState?.movesLeft || 0);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(initialState?.hasDrawnThisTurn || false);
  const [winner, setWinner] = useState(initialState?.winner || null);
  const [matchLog, setMatchLog] = useState(initialState?.matchLog || []);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [doubleRentActive, setDoubleRentActive] = useState(false);

  return {
    // State
    gameState,
    deck,
    discardPile,
    players,
    currentTurnIndex,
    movesLeft,
    hasDrawnThisTurn,
    winner,
    matchLog,
    pendingRequest,
    doubleRentActive,
    
    // Setters
    setGameState,
    setDeck,
    setDiscardPile,
    setPlayers,
    setCurrentTurnIndex,
    setMovesLeft,
    setHasDrawnThisTurn,
    setWinner,
    setMatchLog,
    setPendingRequest,
    setDoubleRentActive,
  };
};
```

#### Step 3: Extract Game Actions

**File: `hooks/game/useGameActions.js`**
```javascript
import { useCallback } from 'react';
import { GAME_RULES } from '@/constants/GameRules';

/**
 * Game actions - drawing, playing, ending turn
 * Single Responsibility: Execute game actions
 */
export const useGameActions = (state) => {
  const {
    deck, setDeck,
    players, setPlayers,
    currentTurnIndex,
    hasDrawnThisTurn, setHasDrawnThisTurn,
    setMovesLeft,
    setGameState,
    setMatchLog,
  } = state;

  const drawCards = useCallback(() => {
    if (hasDrawnThisTurn) return;

    const currentPlayer = players[currentTurnIndex];
    const drawCount = (currentPlayer.hand?.length === 0) 
      ? GAME_RULES.EMPTY_HAND_DRAW_COUNT 
      : GAME_RULES.NORMAL_DRAW_COUNT;
    
    const newDeck = [...deck];
    const drawnCards = [];
    for (let i = 0; i < drawCount && newDeck.length > 0; i++) {
      drawnCards.push(newDeck.pop());
    }

    setDeck(newDeck);
    setPlayers(prev => {
      const newPlayers = [...prev];
      const player = { ...newPlayers[currentTurnIndex] };
      player.hand = [...(player.hand || []), ...drawnCards];
      newPlayers[currentTurnIndex] = player;
      return newPlayers;
    });

    setHasDrawnThisTurn(true);
    setMovesLeft(GAME_RULES.MAX_ACTIONS_PER_TURN);
    setGameState('PLAYING');

    setMatchLog(prev => [{
      id: Date.now(),
      player: currentPlayer.name,
      action: 'DRAW',
      message: `drew ${drawCount} cards`,
      isPrivate: true
    }, ...prev]);
  }, [currentTurnIndex, hasDrawnThisTurn, deck, players]);

  // ... extract playCard, endTurn, etc.

  return {
    drawCards,
    // playCard,
    // endTurn,
  };
};
```

#### Step 4: Compose Everything

**File: `hooks/useLocalGameState.js` (refactored)**
```javascript
import { useGameState } from './game/useGameState';
import { useGameActions } from './game/useGameActions';
import { useTurnManagement } from './game/useTurnManagement';
import { usePaymentSystem } from './game/usePaymentSystem';
import { useBotEngine } from './game/useBotEngine';

/**
 * Composition root - combines all game hooks
 * This is now a thin orchestration layer
 */
export const useLocalGameState = (playerCount = 4, botDifficulty = 'MEDIUM', initialState = null) => {
  // Core state
  const state = useGameState(initialState);
  
  // Game actions
  const actions = useGameActions(state);
  
  // Turn management
  const turnMgmt = useTurnManagement(state, actions, playerCount);
  
  // Payment system
  const payment = usePaymentSystem(state);
  
  // Bot engine
  useBotEngine(state, actions, botDifficulty);

  return {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Turn management
    ...turnMgmt,
    
    // Payment
    ...payment,
  };
};
```

#### ✅ Checkpoint: Test Refactored Hooks

```bash
npm run test
npm run dev
# Play a full game to ensure nothing broke
```

**Commit:**
```bash
git add .
git commit -m "refactor: split useLocalGameState into focused hooks"
```

---

### Phase 2: Refactor Backend Services (12 hours)

#### Step 1: Create Service Layer

```bash
cd backend-java/src/main/java/com/game/service
touch TurnManager.java
touch CardPlayService.java
touch ActionCardService.java
touch PropertyService.java
touch PaymentService.java
```

#### Step 2: Extract Turn Management

**File: `service/TurnManager.java`**
```java
package com.game.service;

import com.game.model.*;
import com.game.exception.GameException;
import static com.game.model.ErrorCodes.*;
import static com.game.constants.GameConstants.*;
import org.springframework.stereotype.Service;

@Service
public class TurnManager {
    
    public void startTurn(GameState state, int playerId) {
        TurnContext turn = state.getTurnContext();
        turn.setActivePlayerId(playerId);
        turn.setActionsRemaining(MAX_ACTIONS_PER_TURN);
        turn.setHasDrawn(false);
    }
    
    public void endTurn(GameState state, int playerId) {
        validatePlayerTurn(state, playerId);
        
        Player player = getPlayer(state, playerId);
        enforceHandLimit(player, state);
        
        advanceTurn(state);
    }
    
    public void advanceTurn(GameState state) {
        TurnContext turn = state.getTurnContext();
        int nextPlayer = (turn.getActivePlayerId() + 1) % state.getPlayers().size();
        startTurn(state, nextPlayer);
    }
    
    public boolean canPlayerAct(GameState state, int playerId) {
        TurnContext turn = state.getTurnContext();
        return turn.getActivePlayerId() == playerId 
            && turn.getActionsRemaining() > 0;
    }
    
    private void enforceHandLimit(Player player, GameState state) {
        if (player.getHand().size() > MAX_HAND_SIZE) {
            // Discard excess cards
            List<Card> toDiscard = player.getHand()
                .subList(0, player.getHand().size() - MAX_HAND_SIZE);
            state.getDiscardPile().addAll(toDiscard);
            player.getHand().removeAll(toDiscard);
        }
    }
    
    private void validatePlayerTurn(GameState state, int playerId) {
        if (state.getTurnContext().getActivePlayerId() != playerId) {
            throw new GameException(NOT_YOUR_TURN)
                .withContext("activePlayer", state.getTurnContext().getActivePlayerId())
                .withContext("requestingPlayer", playerId);
        }
    }
    
    private Player getPlayer(GameState state, int playerId) {
        return state.getPlayers().stream()
            .filter(p -> p.getId() == playerId)
            .findFirst()
            .orElseThrow(() -> new GameException(PLAYER_NOT_FOUND)
                .withContext("playerId", playerId));
    }
}
```

#### Step 3: Update GameEngine to Use Services

**File: `service/GameEngine.java` (refactored)**
```java
@Service
public class GameEngine {
    @Autowired private TurnManager turnManager;
    @Autowired private CardPlayService cardPlayService;
    @Autowired private PaymentService paymentService;
    @Autowired private BotEngine botEngine;
    
    public GameState processMove(String roomId, Move move) {
        GameRoom room = getGameRoom(roomId);
        GameState state = room.getGameState();
        
        // Delegate to appropriate service
        switch (move.getType()) {
            case DRAW -> handleDraw(state, move);
            case PLAY_CARD -> cardPlayService.playCard(state, move);
            case END_TURN -> turnManager.endTurn(state, move.getPlayerId());
            default -> throw new GameException(INVALID_MOVE)
                .withContext("moveType", move.getType());
        }
        
        // Trigger bot if needed
        if (shouldTriggerBot(state)) {
            botEngine.executeTurn(state);
        }
        
        return state;
    }
    
    // GameEngine is now much smaller - just orchestration!
}
```

#### ✅ Checkpoint: Test Services

```bash
cd backend-java
mvn test
mvn spring-boot:run
# Test all game flows
```

**Commit:**
```bash
git add .
git commit -m "refactor: extract services from GameEngine"
```

---

### Phase 3: Context API (4 hours)

**File: `frontend-react/src/contexts/GameContext.jsx`**
```jsx
import React, { createContext, useContext } from 'react';
import { useLocalGameState } from '@/hooks/useLocalGameState';

const GameContext = createContext(null);

export const GameProvider = ({ children, playerCount, botDifficulty }) => {
  const gameState = useLocalGameState(playerCount, botDifficulty);
  
  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
```

**Update App:**
```jsx
import { GameProvider } from '@/contexts/GameContext';

function App() {
  return (
    <GameProvider playerCount={4} botDifficulty="MEDIUM">
      <Board />
    </GameProvider>
  );
}
```

**Update Components:**
```jsx
// ❌ OLD
const Board = ({ players, deck, gameState, onDraw, ... }) => {
  // 20 props!
}

// ✅ NEW
const Board = () => {
  const { players, deck, gameState, drawCards } = useGame();
  // No props needed!
}
```

---

## 📊 FINAL CHECKLIST

### Week 1 Deliverables
- [ ] Constants extracted to shared files
- [ ] Magic numbers eliminated
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Logging improved
- [ ] Commented code removed
- [ ] All tests passing

### Week 2-3 Deliverables
- [ ] `useLocalGameState` split into focused hooks
- [ ] Backend services extracted
- [ ] Context API implemented
- [ ] Prop drilling eliminated
- [ ] Integration tests added
- [ ] Documentation updated
- [ ] All tests passing

### Metrics Targets
- [ ] Cyclomatic complexity < 10
- [ ] Lines per file < 250
- [ ] Code duplication < 5%
- [ ] Test coverage > 90%
- [ ] Zero magic numbers
- [ ] Maintainability index > 85

---

## 🎓 TESTING STRATEGY

After each phase:

```bash
# Frontend
npm run test          # Unit tests
npm run test:e2e      # E2E tests (if available)
npm run dev           # Manual testing

# Backend
mvn test              # Unit tests
mvn verify            # Integration tests
mvn spring-boot:run   # Manual testing

# Full game test
# 1. Start backend
# 2. Start frontend
# 3. Play a complete game
# 4. Verify all features work
```

---

## 🚀 SUCCESS CRITERIA

You'll know you're done when:

1. ✅ No file exceeds 250 lines
2. ✅ No function exceeds 50 lines
3. ✅ No magic numbers in code
4. ✅ All errors have clear messages
5. ✅ Tests pass with >90% coverage
6. ✅ New developer can understand code in <1 day
7. ✅ You can add a new card type in <30 minutes

---

## 💡 TIPS FOR SUCCESS

1. **Commit frequently** - After each small change
2. **Test continuously** - Don't accumulate untested changes
3. **Refactor incrementally** - Don't rewrite everything at once
4. **Keep it working** - Always have a working version
5. **Ask for help** - If stuck, ask for code review

---

**Ready to start? Begin with Week 1, Day 1!** 🚀
