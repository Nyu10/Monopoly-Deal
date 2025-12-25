import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StadiumLayout from '../components/StadiumLayout';
import TutorialOverlay from '../components/TutorialOverlay';
import { CardActionDialog } from '../components/ActionDialogs';
import { generateOfficialDeck } from '../utils/deckGenerator';
import { CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';

const TutorialPage = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardActionDialog, setShowCardActionDialog] = useState(false);
  
  // Create a stable mock deck and initial state
  const mockDeck = useMemo(() => generateOfficialDeck(), []);
  
  // Tutorial State Machine
  const [gameState, setGameState] = useState({
    players: [
      {
        id: 'me',
        name: 'You (The Mogul)',
        isHuman: true,
        hand: [
          mockDeck.find(c => c.name === 'Boardwalk'),
          mockDeck.find(c => c.type === CARD_TYPES.MONEY && c.value === 5),
          mockDeck.find(c => c.type === CARD_TYPES.RENT && c.colors?.includes('dark_blue'))
        ],
        bank: [],
        properties: []
      },
      {
        id: 'bot1',
        name: 'Mr. Monopoly',
        isHuman: false,
        hand: [{}, {}, {}],
        bank: [{ name: '1M', value: 1 }],
        properties: []
      }
    ],
    deck: Array(50).fill({}),
    discardPile: [],
    currentTurnIndex: 0,
    hasDrawnThisTurn: false
  });

  const tutorialSteps = [
    {
      id: 'welcome',
      title: "Welcome to Mogul Academy",
      message: "Monopoly Deal is a fast-paced property trading game. Your goal is to collect 3 complete property sets of different colors. Ready to make your first million?",
      targetId: null
    },
    {
      id: 'draw',
      title: "Step 1: The Draw",
      message: "Every turn starts by drawing 2 cards. If you start with 0 cards, you draw 5! Click the deck to draw your first cards.",
      targetId: 'tutorial-deck',
      actionRequired: 'DRAW'
    },
    {
      id: 'property',
      title: "Step 2: Building Assets",
      message: "This is Boardwalk. It's high value! Click it in your hand and select 'Play Property' to start building a set in your Build Area.",
      targetId: 'tutorial-hand',
      actionRequired: 'PLAY_PROPERTY'
    },
    {
      id: 'bank',
      title: "Step 3: Secure the Bag",
      message: "Action cards and Money cards can be Put in the Bank. You'll need this to pay other players when they charge you rent. Click a card and 'Bank It'.",
      targetId: 'tutorial-bank',
      actionRequired: 'BANK_IT'
    },
    {
      id: 'rent',
      title: "Step 4: Collect Rent",
      message: "Now the fun part. Play a Rent card to charge your opponents based on the properties you own. More cards in a set = more rent!",
      targetId: 'tutorial-hand',
      actionRequired: 'PLAY_RENT'
    },
    {
      id: 'victory',
      title: "The Path to Victory",
      message: "Keep playing, keep stealing, and keep banking. First to 3 full sets wins the game. You're ready for the big leagues!",
      targetId: null
    }
  ];

  const currentStep = tutorialSteps[currentStepIndex];

  // Update target rect whenever step or window changes
  useEffect(() => {
    if (currentStep.targetId) {
      const updateRect = () => {
        const el = document.getElementById(currentStep.targetId);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        }
      };
      
      // Delay slightly to ensure layout is stable
      const timer = setTimeout(updateRect, 100);
      window.addEventListener('resize', updateRect);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateRect);
      };
    } else {
      setTargetRect(null);
    }
  }, [currentStepIndex, currentStep.targetId]);

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      navigate('/stadium');
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleAction = (type) => {
    console.log('Tutorial Action:', type, 'Required:', currentStep.actionRequired);
    if (currentStep.actionRequired === type) {
      // Mock state updates for feedback
      if (type === 'DRAW') {
        const newCards = mockDeck.slice(10, 12);
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => p.id === 'me' ? { ...p, hand: [...p.hand, ...newCards] } : p),
          hasDrawnThisTurn: true
        }));
      } else if (type === 'PLAY_PROPERTY') {
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => p.id === 'me' ? { 
            ...p, 
            hand: p.hand.filter(c => c.name !== 'Boardwalk'),
            properties: [...p.properties, mockDeck.find(c => c.name === 'Boardwalk')]
          } : p)
        }));
      } else if (type === 'BANK_IT') {
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => p.id === 'me' ? { 
            ...p, 
            hand: p.hand.filter(c => !(c.type === CARD_TYPES.MONEY && c.value === 5)),
            bank: [...p.bank, { name: '5M', value: 5 }]
          } : p)
        }));
      } else if (type === 'PLAY_RENT') {
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => {
             if (p.id === 'me') {
               return { ...p, hand: p.hand.filter(c => c.type !== CARD_TYPES.RENT) };
             }
             if (p.id === 'bot1') {
               return { ...p, bank: [] }; // Bot pays
             }
             return p;
          }),
          discardPile: [...gameState.discardPile, mockDeck.find(c => c.type === CARD_TYPES.RENT)]
        }));
      }
      
      handleNext();
    }
  };

  const actionConfirmation = showCardActionDialog && selectedCard ? (
    <CardActionDialog
      card={selectedCard}
      onConfirm={(action) => {
        if (action === 'PROPERTIES') handleAction('PLAY_PROPERTY');
        if (action === 'BANK') handleAction('BANK_IT');
        if (action === 'ACTION' || action === 'RENT') handleAction('PLAY_RENT');
        setShowCardActionDialog(false);
        setSelectedCard(null);
      }}
      onCancel={() => {
        setShowCardActionDialog(false);
        setSelectedCard(null);
      }}
    />
  ) : null;

  return (
    <div className="w-full h-screen relative bg-slate-900 overflow-hidden">
      {/* The Actual Game Board (Simulated) */}
      <div className="w-full h-full opacity-90">
        <StadiumLayout 
          players={gameState.players}
          currentPlayerId="me"
          currentTurnIndex={gameState.currentTurnIndex}
          hasDrawnThisTurn={gameState.hasDrawnThisTurn}
          deck={gameState.deck}
          discardPile={gameState.discardPile}
          onDraw={() => handleAction('DRAW')}
          onCardClick={(card) => {
            setSelectedCard(card);
            setShowCardActionDialog(true);
          }}
          actionConfirmation={actionConfirmation}
        />
      </div>

      {/* The Premium Overlay */}
      <TutorialOverlay 
        targetRect={targetRect}
        title={currentStep.title}
        message={currentStep.message}
        currentStep={currentStepIndex}
        totalSteps={tutorialSteps.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={() => navigate('/stadium')}
        showNext={!currentStep.actionRequired}
      />
    </div>
  );
};

export default TutorialPage;
