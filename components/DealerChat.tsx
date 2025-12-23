import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';

interface DealerChatProps {
  messages: ChatMessage[];
  onSendMessage?: (text: string) => void;
  isBanned?: boolean;
  banUntil?: number;
}

export const DealerChat: React.FC<DealerChatProps> = ({ messages, onSendMessage, isBanned, banUntil }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true); 
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distance = scrollHeight - scrollTop - clientHeight;
      isAtBottomRef.current = distance < 50;
    }
  };

  useEffect(() => {
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Ban timer effect
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isBanned && banUntil) {
          interval = setInterval(() => {
              const remaining = Math.max(0, Math.ceil((banUntil - Date.now()) / 1000));
              setTimeLeft(remaining);
              if (remaining <= 0) clearInterval(interval);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isBanned, banUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanned) return;
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'DEALER': return 'text-yellow-400 font-bold';
      case 'SYSTEM': return 'text-slate-400 italic';
      case 'USER': return 'text-green-400 font-medium'; // User messages green
      default: return 'text-blue-300 font-medium';
    }
  };

  return (
    <div className="absolute top-2 left-2 w-36 h-48 sm:top-20 sm:right-4 sm:w-72 sm:h-80 pointer-events-none z-30 flex flex-col justify-end">
      <div className="bg-black/30 sm:bg-black/60 backdrop-blur-[2px] sm:backdrop-blur-md rounded-lg p-2 sm:p-3 border border-yellow-500/10 sm:border-yellow-500/20 shadow-xl overflow-hidden flex flex-col justify-between h-full pointer-events-auto transition-opacity hover:opacity-100 opacity-70 sm:opacity-100">
         
         {/* Header */}
         <div className="font-display text-yellow-500 text-[10px] sm:text-xs mb-1 sm:mb-2 tracking-widest uppercase border-b border-white/10 pb-1 flex justify-between shrink-0">
            <span>Chat</span>
            <span className="text-green-500 animate-pulse">●</span>
         </div>
         
         {/* Messages List */}
         <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-y-auto scrollbar-hide space-y-1 flex flex-col pointer-events-auto flex-1 mb-2"
         >
            {messages.map((msg) => (
              <div key={msg.id} className="text-[10px] sm:text-sm break-words leading-tight animate-fade-in-up shadow-black drop-shadow-md">
                {msg.sender === 'SYSTEM' ? (
                   <span className="text-red-400 italic opacity-90 text-[10px]">
                     {msg.text}
                   </span>
                ) : (
                  <>
                    <span className={`${getSenderColor(msg.sender)} mr-1`}>
                      {msg.sender === 'DEALER' ? 'D:' : (msg.displayName || 'Tôi') + ':'}
                    </span>
                    <span className={msg.sender === 'DEALER' ? 'text-white' : 'text-gray-200'}>
                      {msg.text}
                    </span>
                  </>
                )}
              </div>
            ))}
         </div>

         {/* Input Area */}
         <form onSubmit={handleSubmit} className="shrink-0 flex gap-1 pointer-events-auto relative">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isBanned}
              placeholder={isBanned ? `Cấm chat: ${timeLeft}s` : "Nhập tin nhắn..."}
              className={`flex-1 bg-black/40 border rounded px-2 py-1 text-[10px] sm:text-xs text-white focus:outline-none transition-colors
                 ${isBanned ? 'border-red-500/50 bg-red-900/20 placeholder-red-400 cursor-not-allowed' : 'border-white/10 focus:border-yellow-500/50'}
              `}
            />
            <button 
              type="submit"
              disabled={isBanned}
              className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold transition-colors
                 ${isBanned ? 'bg-slate-700 text-slate-500' : 'bg-yellow-600/80 hover:bg-yellow-500 text-black'}
              `}
            >
              ➤
            </button>
         </form>

      </div>
    </div>
  );
};