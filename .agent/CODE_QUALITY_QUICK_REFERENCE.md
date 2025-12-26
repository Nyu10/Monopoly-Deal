# 🎯 QUICK REFERENCE: CODE QUALITY PRINCIPLES

## The 7 Principles of Distinguished Engineering

### 1. **Single Responsibility Principle (SRP)**
> "A class should have one, and only one, reason to change"

**❌ Bad:**
```javascript
// One hook doing everything
const useLocalGameState = () => {
  // State management
  // Game logic
  // AI logic
  // Payment logic
  // Turn management
  // 861 lines!
}
```

**✅ Good:**
```javascript
// Each hook has ONE job
const useGameState = () => { /* Only state */ }
const useGameActions = () => { /* Only actions */ }
const useTurnManagement = () => { /* Only turns */ }
const usePaymentSystem = () => { /* Only payments */ }
```

---

### 2. **Don't Repeat Yourself (DRY)**
> "Every piece of knowledge must have a single, unambiguous representation"

**❌ Bad:**
```javascript
// Defined in 5 different files!
const COLORS = { brown: { hex: '#5D4037', count: 2 } };
```

**✅ Good:**
```javascript
// constants/PropertySets.js - ONE place
export const PROPERTY_SETS = { /* ... */ };

// Import everywhere
import { PROPERTY_SETS } from '@/constants/PropertySets';
```

---

### 3. **No Magic Numbers**
> "Constants should be named and centralized"

**❌ Bad:**
```javascript
if (player.hand.length > 7) { /* discard */ }
if (completeSets >= 3) { /* win */ }
const drawCount = hand.length === 0 ? 5 : 2;
```

**✅ Good:**
```javascript
import { GAME_RULES } from '@/constants/GameRules';

if (player.hand.length > GAME_RULES.MAX_HAND_SIZE) { /* discard */ }
if (completeSets >= GAME_RULES.COMPLETE_SETS_TO_WIN) { /* win */ }
const drawCount = hand.length === 0 
  ? GAME_RULES.EMPTY_HAND_DRAW_COUNT 
  : GAME_RULES.NORMAL_DRAW_COUNT;
```

---

### 4. **Fail Fast with Clear Errors**
> "Errors should be explicit, typed, and informative"

**❌ Bad:**
```java
if (player == null) {
    throw new IllegalStateException("Error");
}
return ResponseEntity.badRequest().build(); // No message!
```

**✅ Good:**
```java
if (player == null) {
    throw new GameException(ErrorCodes.PLAYER_NOT_FOUND)
        .withContext("playerId", playerId)
        .withContext("gameId", gameId);
}

// Client gets:
// {
//   "error": "PLAYER_NOT_FOUND",
//   "message": "Player not found",
//   "status": 404,
//   "context": { "playerId": 2, "gameId": "abc-123" }
// }
```

---

### 5. **Composition Over Inheritance**
> "Build complex behavior by combining simple pieces"

**❌ Bad:**
```javascript
// Giant monolithic component
const GameBoard = () => {
  // 1000 lines of everything
}
```

**✅ Good:**
```javascript
// Composed from smaller pieces
const GameBoard = () => {
  const state = useGameState();
  const actions = useGameActions(state);
  const turnMgmt = useTurnManagement(state, actions);
  
  return (
    <Board>
      <PlayerArea />
      <CardArea />
      <ActionArea />
    </Board>
  );
}
```

---

### 6. **Separation of Concerns**
> "Keep different responsibilities in different places"

**❌ Bad:**
```java
// GameEngine doing EVERYTHING
public class GameEngine {
    // Game logic
    // WebSocket broadcasting
    // Database access
    // Logging
    // Validation
    // 1139 lines!
}
```

**✅ Good:**
```java
// Each service has ONE concern
@Service class TurnManager { /* Turn logic only */ }
@Service class CardPlayService { /* Card logic only */ }
@Service class PaymentService { /* Payment logic only */ }
@Service class GameOrchestrator { /* Coordinates services */ }
```

---

### 7. **Make It Testable**
> "If you can't test it easily, it's poorly designed"

**❌ Bad:**
```javascript
// Can't test payment logic without entire game state
const useLocalGameState = () => {
  // Payment logic buried inside
  // Can't extract for testing
}
```

**✅ Good:**
```javascript
// Payment logic is isolated and testable
export const usePaymentSystem = () => {
  const calculatePayment = (amount, cards) => {
    // Pure function - easy to test!
  };
  return { calculatePayment };
};

// Test:
test('calculatePayment selects optimal cards', () => {
  const cards = [/* ... */];
  const result = calculatePayment(5, cards);
  expect(result.total).toBe(5);
});
```

---

## 🎯 Code Smell Detector

### 🔴 Critical Smells (Fix Immediately)

| Smell | Indicator | Fix |
|-------|-----------|-----|
| **God Object** | File > 500 lines | Split into focused modules |
| **Long Method** | Function > 50 lines | Extract smaller functions |
| **Magic Numbers** | Literal numbers in logic | Extract to constants |
| **Duplicate Code** | Same code in 3+ places | Extract to shared function |

### 🟡 Warning Smells (Fix Soon)

| Smell | Indicator | Fix |
|-------|-----------|-----|
| **Prop Drilling** | Props passed 3+ levels | Use Context API |
| **Inconsistent Errors** | Different error patterns | Standardize exceptions |
| **Missing Validation** | No input checks | Add validation layer |
| **Tight Coupling** | Hard to test in isolation | Dependency injection |

### 🟢 Minor Smells (Fix When Convenient)

| Smell | Indicator | Fix |
|-------|-----------|-----|
| **Commented Code** | Old code in comments | Delete (it's in git) |
| **Inconsistent Naming** | `p` vs `player` | Use full names |
| **Missing Null Checks** | No null validation | Add `@NonNull` or checks |

---

## 📏 Metrics to Track

### File Complexity
```bash
# Lines per file (target: <250)
find src -name "*.js" -exec wc -l {} \; | sort -rn | head -10

# Functions per file (target: <15)
# Cyclomatic complexity (target: <10)
```

### Code Quality
- **Test Coverage**: >90%
- **Code Duplication**: <5%
- **Magic Numbers**: 0
- **TODO/FIXME**: <5

### Architecture
- **Max File Size**: 250 lines
- **Max Function Size**: 50 lines
- **Max Parameters**: 4
- **Max Nesting Depth**: 3

---

## 🛠️ Refactoring Checklist

Before committing any refactoring:

- [ ] All tests pass
- [ ] No new warnings/errors
- [ ] Code is more readable than before
- [ ] Complexity decreased
- [ ] No functionality changed
- [ ] Committed with clear message

---

## 💡 Quick Wins (Do These First)

### 1. Extract Constants (1 hour)
```javascript
// Create constants/GameRules.js
// Replace all magic numbers
// Immediate impact!
```

### 2. Remove Commented Code (15 min)
```bash
# Find and delete
grep -r "// OLD:" src/
grep -r "// FIXME" src/
```

### 3. Add Input Validation (1 hour)
```java
// Add @Valid annotations
// Create DTOs with constraints
// Better error messages!
```

### 4. Consistent Error Handling (2 hours)
```java
// Create GameException
// Add GlobalExceptionHandler
// Standardize all errors
```

---

## 🎓 Learning Resources

### Books
- **Clean Code** - Robert Martin
- **Refactoring** - Martin Fowler
- **Design Patterns** - Gang of Four

### Principles
- **SOLID** - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **YAGNI** - You Aren't Gonna Need It

### Patterns
- **Service Layer** - Separate business logic
- **Repository** - Data access abstraction
- **Strategy** - Interchangeable algorithms
- **Factory** - Object creation
- **Observer** - Event handling

---

## 🚀 Before You Code

Ask yourself:

1. **Does this function do ONE thing?**
   - If no → split it

2. **Can I test this in isolation?**
   - If no → reduce dependencies

3. **Is this code duplicated elsewhere?**
   - If yes → extract to shared function

4. **Are there magic numbers?**
   - If yes → extract to constants

5. **Will future-me understand this?**
   - If no → add comments or refactor

6. **Is this the simplest solution?**
   - If no → simplify

---

## 📊 Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error cases handled
- [ ] Tests added/updated

### Quality
- [ ] No magic numbers
- [ ] No code duplication
- [ ] Functions are small (<50 lines)
- [ ] Single responsibility
- [ ] Clear naming

### Architecture
- [ ] Proper separation of concerns
- [ ] Dependencies injected
- [ ] Testable design
- [ ] Follows project patterns

### Documentation
- [ ] Complex logic explained
- [ ] Public APIs documented
- [ ] README updated if needed

---

## 🎯 The Golden Rule

> "Always leave the code better than you found it"
> - The Boy Scout Rule

Every time you touch a file:
1. Fix one small thing
2. Extract one magic number
3. Improve one function name
4. Add one test

**Small improvements compound!**

---

## 🏆 Success Metrics

You've achieved Distinguished Engineer quality when:

✅ New developers understand code in <1 day  
✅ Adding features takes <1 hour  
✅ Bugs are found in <5 minutes  
✅ Tests run in <10 seconds  
✅ Code reviews take <15 minutes  
✅ Refactoring is safe and easy  
✅ You're proud to show your code  

---

**Keep this reference handy while coding!** 📌
