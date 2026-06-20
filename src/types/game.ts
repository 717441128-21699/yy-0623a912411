export interface Consequence {
  complianceScore: number;
  damageRisk: number;
  complaintRisk: number;
  temperatureChange: number;
  feedback: string;
  explanation: string;
}

export interface Option {
  id: string;
  text: string;
  consequence: Consequence;
  isCorrect: boolean;
}

export interface Decision {
  id: string;
  question: string;
  description: string;
  options: Option[];
  timeLimit?: number;
  isRandomEvent?: boolean;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  decisions: Decision[];
}

export interface Level {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetTemp: { min: number; max: number };
  initialTemp: number;
  scenes: Scene[];
  randomEvents: Decision[];
}

export interface DecisionRecord {
  decisionId: string;
  decisionQuestion: string;
  selectedOptionId: string;
  selectedOptionText: string;
  isCorrect: boolean;
  consequence: Consequence;
  timestamp: number;
  sceneName: string;
  isRandomEvent: boolean;
  isTimeout: boolean;
}

export interface GameState {
  currentLevelId: string | null;
  currentSceneIndex: number;
  currentDecisionIndex: number;
  temperature: number;
  complianceScore: number;
  damageRisk: number;
  complaintRisk: number;
  decisionHistory: DecisionRecord[];
  isGameOver: boolean;
  isPaused: boolean;
  showFeedback: boolean;
  lastFeedback: string | null;
  currentRandomEvent: Decision | null;
  practiceConfig: PracticeConfig | null;
  practiceDecisions: Decision[];
  practiceCurrentIndex: number;
}

export interface GameResult {
  levelId: string;
  levelName: string;
  complianceScore: number;
  damageRisk: number;
  complaintRisk: number;
  decisionHistory: DecisionRecord[];
  keyLearnings: string[];
  overallRating: 'excellent' | 'good' | 'pass' | 'fail';
}

export type GameStore = GameState & {
  startGame: (levelId: string) => void;
  startPractice: (config: PracticeConfig, decisions: Decision[], title?: string) => void;
  selectOption: (option: Option) => void;
  selectRandomEventOption: (option: Option, isTimeout?: boolean) => void;
  selectPracticeOption: (option: Option, isTimeout?: boolean) => void;
  nextDecision: () => void;
  nextPracticeDecision: () => void;
  resetGame: () => void;
  setPaused: (paused: boolean) => void;
  setShowFeedback: (show: boolean) => void;
  triggerRandomEvent: (event: Decision) => void;
  closeRandomEvent: () => void;
  getCurrentScene: () => Scene | undefined;
  getCurrentDecision: () => Decision | undefined;
  getCurrentLevel: () => Level | undefined;
  getCurrentPracticeDecision: () => Decision | undefined;
  calculateResult: () => GameResult;
  calculatePracticeResult: () => GameResult;
  saveResultToStorage: () => void;
  getResultFromStorage: () => GameResult | null;
  clearResultFromStorage: () => void;
};

export interface BestScore {
  complianceScore: number;
  date: string;
}

export type BestScores = Record<string, BestScore>;

export interface WrongQuestion {
  id: string;
  decision: Decision;
  levelId: string;
  levelName: string;
  sceneName: string;
  sceneId: string;
  isRandomEvent: boolean;
  lastWrongAnswer: string;
  lastWrongDate: string;
  mastered: boolean;
  wrongCount: number;
  correctCount: number;
}

export type WrongQuestions = WrongQuestion[];

export type PracticeMode = 'full' | 'scene' | 'random' | 'wrong';

export interface PracticeConfig {
  mode: PracticeMode;
  levelId: string;
  sceneId?: string;
  sceneIds?: string[];
  includeRandomEvents?: boolean;
  decisionIds?: string[];
  title?: string;
}

export interface TrainingReport {
  id: string;
  levelId: string;
  levelName: string;
  completedAt: string;
  durationMs: number;
  practiceConfig: PracticeConfig | null;
  complianceScore: number;
  damageRisk: number;
  complaintRisk: number;
  overallRating: 'excellent' | 'good' | 'pass' | 'fail';
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  decisionHistory: DecisionRecord[];
  sceneStats: SceneStat[];
  keyLearnings: string[];
  improvementSuggestions: string[];
  weakScenes: string[];
}

export interface SceneStat {
  sceneName: string;
  total: number;
  correct: number;
  accuracy: number;
  complianceDelta: number;
}

export interface LevelProfile {
  levelId: string;
  levelName: string;
  completionCount: number;
  bestScore: number;
  bestScoreDate: string;
  lastScore: number;
  lastDamageRisk: number;
  lastComplaintRisk: number;
  lastCompletedAt: string;
  totalWrongQuestions: number;
  masteredWrongQuestions: number;
  unmasteredWrongQuestions: number;
  masteryProgress: number;
  avgAccuracy: number;
}

export interface LearningProfile {
  updatedAt: string;
  totalTrainingTime: number;
  reports: TrainingReport[];
  levelProfiles: Record<string, LevelProfile>;
}
