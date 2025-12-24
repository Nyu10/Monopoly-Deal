# 🏗️ MONOPOLY DEAL - FRONTEND/BACKEND ARCHITECTURE

**Architecture Pattern**: Client-Server with WebSocket Real-Time Communication  
**Backend**: Java Spring Boot (Port 8080)  
**Frontend**: React + Vite (Port 5173)  
**Communication**: WebSocket (STOMP protocol)

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              FRONTEND (React + Vite)                      │ │
│  │              Port: 5173                                   │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   App.jsx   │  │ Components   │  │  useGameSocket  │ │ │
│  │  │             │  │              │  │     (Hook)      │ │ │
│  │  │  - Routing  │  │ - Board      │  │                 │ │ │
│  │  │  - Layout   │  │ - PlayerHand │  │ - WebSocket     │ │ │
│  │  │             │  │ - Card       │  │ - State Mgmt    │ │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │                                              ▲            │ │
│  │                                              │            │ │
│  └──────────────────────────────────────────────┼────────────┘ │
│                                                 │              │
└─────────────────────────────────────────────────┼──────────────┘
                                                  │
                                    WebSocket Connection
                                    (STOMP over SockJS)
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER                                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           BACKEND (Spring Boot + Java 21)                 │ │
│  │                Port: 8080                                 │ │
│  │                                                           │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │         WebSocket Layer                          │    │ │
│  │  │  ┌────────────────┐  ┌──────────────────────┐   │    │ │
│  │  │  │ WebSocketConfig│  │  GameController      │   │    │ │
│  │  │  │                │  │                      │   │    │ │
│  │  │  │ - /ws-game     │  │  @MessageMapping     │   │    │ │
│  │  │  │ - STOMP        │  │  - /game/{id}/move   │   │    │ │
│  │  │  │ - /topic       │  │  - /game/{id}/start  │   │    │ │
│  │  │  └────────────────┘  │  - /game/{id}/state  │   │    │ │
│  │  │                      └──────────────────────┘   │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │                            ▼                              │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │         Service Layer (Business Logic)           │    │ │
│  │  │  ┌────────────┐  ┌──────────┐  ┌─────────────┐  │    │ │
│  │  │  │GameEngine  │  │BotEngine │  │RentCalculator│ │    │ │
│  │  │  │            │  │          │  │             │  │    │ │
│  │  │  │- Game Rooms│  │- AI Logic│  │- Rent Calc  │  │    │ │
│  │  │  │- Turn Mgmt │  │- Strategy│  │- Set Check  │  │    │ │
│  │  │  │- Card Logic│  │- Targeting│ │             │  │    │ │
│  │  │  └────────────┘  └──────────┘  └─────────────┘  │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │                            ▼                              │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │         Model Layer (Data Structures)            │    │ │
│  │  │  ┌──────────┐  ┌────────┐  ┌────────────────┐   │    │ │
│  │  │  │GameState │  │ Player │  │ Card           │   │    │ │
│  │  │  │          │  │        │  │                │   │    │ │
│  │  │  │- Players │  │- Hand  │  │- Properties    │   │    │ │
│  │  │  │- Deck    │  │- Bank  │  │- Actions       │   │    │ │
│  │  │  │- Turn    │  │- Props │  │- Money         │   │    │ │
│  │  │  └──────────┘  └────────┘  └────────────────┘   │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 COMMUNICATION FLOW

### 1. **Initial Connection**
```
Frontend                          Backend
   │                                 │
   │  1. Connect to /ws-game         │
   ├────────────────────────────────>│
   │                                 │
   │  2. WebSocket Established       │
   │<────────────────────────────────┤
   │                                 │
   │  3. Subscribe to /topic/game    │
   ├────────────────────────────────>│
   │                                 │
```

### 2. **Starting a Game**
```
Frontend                          Backend
   │                                 │
   │  Send: /app/game/{id}/start     │
   ├────────────────────────────────>│
   │                                 │ GameEngine.createGame()
   │                                 │ - Create 4 players
   │                                 │ - Generate deck
   │                                 │ - Deal cards
   │                                 │
   │  Broadcast: /topic/game/{id}    │
   │  (GameState JSON)               │
   │<────────────────────────────────┤
   │                                 │
   │  React re-renders with state    │
   │                                 │
```

### 3. **Player Makes a Move**
```
Frontend                          Backend
   │                                 │
   │  User clicks "Draw Cards"       │
   │                                 │
   │  Send: /app/game/{id}/move      │
   │  { type: "DRAW", playerId: 0 }  │
   ├────────────────────────────────>│
   │                                 │ GameEngine.processMove()
   │                                 │ - Validate turn
   │                                 │ - Execute move
   │                                 │ - Update state
   │                                 │
   │  Broadcast: /topic/game/{id}    │
   │  (Updated GameState)            │
   │<────────────────────────────────┤
   │                                 │
   │  UI updates automatically       │
   │                                 │
```

### 4. **Bot Turn (Automatic)**
```
Frontend                          Backend
   │                                 │
   │                                 │ After player ends turn:
   │                                 │ GameEngine.triggerBotTurnIfNeeded()
   │                                 │    │
   │                                 │    ├─> BotEngine.calculateBestMove()
   │                                 │    │   - Analyze game state
   │                                 │    │   - Choose optimal action
   │                                 │    │
   │                                 │    ├─> GameEngine.processMove()
   │                                 │    │   - Execute bot's move
   │                                 │    │
   │  Broadcast: /topic/game/{id}    │    │
   │  (Updated GameState)            │<───┘
   │<────────────────────────────────┤
   │                                 │
   │  UI shows bot's action          │
   │                                 │
```

---

## 📁 FILE STRUCTURE

### Backend (Java Spring Boot)
```
backend-java/
├── src/main/java/com/game/
│   ├── config/
│   │   └── WebSocketConfig.java          # WebSocket configuration
│   │       - Enables STOMP messaging
│   │       - Configures /ws-game endpoint
│   │       - Sets up /topic and /app prefixes
│   │
│   ├── controller/
│   │   └── GameController.java           # WebSocket message handlers
│   │       - @MessageMapping("/game/{id}/move")
│   │       - @MessageMapping("/game/{id}/start")
│   │       - @SendTo("/topic/game/{id}")
│   │
│   ├── service/
│   │   ├── GameEngine.java               # Core game logic
│   │   │   - processMove()
│   │   │   - createGame()
│   │   │   - handleDraw/Play/EndTurn
│   │   │   - Thread-safe game rooms
│   │   │
│   │   ├── BotEngine.java                # AI logic
│   │   │   - calculateBestMove()
│   │   │   - selectCardsForPayment()
│   │   │   - shouldUseJustSayNo()
│   │   │
│   │   └── RentCalculator.java           # Rent calculations
│   │       - calculateRent()
│   │       - hasCompleteSet()
│   │
│   └── model/
│       ├── GameState.java                # Game state model
│       │   - Players, deck, discard
│       │   - TurnContext
│       │   - Serialized to JSON
│       │
│       ├── Player.java                   # Player model
│       ├── Card.java                     # Card model
│       └── Move.java                     # Move model
│
└── pom.xml                               # Maven dependencies
    - spring-boot-starter-websocket
    - spring-boot-starter-web
```

### Frontend (React + Vite)
```
frontend-react/
├── src/
│   ├── hooks/
│   │   └── useGameSocket.js              # WebSocket hook
│   │       - Manages WebSocket connection
│   │       - Subscribes to game updates
│   │       - Provides sendMove() function
│   │       - Returns gameState
│   │
│   ├── components/
│   │   ├── Board.jsx                     # Main game board
│   │   │   - Uses useGameSocket()
│   │   │   - Displays game state
│   │   │   - Handles user actions
│   │   │
│   │   ├── PlayerHand.jsx                # Player's cards
│   │   ├── Card.jsx                      # Card component
│   │   └── HowToPlay.jsx                 # Instructions
│   │
│   ├── App.jsx                           # Main app component
│   │   - Routing
│   │   - Layout
│   │
│   └── main.jsx                          # Entry point
│
├── package.json                          # npm dependencies
│   - @stomp/stompjs
│   - sockjs-client
│   - react
│
└── vite.config.js                        # Vite configuration
```

---

## 🔌 WEBSOCKET PROTOCOL (STOMP)

### Message Format

**Client → Server** (Send Move)
```javascript
{
  destination: '/app/game/room-123/move',
  body: JSON.stringify({
    playerId: 0,
    type: 'PLAY_CARD',
    cardUid: 'abc-123',
    targetPlayerId: 1,
    targetCardUid: null
  })
}
```

**Server → Client** (Broadcast State)
```javascript
{
  topic: '/topic/game/room-123',
  body: JSON.stringify({
    gameId: 'room-123',
    status: 'PLAYING',
    players: [...],
    deck: [...],
    turnContext: {
      activePlayerId: 1,
      actionsRemaining: 2
    },
    logs: [...]
  })
}
```

---

## 🎯 KEY ARCHITECTURAL DECISIONS

### 1. **Separation of Concerns**
- **Backend**: Pure business logic, no UI concerns
- **Frontend**: Pure presentation, no game logic
- **Communication**: Clean JSON over WebSocket

### 2. **Real-Time Updates**
- **WebSocket** instead of REST for instant updates
- **STOMP protocol** for structured messaging
- **Broadcast pattern** - all clients get updates

### 3. **Stateful Backend**
- **In-memory game rooms** (ConcurrentHashMap)
- **Thread-safe** operations
- **No database** needed for bot game

### 4. **Reactive Frontend**
- **React hooks** for state management
- **Automatic re-rendering** on state updates
- **Single source of truth** (backend state)

### 5. **Bot Integration**
- **Server-side bots** (no client needed)
- **Automatic turn execution**
- **Broadcast bot moves** to all clients

---

## 🚀 DATA FLOW EXAMPLE

### Complete Turn Cycle

```
1. USER ACTION (Frontend)
   └─> User clicks "Play Property Card"
   └─> Board.jsx calls sendMove()
   └─> useGameSocket.js sends WebSocket message

2. MESSAGE ROUTING (Spring)
   └─> WebSocketConfig routes to GameController
   └─> @MessageMapping("/game/{id}/move") receives message
   └─> Calls GameEngine.processMove()

3. GAME LOGIC (Backend)
   └─> GameEngine validates move
   └─> Executes handlePlayCard()
   └─> Updates GameState
   └─> Checks win condition
   └─> Triggers bot turn if needed

4. BOT TURN (Backend)
   └─> BotEngine.calculateBestMove()
   └─> Analyzes game state
   └─> Selects optimal action
   └─> GameEngine.processMove() for bot

5. STATE BROADCAST (Spring)
   └─> @SendTo("/topic/game/{id}")
   └─> Serializes GameState to JSON
   └─> Broadcasts to all subscribed clients

6. UI UPDATE (Frontend)
   └─> useGameSocket receives message
   └─> Updates gameState in React state
   └─> React re-renders components
   └─> User sees updated board
```

---

## 🔒 THREAD SAFETY

### GameRoom Locking
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

**Why?** Multiple WebSocket messages could arrive simultaneously. Locks prevent race conditions.

---

## 🌐 PORTS & ENDPOINTS

### Backend (Port 8080)
- **WebSocket**: `ws://localhost:8080/ws-game`
- **STOMP Endpoints**:
  - `/app/game/{roomId}/move` - Send moves
  - `/app/game/{roomId}/start` - Start game
  - `/app/game/{roomId}/state` - Get state
- **Broadcast Topic**: `/topic/game/{roomId}`

### Frontend (Port 5173)
- **Dev Server**: `http://localhost:5173`
- **WebSocket Client**: Connects to backend
- **Environment Variable**: `VITE_API_URL`

---

## 📦 DEPENDENCIES

### Backend (Maven)
```xml
<dependencies>
    <!-- WebSocket Support -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    
    <!-- Web Support -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### Frontend (npm)
```json
{
  "dependencies": {
    "@stomp/stompjs": "^7.0.0",  // STOMP protocol
    "sockjs-client": "^1.6.1",   // WebSocket fallback
    "react": "^18.2.0",          // UI framework
    "react-router-dom": "^6.x"   // Routing
  }
}
```

---

## ✅ ADVANTAGES OF THIS ARCHITECTURE

### 1. **Real-Time Gameplay**
- Instant updates for all players
- No polling needed
- Smooth bot animations

### 2. **Scalability**
- Stateless frontend (can deploy anywhere)
- Backend can handle multiple game rooms
- Thread-safe concurrent games

### 3. **Maintainability**
- Clear separation of concerns
- Backend can be tested independently
- Frontend can be redesigned without backend changes

### 4. **Performance**
- WebSocket is faster than HTTP polling
- JSON serialization is efficient
- In-memory state is fast

### 5. **Development Experience**
- Hot reload on both frontend and backend
- Independent development
- Easy debugging

---

## 🎮 HOW TO RUN

### Start Backend
```bash
cd backend-java
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Start Frontend
```bash
cd frontend-react
npm run dev
# Runs on http://localhost:5173
```

### Connection Flow
1. Frontend starts on port 5173
2. Backend starts on port 8080
3. User opens `http://localhost:5173`
4. Frontend connects to `ws://localhost:8080/ws-game`
5. Game begins!

---

## 🔍 DEBUGGING

### Backend Logs
```
INFO com.game.service.GameEngine -- Processing move: DRAW for player 0
INFO com.game.service.GameEngine -- Triggering bot turn for player 1
```

### Frontend Console
```javascript
console.log('WebSocket connected:', connected);
console.log('Game state:', gameState);
```

### Network Tab
- See WebSocket frames
- Monitor STOMP messages
- Debug connection issues

---

## 🎯 SUMMARY

Your architecture is a **modern, real-time client-server application** with:

- ✅ **Clean separation** between frontend and backend
- ✅ **WebSocket** for real-time communication
- ✅ **STOMP protocol** for structured messaging
- ✅ **React hooks** for state management
- ✅ **Spring Boot** for robust backend
- ✅ **Thread-safe** game rooms
- ✅ **JSON** for data exchange
- ✅ **Scalable** architecture

**Perfect for a multiplayer card game!** 🎉
