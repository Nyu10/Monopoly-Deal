import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Wifi, Zap, Shield } from 'lucide-react';

const MultiplayerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8 font-bold"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-2 border-purple-200">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-purple-100 rounded-full">
              <Users size={64} className="text-purple-600" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-4">
            Multiplayer Mode
          </h1>

          <div className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-bold text-sm mb-6">
            🚧 Coming Soon
          </div>

          <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
            We're working hard to bring you real-time multiplayer battles. Stay tuned!
          </p>

          <div className="grid gap-4 mb-8 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Wifi size={24} className="text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Real-Time Gameplay</h3>
                <p className="text-sm text-slate-600">Play with friends in synchronized matches</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Zap size={24} className="text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Instant Matchmaking</h3>
                <p className="text-sm text-slate-600">Find opponents quickly and easily</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Shield size={24} className="text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Fair Play</h3>
                <p className="text-sm text-slate-600">Anti-cheat and secure connections</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/stadium')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md"
            >
              Play vs Bots Instead
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerPage;
