export interface Question {
  id: number;
  text: string;
}

export interface GiftDefinition {
  id: string; // 'A', 'B', ...
  name: string;
  questions: number[]; // Array of question IDs that contribute to this gift
  description: string;
}

export interface Answer {
  questionId: number;
  value: number; // 1-5
}

export interface UserAnswers {
  [questionId: number]: number;
}

export interface GiftScore {
  gift: GiftDefinition;
  score: number;
}

export interface UserResult {
  name: string;
  topGifts: GiftScore[];
  allScores: GiftScore[];
}

export enum AppStep {
  Welcome, // New step for initial screen
  Form,
  Calculating,
  Results,
}