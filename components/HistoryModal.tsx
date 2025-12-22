
import React, { useMemo } from 'react';
import { UserBetHistoryItem, BetOption } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: UserBetHistoryItem[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  // Format currency helper
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Calculate Statistics
  const stats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let totalWagered = 0;
    let totalPayout = 0;

    history.forEach(item => {
      totalWagered += item.betAmount;
      totalPayout += item.winAmount;
      if (item.winAmount > 0) wins++;
      else losses++;
    });

    const netProfit = totalPayout - totalWagered;
    const winRate = history.length > 0 ? Math.round((wins / history.length) * 100) : 0;

    return { wins, losses, totalWagered, netProfit, winRate };
  }, [history]);

  // Generate SVG Graph Data (Last 20 bets profit trajectory)
  const graphPath = useMemo(() => {
    if (history.length < 2) return "";
    
    // Take last 20, reverse to show chronological left-to-right
    const recent = [...history].slice(-20);
    
    // Calculate cumulative profit points
    let currentProfit = 0;
    const points = recent.map((item) => {
      const profit = item.winAmount - item.betAmount;
      currentProfit += profit;
      return currentProfit;
    });

    // Normalize for SVG (ViewBox 0 0 100 50)
    const min = Math.min(0, ...points);
    const max = Math.max(0, ...points);
    const range = Math.max(1, max - min); // Avoid divide by zero
    
    const polyline = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * 100;
      // Invert Y because SVG 0 is top
      const y = 50 - ((val - min) / range) * 50; 
      return `${x},${y}`;
    }).join(' ');

    return polyline;
  }, [history]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="w-full max-w-2xl bg-slate-900 border border-yellow-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
           <h2 className="font-display text-xl text-yellow-400 uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Lịch Sử Cược
           </h2>
           <button onClick={onClose} className="text-slate-400 hover:text-white px-2">✕</button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-white/10 bg-slate-800/30 flex-shrink-0">
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Số ván chơi</div>
                <div className="text-white text-lg font-mono">{history.length}</div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Tỉ lệ thắng</div>
                <div className="text-yellow-400 text-lg font-mono">{stats.winRate}%</div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Tổng cược</div>
                <div className="text-blue-300 text-lg font-mono truncate">{formatMoney(stats.totalWagered)}</div>
            </div>
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Lợi nhuận ròng</div>
                <div className={`text-lg font-mono truncate ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.netProfit >= 0 ? '+' : ''}{formatMoney(stats.netProfit)}
                </div>
            </div>
        </div>

        {/* Graph Area */}
        {history.length >= 2 && (
            <div className="w-full h-32 bg-slate-900/50 relative border-b border-white/10 flex-shrink-0 group">
                <div className="absolute top-2 left-2 text-[10px] text-slate-500 uppercase font-bold z-10">Biểu đồ Lợi nhuận (20 ván gần nhất)</div>
                <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                    {/* Zero Line (Approximation) */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />
                    
                    {/* Trend Line */}
                    <polyline 
                        points={graphPath} 
                        fill="none" 
                        stroke={stats.netProfit >= 0 ? "#22c55e" : "#ef4444"} 
                        strokeWidth="1.5" 
                        vectorEffect="non-scaling-stroke"
                        className="drop-shadow-[0_0_2px_rgba(0,0,0,1)]"
                    />
                </svg>
            </div>
        )}

        {/* Scrollable List */}
        <div className="overflow-y-auto flex-1 p-0 scrollbar-hide">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800 text-xs text-slate-400 uppercase sticky top-0 z-10 shadow-md">
                    <tr>
                        <th className="p-3 font-medium">Thời gian</th>
                        <th className="p-3 font-medium text-center">Cửa đặt</th>
                        <th className="p-3 font-medium text-center">Kết quả</th>
                        <th className="p-3 font-medium text-right">Tiền cược</th>
                        <th className="p-3 font-medium text-right">Thắng/Thua</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-mono divide-y divide-white/5">
                    {[...history].reverse().map((item) => {
                        const isWin = item.winAmount > 0;
                        const net = isWin ? item.winAmount - item.betAmount : -item.betAmount;
                        return (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 text-slate-400 text-xs">{formatTime(item.timestamp)}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.betOption === BetOption.TAI ? 'border-red-500/30 bg-red-500/10 text-red-500' : 'border-blue-500/30 bg-blue-500/10 text-blue-500'}`}>
                                        {item.betOption}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-white font-bold">{item.resultSum}</span>
                                        <span className="text-[10px] text-slate-500">
                                            {item.resultSum >= 11 ? 'TÀI' : 'XỈU'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3 text-right text-slate-300">
                                    {formatMoney(item.betAmount)}
                                </td>
                                <td className={`p-3 text-right font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                                    {isWin ? '+' : ''}{formatMoney(net)}
                                </td>
                            </tr>
                        );
                    })}
                    {history.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                Chưa có lịch sử cược. Hãy đặt cược ván đầu tiên!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};
