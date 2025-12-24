import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AlertCircle, RotateCcw, Check, X, DollarSign, Layers, Trophy, MessageSquare, Sparkles, Send, MapPin, User, Cpu, ShieldAlert, HandMetal, Home, Building, SkipForward, Info, BookOpen } from 'lucide-react';
import HowToPlay from './components/HowToPlay';

// --- API & Configuration ---
const apiKey = ""; // API Key injected by environment

const SYSTEM_RULES = `
You are the "Monopoly Deal Banker".
Rules:
- Objective: 3 full property sets wins.
- 5 cards start hand. Draw 2 per turn (5 if empty hand).
- Max 3 plays per turn.
- Discard to 7 at end.
- Deal Breaker: Steals full set.
- Sly/Forced Deal: Cannot touch full sets.
- JSN: Cancels action.
- Payment: No change given.
`;

async function callGemini(prompt, context = "commentary") {
  if (!apiKey) return "AI: (API Key missing)";
  const fullPrompt = context === "rules" 
    ? `${SYSTEM_RULES}\nUser asks: ${prompt}\nAnswer briefly.`
    : `${SYSTEM_RULES}\nGame Event: ${prompt}\nWrite a 1-sentence witty comment about this move.`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "...";
  } catch (e) { return null; }
}

// --- Data Models & Constants ---

const COLORS = {
  brown: { hex: '#5D4037', count: 2, name: 'Brown', rent: [1, 2] },
  blue: { hex: '#1565C0', count: 2, name: 'Dark Blue', rent: [3, 8] },
  green: { hex: '#2E7D32', count: 3, name: 'Green', rent: [2, 4, 7] },
  yellow: { hex: '#FBC02D', count: 3, name: 'Yellow', text: 'black', rent: [2, 4, 6] },
  orange: { hex: '#EF6C00', count: 3, name: 'Orange', rent: [1, 3, 5] },
  pink: { hex: '#D81B60', count: 3, name: 'Pink', rent: [1, 2, 4] },
  red: { hex: '#C62828', count: 3, name: 'Red', rent: [2, 3, 6] },
  cyan: { hex: '#00BCD4', count: 3, name: 'Light Blue', rent: [1, 2, 3] },
  utility: { hex: '#9E9D24', count: 2, name: 'Utility', text: 'black', rent: [1, 2] },
  railroad: { hex: '#212121', count: 4, name: 'Railroad', rent: [1, 2, 4, 8] },
  multi: { hex: '#fff', count: 0, name: 'Multi', text: 'black', rent: [] } // For Rainbow Wilds
};

const CARD_TYPES = {
  PROPERTY: 'PROPERTY',
  ACTION: 'ACTION',
  MONEY: 'MONEY',
  RENT: 'RENT',
  PROPERTY_WILD: 'PROPERTY_WILD',
  RENT_WILD: 'RENT_WILD'
};

const ACTION_TYPES = {
  PASS_GO: 'PASS_GO',
  DEAL_BREAKER: 'DEAL_BREAKER',
  JUST_SAY_NO: 'JUST_SAY_NO',
  SLY_DEAL: 'SLY_DEAL',
  FORCED_DEAL: 'FORCED_DEAL',
  DEBT_COLLECTOR: 'DEBT_COLLECTOR',
  BIRTHDAY: 'BIRTHDAY',
  HOUSE: 'HOUSE',
  HOTEL: 'HOTEL',
  DOUBLE_RENT: 'DOUBLE_RENT'
};

// --- Utilities ---
const shuffle = (array) => {
  let cur = array.length, rand;
  while (cur !== 0) {
    rand = Math.floor(Math.random() * cur);
    cur--;
    [array[cur], array[rand]] = [array[rand], array[cur]];
  }
  return array;
};

const generateOfficialDeck = () => {
  let deck = [];
  let id = 0;
  const add = (card, qty) => {
    for (let i = 0; i < qty; i++) {
      deck.push({ ...card, id: `card-${id++}`, uid: Math.random().toString(36).substr(2, 9) });
    }
  };

  // 1. Money (20)
  add({ type: CARD_TYPES.MONEY, value: 10, name: '$10M' }, 1);
  add({ type: CARD_TYPES.MONEY, value: 5, name: '$5M' }, 2);
  add({ type: CARD_TYPES.MONEY, value: 4, name: '$4M' }, 3);
  add({ type: CARD_TYPES.MONEY, value: 3, name: '$3M' }, 3);
  add({ type: CARD_TYPES.MONEY, value: 2, name: '$2M' }, 5);
  add({ type: CARD_TYPES.MONEY, value: 1, name: '$1M' }, 6);

  // 2. Properties (28 Solid)
  const props = [
    { c: 'brown', n: ['Baltic Ave', 'Mediterranean Ave'], v: 1 },
    { c: 'blue', n: ['Boardwalk', 'Park Place'], v: 4 },
    { c: 'green', n: ['NC Ave', 'Pacific Ave', 'Penn Ave'], v: 4 },
    { c: 'yellow', n: ['Marvin Gdn', 'Ventnor Ave', 'Atlantic Ave'], v: 3 },
    { c: 'orange', n: ['New York Ave', 'St. James', 'Tennessee'], v: 2 },
    { c: 'pink', n: ['St. Charles', 'Virginia Ave', 'States Ave'], v: 2 },
    { c: 'red', n: ['Kentucky', 'Indiana', 'Illinois'], v: 3 },
    { c: 'cyan', n: ['Oriental', 'Vermont', 'Connecticut'], v: 1 },
    { c: 'railroad', n: ['B&O', 'Short', 'Reading', 'Penn'], v: 2 },
    { c: 'utility', n: ['Electric', 'Water'], v: 2 }
  ];
  props.forEach(p => p.n.forEach(name => add({ type: CARD_TYPES.PROPERTY, color: p.c, name, value: p.v }, 1)));

  // 3. Wild Properties (11)
  const duals = [
    { c: ['blue', 'green'], v: 4 }, { c: ['cyan', 'brown'], v: 1 }, 
    { c: ['pink', 'orange'], v: 2 }, { c: ['pink', 'orange'], v: 2 },
    { c: ['red', 'yellow'], v: 3 }, { c: ['red', 'yellow'], v: 3 },
    { c: ['railroad', 'green'], v: 4 }, { c: ['railroad', 'cyan'], v: 4 }, { c: ['railroad', 'utility'], v: 2 }
  ];
  duals.forEach(d => add({ type: CARD_TYPES.PROPERTY_WILD, colors: d.c, value: d.v, name: `${COLORS[d.c[0]].name}/${COLORS[d.c[1]].name} Wild`, currentColor: d.c[0] }, 1));
  
  // Rainbows (2)
  add({ type: CARD_TYPES.PROPERTY_WILD, colors: ['any'], value: 0, name: 'Rainbow Wild', currentColor: 'multi', isRainbow: true }, 2);

  // 4. Action Cards (34)
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DEAL_BREAKER, value: 5, name: 'Deal Breaker', description: 'Steal a complete set' }, 2);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.JUST_SAY_NO, value: 4, name: 'Just Say No', description: 'Cancel action against you' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.SLY_DEAL, value: 3, name: 'Sly Deal', description: 'Steal a property (non-complete)' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.FORCED_DEAL, value: 3, name: 'Forced Deal', description: 'Swap properties (non-complete)' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DEBT_COLLECTOR, value: 3, name: 'Debt Collector', description: 'Force 1 player to pay $5M' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.BIRTHDAY, value: 2, name: 'It\'s My Birthday', description: 'All pay you $2M' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.PASS_GO, value: 1, name: 'Pass Go', description: 'Draw 2 cards' }, 10);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3, name: 'House', description: '+3M Rent on Full Set' }, 3);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOTEL, value: 4, name: 'Hotel', description: '+4M Rent on Full Set with House' }, 2);
  add({ type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DOUBLE_RENT, value: 1, name: 'Double The Rent', description: '2x Rent Amount' }, 2);

  // 5. Rent Cards (13)
  const rents = [
    ['blue', 'green'], ['red', 'yellow'], ['pink', 'orange'], ['cyan', 'brown'], ['railroad', 'utility']
  ];
  rents.forEach(r => add({ type: CARD_TYPES.RENT, colors: r, value: 1, name: `${COLORS[r[0]].name}/${COLORS[r[1]].name} Rent` }, 2));
  add({ type: CARD_TYPES.RENT_WILD, colors: ['any'], value: 3, name: 'Wild Rent', description: 'Force 1 player to pay rent' }, 3);

  return shuffle(deck);
};

// --- Logic Helpers ---

const getSets = (properties) => {
  if (!properties) return [];
  const sets = {};
  properties.forEach(card => {
      let color = card.color || card.currentColor;
      if (card.isRainbow && color === 'multi') color = 'any_rainbow'; 
      
      if (!sets[color]) sets[color] = { color, cards: [], houses: 0, hotels: 0 };
      
      if (card.actionType === ACTION_TYPES.HOUSE) sets[color].houses++;
      else if (card.actionType === ACTION_TYPES.HOTEL) sets[color].hotels++;
      else sets[color].cards.push(card);
  });

  return Object.values(sets).map(set => {
      if (set.color === 'any_rainbow') return { ...set, isComplete: false, rent: 0 }; 
      const def = COLORS[set.color];
      if (!def) return { ...set, isComplete: false, rent: 0 }; 
      
      const isComplete = set.cards.length >= def.count;
      let rentIndex = Math.min(set.cards.length - 1, def.rent.length - 1);
      let rent = def.rent[rentIndex] || 0;
      if (isComplete) {
          if (set.houses) rent += 3;
          if (set.hotels) rent += 4;
      }
      return { ...set, isComplete, rent };
  });
};

const countCompletedSets = (properties) => {
    return getSets(properties).filter(s => s.isComplete).length;
};

// --- Components ---

const CardComponent = ({ card, onClick, size = 'md', faceDown = false, selected = false, className = '', style = {}, highlighted = false }) => {
  if (faceDown) {
    return (
      <div 
        className={`${size === 'sm' ? 'w-10 h-14' : size === 'lg' ? 'w-36 h-56' : 'w-24 h-36'} bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border-2 border-white/20 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer ${className}`}
        onClick={onClick} style={style}
      >
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
        <div className="absolute inset-2 border border-white/10 rounded-lg"></div>
        <div className="z-10 text-center transform transition duration-500 group-hover:scale-110 group-hover:rotate-3">
            <div className="text-white font-serif italic font-black text-2xl tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">DEAL</div>
            <div className="bg-amber-500 text-black text-[0.4rem] px-1.5 py-0.5 font-black uppercase tracking-[0.2em] mt-1 rounded-sm">Hustle</div>
        </div>
      </div>
    );
  }

  const isProp = card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD;
  const isMoney = card.type === CARD_TYPES.MONEY;
  const isAction = card.type === CARD_TYPES.ACTION || card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD || card.type === CARD_TYPES.JSN;

  let headerColor = '#fff';
  let textColor = 'black';
  let bgClass = 'bg-[#ffffff]';
  
  if (card.isRainbow) {
     headerColor = 'transparent';
     textColor = 'white';
     bgClass = 'bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 via-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-indigo-500';
  } else if (isProp) {
      const cCode = card.currentColor || card.color;
      if (cCode && COLORS[cCode]) {
          headerColor = COLORS[cCode].hex;
          textColor = COLORS[cCode].text || 'white';
      }
  } else if (isMoney) {
      headerColor = '#10b981'; textColor = 'white';
  } else if (isAction) {
      headerColor = '#f59e0b'; textColor = 'white';
  }

  const borderColor = selected ? 'ring-4 ring-amber-500 ring-offset-4 ring-offset-slate-900 border-amber-400' : highlighted ? 'ring-4 ring-red-500 animate-pulse' : 'border-white/10 hover:border-white/30';

  return (
    <div 
      onClick={() => onClick && onClick(card)}
      className={`
        ${size === 'sm' ? 'w-10 h-14 text-[6px]' : size === 'lg' ? 'w-48 h-72' : 'w-24 h-36'} 
        ${card.isRainbow ? bgClass : 'bg-white'} rounded-xl shadow-2xl border-2 ${borderColor} cursor-pointer 
        transform transition-all duration-300 relative overflow-hidden flex flex-col select-none
        ${selected ? '-translate-y-8 z-50 scale-110 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]' : 'hover:-translate-y-4 hover:z-40 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]'}
        ${className}
      `}
      style={style}
    >
      {/* Gloss Effect */}
      <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10"></div>
      
      {/* Header */}
      <div className="h-[22%] w-full flex items-center justify-between px-2 font-black uppercase tracking-tighter shadow-md z-20 relative pt-1"
        style={{ background: headerColor, color: textColor }}>
        <span className="truncate text-[0.55rem] leading-none max-w-[70%] drop-shadow-sm">{card.name}</span>
        <span className="text-[0.6rem] font-mono">${card.value}M</span>
      </div>

      <div className={`flex-1 flex flex-col items-center justify-center p-0 text-center relative overflow-hidden ${card.isRainbow ? '' : 'bg-[#fff] pattern-paper'}`}>
         {/* Subtle pattern for non-rainbow cards */}
         {!card.isRainbow && (
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '8px 8px'}}></div>
         )}

         {card.isRainbow && (
             <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center">
                 <div className="animate-spin-slow absolute inset-0 opacity-40 bg-[conic-gradient(from_0deg,transparent_0_300deg,white_360deg)]"></div>
                 <Sparkles className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" size={44} />
             </div>
         )}

         {isProp && !card.isRainbow && COLORS[card.currentColor || card.color]?.img && (
            <div className="absolute inset-0 z-0">
                <img src={COLORS[card.currentColor || card.color].img} alt="prop" className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
         )}
         
         {!isProp && !card.isRainbow && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none z-0">
                {isMoney ? <DollarSign size={60}/> : card.actionType === ACTION_TYPES.JUST_SAY_NO ? <ShieldAlert size={60}/> : card.actionType === ACTION_TYPES.HOUSE ? <Home size={60}/> : <Sparkles size={60}/>}
            </div>
         )}

        {isProp && (
            <div className="absolute bottom-4 left-0 right-0 z-10 px-2">
                <div className="font-black text-white text-[0.6rem] drop-shadow-lg leading-tight flex items-center justify-center gap-1 uppercase tracking-widest">
                    <MapPin size={8} className="text-amber-400"/> {card.name}
                </div>
            </div>
        )}
        
        {isAction && <div className="font-black text-amber-950 text-[0.7rem] uppercase mb-1 leading-tight z-10 p-2 italic tracking-tighter">{card.name}</div>}
        {isMoney && <div className="font-black text-emerald-600 text-3xl z-10 drop-shadow-sm font-serif">${card.value}M</div>}
        {isAction && <div className="px-2 z-10 mb-2">
            <p className="text-[0.45rem] font-bold text-slate-700 leading-tight bg-white/80 py-1.5 px-2 rounded-lg border border-slate-200 shadow-sm">{card.description}</p>
        </div>}
      </div>
      
      {/* Value Badge */}
      <div className="absolute bottom-1 right-1 text-slate-400 text-[0.4rem] font-black bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-100 z-20 shadow-xs tracking-widest opacity-50">${card.value}M</div>
    </div>
  );
};

// --- Main Game ---

export default function MonopolyDealV3() {
  const [gameState, setGameState] = useState('SETUP'); 
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [players, setPlayers] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [movesLeft, setMovesLeft] = useState(0);
  const [logs, setLogs] = useState([{ text: 'Monopoly Deal v3.0 - Official Rules', type: 'system' }]);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Interactive States
  const [pendingAction, setPendingAction] = useState(null);
  const [activeActionCard, setActiveActionCard] = useState(null);
  const [reactionContext, setReactionContext] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [selectedForPayment, setSelectedForPayment] = useState([]);
  const drawLock = useRef(false);
  
  const logsEndRef = useRef(null);
  useEffect(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), [logs]);

  useEffect(() => {
    if (gameState === 'SETUP' || gameState === 'GAME_OVER') return;
    const p = players[turnIndex];
    if (!p) return;

    if (!p.isHuman && gameState === 'DRAW') setTimeout(() => performDraw(turnIndex), 1000);
    if (!p.isHuman && gameState === 'PLAYING') setTimeout(() => runCpuTurn(turnIndex), 1500);
  }, [turnIndex, gameState]);

  useEffect(() => {
    if (movesLeft === 0 && gameState === 'PLAYING' && turnIndex === 0) {
        const timer = setTimeout(() => {
            endTurn(0);
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [movesLeft, gameState, turnIndex]);

  // --- Game Functions ---

  const addLog = async (text, type = 'info') => {
    setLogs(prev => [...prev, { text, type }]);
    if (type === 'event' && Math.random() > 0.8) {
        const comment = await callGemini(text, "commentary");
        if (comment) setLogs(prev => [...prev, { text: comment, type: 'ai' }]);
    }
  };

  const startGame = (count = 6) => {
    const d = generateOfficialDeck();
    const ps = Array(count).fill(null).map((_, i) => ({
      id: i, name: i === 0 ? 'You' : `Bot ${i}`, isHuman: i === 0,
      hand: [], properties: [], bank: []
    }));
    for (let i = 0; i < 5; i++) ps.forEach(p => d.length && p.hand.push(d.pop()));
    setDeck(d);
    setPlayers(ps);
    setTurnIndex(0);
    setGameState('DRAW');
    setMovesLeft(0);
    setPendingAction(null);
    setActiveActionCard(null);
    setPaymentRequest(null);
    setSelectedForPayment([]);
    addLog("Game Started. Draw 2 to begin.", 'system');
  };

  const performDraw = (idx, forcedCount = null) => {
    // 1. Guard against double-clicks and concurrent triggers
    if (drawLock.current) return;
    drawLock.current = true;

    // 2. Identify count before state changes
    const p = players[idx];
    const count = forcedCount || (p.hand.length === 0 && gameState === 'DRAW' ? 5 : 2);
    
    // 3. Update deck and capture drawn cards
    let drawn = [];
    setDeck(prevDeck => {
        const d = [...prevDeck];
        const localDrawn = [];
        const pull = (deckArr) => {
            if (!deckArr.length) {
                // Simplified reshuffle: if we need a card and deck is empty, try to reshuffle
                // But we can't easily modify discardPile here. 
                // For now, if deck is empty, you just get less cards.
                return null;
            }
            return deckArr.pop();
        };

        for(let i=0; i<count; i++) {
            const c = pull(d);
            if (c) localDrawn.push(c);
        }
        drawn = localDrawn;
        return d;
    });

    // 4. Update players and game state in a single tick AFTER the deck update logic
    setTimeout(() => {
        if (drawn.length > 0) {
            setPlayers(curr => {
                const copy = [...curr];
                const player = { ...copy[idx] };
                player.hand = [...player.hand, ...drawn];
                copy[idx] = player;
                return copy;
            });
            addLog(`${players[idx].name} drew ${drawn.length} cards.`, 'info');
        }

        if (gameState === 'DRAW') {
            setMovesLeft(3);
            setGameState('PLAYING');
        }
        
        drawLock.current = false;
    }, 50);
  };

  const playCard = (card) => {
      // Use the new confirmation flow for human players
      if (players[turnIndex].isHuman) {
          if (gameState !== 'PLAYING' || movesLeft <= 0 || turnIndex !== 0) return;
          if (!players[0].hand.find(c => c.uid === card.uid)) return;
          setPendingAction(card);
          return;
      }
      
      // Direct execution for bots
      executeAction(card, turnIndex);
  };

  const executeConfirmedMove = (card, targetType = 'AUTO') => {
      // 1. Immediate validation
      if (!players[0].hand.find(c => c.uid === card.uid)) {
          setPendingAction(null);
          return;
      }

      // 2. Handle simple types
      if (targetType === 'BANK' || card.type === CARD_TYPES.MONEY) {
          if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
              addLog("Property cards cannot be banked!", "alert");
              setPendingAction(null);
              return;
          }
          updatePlayer(0, p => { 
              p.hand = p.hand.filter(c => c.uid !== card.uid); 
              p.bank = [...p.bank, card]; 
          });
          addLog(`Banked ${card.name}.`, 'info');
          decrementMoves();
          setPendingAction(null);
          return;
      }

      if (card.type === CARD_TYPES.PROPERTY || card.type === CARD_TYPES.PROPERTY_WILD) {
          updatePlayer(0, p => { 
              p.hand = p.hand.filter(c => c.uid !== card.uid); 
              p.properties = [...p.properties, card]; 
          });
          addLog(`Played property ${card.name}.`, 'event');
          checkWin(players[0]);
          decrementMoves();
          setPendingAction(null);
          return;
      }

      // 3. Handle action cards
      setPendingAction(null);
      initiateAction(card, 0);
  };

  const initiateAction = (card, idx) => {
      if (players[idx].isHuman) {
          const needsTarget = [ACTION_TYPES.SLY_DEAL, ACTION_TYPES.FORCED_DEAL, ACTION_TYPES.DEAL_BREAKER].includes(card.actionType);
          const isBuilding = [ACTION_TYPES.HOUSE, ACTION_TYPES.HOTEL].includes(card.actionType);
          const needsRentTarget = card.type === CARD_TYPES.RENT_WILD;

          if (needsTarget || needsRentTarget || isBuilding) {
              setActiveActionCard(card);
              setGameState('TARGET_SELECT');
              addLog(`Select a ${isBuilding ? 'completed set' : 'target'} for ${card.name}.`, 'system');
              return;
          }
          executeAction(card, idx);
      } else {
          const targetIdx = (idx + 1) % players.length;
          executeAction(card, idx, targetIdx); 
      }
  };

  const executeAction = (card, srcIdx, targetIdx = null, targetCard = null) => {
      updatePlayer(srcIdx, p => p.hand = p.hand.filter(c => c.uid !== card.uid));
      switch (card.actionType) {
          case ACTION_TYPES.PASS_GO:
              performDraw(srcIdx, 2); 
              discard(card);
              decrementMoves();
              break;
          case ACTION_TYPES.DEBT_COLLECTOR:
              const t = targetIdx !== null ? targetIdx : (srcIdx + 1) % players.length;
              triggerReaction(srcIdx, t, card, { type: 'PAYMENT', amount: 5 });
              break;
          case ACTION_TYPES.BIRTHDAY:
              const nextP = (srcIdx + 1) % players.length;
              triggerReaction(srcIdx, nextP, card, { type: 'PAYMENT', amount: 2 });
              break;
          case ACTION_TYPES.SLY_DEAL:
              triggerReaction(srcIdx, targetIdx, card, { type: 'STEAL', targetCard });
              break;
          case ACTION_TYPES.DEAL_BREAKER:
              triggerReaction(srcIdx, targetIdx, card, { type: 'STEAL_SET', targetCard });
              break;
          case ACTION_TYPES.HOUSE:
          case ACTION_TYPES.HOTEL:
              updatePlayer(srcIdx, p => p.properties.push(card)); 
              decrementMoves();
              break;
          default:
               if (card.type === CARD_TYPES.RENT || card.type === CARD_TYPES.RENT_WILD) {
                   const t = targetIdx !== null ? targetIdx : (srcIdx + 1) % players.length;
                   const amount = calculateRent(players[srcIdx], card);
                   triggerReaction(srcIdx, t, card, { type: 'PAYMENT', amount });
               } else {
                   updatePlayer(srcIdx, p => p.bank.push(card));
                   decrementMoves();
               }
      }
  };

  const calculateRent = (player, rentCard) => {
      const sets = getSets(player.properties);
      let max = 0;
      const colors = rentCard.type === CARD_TYPES.RENT_WILD ? Object.keys(COLORS) : rentCard.colors;
      sets.forEach(s => { if (colors.includes(s.color)) { if (s.rent > max) max = s.rent; } });
      return max;
  };

  const handleTargetClick = (tCard, ownerIdx) => {
      if (gameState !== 'TARGET_SELECT') return;
      
      const isBuilding = [ACTION_TYPES.HOUSE, ACTION_TYPES.HOTEL].includes(activeActionCard.actionType);
      
      if (isBuilding) {
          if (ownerIdx !== 0) { addLog("Buildings must be placed on your own sets!", 'alert'); return; }
          const sets = getSets(players[0].properties);
          const parentSet = sets.find(s => s.cards.find(c => c.uid === tCard.uid));
          
          if (!parentSet?.isComplete) { addLog("Buildings can only be placed on COMPLETED sets.", 'alert'); return; }
          if (activeActionCard.actionType === ACTION_TYPES.HOTEL && !parentSet.houses) { addLog("Hotel requires a House first.", 'alert'); return; }
          
          executeAction({...activeActionCard, currentColor: parentSet.color}, 0);
          setActiveActionCard(null);
          setGameState('PLAYING');
          return;
      }

      if (ownerIdx === 0) return;
      const sets = getSets(players[ownerIdx].properties);
      const parentSet = sets.find(s => s.cards.find(c => c.uid === tCard.uid));
      const isComplete = parentSet?.isComplete;
      
      if (activeActionCard.actionType === ACTION_TYPES.SLY_DEAL && isComplete) {
          addLog("Cannot Sly Deal a completed set!", 'alert');
          return;
      }
      if (activeActionCard.actionType === ACTION_TYPES.DEAL_BREAKER && !isComplete) {
           addLog("Deal Breaker requires a completed set!", 'alert');
           return;
      }
      executeAction(activeActionCard, 0, ownerIdx, tCard);
      setActiveActionCard(null);
      setGameState('PLAYING');
  };

  const triggerReaction = (src, target, card, effect) => {
      setReactionContext({ src, target, card, effect });
      setGameState('REACTION');
  };

  const validateBuildings = (playerIdx) => {
      setPlayers(prev => {
          const copy = [...prev];
          const p = {...copy[playerIdx], properties: [...copy[playerIdx].properties]};
          const sets = getSets(p.properties);
          let changed = false;
          
          sets.forEach(s => {
              if (!s.isComplete && (s.houses || s.hotels)) {
                  const toDiscard = p.properties.filter(c => 
                      (c.actionType === ACTION_TYPES.HOUSE || c.actionType === ACTION_TYPES.HOTEL) && 
                      (c.currentColor === s.color)
                  );
                  if (toDiscard.length > 0) {
                      p.properties = p.properties.filter(c => !toDiscard.find(td => td.uid === c.uid));
                      toDiscard.forEach(td => discard(td));
                      changed = true;
                  }
              }
          });
          
          if (changed) {
              addLog(`${p.name}'s buildings were discarded (set broken).`, 'alert');
              copy[playerIdx] = p;
              return copy;
          }
          return prev;
      });
  };

  const resolveReaction = (accepted) => {
      const { src, target, card, effect } = reactionContext;
      const victim = players[target];
      if (!accepted) {
          const jsn = victim.hand.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO);
          if (jsn) {
              updatePlayer(target, p => p.hand = p.hand.filter(c => c.uid !== jsn.uid));
              discard(jsn);
              addLog(`${victim.name} used Just Say No!`, 'alert');
              discard(card);
              setGameState('PLAYING');
              decrementMoves();
              setReactionContext(null);
              return;
          }
      }
      if (effect.type === 'PAYMENT') {
          discard(card);
          decrementMoves();
          initiatePayment(effect.amount, target, src);
      } else if (effect.type === 'STEAL') {
          updatePlayer(target, p => p.properties = p.properties.filter(c => c.uid !== effect.targetCard.uid));
          updatePlayer(src, p => p.properties.push(effect.targetCard));
          discard(card);
          decrementMoves();
          setGameState('PLAYING');
          setReactionContext(null);
          validateBuildings(target);
      } else if (effect.type === 'STEAL_SET') {
          const sets = getSets(players[target].properties);
          const targetSet = sets.find(s => s.cards.find(c => c.uid === effect.targetCard.uid));
          const cardsToSteal = targetSet.cards;
          updatePlayer(target, p => p.properties = p.properties.filter(c => c.color !== targetSet.color && c.currentColor !== targetSet.color));
          updatePlayer(src, p => p.properties.push(...cardsToSteal));
          discard(card);
          decrementMoves();
          setGameState('PLAYING');
          setReactionContext(null);
          validateBuildings(target);
      }
  };

  const initiatePayment = (amount, debtor, creditor) => {
      setPaymentRequest({ amount, debtor, creditor });
      setReactionContext(null);
      setGameState('PAYMENT');
      if (!players[debtor].isHuman) setTimeout(() => cpuPay(amount, debtor, creditor), 1500);
  };

  const cpuPay = (amount, debtorIdx, creditorIdx) => {
    const p = players[debtorIdx];
    const assets = [...p.bank, ...p.properties].sort((a,b) => a.value - b.value);
    let paid = 0;
    let giving = [];
    while(paid < amount && assets.length) {
        const c = assets.shift();
        giving.push(c);
        paid += c.value;
    }
    const creditor = players[creditorIdx];
    updatePlayer(debtorIdx, pl => {
        pl.bank = pl.bank.filter(c => !giving.find(g=>g.uid===c.uid));
        pl.properties = pl.properties.filter(c => !giving.find(g=>g.uid===c.uid));
    });
    updatePlayer(creditorIdx, pl => {
        giving.forEach(c => c.type === CARD_TYPES.PROPERTY ? pl.properties.push(c) : pl.bank.push(c));
    });
    setPaymentRequest(null);
    setGameState('PLAYING');
    validateBuildings(debtorIdx);
    if (turnIndex === creditorIdx) setTimeout(() => runCpuTurn(creditorIdx), 1000);
  };
  
  const confirmPlayerPayment = () => {
      const total = selectedForPayment.reduce((a,c) => a + c.value, 0);
      if (total < paymentRequest.amount) {
          const p = players[0];
          const all = p.bank.reduce((a,c)=>a+c.value,0) + p.properties.reduce((a,c)=>a+c.value,0);
          if (total < all) { addLog("Insufficient funds selected.", 'alert'); return; }
      }
      updatePlayer(0, p => {
          p.bank = p.bank.filter(c => !selectedForPayment.find(s => s.uid===c.uid));
          p.properties = p.properties.filter(c => !selectedForPayment.find(s => s.uid===c.uid));
      });
      updatePlayer(paymentRequest.creditor, p => {
          selectedForPayment.forEach(c => c.type === CARD_TYPES.PROPERTY ? p.properties.push(c) : p.bank.push(c));
      });
      setSelectedForPayment([]);
      setPaymentRequest(null);
      setGameState('PLAYING');
      validateBuildings(0);
  };

  const endTurn = (idx) => {
      updatePlayer(idx, p => {
          while(p.hand.length > 7) { discard(p.hand.pop()); }
      });
      const next = (idx + 1) % players.length;
      setTurnIndex(next);
      setGameState('DRAW');
      if (next === 0) addLog("Your turn.", 'system');
  };

  const runCpuTurn = (idx) => {
      if (gameState !== 'PLAYING' || turnIndex !== idx || movesLeft <= 0) return;

      const cpu = players[idx];
      const hand = cpu.hand;
      
      // CPU Strategy: Prioritize Properties
      const property = hand.find(c => c.type === CARD_TYPES.PROPERTY || c.type === CARD_TYPES.PROPERTY_WILD);
      if (property) {
          updatePlayer(idx, p => {
              p.hand = p.hand.filter(c => c.uid !== property.uid);
              p.properties.push(property);
          });
          addLog(`${cpu.name} played ${property.name}.`, 'event');
          decrementMoves();
          checkWin(players[idx]);
          setTimeout(() => runCpuTurn(idx), 1200);
          return;
      }

      // Play money if nothing else
      const money = hand.find(c => c.type === CARD_TYPES.MONEY);
      if (money) {
          updatePlayer(idx, p => {
              p.hand = p.hand.filter(c => c.uid !== money.uid);
              p.bank.push(money);
          });
          addLog(`${cpu.name} banked $${money.value}M.`, 'info');
          decrementMoves();
          setTimeout(() => runCpuTurn(idx), 1200);
          return;
      }

      // If no great moves, end turn
      setTimeout(() => endTurn(idx), 1000);
  };

  // --- FIXED: Auto-End Turn Logic ---
  const decrementMoves = () => {
    setMovesLeft(m => {
        const next = m - 1;
        if (next === 0) {
            // Use a timeout to allow the UI to reflect the move before ending the turn
            setTimeout(() => {
                // End the current player's turn
                setPlayers(prev => {
                    const copy = [...prev];
                    const p = {...copy[turnIndex]};
                    p.hand = [...p.hand];
                    // Discard down to 7 cards
                    while(p.hand.length > 7) { 
                        const discarded = p.hand.pop();
                        setDiscardPile(dp => [...dp, discarded]);
                    }
                    copy[turnIndex] = p;
                    return copy;
                });
                
                // Move to next player
                setTurnIndex(currentIdx => {
                    const nextIdx = (currentIdx + 1) % players.length;
                    setGameState('DRAW');
                    if (nextIdx === 0) addLog("Your turn.", 'system');
                    return nextIdx;
                });
            }, 1500);
        }
        return next;
    });
  };

  const discard = (c) => setDiscardPile(p => [...p, c]);
  const updatePlayer = (idx, fn) => setPlayers(prev => { const c = [...prev]; const p = {...c[idx]}; p.hand=[...p.hand]; p.properties=[...p.properties]; p.bank=[...p.bank]; fn(p); c[idx]=p; return c; });
  const checkWin = (p) => { if (countCompletedSets(p.properties) >= 3) { setGameState('GAME_OVER'); addLog(`${p.name} Wins!`, 'event'); } };

  if (gameState === 'SETUP') return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-mesh relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        
        <div className="z-10 text-center space-y-8 max-w-2xl px-6">
            <div className="space-y-2">
                <h1 className="text-8xl font-black italic tracking-tighter text-glow-gold bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 bg-clip-text text-transparent font-serif-bold leading-none uppercase">
                    Property<br/>Hustle
                </h1>
                <p className="text-amber-500/60 font-black tracking-[0.5em] uppercase text-xs">The Ultimate Card Simulation</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5 shadow-2xl">
                <p className="text-zinc-400 text-sm leading-relaxed font-light">
                    Maneuver through high-stakes real estate deals, dodge forced trades, and protect your empire with the perfect reaction. Three sets to win. Zero mercy.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => startGame()} 
                      className="group relative w-full py-5 bg-gradient-to-r from-amber-600 to-amber-400 rounded-2xl font-black text-black text-xl tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                    >
                        <span className="relative z-10">Initialize Deal</span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                    </button>
                    <button 
                      onClick={() => setShowInstructions(true)}
                      className="group flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-white text-sm tracking-widest uppercase transition-all border border-white/5"
                    >
                        <BookOpen size={18} className="text-amber-500" />
                        How to Play
                    </button>
                </div>
            </div>
            
            <div className="pt-8 flex justify-center gap-8 opacity-40">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"><User size={20}/></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Multiplayer</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"><Cpu size={20}/></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Neural AI</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"><Sparkles size={20}/></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Real-time</span>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-mesh flex overflow-hidden font-sans text-slate-200 select-none">
       {/* New High-Precision Sidebar */}
       <div className="w-80 glass-panel border-r border-white/5 flex flex-col z-20">
           <div className="p-8 border-b border-white/5">
                <h2 className="font-serif-bold italic text-3xl text-glow-gold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent uppercase tracking-tighter">Hustle</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Network Live</span>
                </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {logs.map((l, i) => (
                    <div key={i} className={`
                        group relative p-3 rounded-2xl transition-all border
                        ${l.type === 'ai' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200 italic font-light' : 
                          l.type === 'event' ? 'bg-white/5 border-white/10 text-zinc-100 shadow-sm' : 
                          l.type === 'alert' ? 'bg-red-500/10 border-red-500/20 text-red-200 font-bold' : 
                          'bg-zinc-900/30 border-transparent text-zinc-500'}
                        text-[11px] leading-relaxed
                    `}>
                        {l.type === 'ai' && <Sparkles className="absolute -top-1.5 -right-1.5 text-amber-500" size={12}/>}
                        {l.text}
                    </div>
               ))}
               <div ref={logsEndRef} />
           </div>

           <div className="p-6 bg-black/20 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                    <span>Discard Pile</span>
                    <span>{discardPile.length} Cards</span>
                </div>
                <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center bg-black/20 group cursor-help transition-colors hover:border-white/10">
                    {discardPile.length > 0 ? (
                        <CardComponent card={discardPile[discardPile.length-1]} size="lg" className="scale-75 rotate-3 opacity-60"/>
                    ) : (
                        <RotateCcw size={24} className="text-zinc-800"/>
                    )}
                </div>
           </div>
       </div>

       {/* Enhanced Main Arena */}
       <div className="flex-1 flex flex-col relative">
           {/* Reaction Overlay */}
           {gameState === 'REACTION' && reactionContext && players[reactionContext.target].isHuman && (
               <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-6">
                   <div className="max-w-md w-full glass-panel p-10 rounded-[40px] border-amber-500/30 text-center space-y-8 animate-float">
                       <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/30">
                           <ShieldAlert size={40}/>
                       </div>
                       <div className="space-y-2">
                           <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Incoming!</h2>
                           <p className="text-zinc-400 text-sm leading-relaxed">
                               <span className="text-amber-500 font-bold">{players[reactionContext.src].name}</span> wants to play <span className="text-white font-bold underline decoration-amber-500 underline-offset-4">{reactionContext.card.name}</span> on you.
                           </p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <button onClick={() => resolveReaction(true)} className="py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">Accept</button>
                           {players[0].hand.find(c => c.actionType === ACTION_TYPES.JUST_SAY_NO) ? (
                               <button onClick={() => resolveReaction(false)} className="py-4 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/10 border border-black/10">Just Say No</button>
                           ) : (
                               <button disabled className="py-4 bg-zinc-800 text-zinc-500 rounded-2xl font-black uppercase tracking-widest text-xs opacity-50 cursor-not-allowed border border-white/5">No Counter</button>
                           )}
                       </div>
                   </div>
               </div>
           )}

           {gameState === 'TARGET_SELECT' && (
               <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="glass-panel px-8 py-3 rounded-full border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center gap-4 animate-bounce">
                        <MapPin className="text-amber-500" size={18}/>
                        <span className="text-amber-500 font-black uppercase tracking-[0.2em] text-xs">Choose Target Property</span>
                    </div>
               </div>
           )}

           {/* Opponent Grid */}
           <div className="h-[40%] p-10 grid grid-cols-5 gap-8">
               {players.slice(1).map(p => (
                   <div key={p.id} className={`
                        relative glass-panel rounded-[32px] p-5 flex flex-col transition-all duration-500
                        ${turnIndex===p.id ? 'border-amber-500 ring-4 ring-amber-500/10 shadow-[0_0_50px_rgba(245,158,11,0.15)] bg-amber-500/5' : 'border-white/5 opacity-80'}
                   `}>
                       {/* Bot Status Header */}
                       <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-zinc-800 border ${turnIndex===p.id ? 'border-amber-500 text-amber-500' : 'border-white/10 text-zinc-500'}`}>
                                    <Cpu size={16}/>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-100">{p.name}</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest tracking-widest">Processing</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-amber-500 font-black font-mono text-sm">${p.bank.reduce((a,c)=>a+c.value,0)}M</div>
                       </div>

                       {/* Bot Hand (Hidden visualization) */}
                       <div className="h-14 flex items-center justify-center pl-4 mb-6">
                            {p.hand.length === 0 ? (
                                <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest italic tracking-widest">Out of cards</span>
                            ) : (
                                p.hand.slice(0, 6).map((c, idx) => (
                                    <div key={c.uid} className="transform -ml-6 transition-all hover:-translate-y-2" style={{zIndex: idx, rotate: `${(idx - 3) * 6}deg`}}>
                                        <CardComponent card={c} size="sm" faceDown className="shadow-2xl border-white/5"/>
                                    </div>
                                ))
                            )}
                       </div>

                       {/* Bot Wealth Overview */}
                       <div className="flex-1 flex flex-wrap gap-2 content-start overflow-y-auto custom-scrollbar">
                           {getSets(p.properties).map((s, i) => (
                               <div key={i} onClick={() => s.cards.forEach(c => handleTargetClick(c, p.id))} className={`
                                    group relative p-1 rounded-xl border-2 transition-all cursor-pointer hover:border-white/20
                                    ${s.isComplete ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-white/5 bg-white/5'}
                               `}>
                                   <div className="flex flex-col-reverse -space-y-4">
                                       {s.cards.map(c => <div key={c.uid} className="w-5 h-7 rounded shadow-md border border-black/20" style={{backgroundColor: COLORS[c.currentColor||c.color]?.hex}}></div>)}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               ))}
           </div>

           {/* Global Deck & Play Area */}
           <div className="flex-1 flex items-center justify-center gap-20 relative">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none"></div>
               
               <div onClick={() => turnIndex === 0 && gameState === 'DRAW' && performDraw(0)} className={`
                    relative cursor-pointer transition-all duration-300 group
                    ${gameState==='DRAW' && turnIndex===0 ? 'scale-110' : 'hover:scale-105 opacity-80'}
               `}>
                   {deck.length > 0 ? (
                       <div className="relative">
                            <CardComponent faceDown size="lg" className="shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10"/>
                            {/* Card Stack Illusion */}
                            <div className="absolute top-1 left-1 w-full h-full bg-red-900 border-2 border-white/90 rounded-lg -z-10 translate-x-1 translate-y-1"></div>
                            <div className="absolute top-2 left-2 w-full h-full bg-red-800 border-2 border-white/90 rounded-lg -z-20 translate-x-2 translate-y-2"></div>
                       </div>
                   ) : (
                       <div className="w-36 h-56 border-4 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-zinc-800 font-black uppercase text-xs">Deck Empty</div>
                   )}
                   
                   {gameState === 'DRAW' && turnIndex === 0 && (
                       <div className="absolute -top-16 left-0 right-0 text-center animate-bounce">
                           <div className="inline-block bg-amber-500 text-black font-black uppercase tracking-[0.3em] text-[10px] px-6 py-2 rounded-full shadow-2xl">Start Phase: Draw</div>
                       </div>
                   )}
               </div>

                {/* Turn Info UI */}
                <div className="glass-panel p-8 rounded-full border-white/10 flex items-center gap-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Active Turn</div>
                        <div className="text-lg font-black italic uppercase tracking-tighter text-white">{players[turnIndex].name}</div>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="text-center space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Moves Remaining</div>
                        <div className="flex gap-1.5 justify-center">
                            {[1,2,3].map(i => (
                                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= movesLeft ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/5 ring-1 ring-white/10'}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => endTurn(0)}
                            disabled={gameState !== 'PLAYING' || turnIndex !== 0}
                            className={`
                                group flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${gameState === 'PLAYING' && turnIndex === 0 
                                    ? 'bg-amber-500 text-black hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/10' 
                                    : 'bg-white/5 text-zinc-700 cursor-not-allowed'}
                            `}
                        >
                            End Phase <SkipForward size={14} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>
                </div>
           </div>

           {/* Production Player Zone */}
           <div className="h-[35%] glass-panel border-t border-white/10 p-10 flex items-start gap-12 relative shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
               {/* Fixed Bank Display */}
               <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Liquid Assets</span>
                        <div className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-lg text-[10px] font-black">${players[0].bank.reduce((a,c)=>a+c.value,0)}M</div>
                   </div>
                   <div className="flex -space-x-12 hover:-space-x-6 transition-all duration-500 h-40">
                       {players[0].bank.map(c => (
                            <CardComponent 
                                key={c.uid} 
                                card={c} 
                                size="sm" 
                                className="shadow-2xl hover:scale-110 active:z-50"
                                selected={selectedForPayment.find(s=>s.uid===c.uid)} 
                                onClick={() => {
                                    if (gameState === 'PAYMENT') {
                                        setSelectedForPayment(prev => prev.find(s=>s.uid===c.uid) ? prev.filter(s=>s.uid!==c.uid) : [...prev, c]);
                                    } else if (gameState === 'TARGET_SELECT') {
                                        handleTargetClick(c, 0);
                                    }
                                }}
                            />
                       ))}
                       {players[0].bank.length === 0 && (
                           <div className="w-24 h-36 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center opacity-40">
                               <DollarSign size={24} className="text-zinc-600"/>
                           </div>
                       )}
                   </div>
               </div>

               {/* Real Estate Portfolio */}
               <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Real Estate Portfolio</span>
                    <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                        {getSets(players[0].properties).map((set, i) => (
                            <div key={i} className={`
                                group relative flex flex-col p-4 rounded-3xl border-2 transition-all duration-500 min-w-[120px]
                                ${set.isComplete ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-white/5 bg-white/5'}
                            `}>
                                {set.isComplete && (
                                    <div className="absolute top-0 left-0 right-0 py-1 bg-amber-500 rounded-t-[20px] shadow-lg">
                                        <div className="text-[8px] font-black text-black text-center uppercase tracking-[0.2em] flex items-center justify-center gap-1">
                                            <Trophy size={8}/> Monopoly Complete
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col -space-y-28 mt-2 h-44 hover:space-y-1 transition-all">
                                    {set.cards.map(c => (
                                        <CardComponent 
                                            key={c.uid} 
                                            card={c} 
                                            size="md" 
                                            className="shadow-2xl hover:z-50"
                                            selected={selectedForPayment.find(s=>s.uid===c.uid)}
                                            onClick={() => {
                                                if (gameState === 'PAYMENT') {
                                                    setSelectedForPayment(prev => prev.find(s=>s.uid===c.uid) ? prev.filter(s=>s.uid!==c.uid) : [...prev, c]);
                                                } else if (gameState === 'TARGET_SELECT') {
                                                    handleTargetClick(c, 0);
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{set.color}</span>
                                    <div className="flex gap-1">
                                        {set.houses > 0 && <div className="p-1 bg-green-500 rounded-lg shadow-lg animate-pulse"><Home size={10} color="white"/></div>}
                                        {set.hotels > 0 && <div className="p-1 bg-red-500 rounded-lg shadow-lg animate-pulse"><Building size={10} color="white"/></div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
               </div>

                <div className="flex flex-col gap-4 relative">
                     <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Tactical Hand</span>
                          <span className="text-zinc-600 font-bold text-[10px]">{players[0].hand.length}/7</span>
                     </div>
                     
                     {/* Move Confirmation Overlay */}
                     {pendingAction && (
                         <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10 duration-500 w-max">
                              <div className="glass-panel p-5 rounded-[28px] border-amber-500/30 flex items-center gap-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)] bg-zinc-950/90 backdrop-blur-3xl">
                                  <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Confirm Move</span>
                                      <span className="text-lg font-black text-white italic">{pendingAction.name}</span>
                                  </div>
                                  <div className="h-8 w-px bg-white/10"></div>
                                  <div className="flex gap-3">
                                      {pendingAction.type === CARD_TYPES.PROPERTY || pendingAction.type === CARD_TYPES.PROPERTY_WILD ? (
                                          <button onClick={() => executeConfirmedMove(pendingAction, 'PROPERTY')} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"><Check size={12}/> Play to Board</button>
                                      ) : pendingAction.type === CARD_TYPES.ACTION || pendingAction.type === CARD_TYPES.RENT || pendingAction.type === CARD_TYPES.RENT_WILD ? (
                                          <>
                                              <button onClick={() => executeConfirmedMove(pendingAction, 'ACTION')} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"><Check size={12}/> Action</button>
                                              <button onClick={() => executeConfirmedMove(pendingAction, 'BANK')} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/20 transition-all"><DollarSign size={12}/> Bank</button>
                                          </>
                                      ) : (
                                          <button onClick={() => executeConfirmedMove(pendingAction, 'BANK')} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"><Check size={12}/> Bank</button>
                                      )}
                                      <button onClick={() => setPendingAction(null)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={16}/></button>
                                  </div>
                              </div>
                         </div>
                     )}

                     <div className="flex justify-center -space-x-16 hover:-space-x-10 transition-all duration-700 h-40 origin-bottom px-10">
                         {players[0].hand.filter(c => c.uid !== pendingAction?.uid).map((c, i) => (
                             <div key={c.uid} className="transform hover:-translate-y-20 hover:scale-125 transition-all duration-300 cursor-pointer origin-bottom" style={{zIndex: i, rotate: `${(i - (players[0].hand.length-1)/2) * 4}deg`}}>
                                 <CardComponent card={c} onClick={playCard} className="shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-white/10" />
                             </div>
                         ))}
                     </div>
                </div>
               
               {/* Payment HUD */}
               {gameState === 'PAYMENT' && paymentRequest && paymentRequest.debtor === 0 && (
                   <div className="absolute inset-0 z-[100] bg-red-950/40 backdrop-blur-xl flex items-center justify-center">
                        <div className="max-w-md w-full glass-panel p-8 rounded-[40px] border-red-500/30 text-center space-y-6 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Liquidation Required</div>
                                <div className="text-6xl font-black text-white italic font-serif-bold tracking-tighter">${paymentRequest.amount}M</div>
                            </div>
                            <div className="p-4 bg-black/40 rounded-2xl flex justify-between items-center">
                                <div className="text-left">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Selected Value</div>
                                    <div className="text-lg font-black text-amber-500">${selectedForPayment.reduce((a,c)=>a+c.value,0)}M</div>
                                </div>
                                <button 
                                    onClick={confirmPlayerPayment}
                                    className="px-10 py-3 bg-red-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition"
                                >
                                    Liquidate
                                </button>
                            </div>
                        </div>
                   </div>
               )}
           </div>
       </div>

       {/* Floating UI Elements */}
       <div className="fixed top-8 right-8 z-[100] flex gap-4">
            <button 
              onClick={() => setShowInstructions(true)}
              className="glass-card w-12 h-12 rounded-2xl flex items-center justify-center text-amber-500 hover:text-white hover:bg-amber-500/20 transition-all border border-amber-500/20 shadow-lg shadow-amber-500/5 group"
              title="How to Play"
            >
                <BookOpen size={20} className="group-hover:scale-110 transition-transform"/>
            </button>
            <button className="glass-card w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                <RotateCcw size={20}/>
            </button>
            <div className="glass-panel px-6 rounded-2xl flex items-center gap-4 border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Session Connected</span>
            </div>
       </div>

       <HowToPlay isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}
