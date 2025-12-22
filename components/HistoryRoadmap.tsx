import React from 'react';
import { GameHistoryItem, BetOption } from '../types';

interface HistoryRoadmapProps {
  history: GameHistoryItem[];
}

export const HistoryRoadmap: React.FC<HistoryRoadmapProps> = ({ history }) => {
  // Create a fixed grid of 6 rows x 20 columns max for display
  const renderBeads = () => {
    // Take last 20 items or fill with empty
    const displayHistory = history.slice(-18); 

    return (
      <div className="flex gap-2 items-center justify-center overflow-x-auto p-2 scrollbar-hide">
        {displayHistory.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1 min-w-[30px]">
             <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-lg
                  ${item.winner === BetOption.TAI 
                    ? 'bg-red-600 border-red-400 text-white' 
                    : 'bg-slate-700 border-blue-400 text-white'}
                `}
             >
                {item.result.sum}
             </div>
             <span className={`text-[10px] font-bold ${item.winner === BetOption.TAI ? 'text-red-500' : 'text-blue-400'}`}>
               {item.winner === BetOption.TAI ? 'T' : 'X'}
             </span>
          </div>
        ))}
        {/* Placeholder for empty slots to maintain look if history is short */}
        {Array.from({ length: Math.max(0, 10 - displayHistory.length) }).map((_, i) => (
           <div key={`empty-${i}`} className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 opacity-30"></div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-900/90 border-y border-yellow-600/30 backdrop-blur-sm">
      {renderBeads()}
    </div>
  );
};
