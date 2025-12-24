# Monopoly Deal Bot Game - Implementation Roadmap

## 🎯 Goal: Fully Functional Bot Game with Strategic AI

This roadmap provides a step-by-step guide to complete the Monopoly Deal bot game, prioritized by dependencies and impact.

---

## 📋 Phase 1: Core Gameplay Foundation (2-3 weeks)

### Milestone 1.1: Payment System (Week 1)
**Priority**: 🔴 Critical - Foundation for all economic interactions

#### Tasks:
1. **Create Payment Models** (2 hours)
   - [ ] Create `PaymentRequest` class
     - Fields: `fromPlayerId`, `toPlayerId`, `amount`, `reason`, `cardUid`
   - [ ] Add `pendingPayments` to `TurnContext`
   - [ ] Create `PaymentResponse` class

2. **Implement Payment Resolution** (4 hours)
   - [ ] Add `handlePayment()` method to `GameEngine`
   - [ ] Calculate total payment value from cards
   - [ ] Transfer cards from payer to payee
   - [ ] Handle insufficient funds (force property payment)
   - [ ] Validate payment completeness

3. **Add Payment Choice Logic** (3 hours)
   - [ ] Create `selectCardsForPayment()` in `BotEngine`
   - [ ] Priority: Money cards first, then action cards, then properties
   - [ ] Minimize value loss (pay exact amount if possible)

4. **Testing** (2 hours)
   - [ ] Test exact payment
   - [ ] Test overpayment
   - [ ] Test insufficient funds
   - [ ] Test property payment

**Files to Modify**:
- `backend-java/src/main/java/com/game/model/PaymentRequest.java` (NEW)
- `backend-java/src/main/java/com/game/service/GameEngine.java`
- `backend-java/src/main/java/com/game/service/BotEngine.java`
- `backend-java/src/test/java/com/game/service/GameEngineTest.java`

---

### Milestone 1.2: Rent Collection System (Week 1-2)
**Priority**: 🔴 Critical - Core Monopoly Deal mechanic

#### Tasks:
1. **Rent Calculation Logic** (4 hours)
   - [ ] Create `calculateRent()` method
   - [ ] Base rent by color and set size
   - [ ] Complete set multipliers
   - [ ] House/Hotel bonuses
   - [ ] Create rent value tables

2. **Rent Card Handling** (3 hours)
   - [ ] Handle color-specific rent cards
   - [ ] Handle wild rent cards (player chooses property set)
   - [ ] Validate player owns properties of that color
   - [ ] Target selection (which player to charge)

3. **Double Rent Implementation** (2 hours)
   - [ ] Allow playing Double Rent with a Rent card
   - [ ] Multiply calculated rent by 2
   - [ ] Consume both cards in one action

4. **Bot Rent Strategy** (4 hours)
   - [ ] Identify which property sets to charge rent for
   - [ ] Select optimal target (player with most money)
   - [ ] Decide when to use Double Rent
   - [ ] Prioritize rent when sets are complete

5. **Testing** (3 hours)
   - [ ] Test rent calculation for all colors
   - [ ] Test complete set bonuses
   - [ ] Test wild rent card
   - [ ] Test double rent
   - [ ] Test bot rent decisions

**Files to Modify**:
- `backend-java/src/main/java/com/game/service/GameEngine.java`
- `backend-java/src/main/java/com/game/service/BotEngine.java`
- `backend-java/src/main/java/com/game/service/RentCalculator.java` (NEW)
- `backend-java/src/test/java/com/game/service/RentCalculatorTest.java` (NEW)

**Rent Value Table**:
```java
// Properties needed for complete set
brown: 2, light_blue: 3, pink: 3, orange: 3,
red: 3, yellow: 3, green: 3, dark_blue: 2,
railroad: 4, utility: 2

// Rent values by set size
brown: [1, 2]
light_blue: [1, 2, 3]
pink: [1, 2, 4]
orange: [1, 3, 5]
red: [2, 3, 6]
yellow: [2, 4, 6]
green: [2, 4, 7]
dark_blue: [3, 8]
railroad: [1, 2, 3, 4]
utility: [1, 2]
```

---

### Milestone 1.3: Basic Action Cards (Week 2)
**Priority**: 🔴 Critical - Enable economic gameplay

#### Tasks:
1. **Debt Collector** (3 hours)
   - [ ] Create payment request for $2M
   - [ ] Target selection (bot chooses richest opponent)
   - [ ] Integrate with payment system
   - [ ] Bot strategy: Use when opponent has money

2. **Birthday** (2 hours)
   - [ ] Create payment requests for all opponents
   - [ ] Each pays $2M to active player
   - [ ] Handle multiple payments sequentially
   - [ ] Bot strategy: Use when multiple opponents have money

3. **Pass Go Enhancement** (1 hour)
   - [ ] Already implemented, but verify it works correctly
   - [ ] Ensure bot prioritizes this card

4. **Testing** (2 hours)
   - [ ] Test Debt Collector against rich/poor opponents
   - [ ] Test Birthday with multiple players
   - [ ] Test bot decision-making for these cards

**Files to Modify**:
- `backend-java/src/main/java/com/game/service/GameEngine.java`
- `backend-java/src/main/java/com/game/service/BotEngine.java`

---

## 📋 Phase 2: Strategic Gameplay (3-4 weeks)

### Milestone 2.1: Property Manipulation Actions (Week 3)
**Priority**: 🔴 Critical - Core strategic gameplay

#### Tasks:
1. **Sly Deal** (5 hours)
   - [ ] Target player selection (bot chooses player with valuable properties)
   - [ ] Property selection (cannot steal from complete sets)
   - [ ] Validate property is not in complete set
   - [ ] Transfer property to active player
   - [ ] Bot strategy: Steal properties that help complete sets

2. **Forced Deal** (5 hours)
   - [ ] Select property to give away
   - [ ] Select property to receive
   - [ ] Validate neither is in complete set
   - [ ] Swap properties
   - [ ] Bot strategy: Trade low-value for high-value, or to complete sets

3. **Deal Breaker** (4 hours)
   - [ ] Target selection (player with complete set)
   - [ ] Validate target has complete set
   - [ ] Transfer entire set (including buildings)
   - [ ] Bot strategy: Steal sets that help bot win

4. **Bot Property Evaluation** (6 hours)
   - [ ] Create `evaluatePropertyValue()` method
   - [ ] Consider: color, set completion potential, rent value
   - [ ] Identify most valuable properties to steal
   - [ ] Identify least valuable properties to trade away

5. **Testing** (4 hours)
   - [ ] Test Sly Deal validation
   - [ ] Test Forced Deal swap logic
   - [ ] Test Deal Breaker set transfer
   - [ ] Test bot property selection

**Files to Modify**:
- `backend-java/src/main/java/com/game/service/GameEngine.java`
- `backend-java/src/main/java/com/game/service/BotEngine.java`
- `backend-java/src/main/java/com/game/service/PropertyEvaluator.java` (NEW)

---

### Milestone 2.2: Reaction System (Week 4)
**Priority**: 🔴 Critical - Defensive gameplay

#### Tasks:
1. **Just Say No Implementation** (6 hours)
   - [ ] Pause game when action card is played
   - [ ] Set `waitingForResponse = true`
   - [ ] Give target player option to play Just Say No
   - [ ] Handle Just Say No chains (can counter a Just Say No)
   - [ ] Resume game after reaction resolved
   - [ ] Timeout after 10 seconds (auto-decline)

2. **Bot Reaction Logic** (5 hours)
   - [ ] Decide when to use Just Say No
   - [ ] Evaluate threat level of action card
   - [ ] Consider: Deal Breaker > Sly Deal > Forced Deal > Rent > Debt Collector
   - [ ] Save Just Say No for high-value threats
   - [ ] Consider number of Just Say No cards in hand

3. **Update Action Card Flow** (4 hours)
   - [ ] Modify all action cards to check for reactions
   - [ ] Add reaction window before executing action
   - [ ] Handle action cancellation if Just Say No succeeds

4. **Testing** (3 hours)
   - [ ] Test Just Say No against each action type
   - [ ] Test Just Say No chains
   - [ ] Test timeout
   - [ ] Test bot reaction decisions

**Files to Modify**:
- `backend-java/src/main/java/com/game/service/GameEngine.java`
- `backend-java/src/main/java/com/game/service/BotEngine.java`
- `backend-java/src/main/java/com/game/model/GameState.java` (TurnContext)

---

### Milestone 2.3: Enhanced Bot AI (Week 5-6)
**Priority**: 🟡 Important - Makes game challenging and fun

#### Tasks:
1. **Threat Assessment System** (6 hours)
   - [ ] Create `assessThreat()` method
   - [ ] Calculate how close each opponent is to winning
   - [ ] Consider: complete sets, set progress, money, hand size
   - [ ] Identify biggest threat

2. **Target Selection Strategy** (5 hours)
   - [ ] For attacks: Target biggest threat
   - [ ] For rent: Target richest player
   - [ ] For stealing: Target player with properties bot needs
   - [ ] Avoid targeting players with Just Say No cards (if known)

3. **Set Completion Priority** (5 hours)
   - [ ] Identify which color sets bot is closest to completing
   - [ ] Prioritize playing properties of those colors
   - [ ] Use wild cards optimally
   - [ ] Steal properties that complete sets

4. **Economic Management** (4 hours)
   - [ ] Maintain minimum bank balance ($3-5M)
   - [ ] Balance banking money vs. playing aggressively
   - [ ] Save money for potential payments
   - [ ] Use action cards strategically vs. banking them

5. **Defensive Strategy** (4 hours)
   - [ ] Keep Just Say No cards when threatened
   - [ ] Avoid completing sets if vulnerable to Deal Breaker
   - [ ] Maintain balanced property distribution

6. **Hand Management** (3 hours)
   - [ ] Improve discard logic
   - [ ] Keep high-value cards
   - [ ] Keep cards that help complete sets
   - [ ] Keep defensive cards (Just Say No)
   - [ ] Discard duplicates and low-value cards

7. **Testing** (4 hours)
   - [ ] Test threat assessment accuracy
   - [ ] Test target selection
   - [ ] Test set completion decisions
   - [ ] Play 100 bot vs. bot games, analyze win rates

**Files to Modify**:
- `backend-java/src/main/java/com/game/service/BotEngine.java`
- `backend-java/src/main/java/com/game/service/ThreatAssessor.java` (NEW)
- `backend-java/src/main/java/com/game/service/SetOptimizer.java` (NEW)

**Bot AI Architecture**:
```java
BotEngine
├── calculateBestMove()
├── assessThreats()
├── selectTarget()
├── evaluateProperty()
├── optimizeSetCompletion()
├── selectPaymentCards()
├── selectDiscardCards()
└── shouldUseJustSayNo()
```

---

## 📋 Phase 3: Advanced Features & Polish (1-2 weeks)

### Milestone 3.1: Buildings (Week 7)
**Priority**: 🟢 Nice-to-Have - Adds depth to gameplay

#### Tasks:
1. **House Implementation** (3 hours)
   - [ ] Validate placement on complete set only
   - [ ] Add $3M to rent value
   - [ ] Track buildings in property set
   - [ ] Bot strategy: Place on high-rent sets

2. **Hotel Implementation** (3 hours)
   - [ ] Validate house exists on set
   - [ ] Add $4M to rent value (total $7M with house)
   - [ ] Bot strategy: Upgrade high-rent sets

3. **Building Rent Calculation** (2 hours)
   - [ ] Update rent calculator to include buildings
   - [ ] Test rent with house
   - [ ] Test rent with hotel

4. **Testing** (2 hours)
   - [ ] Test building placement validation
   - [ ] Test rent bonuses
   - [ ] Test bot building strategy

**Files to Modify**:
- `backend-java/src/main/java/com/game/service/GameEngine.java`
- `backend-java/src/main/java/com/game/service/RentCalculator.java`
- `backend-java/src/main/java/com/game/service/BotEngine.java`

---

### Milestone 3.2: Wild Card Optimization (Week 7)
**Priority**: 🟢 Nice-to-Have - Improves bot intelligence

#### Tasks:
1. **Wild Card Color Selection** (4 hours)
   - [ ] Analyze current property sets
   - [ ] Determine which color brings bot closest to complete set
   - [ ] Consider future wild card flexibility
   - [ ] Allow color changes (move wild cards between sets)

2. **Set Optimization Algorithm** (5 hours)
   - [ ] Create algorithm to find optimal wild card placement
   - [ ] Maximize number of complete sets
   - [ ] Consider rent values
   - [ ] Handle multi-color wild cards

3. **Testing** (2 hours)
   - [ ] Test wild card placement decisions
   - [ ] Test set optimization
   - [ ] Verify bot makes optimal choices

**Files to Modify**:
- `backend-java/src/main/java/com/game/service/BotEngine.java`
- `backend-java/src/main/java/com/game/service/SetOptimizer.java`

---

### Milestone 3.3: Edge Cases & Polish (Week 8)
**Priority**: 🟢 Nice-to-Have - Production readiness

#### Tasks:
1. **Edge Case Handling** (4 hours)
   - [ ] Empty deck and discard pile
   - [ ] All cards in player hands
   - [ ] Player has no valid payment
   - [ ] Infinite Just Say No chains (limit to 3)
   - [ ] Simultaneous win condition

2. **Win Condition Refinement** (3 hours)
   - [ ] Accurate set counting with wild cards
   - [ ] Validate 3 complete sets
   - [ ] Handle ties (most money wins)

3. **Error Handling** (3 hours)
   - [ ] Add try-catch blocks
   - [ ] Graceful failure handling
   - [ ] Log errors properly
   - [ ] Return meaningful error messages

4. **Performance Optimization** (3 hours)
   - [ ] Optimize bot decision-making speed
   - [ ] Cache property evaluations
   - [ ] Reduce unnecessary state copies

5. **Code Cleanup** (3 hours)
   - [ ] Remove TODO comments
   - [ ] Extract magic numbers to constants
   - [ ] Add comprehensive JavaDoc
   - [ ] Refactor long methods

6. **Testing** (4 hours)
   - [ ] Integration tests for full game flow
   - [ ] Edge case tests
   - [ ] Performance tests
   - [ ] Bot vs. bot tournament (1000 games)

**Files to Modify**:
- All existing files (cleanup)
- `backend-java/src/main/java/com/game/constants/GameConstants.java` (NEW)

---

## 📊 Progress Tracking

### Completion Checklist

#### Phase 1: Core Gameplay ⬜ 0%
- [ ] Milestone 1.1: Payment System
- [ ] Milestone 1.2: Rent Collection
- [ ] Milestone 1.3: Basic Action Cards

#### Phase 2: Strategic Gameplay ⬜ 0%
- [ ] Milestone 2.1: Property Manipulation
- [ ] Milestone 2.2: Reaction System
- [ ] Milestone 2.3: Enhanced Bot AI

#### Phase 3: Advanced Features ⬜ 0%
- [ ] Milestone 3.1: Buildings
- [ ] Milestone 3.2: Wild Card Optimization
- [ ] Milestone 3.3: Edge Cases & Polish

---

## 🎯 Success Metrics

### Phase 1 Success Criteria:
- ✅ Bots can collect rent
- ✅ Bots can force payments
- ✅ Economic pressure exists in game
- ✅ All payment scenarios work correctly

### Phase 2 Success Criteria:
- ✅ Bots can steal properties strategically
- ✅ Bots can defend with Just Say No
- ✅ Bots make intelligent target selections
- ✅ Games are competitive and interesting

### Phase 3 Success Criteria:
- ✅ Bots use buildings effectively
- ✅ Wild cards placed optimally
- ✅ No crashes or edge case failures
- ✅ Bot vs. bot games complete successfully 100% of the time

---

## 🚀 Quick Start Guide

### To Begin Implementation:

1. **Start with Milestone 1.1** (Payment System)
   ```bash
   cd backend-java
   # Create PaymentRequest.java
   # Modify GameEngine.java
   # Add tests
   mvn test
   ```

2. **Follow the roadmap sequentially**
   - Each milestone builds on previous ones
   - Don't skip ahead (dependencies exist)

3. **Test after each milestone**
   - Run `mvn test` after each feature
   - Play manual games to verify
   - Fix bugs before moving on

4. **Track progress**
   - Check off tasks as completed
   - Update completion percentages
   - Document any deviations from plan

---

## 📝 Notes

- **Estimated Total Time**: 6-9 weeks (full-time developer)
- **Can be parallelized**: Frontend work can happen alongside backend
- **Flexible**: Milestones can be reordered within phases
- **Iterative**: Test and refine as you go

**Current Status**: Ready to begin Phase 1, Milestone 1.1

**Next Action**: Create `PaymentRequest.java` model class
