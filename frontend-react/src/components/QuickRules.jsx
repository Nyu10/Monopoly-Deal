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
        <div className="overflow-y-auto max-h-[70vh] p-6 space-y-6 bg-slate-50">
          
          {/* Important Rules (Top bullets) */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-red-600">
              <AlertCircle size={18} />
              <h3 className="font-bold text-xs uppercase tracking-wider">Critical Rules</h3>
            </div>
            <ul className="space-y-2">
               {[
                 "You may not pay a debt with cards from your hand.",
                 "Properties never go in your Bank.",
                 "Change is never given when paying a debt.",
                 "If you don't have enough money in your Bank, pay with property.",
                 "You may change the color of a wild property card anytime during your turn."
               ].map((rule, i) => (
                 <li key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                   <span className="text-red-400 mt-0.5">•</span>
                   {rule}
                 </li>
               ))}
            </ul>
          </div>

          {/* How To Win */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-amber-600">
              <Trophy size={18} strokeWidth={2.5} />
              <h3 className="font-black text-xs uppercase tracking-wider">How To Win</h3>
            </div>
            <p className="text-sm font-bold text-slate-800">
              Collect 3 complete property sets, each in a different color.
            </p>
          </div>

          {/* Set Up */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-600">
              <Layers size={18} strokeWidth={2.5} />
              <h3 className="font-black text-xs uppercase tracking-wider">Set Up</h3>
            </div>
            <p className="text-xs text-slate-600">
              Each player starts with <span className="font-bold text-slate-900">5 cards</span>.
            </p>
          </div>

          {/* On Your Turn */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-blue-600">
              <PlayCircle size={18} strokeWidth={2.5} />
              <h3 className="font-black text-xs uppercase tracking-wider">On Your Turn</h3>
            </div>
            
            <div className="space-y-4 relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-blue-200/50"></div>

              {/* Step 1 */}
              <div className="relative flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 z-10 ring-4 ring-blue-50">1</div>
                <div>
                   <h4 className="font-bold text-sm text-slate-800">Draw 2 Cards</h4>
                   <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">Start of turn</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 z-10 ring-4 ring-blue-50">2</div>
                <div className="w-full">
                   <h4 className="font-bold text-sm text-slate-800 mb-2">Play up to 3 cards</h4>
                   <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm space-y-2">
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <ArrowRight size={14} className="text-blue-400 mt-0.5 shrink-0" />
                        <span>Add money/action cards to your <span className="font-bold text-slate-800">Bank</span>.</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <ArrowRight size={14} className="text-blue-400 mt-0.5 shrink-0" />
                        <span>Add properties to your <span className="font-bold text-slate-800">Collection</span>.</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <ArrowRight size={14} className="text-blue-400 mt-0.5 shrink-0" />
                        <span>Play an <span className="font-bold text-slate-800">Action Card</span> into center.</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 z-10 ring-4 ring-blue-50">3</div>
                <div>
                   <h4 className="font-bold text-sm text-slate-800">End your turn</h4>
                   <p className="text-xs text-slate-600 mt-1 leading-snug">
                     Limit hand to 7 cards. Discard extras if you have more than 7.
                   </p>
                </div>
              </div>

            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
             <button 
               onClick={onClose}
               className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors"
             >
               Got it, let's play!
             </button>
        </div>
      </div>
    </div>
  );
};

export default QuickRules;
