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
  selectOption: (option: Option) => void;
  selectRandomEventOption: (option: Option, isTimeout?: boolean) => void;
  nextDecision: () => void;
  resetGame: () => void;
  setPaused: (paused: boolean) => void;
  setShowFeedback: (show: boolean) => void;
  triggerRandomEvent: (event: Decision) => void;
  closeRandomEvent: () => void;
  getCurrentScene: () => Scene | undefined;
  getCurrentDecision: () => Decision | undefined;
  getCurrentLevel: () => Level | undefined;
  calculateResult: () => GameResult;
  saveResultToStorage: () => void;
  getResultFromStorage: () => GameResult | null;
  clearResultFromStorage: () => void;
};

export interface BestScore {
  complianceScore: number;
  date: string;
}

export type BestScores = Record<string, BestScore>;
