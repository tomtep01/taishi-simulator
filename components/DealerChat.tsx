import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface DealerChatProps {
  messages: ChatMessage[];
}

export const DealerChat: React.FC<DealerChatProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true); // Start assuming at bottom

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const distance = scrollHeight - scrollTop - clientHeight;
      // Consider user at bottom if within 50px
      isAtBottomRef.current = distance < 50;
    }
  };

  useEffect(() => {
    // Only auto-scroll if the user was already at the bottom
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'DEALER': return 'text-yellow-400 font-bold';
      case 'SYSTEM': return 'text-slate-400 italic';
      default: return 'text-blue-300 font-medium';
    }
  };

  return (
    <div className="absolute top-2 left-2 w-32 h-32 sm:top-20 sm:right-4 sm:w-72 sm:h-64 pointer-events-none z-30 flex flex-col justify-end">
      <div className="bg-black/30 sm:bg-black/60 backdrop-blur-[2px] sm:backdrop-blur-md rounded-lg p-2 sm:p-3 border border-yellow-500/10 sm:border-yellow-500/20 shadow-xl overflow-hidden flex flex-col justify-end h-full pointer-events-auto transition-opacity hover:opacity-100 opacity-70 sm:opacity-100">
         <div className="font-display text-yellow-500 text-[10px] sm:text-xs mb-1 sm:mb-2 tracking-widest uppercase border-b border-white/10 pb-1 flex justify-between">
            <span>Chat</span>
            <span className="text-green-500 animate-pulse">●</span>
         </div>
         <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-y-auto scrollbar-hide space-y-1 flex flex-col pointer-events-auto"
         >
            {messages.map((msg) => (
              <div key={msg.id} className="text-[10px] sm:text-sm break-words leading-tight animate-fade-in-up shadow-black drop-shadow-md">
                {msg.sender === 'SYSTEM' ? (
                   <span className="text-slate-400 italic opacity-80">
                     {msg.text}
                   </span>
                ) : (
                  <>
                    <span className={`${getSenderColor(msg.sender)} mr-1`}>
                      {msg.sender === 'DEALER' ? 'D:' : (msg.displayName || 'U') + ':'}
                    </span>
                    <span className={msg.sender === 'DEALER' ? 'text-white' : 'text-gray-200'}>
                      {msg.text}
                    </span>
                  </>
                )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};