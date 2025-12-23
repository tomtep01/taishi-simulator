
export enum GameState {
  IDLE = 'IDLE',
  BETTING = 'BETTING',
  ROLLING = 'ROLLING',
  MANUAL_REVEAL = 'MANUAL_REVEAL', // New state for hand reveal
  REVEALING = 'REVEALING',
  RESULT = 'RESULT'
}

export enum BetOption {
  TAI = 'TAI', // Big (11-17)
  XIU = 'XIU', // Small (4-10)
}

export interface DiceResult {
  d1: number;
  d2: number;
  d3: number;
  sum: number;
  isTriple: boolean; // House wins on triple in some rules, strictly usually just sum
}

export interface GameHistoryItem {
  id: string;
  result: DiceResult;
  winner: BetOption;
}

export interface UserBetHistoryItem {
  id: string;
  timestamp: number;
  betOption: BetOption;
  betAmount: number;
  winAmount: number; // 0 if lost, includes stake if won
  resultSum: number;
}

export interface ChatMessage {
  id: string;
  sender: 'DEALER' | 'SYSTEM' | 'USER';
  displayName?: string; // Name to display in chat
  text: string;
  timestamp: number;
}
