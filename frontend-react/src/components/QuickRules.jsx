import React, { useRef, useEffect } from 'react';
import { X, Trophy, AlertCircle, PlayCircle, Layers, ArrowRight } from 'lucide-react';

const QuickRules = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200"
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="text-white font-black uppercase tracking-wider text-sm">Quick Reference</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[75vh] p-6 space-y-8 bg-slate-50/50">
          
          {/* Section 1: The Goal */}
          <section className="animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <Trophy size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-amber-600 leading-none mb-1">The Objective</h3>
                <h4 className="font-bold text-base text-slate-900 leading-none">How To Win</h4>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-amber-50/30 border border-amber-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                "Be the first player to collect <span className="text-amber-600 underline decoration-amber-200 underline-offset-4">3 complete property sets</span> in different colors."
              </p>
            </div>
          </section>

          {/* Section 2: Gameplay */}
          <section className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <PlayCircle size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600 leading-none mb-1">Game Loop</h3>
                <h4 className="font-bold text-base text-slate-900 leading-none">On Your Turn</h4>
              </div>
            </div>
            
            <div className="space-y-6 relative ml-2">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent"></div>

              {/* Step 1 */}
              <div className="relative flex gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 z-10 shadow-lg shadow-blue-200 ring-4 ring-white">1</div>
                <div>
                   <h4 className="font-bold text-sm text-slate-800">Draw 2 Cards</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Start of your turn</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 z-10 shadow-lg shadow-blue-200 ring-4 ring-white">2</div>
                <div className="w-full">
                   <h4 className="font-bold text-sm text-slate-800 mb-3">Play up to 3 cards</h4>
                   <div className="grid gap-2">
                      {[
                        { text: "Bank", desc: "Money & Action cards", icon: "💰" },
                        { text: "Build", desc: "Properties & Wilds", icon: "🏠" },
                        { text: "Action", desc: "Play cards for effects", icon: "⚡" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-50/50 shadow-sm">
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider mb-0.5">{item.text}</div>
                            <div className="text-xs text-slate-600 font-medium">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 font-black text-xs flex items-center justify-center shrink-0 z-10 ring-4 ring-white">3</div>
                <div>
                   <h4 className="font-bold text-sm text-slate-800">End your turn</h4>
                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                     Hand limit is <span className="font-black text-slate-900">7 cards</span>. Discard extras to the pile.
                   </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Fine Print */}
          <section className="animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-2 rounded-lg text-red-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-red-600 leading-none mb-1">Nuances</h3>
                <h4 className="font-bold text-base text-slate-900 leading-none">Critical Rules</h4>
              </div>
            </div>
            <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-red-50">
                 {[
                   "You may not pay a debt with cards from your hand.",
                   "Properties never go in your Bank.",
                   "Change is never given when paying a debt.",
                   "If you run out of money, you must pay with property.",
                   "Flip wild property colors anytime during your turn."
                 ].map((rule, i) => (
                   <div key={i} className="p-3 text-[11px] text-slate-700 leading-snug flex items-center gap-3 hover:bg-red-50/30 transition-colors">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                     {rule}
                   </div>
                 ))}
              </div>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100">
             <button 
               onClick={onClose}
               className="group w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
             >
               Got it, let's play!
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>
        </div>
      </div>
    </div>
  );
};

export default QuickRules;
