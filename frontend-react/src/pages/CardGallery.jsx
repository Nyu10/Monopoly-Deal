import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { CARD_TYPES } from '../utils/gameHelpers';
import { generateOfficialDeck } from '../utils/deckGenerator';
import Card from '../components/Card';

export default function CardGallery() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [rotatedCards, setRotatedCards] = useState(new Set());
  
  // Use useMemo to ensure deck is only generated once
  const allCards = useMemo(() => {
    console.log("CardGallery: Generating deck...");
    try {
      const deck = generateOfficialDeck();
      console.log("CardGallery: Deck generated, length:", deck?.length);
      return deck || [];
    } catch (e) {
      console.error("Failed to generate deck:", e);
      return [];
    }
  }, []);

  const filteredCards = allCards.filter(card => {
    if (!card) return false;
    const matchesFilter = filter === 'ALL' || card.type === filter;
    const matchesSearch = (card.name || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const cardsByType = {
    MONEY: filteredCards.filter(c => c.type === CARD_TYPES.MONEY),
    PROPERTY: filteredCards.filter(c => c.type === CARD_TYPES.PROPERTY),
    WILD: filteredCards.filter(c => c.type === CARD_TYPES.PROPERTY_WILD),
    ACTION: filteredCards.filter(c => c.type === CARD_TYPES.ACTION),
    RENT: filteredCards.filter(c => c.type === CARD_TYPES.RENT || c.type === CARD_TYPES.RENT_WILD)
  };

  const toggleRotate = (cardUid) => {
    setRotatedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardUid)) {
        newSet.delete(cardUid);
      } else {
        newSet.add(cardUid);
      }
      return newSet;
    });
  };

  if (!allCards || allCards.length === 0) {
    return <div className="p-8 text-center text-red-500">Error loading deck. Please refresh.</div>;
  }

  /* Inline Error Boundary Component */
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    render() {
      if (this.state.hasError) {
        return <div className="p-4 bg-red-100 border border-red-500 text-red-700">
          <h3>Component Error:</h3>
          <pre>{this.state.error.toString()}</pre>
        </div>;
      }
      return this.props.children;
    }
  }

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-white">
      <div className="p-8 pb-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Game
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black italic text-slate-900 mb-2">Card Gallery</h1>
              <p className="text-slate-600 text-sm">Complete 110-Card Monopoly Deal Deck • Click cards to flip</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-blue-600">{filteredCards.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">Cards</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'MONEY', 'PROPERTY', 'PROPERTY_WILD', 'ACTION', 'RENT'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    filter === f 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="max-w-7xl mx-auto space-y-12">
          {filter === 'ALL' ? (
            Object.entries(cardsByType).map(([type, cards]) => (
              cards.length > 0 && (
                <div key={type}>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-3">
                    <div className="h-1 w-12 bg-blue-600 rounded"></div>
                    {type} Cards ({cards.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {cards.map(card => (
                      <div key={card.uid} className="flex flex-col items-center gap-2">
                        <ErrorBoundary>
                           <div 
                             className="cursor-pointer transition-all duration-300 hover:scale-105"
                             onClick={() => toggleRotate(card.uid)}
                           >
                             <Card 
                               card={card} 
                               className={`transition-transform duration-500 ${rotatedCards.has(card.uid) ? 'rotate-180' : ''}`}
                             />
                           </div>
                        </ErrorBoundary>
                        
                        <div className="text-xs text-slate-600 text-center font-bold px-2 truncate w-full">{card.name}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRotate(card.uid);
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider border border-blue-200 rounded-full px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          {rotatedCards.has(card.uid) ? 'Flip 180' : 'Flip 180'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards.map(card => (
                      <div key={card.uid} className="flex flex-col items-center gap-2">
                        <ErrorBoundary>
                           <div 
                             className="cursor-pointer transition-all duration-300 hover:scale-105"
                             onClick={() => toggleRotate(card.uid)}
                           >
                             <Card 
                               card={card} 
                               className={`transition-transform duration-500 ${rotatedCards.has(card.uid) ? 'rotate-180' : ''}`}
                             />
                           </div>
                        </ErrorBoundary>
                        
                        <div className="text-xs text-slate-600 text-center font-bold px-2 truncate w-full">{card.name}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRotate(card.uid);
                          }}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider border border-blue-200 rounded-full px-3 py-1 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    {rotatedCards.has(card.uid) ? 'Flip 180' : 'Flip 180'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
