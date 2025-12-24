import React from 'react';
import { X, BookOpen, Trophy, CreditCard, Home, HelpCircle, ShieldAlert, Sparkles, AlertCircle, TrendingUp, Info, Layers } from 'lucide-react';

const HowToPlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-5xl w-full h-[90vh] bg-zinc-950/80 rounded-[48px] border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-yellow-500/20 flex items-center justify-center text-yellow-500 border border-yellow-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black italic text-white leading-tight tracking-tight uppercase">The Official Rules</h2>
              <p className="text-yellow-500/60 text-[10px] font-black uppercase tracking-[0.5em]">Standard 110-Card Deck Edition</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 hover:scale-110 active:scale-95"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-16 custom-scrollbar">
          
          {/* Section 1: Objective */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-yellow-500">
              <Trophy size={24} />
              <h3 className="font-black uppercase tracking-[0.3em] text-sm italic">01. The Objective</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-2xl text-zinc-100 font-medium leading-relaxed">
                  To win, be the first player to complete <span className="text-yellow-500 font-black italic">three full Property Sets</span> of different colors.
                </p>
                <div className="bg-yellow-500/5 p-6 rounded-3xl border border-yellow-500/20">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-yellow-500 shrink-0" size={20} />
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Collect properties, charge rent, and steal from others to build your sets. The first to three wins instantly!
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900/60 rounded-[32px] p-8 border border-white/5 space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h4 className="text-white/40 font-black text-[10px] uppercase tracking-widest text-center w-full">Sample Target Sets</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                    <div className="w-full h-2 rounded bg-blue-600 shadow-lg"></div>
                    <span className="text-zinc-200 font-bold text-xs">Dark Blue</span>
                    <span className="text-yellow-500 font-mono font-black text-[10px]">2 CARDS</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                    <div className="w-full h-2 rounded bg-green-600 shadow-lg"></div>
                    <span className="text-zinc-200 font-bold text-xs">Green</span>
                    <span className="text-yellow-500 font-mono font-black text-[10px]">3 CARDS</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Hierarchy of Payment (Requested) */}
          <section className="space-y-8 p-10 bg-emerald-500/5 rounded-[40px] border border-emerald-500/10">
            <div className="flex items-center gap-4 text-emerald-400">
              <TrendingUp size={24} />
              <h3 className="font-black uppercase tracking-[0.3em] text-sm italic">02. Hierarchy of Payment</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                    <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">01. Cash First</div>
                    <p className="text-zinc-400 text-xs leading-relaxed">Players must first pay using any Money cards in their bank. No change is ever given!</p>
                </div>
                <div className="space-y-3">
                    <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">02. Property Assets</div>
                    <p className="text-zinc-400 text-xs leading-relaxed">If you run out of cash, you MUST pay with properties from your collection. They are valued at the number shown on the card.</p>
                </div>
                <div className="space-y-3">
                    <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">03. Bankruptcy</div>
                    <p className="text-zinc-400 text-xs leading-relaxed">If you have NO cards on the table (no bank, no properties), you pay nothing. You never pay with cards from your hand!</p>
                </div>
            </div>
          </section>

          {/* Section 3: The Deck Composition */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-purple-400">
              <Layers size={24} />
              <h3 className="font-black uppercase tracking-[0.3em] text-sm italic">03. The 110-Card Deck</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Money', count: 20, color: 'text-green-400' },
                    { label: 'Properties', count: 28, color: 'text-blue-400' },
                    { label: 'Wildcards', count: 11, color: 'text-amber-400' },
                    { label: 'Action Cards', count: 34, color: 'text-orange-400' },
                    { label: 'Rent Cards', count: 13, color: 'text-purple-400' },
                    { label: 'Ref Cards', count: 4, color: 'text-zinc-500' },
                ].map((item, i) => (
                    <div key={i} className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 flex flex-col items-center">
                        <span className={`text-xl font-black ${item.color}`}>{item.count}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>
          </section>

          {/* Section 4: Tactical Mechanics */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-red-400">
              <ShieldAlert size={24} />
              <h3 className="font-black uppercase tracking-[0.3em] text-sm italic">04. Tactical Intel</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 bg-zinc-900/60 rounded-[40px] border border-white/10 space-y-4">
                <ShieldAlert size={24} className="text-red-500" />
                <h5 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Just Say No</h5>
                <p className="text-zinc-500 text-xs leading-relaxed italic">The only card playable on an opponent's turn. Cancels any action played against you.</p>
              </div>

              <div className="p-8 bg-zinc-900/60 rounded-[40px] border border-white/10 space-y-4">
                <Home size={24} className="text-green-500" />
                <h5 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Buildings</h5>
                <p className="text-zinc-500 text-xs leading-relaxed italic">House adds $3M rent, Hotel adds $4M. Must be placed on a completed set.</p>
              </div>

              <div className="p-8 bg-zinc-900/60 rounded-[40px] border border-white/10 space-y-4">
                <Sparkles size={24} className="text-amber-500" />
                <h5 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Sly Deal</h5>
                <p className="text-zinc-500 text-xs leading-relaxed italic">Steal any property that is NOT part of a full set. Full sets are protected!</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-white/5 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Official Monopoly Deal Ruleset • 110 Cards Total</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default HowToPlay;
