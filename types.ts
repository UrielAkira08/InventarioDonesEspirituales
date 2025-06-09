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
  id?: string; // Optional: ID from Firestore
  name: string;
  topGifts: GiftScore[];
  allScores: GiftScore[];
  createdAt: Date | any; // Date for local, Firebase ServerTimestamp for Firestore
  saveError?: string; // To store any error message during saving
}

export enum AppStep {
  Welcome,
  Form,
  Calculating,
  Saving, // New step for saving to Firestore
  Results,
}