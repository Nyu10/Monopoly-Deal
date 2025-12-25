import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X, Trophy, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import { CARD_TYPES, ACTION_TYPES } from '../utils/gameHelpers';

const TutorialPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Sample cards for demonstration
  const sampleCards = {
    money: { id: 'demo-1', type: CARD_TYPES.MONEY, value: 5, name: '$5M' },
    property: { id: 'demo-2', type: CARD_TYPES.PROPERTY, color: 'blue', name: 'Park Place', value: 4 },
    propertyWild: { id: 'demo-3', type: CARD_TYPES.PROPERTY_WILD, colors: ['blue', 'green'], value: 4, name: 'Blue/Green Wild', currentColor: 'blue' },
    dealBreaker: { id: 'demo-4', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.DEAL_BREAKER, value: 5, name: 'Deal Breaker', description: 'Steal a complete set' },
    slyDeal: { id: 'demo-5', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.SLY_DEAL, value: 3, name: 'Sly Deal', description: 'Steal a property (non-complete)' },
    justSayNo: { id: 'demo-6', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.JUST_SAY_NO, value: 4, name: 'Just Say No', description: 'Cancel action against you' },
    rent: { id: 'demo-7', type: CARD_TYPES.RENT, colors: ['blue', 'green'], value: 1, name: 'Blue/Green Rent' },
    house: { id: 'demo-8', type: CARD_TYPES.ACTION, actionType: ACTION_TYPES.HOUSE, value: 3, name: 'House', description: '+3M Rent on Full Set' },
  };

  const tutorialSteps = [
    {
      title: "Welcome to Monopoly Deal!",
      content: (
        <div className="text-center">
          <Trophy size={64} className="mx-auto mb-6 text-yellow-500" />
          <p className="text-lg text-slate-700 mb-4">
            Monopoly Deal is a fast-paced card game where you collect property sets, charge rent, and use action cards to win!
          </p>
          <p className="text-xl font-bold text-blue-600 mb-2">
            Objective: Be the first to collect 3 complete property sets
          </p>
          <p className="text-sm text-slate-500">
            Let's learn how to play in just a few minutes!
          </p>
        </div>
      )
    },
    {
      title: "Turn Structure",
      content: (
        <div>
          <p className="text-slate-700 mb-6">Each turn has three phases:</p>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">1. Draw Phase</h3>
              <p className="text-slate-700">Draw 2 cards from the deck (or 5 if your hand is empty)</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-green-900 mb-2">2. Play Phase</h3>
              <p className="text-slate-700">Play up to 3 cards from your hand</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold text-purple-900 mb-2">3. Discard Phase</h3>
              <p className="text-slate-700">If you have more than 7 cards, discard down to 7</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Money Cards",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            Money cards are used to pay rent and debts. You can bank them for later use.
          </p>
          <div className="flex justify-center mb-6">
            <Card card={sampleCards.money} size="lg" enableHover={false} />
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
            <p className="text-amber-900 font-bold mb-2">💡 Tip:</p>
            <p className="text-slate-700">
              Money cards can also be played as properties or actions if they have that type, but once banked, they can only be used as money!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Property Cards",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            Collect properties to build complete sets. Each color has a different set size.
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <Card card={sampleCards.property} size="md" enableHover={false} />
            <Card card={sampleCards.propertyWild} size="md" enableHover={false} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 p-3 rounded">
              <span className="font-bold">Brown/Dark Blue:</span> 2 cards
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <span className="font-bold">Railroads:</span> 4 cards
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <span className="font-bold">Most Colors:</span> 3 cards
            </div>
            <div className="bg-slate-50 p-3 rounded">
              <span className="font-bold">Utilities:</span> 2 cards
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Rent Cards",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            Charge rent to opponents based on your complete property sets!
          </p>
          <div className="flex justify-center mb-6">
            <Card card={sampleCards.rent} size="lg" enableHover={false} />
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <p className="text-green-900 font-bold mb-2">How Rent Works:</p>
              <ul className="text-slate-700 space-y-1 list-disc list-inside">
                <li>Rent amount depends on how many properties you have in that color</li>
                <li>Complete sets charge the highest rent</li>
                <li>Target player must pay or use Just Say No</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Action Cards: Deal Breaker",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            The most powerful card! Steal an entire complete property set from an opponent.
          </p>
          <div className="flex justify-center mb-6">
            <Card card={sampleCards.dealBreaker} size="lg" enableHover={false} />
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <p className="text-red-900 font-bold mb-2">⚠️ Important:</p>
            <p className="text-slate-700">
              Can only target COMPLETE sets (not incomplete ones). The opponent can defend with Just Say No!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Action Cards: Sly Deal",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            Steal a single property from an opponent's incomplete set.
          </p>
          <div className="flex justify-center mb-6">
            <Card card={sampleCards.slyDeal} size="lg" enableHover={false} />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-blue-900 font-bold mb-2">Rules:</p>
            <ul className="text-slate-700 space-y-1 list-disc list-inside">
              <li>Can only steal from INCOMPLETE sets</li>
              <li>Cannot steal properties with houses/hotels</li>
              <li>Can be blocked with Just Say No</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Action Cards: Just Say No",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            Your defensive card! Cancel any action played against you.
          </p>
          <div className="flex justify-center mb-6">
            <Card card={sampleCards.justSayNo} size="lg" enableHover={false} />
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
            <p className="text-purple-900 font-bold mb-2">💪 Defense Strategy:</p>
            <p className="text-slate-700 mb-2">
              Use Just Say No to block:
            </p>
            <ul className="text-slate-700 space-y-1 list-disc list-inside">
              <li>Deal Breaker attempts</li>
              <li>Sly Deal or Forced Deal</li>
              <li>Rent charges</li>
              <li>Debt Collector or Birthday demands</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Buildings: Houses & Hotels",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            Add buildings to complete sets to increase rent!
          </p>
          <div className="flex justify-center mb-6">
            <Card card={sampleCards.house} size="lg" enableHover={false} />
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-green-900">🏠 House: +$3M rent</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="font-bold text-red-900">🏨 Hotel: +$4M rent (requires house first)</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200 mt-4">
              <p className="text-amber-900 font-bold mb-2">⚠️ Warning:</p>
              <p className="text-slate-700">
                Buildings can only be placed on COMPLETE sets. If the set is broken (property stolen), buildings are discarded!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Payment Rules",
      content: (
        <div>
          <p className="text-slate-700 mb-6">
            When you owe money (from rent or actions), you must pay with cards.
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Payment Sources:</h3>
              <ul className="text-slate-700 space-y-1 list-disc list-inside">
                <li>Money cards from your bank</li>
                <li>Properties from your sets</li>
                <li>Action cards from your hand</li>
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
              <p className="text-red-900 font-bold mb-2">❌ No Change Given!</p>
              <p className="text-slate-700">
                If you pay with a $5M card for a $2M debt, you lose the full $5M. Choose wisely!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Play!",
      content: (
        <div className="text-center">
          <Sparkles size={64} className="mx-auto mb-6 text-purple-500" />
          <h2 className="text-2xl font-black text-slate-900 mb-4">
            You're Ready to Win!
          </h2>
          <p className="text-lg text-slate-700 mb-6">
            Remember: Collect 3 complete property sets to win the game!
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200 mb-6">
            <h3 className="font-bold text-slate-900 mb-3">Quick Recap:</h3>
            <ul className="text-left text-slate-700 space-y-2">
              <li>✅ Draw 2 cards per turn</li>
              <li>✅ Play up to 3 cards</li>
              <li>✅ Build property sets</li>
              <li>✅ Use action cards strategically</li>
              <li>✅ Defend with Just Say No</li>
              <li>✅ First to 3 complete sets wins!</li>
            </ul>
          </div>
          <button
            onClick={() => navigate('/stadium')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-black text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Playing! 🎮
          </button>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            Exit Tutorial
          </button>
          
          <button
            onClick={() => navigate('/stadium')}
            className="text-blue-600 hover:text-blue-700 transition-colors font-bold"
          >
            Skip to Game →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tutorial Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 min-h-[500px] border-2 border-slate-200">
          <h2 className="text-3xl font-black text-slate-900 mb-6 text-center">
            {tutorialSteps[currentStep].title}
          </h2>
          <div className="prose prose-slate max-w-none">
            {tutorialSteps[currentStep].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              currentStep === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-blue-600 w-8'
                    : index < currentStep
                    ? 'bg-blue-300'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === tutorialSteps.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              currentStep === tutorialSteps.length - 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
