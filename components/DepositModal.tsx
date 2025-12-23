
import React, { useState } from 'react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onDeposit }) => {
  if (!isOpen) return null;

  const [amount, setAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'BANKING' | 'MOMO' | 'CARD'>('BANKING');

  const PRESETS = [500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1000000000];

  const handleDeposit = () => {
    if (amount > 0) {
      onDeposit(amount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="w-full max-w-md bg-slate-900 border border-yellow-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-white/10 flex justify-between items-center">
           <h2 className="font-display text-xl text-yellow-400 uppercase tracking-widest">NẠP TIỀN</h2>
           <button onClick={onClose} className="text-slate-400 hover:text-white px-2">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
            {['BANKING', 'MOMO', 'CARD'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === tab ? 'bg-yellow-600/20 text-yellow-400 border-b-2 border-yellow-500' : 'text-slate-500 hover:bg-white/5'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="p-6 space-y-6">
            {/* Amount Input */}
             <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Nhập số tiền</label>
                <div className="relative">
                    <input
                        type="number"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-lg focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">VND</span>
                </div>
             </div>

             {/* Presets */}
             <div className="grid grid-cols-4 gap-2">
                {PRESETS.map(val => (
                    <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-2 px-1 rounded border text-[10px] sm:text-xs font-mono transition-all
                            ${amount === val
                                ? 'bg-yellow-500 text-black border-yellow-400 font-bold shadow-[0_0_10px_#eab308]'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                            }
                        `}
                    >
                        {val >= 1000000 ? `${val/1000000}M` : `${val/1000}k`}
                    </button>
                ))}
             </div>

             {/* Action */}
             <button
                onClick={handleDeposit}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-display font-bold text-lg py-3 rounded-lg shadow-lg transform active:scale-95 transition-all"
             >
                XÁC NHẬN NẠP
             </button>
             
             <p className="text-center text-[10px] text-slate-500 italic">
                 * Hệ thống xử lý tự động trong 30s
             </p>
        </div>
      </div>
    </div>
  );
};
