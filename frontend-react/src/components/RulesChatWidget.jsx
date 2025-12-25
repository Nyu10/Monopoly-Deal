import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

const RULES_DATA = [
  {
    keywords: ['win', 'objective', 'goal', 'winning'],
    response: "To win, be the first player to complete 3 full Property Sets of different colors. Collect properties, charge rent, and steal from others to build your sets!"
  },
  {
    keywords: ['pay', 'rent', 'money', 'cash', 'debt', 'owe'],
    response: "Hierarchy of Payment:\n1. Cash First: Pay using Money cards in your bank (no change given).\n2. Property Assets: If out of cash, pay with properties on the table.\n3. Bankruptcy: If you have no cards on table, you pay nothing. NEVER pay with cards from your hand."
  },
  {
    keywords: ['sly', 'deal', 'steal', 'force'],
    response: "Sly Deal lets you steal any property NOT part of a full set. Forced Deal lets you swap a property with another player (also cannot be from a full set). Full sets are protected unless you use a Deal Breaker!"
  },
  {
    keywords: ['break', 'breaker'],
    response: "Deal Breaker lets you steal an entire COMPLETE set of properties from an opponent. It's the most powerful card!"
  },
  {
    keywords: ['no', 'cancel', 'stop', 'just say no'],
    response: "Just Say No is the only card playable on an opponent's turn. It cancels any action played against you. You can even 'Just Say No' a 'Just Say No'!"
  },
  {
    keywords: ['house', 'hotel', 'building'],
    response: "House adds $3M to rent, Hotel adds $4M. They must be placed on a COMPLETED full set of properties. You can't add a Hotel before a House!"
  },
  {
    keywords: ['start', 'turn', 'draw'],
    response: "Start your turn by drawing 2 cards. If you have no cards in hand, draw 5 instead. You can play up to 3 cards per turn."
  },
  {
    keywords: ['wild', 'multicolor', 'all color'],
    response: "Wildcards can be used as properties of any color shown on the card. The 10-color Property Wildcard can be essentially any color but creates no monetary value on its own."
  }
];

const RulesChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm the Monopoly Deal RuleBot. Ask me anything about the rules!", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Attempt to contact real AI backend
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });

      if (!response.ok) {
        throw new Error('Backend unreachable');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'bot' }]);

    } catch (error) {
      console.log("Falling back to local rules", error);
      
      // Fallback Simulation
      setTimeout(() => {
        const lowerInput = userMsg.text.toLowerCase();
        let response = "I'm having trouble reaching the main server, so I'm using my local rulebook: ";
        let found = false;
        
        for (const rule of RULES_DATA) {
          if (rule.keywords.some(k => lowerInput.includes(k))) {
            response = rule.response;
            found = true;
            break;
          }
        }
        
        if (!found) {
            response = "I couldn't reach the AI server and I don't have a specific local rule for that. Please try asking about Winning, Rent, or Action Cards.";
        }

        setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'bot' }]);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-zinc-800/50 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Bot size={16} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">RuleBot AI</h3>
                <p className="text-[10px] text-zinc-400">Powered by LLM</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-950/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${msg.sender === 'user' ? 'bg-zinc-700 text-zinc-300' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}
                `}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`
                  p-3 rounded-2xl text-sm max-w-[80%] leading-relaxed whitespace-pre-wrap
                  ${msg.sender === 'user' 
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-md' 
                    : 'bg-indigo-500/10 text-indigo-100 border border-indigo-500/20 rounded-tl-md'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Bot size={14} className="text-indigo-400" />
                 </div>
                 <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-tl-md flex items-center">
                    <Loader2 size={16} className="text-indigo-400 animate-spin" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-white/5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="w-full bg-zinc-950 text-white text-sm rounded-xl py-3 pl-4 pr-12 border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? 'bg-zinc-800 text-zinc-400 rotate-90' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/25'}
        `}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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

export default RulesChatWidget;
