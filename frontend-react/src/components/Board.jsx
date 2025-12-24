import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Users, Info, Layers, Trash2, History, ChevronRight, DollarSign } from 'lucide-react';
import Card from './Card';
import PlayerHand from './PlayerHand';
import HowToPlay from './HowToPlay';
import { getSets, COLORS } from '../utils/gameHelpers';

const Board = ({ 
    players, 
    turnIndex, 
    gameState, 
    movesLeft, 
    logs, 
    deck, 
    discardPile, 
    onDraw, 
    onPlayCard, 
    onEndTurn 
}) => {
    const [showRules, setShowRules] = useState(false);
    const player = players[0];
    const isMyTurn = turnIndex === 0;

    return (
        <div className="w-full h-screen bg-[#09090b] flex overflow-hidden font-sans text-slate-200 select-none">
            {/* Sidebar with Logs */}
            <div className="w-80 bg-zinc-950/50 backdrop-blur-3xl border-r border-white/10 flex flex-col shadow-2xl z-20">
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <h1 className="text-2xl font-black text-yellow-500 tracking-tighter uppercase italic">Monopoly Deal</h1>
                    <button onClick={() => setShowRules(true)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                        <Info size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                        <History size={12} />
                        Game History
                    </div>
                    {logs.map((l, i) => (
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            key={i}
                            className={`text-xs p-4 rounded-2xl border ${l.type === 'system' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' : 'bg-white/5 border-white/5 text-zinc-400'}`}
                        >
                            {l.text}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-[#09090b]">
                {/* Opponents Section */}
                <div className="h-1/4 flex justify-center gap-8 p-8 items-start">
                    {players.slice(1).map(p => (
                        <motion.div 
                            key={p.id} 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`w-72 bg-zinc-900/50 backdrop-blur-md rounded-[2.5rem] p-5 border-2 transition-all duration-500 ${turnIndex === p.id ? 'border-yellow-500 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)] scale-105' : 'border-white/5 opacity-80'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-zinc-800 rounded-full">
                                    <Cpu size={16} className={turnIndex === p.id ? 'text-yellow-500' : 'text-zinc-500'} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">{p.name}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{p.hand.length} Cards in Hand</span>
                                </div>
                                <div className="ml-auto text-yellow-500 font-mono text-lg font-black">${p.bank.reduce((a,c)=>a+c.value,0)}M</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {getSets(p.properties).map((s, i) => (
                                    <div key={i} className="flex flex-col-reverse -space-y-4 group">
                                        {s.cards.map(c => (
                                            <div 
                                                key={c.uid} 
                                                className="w-8 h-10 rounded-lg border border-white/20 shadow-xl transition-transform group-hover:translate-z-10" 
                                                style={{ backgroundColor: COLORS[c.currentColor||c.color]?.hex || '#444' }} 
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Center: Deck and Discard Pile */}
                <div className="flex-1 flex items-center justify-center gap-16 relative">
                    {/* Deck Tracking */}
                    <div className="flex flex-col items-center gap-4 group">
                        <div onClick={() => isMyTurn && gameState === 'DRAW' && onDraw()} className={`relative ${isMyTurn && gameState === 'DRAW' ? 'cursor-pointer hover:scale-110 active:scale-95' : 'opacity-40'} transition-all duration-300`}>
                            {deck && <Card faceDown size="lg" className="shadow-2xl translate-y-[-2px] translate-x-[-2px]" />}
                            <Card faceDown size="lg" className="absolute top-1 left-1 -z-10 opacity-60" />
                            <Card faceDown size="lg" className="absolute top-2 left-2 -z-20 opacity-30" />
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
                            <Layers size={14} className="text-zinc-500" />
                            <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">{deck?.length || 0} CARDS LEFT</span>
                        </div>
                    </div>

                    {/* Discard Pile */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-52 h-80 bg-zinc-950/40 border-2 border-dashed border-white/10 rounded-[2rem] flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="popLayout">
                                {discardPile?.length > 0 ? (
                                    <Card key={discardPile[discardPile.length - 1].uid} card={discardPile[discardPile.length - 1]} size="lg" className="shadow-2xl" />
                                ) : (
                                    <Trash2 size={48} className="text-white/5" />
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
                            <Trash2 size={14} className="text-zinc-500" />
                            <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">{discardPile?.length || 0} DISCARDED</span>
                        </div>
                    </div>

                    {/* Turn Notification Overlay */}
                    <AnimatePresence>
                        {isMyTurn && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-0 right-0 p-4"
                            >
                                <div className="bg-yellow-500 text-black px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest shadow-[0_10px_40px_-10px_rgba(234,179,8,0.5)] flex items-center gap-3">
                                    Your Turn
                                    <ChevronRight size={16} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Player UI Area */}
                <div className="h-[35%] bg-zinc-950/80 backdrop-blur-3xl border-t border-white/10 p-8 flex items-end gap-10">
                    {/* Bank Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                            <DollarSign size={12} />
                            Your Bank
                        </div>
                        <div className="flex -space-x-12 hover:space-x-4 transition-all duration-500 h-32 items-end pb-2 group">
                            {player.bank.length > 0 ? (
                                player.bank.map((c, i) => (
                                    <motion.div key={c.uid} layoutId={c.uid} className="hover:z-50 hover:-translate-y-4 transition-all">
                                        <Card card={c} size="sm" />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="w-16 h-24 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center">
                                    <DollarSign size={20} className="text-white/5" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Properties Section */}
                    <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-end h-32">
                        {getSets(player.properties).map((set, i) => (
                            <div key={i} className={`p-1 rounded-[2rem] transition-all duration-300 ${set.isComplete ? 'bg-yellow-500/10 scale-105' : ''}`}>
                                <div className="flex -space-x-12 hover:space-x-2 transition-all duration-500">
                                    {set.cards.map(c => (
                                        <Card key={c.uid} card={c} size="sm" layoutId={c.uid} className="shadow-2xl" />
                                    ))}
                                </div>
                            </div>
                        ))}
                         {player.properties.length === 0 && (
                            <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center italic text-white/10 text-xs">
                                No properties yet. Build your empire.
                            </div>
                        )}
                    </div>

                    {/* Hand and Actions */}
                    <div className="w-fit">
                        <PlayerHand 
                            hand={player.hand} 
                            movesLeft={movesLeft} 
                            isTurn={isMyTurn} 
                            gameState={gameState} 
                            onPlayCard={onPlayCard} 
                            onEndTurn={onEndTurn} 
                        />
                    </div>
                </div>
            </div>

            {/* Rules Modal */}
            <AnimatePresence>
                {showRules && (
                    <HowToPlay onClose={() => setShowRules(false)} />
                )}
            </AnimatePresence>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
};

export default Board;
