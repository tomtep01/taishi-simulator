
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dice } from './components/Dice';
import { HistoryRoadmap } from './components/HistoryRoadmap';
import { DealerChat } from './components/DealerChat';
import { DepositModal } from './components/DepositModal';
import { HistoryModal } from './components/HistoryModal';
import { GameState, BetOption, DiceResult, GameHistoryItem, ChatMessage, UserBetHistoryItem } from './types';
import { CHIP_VALUES, INITIAL_BALANCE, BETTING_TIME } from './constants';
import { getDealerCommentary } from './services/geminiService';
import { 
  generateBotName, 
  getRandomUserChat, 
  getRandomDealerMessage, 
  generateBotBet, 
} from './utils/simulation';
import { audioManager } from './utils/audio';

// Icons
const VolumeOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const MusicIcon = ({ enabled }: { enabled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${enabled ? 'text-blue-400' : 'text-slate-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163z" />
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const App: React.FC = () => {
  // State
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [currentBet, setCurrentBet] = useState<{ [key in BetOption]?: number }>({});
  const [crowdBet, setCrowdBet] = useState<{ [key in BetOption]: number }>({ [BetOption.TAI]: 0, [BetOption.XIU]: 0 });
  const [selectedChip, setSelectedChip] = useState<number>(CHIP_VALUES[0]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [countdown, setCountdown] = useState(BETTING_TIME);
  const [dice, setDice] = useState<[number, number, number]>([1, 1, 1]); // Initial visual
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [userHistory, setUserHistory] = useState<UserBetHistoryItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastWin, setLastWin] = useState<number>(0);
  const [onlineCount, setOnlineCount] = useState<number>(1243);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Audio State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // Refs for timers
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toggle Audio
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioManager.toggleSFX(newState);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    audioManager.toggleMusic(newState);
  };

  // Helper to add chat message
  const addMessage = useCallback((text: string, sender: 'DEALER' | 'SYSTEM' | 'USER' = 'DEALER', displayName?: string) => {
    setMessages(prev => {
      const newMsg: ChatMessage = {
        id: Date.now().toString() + Math.random().toString(),
        sender,
        displayName,
        text,
        timestamp: Date.now()
      };
      // Keep last 50 messages
      return [...prev.slice(-49), newMsg];
    });
  }, []);

  // Format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Compact format for button display (e.g. 1.2b, 500k)
  const compactMoney = (amount: number) => {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + 'B';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toString();
  };

  // Deposit Handler
  const handleDeposit = (amount: number) => {
    setBalance(prev => prev + amount);
    audioManager.playWin();
    addMessage(`Nạp thành công ${formatMoney(amount)}`, 'SYSTEM');
  };

  // Simulation Loop
  useEffect(() => {
    // Fluctuate online count occasionally
    const onlineInterval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 2000);

    return () => clearInterval(onlineInterval);
  }, []);

  // Game Phase Logic
  useEffect(() => {
    if (gameState === GameState.IDLE) {
      setCountdown(BETTING_TIME);
      setGameState(GameState.BETTING);
      setCrowdBet({ [BetOption.TAI]: 0, [BetOption.XIU]: 0 }); // Reset crowd bets
      
      // Dealer opening message: Mix of pre-made and occasional AI check
      addMessage(getRandomDealerMessage('OPEN'), "DEALER");
    }

    if (gameState === GameState.BETTING) {
      // Main countdown timer
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 5) {
             addMessage(getRandomDealerMessage('CLOSE_SOON'), "DEALER");
          }
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState(GameState.ROLLING);
            addMessage(getRandomDealerMessage('CLOSED'), "DEALER");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Simulation of bots betting and chatting
      simulationRef.current = setInterval(() => {
          // 40% chance a bot places a bet
          if (Math.random() < 0.4) {
            const { side, amount } = generateBotBet();
            setCrowdBet(prev => ({
              ...prev,
              [side]: prev[side] + amount
            }));

            // 10% chance the bot announces the bet
            if (Math.random() < 0.1) {
               const name = generateBotName();
               addMessage(`Cược ${amount/1000}k ${side === BetOption.TAI ? 'Tài' : 'Xỉu'}`, "USER", name);
            }
          }

          // 30% chance of random chat (spam)
          if (Math.random() < 0.3) {
             addMessage(getRandomUserChat(), "USER", generateBotName());
          }
      }, 200); // Fast ticks for busy feel
    } else {
        // Stop simulation when not betting
        if (simulationRef.current) clearInterval(simulationRef.current);
    }

    if (gameState === GameState.ROLLING) {
      audioManager.playRoll(); // SFX: Shake
      
      // Shake animation duration
      setTimeout(() => {
        performRoll();
      }, 2000);
    }

    if (gameState === GameState.RESULT) {
        // Wait before restarting
        setTimeout(() => {
            setGameState(GameState.IDLE);
            setCurrentBet({});
            setLastWin(0);
        }, 6000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Logic to roll dice
  const performRoll = async () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2 + d3;
    const isTriple = d1 === d2 && d2 === d3;
    const result: DiceResult = { d1, d2, d3, sum, isTriple };
    
    let winner: BetOption | null = null;
    
    if (!isTriple) {
        if (sum >= 11 && sum <= 17) winner = BetOption.TAI;
        if (sum >= 4 && sum <= 10) winner = BetOption.XIU;
    }

    setDice([d1, d2, d3]);
    setGameState(GameState.REVEALING);

    // Short reveal delay to lift the bowl
    setTimeout(async () => {
        setGameState(GameState.RESULT);
        audioManager.playSettle(); // SFX: Settle
        
        // Payout and History Recording
        let totalWin = 0;
        
        // Check for TAI Bet
        if (currentBet[BetOption.TAI] && currentBet[BetOption.TAI]! > 0) {
            const betAmt = currentBet[BetOption.TAI]!;
            const isWin = winner === BetOption.TAI;
            const payout = isWin ? betAmt * 2 : 0;
            totalWin += payout;
            
            setUserHistory(prev => [...prev, {
                id: Date.now().toString() + 'T',
                timestamp: Date.now(),
                betOption: BetOption.TAI,
                betAmount: betAmt,
                winAmount: payout,
                resultSum: sum
            }]);
        }

        // Check for XIU Bet
        if (currentBet[BetOption.XIU] && currentBet[BetOption.XIU]! > 0) {
            const betAmt = currentBet[BetOption.XIU]!;
            const isWin = winner === BetOption.XIU;
            const payout = isWin ? betAmt * 2 : 0;
            totalWin += payout;
            
            setUserHistory(prev => [...prev, {
                id: Date.now().toString() + 'X',
                timestamp: Date.now(),
                betOption: BetOption.XIU,
                betAmount: betAmt,
                winAmount: payout,
                resultSum: sum
            }]);
        }

        if (totalWin > 0) {
             setBalance(prev => prev + totalWin);
             setLastWin(totalWin);
             audioManager.playWin(); // SFX: Win
        }

        // Update Global History
        setHistory(prev => [...prev, {
            id: Date.now().toString(),
            result,
            winner: winner || (sum >= 11 ? BetOption.TAI : BetOption.XIU) // For roadmap visual
        }]);

        // Commentary Logic
        // 1. Instant Reaction from pre-made list
        if (isTriple) addMessage(getRandomDealerMessage('TRIPLE'), "DEALER");
        else if (winner === BetOption.TAI) addMessage(getRandomDealerMessage('WIN_TAI'), "DEALER");
        else addMessage(getRandomDealerMessage('WIN_XIU'), "DEALER");

        // 2. Async Gemini Commentary
        if (Math.random() > 0.3) {
            getDealerCommentary(sum, winner || "Triple", isTriple).then(comment => {
                setTimeout(() => addMessage(comment, "DEALER"), 1500);
            });
        }
        
        // 3. Fake user reactions
        setTimeout(() => {
           for(let i=0; i<3; i++) {
              addMessage(getRandomUserChat(), "USER", generateBotName());
           }
        }, 1000);

    }, 1000);
  };

  const placeBet = (option: BetOption) => {
    if (gameState !== GameState.BETTING) return;
    if (balance < selectedChip) {
        alert("Không đủ tiền!");
        return;
    }
    
    // Play sound if allowed
    audioManager.playChip(); 

    setBalance(prev => prev - selectedChip);
    setCurrentBet(prev => ({
        ...prev,
        [option]: (prev[option] || 0) + selectedChip
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden flex flex-col text-white font-sans selection:bg-yellow-500/30">
      
      {/* Header */}
      <header className="h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex items-center justify-between px-4 z-20 shadow-lg">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-yellow-600 flex items-center justify-center font-display font-bold text-black text-xl border-2 border-yellow-300 shadow-[0_0_10px_#ca8a04]">
                R
            </div>
            <h1 className="font-display text-xl tracking-wider text-yellow-400 hidden sm:block">ROYAL CASINO</h1>
         </div>
         <div className="flex items-center gap-4 sm:gap-6">
             {/* Sound Controls */}
             <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-2 py-1 border border-white/10">
                 <button onClick={() => setShowHistoryModal(true)} className="p-1 hover:bg-white/10 rounded-full transition-colors group relative">
                    <HistoryIcon />
                    <span className="absolute top-full right-0 mt-2 text-[10px] bg-black px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Lịch sử</span>
                 </button>
                 <button onClick={toggleMusic} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <MusicIcon enabled={musicEnabled} />
                 </button>
                 <button onClick={toggleSound} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    {soundEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
                 </button>
             </div>

             <div className="hidden md:flex items-center gap-1 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>{onlineCount.toLocaleString()} online</span>
             </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Balance</span>
                <div className="flex items-center gap-2">
                    <span className="font-display text-lg text-yellow-400 tracking-wide drop-shadow-lg">
                        {formatMoney(balance)}
                    </span>
                    <button 
                        onClick={() => setShowDepositModal(true)}
                        className="w-5 h-5 rounded bg-green-600 flex items-center justify-center text-white text-xs hover:bg-green-500 transition-colors shadow-[0_0_10px_rgba(22,163,74,0.5)] active:scale-95"
                    >
                        +
                    </button>
                </div>
            </div>
         </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-start py-4 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
        
        {/* Dealer Chat Overlay (Desktop) */}
        <DealerChat messages={messages} />

        {/* The Bowl & Dice */}
        <div className="relative mt-4 mb-8 w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center perspective-1000">
            {/* Plate */}
            <div className="absolute inset-0 rounded-full bg-slate-800 border-8 border-yellow-700 shadow-2xl flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black">
                 {/* Dice Container */}
                 <div className="flex gap-4 p-8">
                     {gameState !== GameState.ROLLING && (
                         <>
                            <Dice value={dice[0]} />
                            <Dice value={dice[1]} />
                            <Dice value={dice[2]} />
                         </>
                     )}
                 </div>
            </div>

            {/* The Bowl (Lid) */}
            <div 
                className={`
                    absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-yellow-400/50
                    flex items-center justify-center flex-col z-10 transition-all duration-700 ease-in-out
                    ${gameState === GameState.ROLLING ? 'animate-shake' : ''}
                    ${gameState === GameState.RESULT ? '-translate-y-40 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
                `}
            >
                {/* Dragon/Logo on Bowl */}
                <div className="w-40 h-40 rounded-full border-4 border-yellow-300/30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <span className="font-display text-6xl text-yellow-300 font-bold opacity-80 select-none">龍</span>
                </div>
                {gameState === GameState.BETTING && (
                    <div className="absolute bottom-16 bg-black/60 px-4 py-1 rounded-full border border-yellow-500/50 backdrop-blur">
                        <span className="font-display text-2xl text-white tracking-widest animate-pulse">
                            {countdown < 10 ? `0${countdown}` : countdown}s
                        </span>
                    </div>
                )}
            </div>
            
            {/* Result Popup */}
            {gameState === GameState.RESULT && (
                <div className="absolute -bottom-12 z-20 flex flex-col items-center animate-bounce">
                    <div className="bg-black/80 text-white px-6 py-2 rounded-full border-2 border-yellow-400 font-display text-2xl shadow-[0_0_20px_#facc15]">
                        SUM: <span className="text-yellow-400 text-3xl mx-2">{dice[0]+dice[1]+dice[2]}</span>
                        {dice[0]+dice[1]+dice[2] >= 11 ? <span className="text-red-500">TÀI</span> : <span className="text-blue-400">XỈU</span>}
                    </div>
                    {lastWin > 0 && (
                        <div className="mt-2 text-yellow-300 font-bold text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                            +{formatMoney(lastWin)}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* History Bar */}
        <div className="w-full max-w-3xl mb-4 z-10">
             <HistoryRoadmap history={history} />
        </div>

        {/* Betting Board */}
        <div className="w-full max-w-4xl px-4 grid grid-cols-2 gap-4 md:gap-12 z-10 mb-24 sm:mb-32">
            
            {/* TAI AREA */}
            <button 
                onClick={() => placeBet(BetOption.TAI)}
                disabled={gameState !== GameState.BETTING}
                className={`
                    relative group h-40 sm:h-52 rounded-2xl border-2 transition-all duration-200
                    flex flex-col items-center justify-center overflow-hidden
                    ${currentBet[BetOption.TAI] ? 'border-yellow-400 bg-red-900/60' : 'border-red-800 bg-red-950/40 hover:bg-red-900/50'}
                    ${gameState !== GameState.BETTING ? 'opacity-80 cursor-default' : 'cursor-pointer active:scale-95'}
                `}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-30"></div>
                
                <span className="font-display text-5xl sm:text-7xl font-bold text-red-500 group-hover:text-red-400 transition-colors z-10 neon-text-red">
                    TÀI
                </span>
                <span className="text-red-300/70 text-sm font-display tracking-widest mt-2 z-10">11 - 17</span>
                <span className="text-xs text-slate-400 mt-1 z-10">1 : 1</span>

                {/* Chips on Table (User) */}
                {currentBet[BetOption.TAI] && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full border border-yellow-500/30">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_5px_yellow]"></div>
                        <span className="text-yellow-400 font-mono font-bold text-sm">
                            {compactMoney(currentBet[BetOption.TAI] || 0)}
                        </span>
                    </div>
                )}

                {/* Total Bet (Crowd) */}
                <div className="absolute bottom-2 w-full text-center z-10">
                    <span className="text-white/60 text-xs font-mono bg-black/40 px-2 py-0.5 rounded">
                        Total: {compactMoney((crowdBet[BetOption.TAI] || 0) + (currentBet[BetOption.TAI] || 0))}
                    </span>
                </div>
            </button>

            {/* XIU AREA */}
            <button 
                onClick={() => placeBet(BetOption.XIU)}
                disabled={gameState !== GameState.BETTING}
                className={`
                    relative group h-40 sm:h-52 rounded-2xl border-2 transition-all duration-200
                    flex flex-col items-center justify-center overflow-hidden
                    ${currentBet[BetOption.XIU] ? 'border-yellow-400 bg-slate-800/80' : 'border-slate-700 bg-slate-900/60 hover:bg-slate-800/70'}
                    ${gameState !== GameState.BETTING ? 'opacity-80 cursor-default' : 'cursor-pointer active:scale-95'}
                `}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-30"></div>

                <span className="font-display text-5xl sm:text-7xl font-bold text-blue-500 group-hover:text-blue-400 transition-colors z-10 neon-text-blue">
                    XỈU
                </span>
                <span className="text-blue-300/70 text-sm font-display tracking-widest mt-2 z-10">4 - 10</span>
                <span className="text-xs text-slate-400 mt-1 z-10">1 : 1</span>

                {/* Chips on Table (User) */}
                {currentBet[BetOption.XIU] && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full border border-yellow-500/30">
                         <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_5px_blue]"></div>
                        <span className="text-white font-mono font-bold text-sm">
                            {compactMoney(currentBet[BetOption.XIU] || 0)}
                        </span>
                    </div>
                )}
                 {/* Total Bet (Crowd) */}
                 <div className="absolute bottom-2 w-full text-center z-10">
                    <span className="text-white/60 text-xs font-mono bg-black/40 px-2 py-0.5 rounded">
                        Total: {compactMoney((crowdBet[BetOption.XIU] || 0) + (currentBet[BetOption.XIU] || 0))}
                    </span>
                </div>
            </button>

            {/* Center Status Text (Mobile Overlay) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                {gameState === GameState.IDLE && (
                    <span className="text-white/50 text-xs uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Waiting</span>
                )}
            </div>
        </div>

      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 pb-6 z-50">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
             {/* Chip Selector */}
             <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                 {CHIP_VALUES.map(val => (
                     <button
                        key={val}
                        onClick={() => setSelectedChip(val)}
                        className={`
                            relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-transform
                            border-2 shadow-lg
                            ${selectedChip === val ? 'border-yellow-300 -translate-y-2 scale-110 shadow-[0_0_15px_rgba(253,224,71,0.5)]' : 'border-slate-600 scale-100 opacity-70 hover:opacity-100'}
                            ${val >= 500000 ? 'bg-gradient-to-br from-purple-600 to-purple-900' : 
                              val >= 100000 ? 'bg-gradient-to-br from-red-600 to-red-900' :
                              val >= 50000 ? 'bg-gradient-to-br from-green-600 to-green-900' :
                              val >= 10000 ? 'bg-gradient-to-br from-blue-600 to-blue-900' :
                              'bg-gradient-to-br from-slate-500 to-slate-800'
                            }
                        `}
                     >
                         <div className="absolute inset-0 rounded-full border border-white/20 border-dashed m-1"></div>
                         <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">
                            {val >= 1000 ? `${val/1000}k` : val}
                         </span>
                     </button>
                 ))}
             </div>
             
             {/* Action Info */}
             <div className="text-center text-xs text-slate-400 font-mono">
                {gameState === GameState.BETTING ? 'PLEASE PLACE YOUR BET' : 'BETS CLOSED'}
             </div>
        </div>
      </footer>
      
      {/* Deposit Modal */}
      <DepositModal 
         isOpen={showDepositModal}
         onClose={() => setShowDepositModal(false)}
         onDeposit={handleDeposit}
      />
      
      {/* History Modal */}
      <HistoryModal
         isOpen={showHistoryModal}
         onClose={() => setShowHistoryModal(false)}
         history={userHistory}
      />

    </div>
  );
};

export default App;
