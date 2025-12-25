import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Users, Trophy, Sparkles, BookOpen } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy size={48} className="text-yellow-500" />
            <h1 className="text-6xl font-black text-slate-900">
              Monopoly Deal
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The fast-paced card game where you collect property sets, charge rent, and deal your way to victory!
          </p>
        </div>

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Bot Game Card */}
          <button
            onClick={() => navigate('/stadium')}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-200 hover:border-blue-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-colors">
                  <Cpu size={48} className="text-blue-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-3 text-center">
                Play vs Bots
              </h2>
              
              <p className="text-slate-600 text-center mb-6">
                Practice against AI opponents. Perfect for solo play!
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Sparkles size={16} />
                <span>Instant Start</span>
              </div>
            </div>
          </button>

          {/* Tutorial Card */}
          <button
            onClick={() => navigate('/tutorial')}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-200 hover:border-green-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-500 transition-colors">
                  <BookOpen size={48} className="text-green-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-3 text-center">
                Learn to Play
              </h2>
              
              <p className="text-slate-600 text-center mb-6">
                Interactive tutorial covering all game mechanics.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Sparkles size={16} />
                <span>5 Minutes</span>
              </div>
            </div>
          </button>

          {/* Multiplayer Card */}
          <button
            onClick={() => navigate('/multiplayer')}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-200 hover:border-purple-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-500 transition-colors">
                  <Users size={48} className="text-purple-600 group-hover:text-white transition-colors" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-3 text-center">
                Multiplayer
              </h2>
              
              <p className="text-slate-600 text-center mb-6">
                Challenge friends in real-time matches.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-amber-600 font-bold">
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span>Coming Soon</span>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Info */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3 text-center">
            How to Win
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-blue-600 mb-1">3</div>
              <div className="text-sm text-slate-600">Complete Property Sets</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-600 mb-1">3</div>
              <div className="text-sm text-slate-600">Actions Per Turn</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-600 mb-1">7</div>
              <div className="text-sm text-slate-600">Card Hand Limit</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/cards')}
            className="text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
          >
            View All Cards →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
