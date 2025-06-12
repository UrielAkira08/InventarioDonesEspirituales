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
  userEmail?: string; // Added userEmail
  topGifts: GiftScore[];
  allScores: GiftScore[];
  createdAt: Date | any; // Date for local, Firebase ServerTimestamp for Firestore
  saveError?: string; // To store any error message during saving
}

export enum AppStep {
  Welcome,
  IdentifyForQuiz, // New step to gather name and email before quiz
  IdentifyForDevelopment, // New step to gather email to load development plan
  Form,
  Calculating,
  Saving,
  Results,
  DevelopmentGuide,
}

export interface DevelopmentPlanData {
  step1_primaryGifts: string;
  step1_secondaryGifts: string;
  step2_categories: {
    numericos: boolean;
    madurez: boolean;
    organicos: boolean;
  };
  step3_functionsInChurch: string;
  step3_newMinistriesToStart: string;
  step4_chosenMinistries: string;
  step5_potentialBarriers: string;
  step5_ministryImpactOnChurch: string;
  step6_studyAndLearningPlan: string;
  step7_currentResources: string;
  step7_neededResources: string;
  step8_helperSkillsNeeded: string;
  step8_helperTrainingPlan: string;
  step9_supportGroupTemperament: string;
  step9_supportGroupResources: string;
  step10_baseOfOperations: string;
  step11_actionPlanDetails: string;
  step12_timeline_3months: string;
  step12_timeline_1year: string;
  step12_timeline_longTerm: string;
  lastUpdated?: any; // Firestore serverTimestamp
}

export const initialDevelopmentPlanData: DevelopmentPlanData = {
  step1_primaryGifts: '',
  step1_secondaryGifts: '',
  step2_categories: {
    numericos: false,
    madurez: false,
    organicos: false,
  },
  step3_functionsInChurch: '',
  step3_newMinistriesToStart: '',
  step4_chosenMinistries: '',
  step5_potentialBarriers: '',
  step5_ministryImpactOnChurch: '',
  step6_studyAndLearningPlan: '',
  step7_currentResources: '',
  step7_neededResources: '',
  step8_helperSkillsNeeded: '',
  step8_helperTrainingPlan: '',
  step9_supportGroupTemperament: '',
  step9_supportGroupResources: '',
  step10_baseOfOperations: '',
  step11_actionPlanDetails: '',
  step12_timeline_3months: '',
  step12_timeline_1year: '',
  step12_timeline_longTerm: '',
};