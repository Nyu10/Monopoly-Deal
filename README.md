# Property Hustle (Monopoly Deal)

A real-time multiplayer card game implementation of Monopoly Deal with sophisticated AI opponents, built as a full-stack application with modern web technologies.

![Game Status](https://img.shields.io/badge/status-in%20development-yellow)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-green)
![React](https://img.shields.io/badge/React-18.3-blue)

## 🎮 What is This Project?

Property Hustle is a digital implementation of the popular Monopoly Deal card game, featuring:

- **Real-time multiplayer gameplay** with WebSocket communication
- **Intelligent AI opponents** with strategic decision-making
- **Complete rule implementation** including all card types and game mechanics
- **Modern, responsive UI** with smooth animations and visual feedback
- **Turn-based gameplay** with automatic state synchronization

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   UI Layer   │  │  WebSocket   │  │  State Mgmt  │     │
│  │  Components  │  │    Client    │  │   (Hooks)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket (STOMP)
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Spring Boot)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   REST API   │  │  WebSocket   │  │ Game Engine  │     │
│  │  Controller  │  │   Handler    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Bot Engine  │  │     Rent     │  │    Deck      │     │
│  │   (AI Logic) │  │  Calculator  │  │  Generator   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🧠 Why This is Technically Complex

### 1. **Stateful Game Logic with Complex Rule Validation**

**Challenge**: Monopoly Deal has intricate rules with many edge cases:
- Properties can be wild cards (multi-color)
- Complete sets have different requirements (2-4 cards depending on color)
- Action cards can be countered with "Just Say No" cards
- Rent calculations vary based on set completion and buildings
- Payment can be made with any combination of money, properties, or action cards

**Solution**: 
- Implemented a comprehensive `GameState` model that tracks all game entities
- Created a `RentCalculator` service that handles complex rent logic
- Built validation layers to prevent illegal moves
- Designed a flexible card system with inheritance and composition

```java
// Example: Complex rent calculation
public int calculateRent(Player player, String color) {
    PropertySet set = getPropertySet(player, color);
    int baseRent = RENT_VALUES.get(color)[set.size() - 1];
    
    if (set.isComplete()) {
        baseRent *= 2; // Double rent for complete sets
        baseRent += set.getHouses() * 3; // +3M per house
        baseRent += set.getHotels() * 4; // +4M per hotel
    }
    
    return baseRent;
}
```

### 2. **Real-Time Multiplayer with State Synchronization**

**Challenge**: Multiple players need to see consistent game state in real-time, with actions from one player immediately reflected to all others.

**Solution**:
- WebSocket implementation using STOMP protocol over SockJS
- Server-authoritative game state (backend is source of truth)
- Optimistic UI updates with server reconciliation
- Thread-safe game state management using `ConcurrentHashMap` and locks

```java
public class GameRoom {
    private final ReentrantLock lock = new ReentrantLock();
    
    public void executeWithLock(Runnable action) {
        lock.lock();
        try {
            action.run();
        } finally {
            lock.unlock();
        }
    }
}
```

### 3. **Intelligent AI Opponents**

**Challenge**: Creating bot players that make strategic decisions, not just random moves.

**Solution**: Multi-layered decision-making system:

```java
public Move calculateBestMove(GameState state, int botId) {
    // Priority 1: Win condition (complete 3rd set)
    if (canWinThisTurn(state, botId)) {
        return getWinningMove(state, botId);
    }
    
    // Priority 2: Block opponent from winning
    if (opponentCloseToWinning(state, botId)) {
        return getBlockingMove(state, botId);
    }
    
    // Priority 3: Build property sets
    Move propertyMove = getBestPropertyMove(state, botId);
    if (propertyMove != null) return propertyMove;
    
    // Priority 4: Economic strategy (banking high-value cards)
    // Priority 5: Defensive plays
    // ...
}
```

**AI Features**:
- Evaluates multiple move options and selects optimal strategy
- Considers opponent positions and threats
- Manages resources (when to bank vs. when to play)
- Handles complex card interactions (Sly Deal, Deal Breaker, etc.)

### 4. **Payment System with Flexible Asset Selection**

**Challenge**: Players can pay debts using any combination of cards (money, properties, action cards), and the system must:
- Calculate total value correctly
- Allow partial payments with overpayment
- Handle property transfers that may break complete sets
- Validate building removals when sets are broken

**Solution**:
```java
private List<Card> selectCardsForPayment(Player player, int amount) {
    List<Card> selected = new ArrayList<>();
    int total = 0;
    
    // Priority: Money > Action Cards > Properties (preserve sets)
    List<Card> sortedAssets = sortAssetsByPaymentPriority(player);
    
    for (Card card : sortedAssets) {
        if (total >= amount) break;
        selected.add(card);
        total += card.value;
    }
    
    // Validate and handle set breaking
    validateBuildingIntegrity(player, selected);
    
    return selected;
}
```

### 5. **Turn Management with Automatic Progression**

**Challenge**: Coordinating turn flow between human and AI players:
- Humans need time to make decisions
- Bots should play automatically but with realistic delays
- Turn must auto-end after 3 actions
- State must be consistent across all clients

**Solution**:
- Asynchronous bot turn execution with delays for UX
- Action counter that automatically triggers turn end
- State broadcasting after each significant action
- Queue system for pending reactions (Just Say No, payment requests)

```java
private void triggerBotTurnIfNeeded(String roomId, GameState state) {
    Player activePlayer = state.getPlayers().get(state.getTurnContext().getActivePlayerId());
    
    if (!activePlayer.isHuman()) {
        new Thread(() -> {
            Thread.sleep(1500); // Realistic delay
            executeBotTurn(roomId, activePlayer.getId());
        }).start();
    }
}
```

### 6. **Complex Card Interactions and Chaining**

**Challenge**: Some actions can be countered, which can be counter-countered:
- Player A plays "Sly Deal"
- Player B plays "Just Say No"
- Player A plays another "Just Say No" to cancel the cancellation

**Solution**:
- Reaction queue system
- State machine for action resolution
- Timeout mechanisms for human responses

### 7. **Frontend State Management Without Redux**

**Challenge**: Managing complex game state in React without a state management library.

**Solution**:
- Custom hooks for WebSocket connection and game state
- Optimistic updates with rollback capability
- Local state for UI interactions (card selection, animations)
- Effect hooks for automatic turn progression

```javascript
useEffect(() => {
    if (movesLeft === 0 && gameState === 'PLAYING' && turnIndex === 0) {
        const timer = setTimeout(() => {
            endTurn(0);
        }, 1500);
        return () => clearTimeout(timer);
    }
}, [movesLeft, gameState, turnIndex]);
```

### 8. **Deck Management and Shuffling**

**Challenge**: Generating the exact official Monopoly Deal deck with correct card counts and handling deck exhaustion.

**Solution**:
- `DeckGenerator` service that creates the official 106-card deck
- Automatic reshuffling of discard pile when deck is empty
- Proper randomization using Fisher-Yates shuffle
- Card uniqueness tracking with UIDs

## 🛠️ Technology Stack

### Backend
- **Java 21** - Latest LTS with modern language features
- **Spring Boot 3.4.0** - Enterprise-grade framework
- **Spring WebSocket** - Real-time bidirectional communication
- **Maven** - Dependency management and build tool

### Frontend
- **React 18.3** - Modern UI library with hooks
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first styling
- **STOMP.js** - WebSocket client protocol
- **Lucide React** - Icon library

## 📁 Project Structure

```
monopoly-deal/
├── backend-java/
│   ├── src/main/java/com/game/
│   │   ├── model/              # Game entities (Card, Player, GameState)
│   │   ├── service/            # Business logic (GameEngine, BotEngine)
│   │   ├── controller/         # REST and WebSocket endpoints
│   │   └── config/             # Spring configuration
│   └── pom.xml
│
├── frontend-react/
│   ├── src/
│   │   ├── components/         # React components (Board, Card, PlayerHand)
│   │   ├── utils/              # Helper functions (gameHelpers)
│   │   └── App.jsx             # Main application component
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 18+ and npm
- Maven 3.8+

### Running the Backend
```bash
cd backend-java
mvn spring-boot:run
```
Backend will start on `http://localhost:8080`

### Running the Frontend
```bash
cd frontend-react
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`

## 🎯 Key Features Implemented

- ✅ Complete card deck generation (106 official cards)
- ✅ Turn-based gameplay with 3-action limit
- ✅ Property set tracking and completion detection
- ✅ Rent calculation with buildings (House/Hotel)
- ✅ Action cards: Pass Go, Sly Deal, Forced Deal, Deal Breaker, Debt Collector, Birthday
- ✅ Payment system with flexible asset selection
- ✅ AI opponents with strategic decision-making
- ✅ Real-time multiplayer via WebSocket
- ✅ Automatic turn progression
- ✅ Win condition detection (3 complete sets)
- ✅ Responsive UI with animations

## 🔮 Future Enhancements

- [ ] "Just Say No" reaction system
- [ ] Double Rent action card
- [ ] Property wild card color switching
- [ ] Multiplayer lobby system
- [ ] Player authentication
- [ ] Game history and replay
- [ ] Advanced AI difficulty levels
- [ ] Mobile-responsive design improvements
- [ ] Sound effects and music
- [ ] Tournament mode

## 🧪 Technical Highlights

1. **Concurrency Control**: Thread-safe game state management using locks
2. **Event-Driven Architecture**: WebSocket-based real-time updates
3. **Domain-Driven Design**: Rich domain models with business logic
4. **Separation of Concerns**: Clear layering (Controller → Service → Model)
5. **Reactive UI**: Optimistic updates with server reconciliation
6. **Strategic AI**: Multi-factor decision-making algorithm
7. **Type Safety**: Strong typing in both Java and TypeScript-adjacent patterns

## 📝 License

This project is for educational purposes. Monopoly Deal is a trademark of Hasbro.

## 👨‍💻 Author

Built as a technical showcase demonstrating full-stack development, real-time systems, game logic implementation, and AI programming.

---

**Note**: This is a complex project that demonstrates advanced software engineering concepts including distributed systems, game theory, AI algorithms, and real-time communication protocols.
