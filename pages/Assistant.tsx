
import React, { useState, useRef, useEffect } from 'react';
import { getMechdyaneAssistantResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AssistantProps {
  isApiEnabled?: boolean;
}

const Assistant: React.FC<AssistantProps> = ({ isApiEnabled = true }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Greetings, User. Mechdyane Core is online. How can I facilitate your growth today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !isApiEnabled) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const aiResponse = await getMechdyaneAssistantResponse(history, input);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, timestamp: Date.now() }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617]/60">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {!isApiEnabled && (
          <div className="bg-amber-600/10 border border-amber-500/20 p-6 rounded-2xl mb-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
             <i className="fas fa-satellite-dish-slash text-amber-500 text-2xl"></i>
             <div>
               <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest font-orbitron">Archive Mode Active</h4>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Mechdyane Core AI is currently in stasis. Link to the real-time neural stream in Control Center to resume conversation.</p>
             </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
            } ${!isApiEnabled && m.role === 'assistant' ? 'border-amber-500/20' : ''}`}>
              <p className="text-xs md:text-sm leading-relaxed">{m.content}</p>
              <p className="text-[8px] md:text-[10px] mt-2 opacity-50 font-black uppercase tracking-widest">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 md:p-4 bg-slate-900/50 border-t border-white/5">
        <div className={`flex gap-2 ${!isApiEnabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          {/* Voice Tool Icon */}
          <button 
            className="w-10 md:w-12 h-10 md:h-12 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl flex items-center justify-center transition-all border border-white/5 active:text-blue-400 active:border-blue-500/30"
            title="Voice Command"
            onClick={() => alert("Voice input module initializing...")}
          >
            <i className="fas fa-microphone text-sm"></i>
          </button>
          
          <input
            type="text"
            disabled={!isApiEnabled}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isApiEnabled ? "Query Core..." : "Core Stasis Engaged"}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !isApiEnabled}
            className={`w-10 md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg ${isApiEnabled ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-slate-700'}`}
          >
            <i className={`fas ${isApiEnabled ? 'fa-paper-plane' : 'fa-lock'} text-white text-sm`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
