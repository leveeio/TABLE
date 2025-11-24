export enum TransformationState {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface TransformationResult {
  original: string;
  transformed: string;
}

export interface HistoryEntry {
  id: string;
  original: string;
  transformed: string;
  timestamp: number;
  era: string; 
  writer: string; // Added field for writer style
}