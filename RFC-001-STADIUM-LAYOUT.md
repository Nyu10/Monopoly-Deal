# RFC-001: Stadium Layout UI for Multiplayer Monopoly Deal

**Status**: Draft  
**Author**: Development Team  
**Created**: 2024-12-24  
**Last Updated**: 2024-12-24

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Non-Goals](#goals--non-goals)
4. [Detailed Design](#detailed-design)
5. [UI Components Specification](#ui-components-specification)
6. [Layout Specifications](#layout-specifications)
7. [Interaction Design](#interaction-design)
8. [Technical Implementation](#technical-implementation)
9. [Accessibility](#accessibility)
10. [Performance Considerations](#performance-considerations)
11. [Testing Strategy](#testing-strategy)
12. [Open Questions](#open-questions)

---

## 🎯 EXECUTIVE SUMMARY

This RFC proposes a comprehensive stadium-style layout for displaying opponents in multiplayer Monopoly Deal. The design provides an elevated, poker-table-inspired view that clearly shows each opponent's game state while maintaining focus on the current player's area.

**Key Features:**
- 🎪 **Stadium View**: Elevated perspective showing all players
- 🏦 **Bank Visualization**: Top money card display with total value
- 🏠 **Property Display**: Organized property sets with completion status
- 🎴 **Hand Count**: Fan-style card count indicator
- 📊 **Real-time Updates**: Live sync with game state
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🚨 PROBLEM STATEMENT

### Current State
The existing UI only shows the current player's view with minimal opponent information. Players cannot:
- See opponents' property sets clearly
- Track opponents' progress toward winning
- Identify which opponents are close to completing sets
- Estimate opponents' financial resources
- Make strategic decisions based on opponent state

### User Pain Points
1. **Lack of Strategic Information**: Players can't see what properties opponents have
2. **No Progress Tracking**: Can't tell who's winning
3. **Poor Spatial Awareness**: No sense of "table" or multiplayer presence
4. **Limited Interaction**: Can't target opponents for actions effectively

---

## 🎯 GOALS & NON-GOALS

### Goals
✅ **Primary Goals:**
1. Display all opponents' visible game state clearly
2. Provide intuitive stadium/table layout for 2-6 players
3. Show bank totals without revealing exact cards
4. Display property sets with completion status
5. Indicate hand size with fan-style visualization
6. Support real-time updates via WebSocket
7. Enable click-to-target for action cards

✅ **Secondary Goals:**
1. Smooth animations for card movements
2. Responsive design for all screen sizes
3. Accessibility compliance (WCAG 2.1 AA)
4. Performance optimization (60fps)

### Non-Goals
❌ **Out of Scope:**
1. Showing opponents' actual hand cards (hidden information)
2. Advanced 3D rendering or WebGL effects
3. Voice chat or video integration
4. Spectator mode (future RFC)
5. Replay/history features (future RFC)

---

## 🎨 DETAILED DESIGN

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     OPPONENT AREA (40%)                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Player 2 │    │ Player 3 │    │ Player 4 │             │
│  │  Bank    │    │  Bank    │    │  Bank    │             │
│  │Properties│    │Properties│    │Properties│             │
│  │   Hand   │    │   Hand   │    │   Hand   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
├─────────────────────────────────────────────────────────────┤
│                   CENTER AREA (10%)                         │
│              ┌──────┐  ┌──────┐                            │
│              │ Deck │  │Discard                            │
│              └──────┘  └──────┘                            │
├─────────────────────────────────────────────────────────────┤
│                   YOUR AREA (50%)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Your Properties                        │   │
│  │  [Set 1] [Set 2] [Set 3] [Set 4]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Your Hand                              │   │
│  │  [Card] [Card] [Card] [Card] [Card]                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 UI COMPONENTS SPECIFICATION

### 1. **OpponentCard Component**

#### Purpose
Display a single opponent's complete game state in a compact, readable format.

#### Visual Design
```
┌──────────────────────────────┐
│ 👤 Player Name    [Turn]     │ ← Header
├──────────────────────────────┤
│ 💰 Bank: $15M                │ ← Bank Summary
│ ┌────┐                       │
│ │$10M│ (Top card visible)    │
│ └────┘                       │
├──────────────────────────────┤
│ 🏠 Properties (6/9 sets)     │ ← Property Sets
│ ┌─────┬─────┬─────┐          │
│ │🟤🟤 │🔵🔵 │🟢🟢🟢│          │ ← Color-coded sets
│ │ ✓  │ ✓  │ 2/3 │          │ ← Completion status
│ └─────┴─────┴─────┘          │
├──────────────────────────────┤
│ 🎴 Hand: 5 cards             │ ← Hand Count
│  ┌┐┌┐┌┐┌┐┌┐                 │ ← Fan visualization
│  └┘└┘└┘└┘└┘                 │
└──────────────────────────────┘
```

#### Props
```typescript
interface OpponentCardProps {
  player: Player;
  isCurrentTurn: boolean;
  isTargetable: boolean;
  onSelect?: () => void;
  compact?: boolean;
}
```

#### States
- **Default**: Normal display
- **Active Turn**: Highlighted border (green glow)
- **Targetable**: Clickable with hover effect (yellow glow)
- **Selected**: Selected for action (red border)
- **Disabled**: Grayed out (not targetable)

---

### 2. **BankDisplay Component**

#### Purpose
Show opponent's bank total and top visible money card.

#### Visual Design
```
┌────────────────┐
│ 💰 Bank: $15M  │ ← Total value
├────────────────┤
│  ┌──────────┐  │
│  │          │  │
│  │   $10M   │  │ ← Top card (largest denomination)
│  │          │  │
│  └──────────┘  │
│  + 5 more cards│ ← Card count indicator
└────────────────┘
```

#### Data Display Rules
1. **Show**: Total bank value (sum of all cards)
2. **Show**: Top card (highest denomination visible)
3. **Show**: Number of cards in bank
4. **Hide**: Exact composition of other cards

#### Props
```typescript
interface BankDisplayProps {
  cards: Card[];
  totalValue: number;
  compact?: boolean;
}
```

---

### 3. **PropertySetDisplay Component**

#### Purpose
Show opponent's property sets with completion status.

#### Visual Design

**Compact Mode** (for opponent view):
```
┌─────────────────────────────┐
│ Properties (2/3 complete)   │
├─────────────────────────────┤
│ 🟤🟤 ✓  🔵🔵 ✓  🟢🟢 2/3    │ ← Color bars + status
│ 🟡🟡🟡 ✓  🔴🔴 1/3          │
└─────────────────────────────┘
```

**Expanded Mode** (on hover/click):
```
┌─────────────────────────────┐
│ Brown Set (COMPLETE) ✓      │
├─────────────────────────────┤
│ ┌────┐ ┌────┐               │
│ │🟤  │ │🟤  │               │
│ │$1M │ │$1M │               │
│ └────┘ └────┘               │
│ Rent: $2M                   │
└─────────────────────────────┘
```

#### Completion Indicators
- ✅ **Complete Set**: Green checkmark, solid border
- 🔄 **In Progress**: Yellow, shows X/Y (e.g., "2/3")
- ⚠️ **Empty**: Gray, shows "0/Y"

#### Props
```typescript
interface PropertySetDisplayProps {
  properties: Card[];
  compact?: boolean;
  showRentValues?: boolean;
  onSetClick?: (color: string) => void;
}
```

---

### 4. **HandCountDisplay Component**

#### Purpose
Show number of cards in opponent's hand with fan visualization.

#### Visual Design

**Fan Layout**:
```
     ┌┐
    ┌┐└┘
   ┌┐└┘
  ┌┐└┘
 ┌┐└┘
└┘
```

**Compact Layout** (for mobile):
```
🎴 5 cards
```

#### Animation
- Cards fan out on hover
- Smooth rotation animation (200ms ease-out)
- Slight bounce effect when count changes

#### Props
```typescript
interface HandCountDisplayProps {
  cardCount: number;
  maxCards?: number; // For hand limit indicator
  compact?: boolean;
}
```

---

### 5. **StadiumLayout Component**

#### Purpose
Arrange all opponent cards in a stadium/table layout.

#### Layout Patterns

**2 Players**:
```
┌─────────────────┐
│   Opponent 1    │
└─────────────────┘
        ↕
┌─────────────────┐
│      You        │
└─────────────────┘
```

**3 Players**:
```
┌──────┐  ┌──────┐
│ Opp1 │  │ Opp2 │
└──────┘  └──────┘
      ↓
  ┌──────┐
  │ You  │
  └──────┘
```

**4 Players** (Recommended):
```
    ┌──────┐
    │ Opp2 │
    └──────┘
┌──────┐  ┌──────┐
│ Opp1 │  │ Opp3 │
└──────┘  └──────┘
    ┌──────┐
    │ You  │
    └──────┘
```

**5-6 Players**:
```
┌────┐ ┌────┐ ┌────┐
│Op2 │ │Op3 │ │Op4 │
└────┘ └────┘ └────┘
┌────┐        ┌────┐
│Op1 │        │Op5 │
└────┘        └────┘
     ┌────┐
     │You │
     └────┘
```

---

## 📐 LAYOUT SPECIFICATIONS

### Screen Breakpoints

```css
/* Desktop (Primary) */
@media (min-width: 1280px) {
  .opponent-card { width: 280px; }
  .property-set { display: flex; }
  .hand-fan { transform: rotate(-15deg to 15deg); }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1279px) {
  .opponent-card { width: 220px; }
  .property-set { display: grid; grid-template-columns: repeat(2, 1fr); }
  .hand-fan { transform: rotate(-10deg to 10deg); }
}

/* Mobile */
@media (max-width: 767px) {
  .opponent-card { width: 100%; }
  .property-set { display: flex; flex-direction: column; }
  .hand-fan { display: none; /* Show count only */ }
}
```

### Spacing & Sizing

```javascript
const LAYOUT_CONSTANTS = {
  // Component sizes
  OPPONENT_CARD_WIDTH: 280,
  OPPONENT_CARD_HEIGHT: 400,
  PROPERTY_CARD_WIDTH: 60,
  PROPERTY_CARD_HEIGHT: 80,
  BANK_CARD_WIDTH: 80,
  BANK_CARD_HEIGHT: 120,
  
  // Spacing
  OPPONENT_GAP: 24,
  PROPERTY_GAP: 8,
  SECTION_PADDING: 16,
  
  // Animation
  CARD_TRANSITION_MS: 300,
  HOVER_SCALE: 1.05,
  SELECTED_SCALE: 1.1,
  
  // Z-index layers
  Z_INDEX: {
    BASE: 0,
    OPPONENT_CARD: 10,
    HOVER: 20,
    SELECTED: 30,
    MODAL: 100
  }
};
```

---

## 🎮 INTERACTION DESIGN

### User Interactions

#### 1. **Hover States**

**Opponent Card Hover**:
- Slight scale up (1.05x)
- Subtle shadow increase
- Show detailed tooltip
- Highlight targetable indicator

**Property Set Hover**:
- Expand to show all cards
- Display rent values
- Show building bonuses

**Bank Hover**:
- Show breakdown of all cards
- Animate card stack

#### 2. **Click Interactions**

**Select Opponent** (for action cards):
```javascript
// User flow
1. User plays "Sly Deal" card
2. All opponents with stealable properties highlight (yellow glow)
3. User clicks opponent
4. Opponent's properties expand
5. User clicks property to steal
6. Confirmation dialog appears
7. Action executes
```

**View Property Details**:
```javascript
// User flow
1. User clicks on property set
2. Modal opens showing:
   - All cards in set
   - Rent values
   - Building bonuses
   - Set completion status
3. User can close or select property (if action pending)
```

#### 3. **Keyboard Navigation**

```
Tab       → Navigate between opponents
Enter     → Select opponent/property
Escape    → Cancel selection
Arrow Keys → Navigate properties within set
Space     → Toggle expanded view
```

---

## 💻 TECHNICAL IMPLEMENTATION

### Component Architecture

```
StadiumLayout/
├── index.tsx                 # Main layout component
├── OpponentCard/
│   ├── index.tsx            # Opponent card container
│   ├── BankDisplay.tsx      # Bank visualization
│   ├── PropertyDisplay.tsx  # Property sets
│   ├── HandDisplay.tsx      # Hand count
│   └── styles.module.css
├── hooks/
│   ├── useOpponentLayout.ts # Layout calculation
│   ├── useTargeting.ts      # Action targeting logic
│   └── useAnimations.ts     # Card animations
└── utils/
    ├── layoutCalculator.ts  # Position calculations
    └── constants.ts         # Layout constants
```

### Data Flow

```typescript
// Game State (from WebSocket)
interface GameState {
  players: Player[];
  currentTurn: number;
  pendingAction?: PendingAction;
}

interface Player {
  id: string;
  name: string;
  hand: Card[];        // Hidden for opponents
  properties: Card[];  // Visible
  bank: Card[];        // Visible (top card + count)
}

// Component Props
interface StadiumLayoutProps {
  gameState: GameState;
  currentPlayerId: string;
  onOpponentSelect?: (playerId: string) => void;
  onPropertySelect?: (playerId: string, card: Card) => void;
}
```

### WebSocket Integration

```typescript
// Subscribe to game state updates
useEffect(() => {
  const socket = connectWebSocket(roomId);
  
  socket.on('gameState', (state: GameState) => {
    setGameState(state);
    animateChanges(prevState, state);
  });
  
  socket.on('playerAction', (action: PlayerAction) => {
    animateAction(action);
  });
  
  return () => socket.disconnect();
}, [roomId]);
```

### Animation System

```typescript
// Card movement animations
const animateCardMovement = (
  card: Card,
  from: Position,
  to: Position,
  duration: number = 300
) => {
  return {
    initial: { x: from.x, y: from.y, scale: 1 },
    animate: { x: to.x, y: to.y, scale: 1 },
    transition: { duration: duration / 1000, ease: 'easeInOut' }
  };
};

// State change animations
const animateStateChange = (
  element: HTMLElement,
  property: string,
  from: any,
  to: any
) => {
  element.animate(
    [
      { [property]: from },
      { [property]: to }
    ],
    {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards'
    }
  );
};
```

---

## ♿ ACCESSIBILITY

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Text on backgrounds**: Minimum 4.5:1 ratio
- **Interactive elements**: Minimum 3:1 ratio
- **Property colors**: Additional text labels for colorblind users

#### Screen Reader Support
```html
<div 
  role="region" 
  aria-label="Opponent: John's game area"
  aria-live="polite"
>
  <div aria-label="Bank: 15 million dollars, 6 cards">
    <!-- Bank content -->
  </div>
  
  <div aria-label="Properties: 2 complete sets, 1 in progress">
    <!-- Properties content -->
  </div>
  
  <div aria-label="Hand: 5 cards">
    <!-- Hand content -->
  </div>
</div>
```

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Clear focus indicators (2px solid outline)
- Logical tab order (left to right, top to bottom)

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ⚡ PERFORMANCE CONSIDERATIONS

### Optimization Strategies

#### 1. **Virtual Scrolling** (for 6+ players)
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: opponents.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 400, // Opponent card height
  overscan: 1
});
```

#### 2. **Memoization**
```typescript
// Memoize expensive calculations
const propertySetStatus = useMemo(() => 
  calculatePropertySets(player.properties),
  [player.properties]
);

// Memoize components
const OpponentCard = memo(({ player }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.player.id === nextProps.player.id &&
         prevProps.player.properties.length === nextProps.player.properties.length;
});
```

#### 3. **Lazy Loading**
```typescript
// Load detailed views only when needed
const PropertyDetailModal = lazy(() => import('./PropertyDetailModal'));

// Preload on hover
<OpponentCard
  onMouseEnter={() => {
    import('./PropertyDetailModal');
  }}
/>
```

#### 4. **Animation Performance**
```css
/* Use GPU-accelerated properties */
.opponent-card {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform; /* Hint to browser */
}

/* Avoid layout thrashing */
.property-card {
  transform: scale(1.05); /* Instead of width/height */
}
```

### Performance Metrics

**Target Metrics**:
- **Initial Render**: < 100ms
- **State Update**: < 16ms (60fps)
- **Animation Frame Rate**: 60fps
- **Memory Usage**: < 50MB per opponent
- **Bundle Size**: < 200KB (gzipped)

---

## 🧪 TESTING STRATEGY

### Unit Tests

```typescript
describe('OpponentCard', () => {
  it('displays player name correctly', () => {
    const player = createMockPlayer({ name: 'Alice' });
    render(<OpponentCard player={player} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
  
  it('shows correct bank total', () => {
    const player = createMockPlayer({
      bank: [
        { value: 10 },
        { value: 5 }
      ]
    });
    render(<OpponentCard player={player} />);
    expect(screen.getByText('Bank: $15M')).toBeInTheDocument();
  });
  
  it('highlights when targetable', () => {
    const player = createMockPlayer();
    const { container } = render(
      <OpponentCard player={player} isTargetable={true} />
    );
    expect(container.firstChild).toHaveClass('targetable');
  });
});
```

### Integration Tests

```typescript
describe('StadiumLayout', () => {
  it('arranges 4 players correctly', () => {
    const gameState = createMockGameState({ playerCount: 4 });
    render(<StadiumLayout gameState={gameState} />);
    
    const opponents = screen.getAllByRole('region', { name: /Opponent/ });
    expect(opponents).toHaveLength(3); // Excluding current player
  });
  
  it('handles opponent selection for action', async () => {
    const onSelect = jest.fn();
    render(<StadiumLayout onOpponentSelect={onSelect} />);
    
    const opponent = screen.getByLabelText('Opponent: Alice');
    await userEvent.click(opponent);
    
    expect(onSelect).toHaveBeenCalledWith('alice-id');
  });
});
```

### Visual Regression Tests

```typescript
// Using Playwright + Percy
test('stadium layout matches snapshot', async ({ page }) => {
  await page.goto('/game/test-room');
  await page.waitForSelector('[data-testid="stadium-layout"]');
  await percySnapshot(page, 'Stadium Layout - 4 Players');
});
```

### Performance Tests

```typescript
test('renders 6 opponents in under 100ms', async () => {
  const startTime = performance.now();
  
  render(<StadiumLayout gameState={create6PlayerGame()} />);
  
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100);
});
```

---

## ❓ OPEN QUESTIONS

### Design Questions

1. **Q**: Should we show exact card composition in bank or just total?
   **A**: Show total + top card only (maintains some mystery)

2. **Q**: How to handle 7+ players on mobile?
   **A**: Horizontal scrolling carousel with current player centered

3. **Q**: Should property sets auto-expand on hover or require click?
   **A**: Hover on desktop, click on mobile

4. **Q**: How to indicate which opponent is "winning"?
   **A**: Crown icon + gold border for player with most complete sets

### Technical Questions

1. **Q**: Should we use Canvas or DOM for card rendering?
   **A**: DOM for accessibility, Canvas for complex animations if needed

2. **Q**: How to handle network latency in animations?
   **A**: Optimistic updates + rollback on error

3. **Q**: Should we cache opponent data locally?
   **A**: Yes, with TTL of 30 seconds + invalidation on updates

4. **Q**: How to handle reconnection after disconnect?
   **A**: Fetch full game state, animate diff from last known state

---

## 📅 IMPLEMENTATION TIMELINE

### Phase 1: Core Components (Week 1)
- [ ] OpponentCard component
- [ ] BankDisplay component
- [ ] PropertySetDisplay component
- [ ] HandCountDisplay component
- [ ] Basic layout logic

### Phase 2: Layout & Positioning (Week 2)
- [ ] StadiumLayout component
- [ ] Responsive breakpoints
- [ ] Player positioning algorithm
- [ ] Animation system

### Phase 3: Interactions (Week 3)
- [ ] Hover states
- [ ] Click interactions
- [ ] Targeting system
- [ ] Keyboard navigation

### Phase 4: Polish & Testing (Week 4)
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Visual regression tests
- [ ] User acceptance testing

---

## 📊 SUCCESS METRICS

### User Experience
- ✅ 95%+ users can identify opponent's progress
- ✅ < 2 seconds to target opponent for action
- ✅ 90%+ users find layout intuitive (user testing)

### Technical
- ✅ 60fps animation performance
- ✅ < 100ms initial render
- ✅ WCAG 2.1 AA compliance
- ✅ 0 critical accessibility issues

### Business
- ✅ 30%+ increase in multiplayer engagement
- ✅ 50%+ reduction in "how do I target opponent" support tickets
- ✅ 4.5+ star rating for multiplayer experience

---

## 🔗 REFERENCES

1. [Monopoly Deal Official Rules](https://www.hasbro.com/common/instruct/MonopolyDeal.pdf)
2. [Card Game UI Best Practices](https://www.gamedeveloper.com/design/card-game-ui-design)
3. [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
4. [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

## 📝 CHANGELOG

### 2024-12-24
- Initial RFC draft
- Added detailed component specifications
- Defined layout patterns for 2-6 players
- Specified accessibility requirements
- Added performance considerations

---

## ✅ APPROVAL

**Pending Review By:**
- [ ] Product Manager
- [ ] UX Designer
- [ ] Frontend Lead
- [ ] Accessibility Specialist
- [ ] QA Lead

**Status**: 🟡 Draft - Awaiting Review
