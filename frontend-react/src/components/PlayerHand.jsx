import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward } from 'lucide-react';
import Card from './Card';

const PlayerHand = ({ hand, movesLeft, onPlayCard, onEndTurn, isTurn, gameState }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 bg-white/5 px-6 py-2 rounded-full border border-white/10">
        <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= movesLeft ? 'bg-yellow-500' : 'bg-white/10'}`} />
            ))}
            <span className="text-xs font-black uppercase tracking-widest text-white/50 ml-2">{movesLeft} MOVES</span>
        </div>
        
        <button 
          onClick={onEndTurn}
          disabled={!isTurn}
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isTurn ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-white/5 text-white/20'}`}
        >
          END TURN
        </button>
      </div>
      
      <div className="flex justify-center -space-x-12 px-12">
        <AnimatePresence>
            {hand.map((c, i) => (
                <motion.div key={c.uid} layoutId={c.uid} style={{ zIndex: i }} className="origin-bottom">
                    <Card card={c} onClick={() => onPlayCard(c)} />
                </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlayerHand;
