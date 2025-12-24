import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StadiumLayout from '../components/StadiumLayout';

// Mock data for testing
const createMockPlayer = (id, name, isBot = true) => ({
  id,
  name,
  isHuman: !isBot,
  hand: Array.from({ length: Math.floor(Math.random() * 7) + 1 }, (_, i) => ({
    id: `${id}-hand-${i}`,
    type: 'MONEY',
    value: Math.floor(Math.random() * 5) + 1
  })),
  bank: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
    id: `${id}-bank-${i}`,
    type: 'MONEY',
    value: [1, 2, 3, 4, 5, 10][Math.floor(Math.random() * 6)]
  })),
  properties: Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => {
    const colors = ['brown', 'cyan', 'pink', 'orange', 'red', 'yellow', 'green', 'blue'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      id: `${id}-prop-${i}`,
      type: 'PROPERTY',
      color,
      currentColor: color,
      value: Math.floor(Math.random() * 4) + 1
    };
  })
});

const StadiumDemo = () => {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState(4);
  const [currentTurn, setCurrentTurn] = useState(0);

  // Generate mock players
  const players = [
    { id: 'player-0', name: 'You', isHuman: true, hand: [], bank: [], properties: [] },
    ...Array.from({ length: playerCount - 1 }, (_, i) => 
      createMockPlayer(`bot-${i}`, `Bot ${i + 1}`, true)
    )
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <h1 className="text-2xl font-black text-white">Stadium Layout Demo</h1>
          
          <div className="flex items-center gap-4">
            <label className="text-white text-sm">
              Players:
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="ml-2 bg-slate-700 text-white rounded px-3 py-1 border border-slate-600"
              >
                {[2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            
            <button
              onClick={() => setCurrentTurn((currentTurn + 1) % playerCount)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              Next Turn
            </button>
          </div>
        </div>
      </div>

      {/* Stadium Layout */}
      <div className="h-[calc(100vh-80px)]">
        <StadiumLayout
          players={players}
          currentPlayerId="player-0"
          currentTurnIndex={currentTurn}
          onOpponentSelect={(player) => {
            console.log('Selected opponent:', player.name);
            alert(`Selected: ${player.name}`);
          }}
        />
      </div>
    </div>
  );
};

export default StadiumDemo;
