
import React, { useState } from 'react';

interface AdminPanelProps {
  isOpen: boolean;
  preDeterminedResult: [number, number, number] | null;
  forcedResult: [number, number, number] | null;
  onForceResult: (dice: [number, number, number] | null) => void;
  spamThreshold: number;
  onSetSpamThreshold: (val: number) => void;
  isChatBanned: boolean;
  onUnbanChat: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  preDeterminedResult, 
  forcedResult, 
  onForceResult,
  spamThreshold,
  onSetSpamThreshold,
  isChatBanned,
  onUnbanChat
}) => {
  if (!isOpen) return null;

  const [isExpanded, setIsExpanded] = useState(true);
  const [d1, setD1] = useState(1);
  const [d2, setD2] = useState(1);
  const [d3, setD3] = useState(1);

  const applyForce = () => {
    onForceResult([d1, d2, d3]);
  };

  const clearForce = () => {
    onForceResult(null);
  };

  const nextSum = forcedResult 
    ? forcedResult[0] + forcedResult[1] + forcedResult[2] 
    : preDeterminedResult 
        ? preDeterminedResult[0] + preDeterminedResult[1] + preDeterminedResult[2] 
        : 0;
        
  const nextType = nextSum >= 11 ? 'TAI' : 'XIU';

  return (
    <div 
        className={`fixed right-0 top-14 bottom-0 w-48 z-[60] transition-transform duration-300 ease-in-out flex items-start ${isExpanded ? 'translate-x-0' : 'translate-x-[12rem]'}`}
    >
        {/* Toggle Handle */}
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -left-8 top-0 w-8 h-10 bg-red-900/90 border-l border-y border-red-500/50 rounded-l-md flex items-center justify-center text-red-300 hover:text-white shadow-[-5px_0_10px_rgba(0,0,0,0.3)] backdrop-blur"
        >
            {isExpanded ? '►' : '◄'}
        </button>

        {/* Main Panel Content */}
        <div className="w-full h-full bg-black/95 backdrop-blur-xl border-l border-red-500/30 flex flex-col p-4 shadow-[-5px_0_20px_rgba(0,0,0,0.5)] overflow-y-auto scrollbar-hide pb-20">
            <div className="border-b border-red-500/30 pb-2 mb-4">
                <h3 className="text-red-500 font-display text-lg tracking-widest text-center">BẢNG VIP</h3>
            </div>

            {/* Prediction Display */}
            <div className="bg-slate-900/80 p-3 rounded mb-6 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Kết quả dự đoán</div>
                {preDeterminedResult ? (
                    <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-1">
                            {preDeterminedResult.map((v, i) => (
                                <span key={i} className="w-5 h-5 bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-white">{v}</span>
                            ))}
                        </div>
                        {!forcedResult && (
                            <div className={`text-lg font-bold ${nextType === 'TAI' ? 'text-red-500' : 'text-blue-500'}`}>
                                {nextSum} - {nextType}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-xs text-slate-500 italic">Đang chờ ván mới...</div>
                )}
            </div>

            {/* Force Result Controls */}
            <div className="space-y-4 border-b border-white/10 pb-4 mb-4">
                <div className="text-[10px] text-red-400 uppercase font-bold">Cài đặt kết quả</div>
                
                <div className="flex justify-between gap-1">
                    {[d1, d2, d3].map((val, idx) => (
                        <input 
                            key={idx}
                            type="number"
                            min="1"
                            max="6"
                            value={val}
                            onChange={(e) => {
                                const v = Math.min(6, Math.max(1, parseInt(e.target.value) || 1));
                                if (idx === 0) setD1(v);
                                if (idx === 1) setD2(v);
                                if (idx === 2) setD3(v);
                            }}
                            className="w-10 h-10 bg-slate-800 border border-slate-600 text-center text-white rounded focus:border-red-500 focus:outline-none"
                        />
                    ))}
                </div>

                <button 
                    onClick={applyForce}
                    className={`w-full py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors
                        ${forcedResult ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                    `}
                >
                    {forcedResult ? 'ĐANG BẬT' : 'KÍCH HOẠT'}
                </button>

                {forcedResult && (
                    <button 
                        onClick={clearForce}
                        className="w-full py-2 border border-slate-600 rounded text-[10px] text-slate-400 hover:text-white hover:border-white transition-colors"
                    >
                        HỦY (NGẪU NHIÊN)
                    </button>
                )}
            </div>

            {/* Chat Controls */}
            <div className="space-y-3">
                <div className="text-[10px] text-red-400 uppercase font-bold">Cài đặt Chat</div>
                
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Giới hạn Spam (tin/giây)</label>
                    <input 
                        type="number"
                        min="1"
                        max="20"
                        value={spamThreshold}
                        onChange={(e) => onSetSpamThreshold(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                    />
                </div>

                <div className="bg-slate-900 p-2 rounded border border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400">Trạng thái:</span>
                        <span className={`text-[10px] font-bold ${isChatBanned ? 'text-red-500' : 'text-green-500'}`}>
                            {isChatBanned ? 'ĐANG BỊ CẤM' : 'BÌNH THƯỜNG'}
                        </span>
                    </div>
                    {isChatBanned && (
                         <button 
                            onClick={onUnbanChat}
                            className="w-full mt-1 bg-green-700 hover:bg-green-600 text-white text-[10px] font-bold py-1.5 rounded uppercase"
                         >
                            Gỡ Ban Ngay
                         </button>
                    )}
                </div>
            </div>
            
            {forcedResult && (
                <div className="mt-4 p-2 bg-red-900/20 border border-red-500/50 rounded text-center">
                    <div className="text-[10px] text-red-300 mb-1">Đã can thiệp</div>
                    <div className="text-xl font-bold text-white">
                        {forcedResult.reduce((a,b)=>a+b,0)} - {forcedResult.reduce((a,b)=>a+b,0) >= 11 ? 'TAI' : 'XIU'}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
