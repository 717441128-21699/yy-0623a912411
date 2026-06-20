import { create } from 'zustand';
import { GameStore, Option, Decision, DecisionRecord, GameResult, PracticeConfig } from '../types/game';
import { getLevelById, levels } from '../data/levels';

const GAME_RESULT_STORAGE_KEY = 'cold_chain_game_result';

const initialState = {
  currentLevelId: null,
  currentSceneIndex: 0,
  currentDecisionIndex: 0,
  temperature: 5,
  complianceScore: 100,
  damageRisk: 0,
  complaintRisk: 0,
  decisionHistory: [],
  isGameOver: false,
  isPaused: false,
  showFeedback: false,
  lastFeedback: null,
  currentRandomEvent: null,
  practiceConfig: null,
  practiceDecisions: [],
  practiceCurrentIndex: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: (levelId: string) => {
    const level = getLevelById(levelId);
    if (!level) return;

    set({
      ...initialState,
      currentLevelId: levelId,
      temperature: level.initialTemp,
    });
  },

  startPractice: (config: PracticeConfig, decisions: Decision[], title?: string) => {
    const level = getLevelById(config.levelId);
    if (!level) return;

    const practiceTitle = title || config.mode === 'random'
      ? `${level.name} - 突发情况专项练习`
      : config.mode === 'scene'
      ? `${level.name} - ${level.scenes.find(s => s.id === config.sceneId)?.name || ''}专项练习`
      : config.mode === 'wrong'
      ? `${level.name} - 错题专项练习`
      : level.name;

    set({
      ...initialState,
      currentLevelId: config.levelId,
      temperature: level.initialTemp,
      practiceConfig: {
        ...config,
        title: practiceTitle,
      },
      practiceDecisions: decisions,
      practiceCurrentIndex: 0,
    });
  },

  selectOption: (option: Option) => {
    const state = get();
    const level = state.getCurrentLevel();
    const scene = state.getCurrentScene();
    const decision = state.getCurrentDecision();

    if (!level || !scene || !decision) return;

    const newTemp = Math.max(-20, Math.min(40, state.temperature + option.consequence.temperatureChange));
    const newCompliance = Math.max(0, Math.min(100, state.complianceScore + option.consequence.complianceScore));
    const newDamage = Math.max(0, Math.min(100, state.damageRisk + option.consequence.damageRisk));
    const newComplaint = Math.max(0, Math.min(100, state.complaintRisk + option.consequence.complaintRisk));

    const record: DecisionRecord = {
      decisionId: decision.id,
      decisionQuestion: decision.question,
      selectedOptionId: option.id,
      selectedOptionText: option.text,
      isCorrect: option.isCorrect,
      consequence: option.consequence,
      timestamp: Date.now(),
      sceneName: scene.name,
      isRandomEvent: false,
      isTimeout: false,
    };

    set({
      temperature: newTemp,
      complianceScore: newCompliance,
      damageRisk: newDamage,
      complaintRisk: newComplaint,
      decisionHistory: [...state.decisionHistory, record],
      showFeedback: true,
      lastFeedback: option.consequence.feedback,
    });
  },

  selectRandomEventOption: (option: Option, isTimeout: boolean = false) => {
    const state = get();
    const level = state.getCurrentLevel();
    const scene = state.getCurrentScene();
    const randomEvent = state.currentRandomEvent;

    if (!level || !scene || !randomEvent) return;

    const newTemp = Math.max(-20, Math.min(40, state.temperature + option.consequence.temperatureChange));
    const newCompliance = Math.max(0, Math.min(100, state.complianceScore + option.consequence.complianceScore));
    const newDamage = Math.max(0, Math.min(100, state.damageRisk + option.consequence.damageRisk));
    const newComplaint = Math.max(0, Math.min(100, state.complaintRisk + option.consequence.complaintRisk));

    const record: DecisionRecord = {
      decisionId: randomEvent.id,
      decisionQuestion: randomEvent.question,
      selectedOptionId: option.id,
      selectedOptionText: option.text,
      isCorrect: option.isCorrect,
      consequence: option.consequence,
      timestamp: Date.now(),
      sceneName: scene.name,
      isRandomEvent: true,
      isTimeout,
    };

    set({
      temperature: newTemp,
      complianceScore: newCompliance,
      damageRisk: newDamage,
      complaintRisk: newComplaint,
      decisionHistory: [...state.decisionHistory, record],
      lastFeedback: isTimeout ? '⏰ 时间到！' + option.consequence.feedback : option.consequence.feedback,
    });
  },

  selectPracticeOption: (option: Option, isTimeout: boolean = false) => {
    const state = get();
    const level = state.getCurrentLevel();
    const decision = state.getCurrentPracticeDecision();

    if (!level || !decision) return;

    const sceneName = state.practiceConfig?.mode === 'random'
      ? '突发情况'
      : state.practiceConfig?.mode === 'scene'
      ? level.scenes.find(s => s.id === state.practiceConfig?.sceneId)?.name || '专项练习'
      : '错题练习';

    const newTemp = Math.max(-20, Math.min(40, state.temperature + option.consequence.temperatureChange));
    const newCompliance = Math.max(0, Math.min(100, state.complianceScore + option.consequence.complianceScore));
    const newDamage = Math.max(0, Math.min(100, state.damageRisk + option.consequence.damageRisk));
    const newComplaint = Math.max(0, Math.min(100, state.complaintRisk + option.consequence.complaintRisk));

    const record: DecisionRecord = {
      decisionId: decision.id,
      decisionQuestion: decision.question,
      selectedOptionId: option.id,
      selectedOptionText: option.text,
      isCorrect: option.isCorrect,
      consequence: option.consequence,
      timestamp: Date.now(),
      sceneName,
      isRandomEvent: state.practiceConfig?.mode === 'random' || decision.isRandomEvent || false,
      isTimeout,
    };

    set({
      temperature: newTemp,
      complianceScore: newCompliance,
      damageRisk: newDamage,
      complaintRisk: newComplaint,
      decisionHistory: [...state.decisionHistory, record],
      showFeedback: true,
      lastFeedback: isTimeout ? '⏰ 时间到！' + option.consequence.feedback : option.consequence.feedback,
    });
  },

  nextDecision: () => {
    const state = get();
    const level = state.getCurrentLevel();
    if (!level) return;

    const currentScene = level.scenes[state.currentSceneIndex];
    const nextDecisionIndex = state.currentDecisionIndex + 1;

    set({
      showFeedback: false,
      lastFeedback: null,
    });

    if (nextDecisionIndex < currentScene.decisions.length) {
      set({ currentDecisionIndex: nextDecisionIndex });
    } else {
      const nextSceneIndex = state.currentSceneIndex + 1;
      if (nextSceneIndex < level.scenes.length) {
        set({
          currentSceneIndex: nextSceneIndex,
          currentDecisionIndex: 0,
        });
      } else {
        set({ isGameOver: true });
      }
    }
  },

  nextPracticeDecision: () => {
    const state = get();
    const nextIndex = state.practiceCurrentIndex + 1;

    set({
      showFeedback: false,
      lastFeedback: null,
    });

    if (nextIndex < state.practiceDecisions.length) {
      set({ practiceCurrentIndex: nextIndex });
    } else {
      set({ isGameOver: true });
    }
  },

  resetGame: () => {
    set(initialState);
  },

  setPaused: (paused: boolean) => {
    set({ isPaused: paused });
  },

  setShowFeedback: (show: boolean) => {
    set({ showFeedback: show });
  },

  triggerRandomEvent: (event: Decision) => {
    set({
      currentRandomEvent: event,
      isPaused: true,
    });
  },

  closeRandomEvent: () => {
    set({
      currentRandomEvent: null,
      isPaused: false,
    });
  },

  getCurrentScene: () => {
    const state = get();
    const level = state.getCurrentLevel();
    if (!level) return undefined;
    return level.scenes[state.currentSceneIndex];
  },

  getCurrentDecision: () => {
    const state = get();
    const scene = state.getCurrentScene();
    if (!scene) return undefined;
    return scene.decisions[state.currentDecisionIndex];
  },

  getCurrentLevel: () => {
    const state = get();
    if (!state.currentLevelId) return undefined;
    return getLevelById(state.currentLevelId);
  },

  getCurrentPracticeDecision: () => {
    const state = get();
    return state.practiceDecisions[state.practiceCurrentIndex];
  },

  calculateResult: (): GameResult => {
    const state = get();
    const level = state.getCurrentLevel();
    if (!level) {
      return {
        levelId: '',
        levelName: '',
        complianceScore: 0,
        damageRisk: 0,
        complaintRisk: 0,
        decisionHistory: [],
        keyLearnings: [],
        overallRating: 'fail',
      };
    }

    let rating: 'excellent' | 'good' | 'pass' | 'fail';
    if (state.complianceScore >= 90) rating = 'excellent';
    else if (state.complianceScore >= 75) rating = 'good';
    else if (state.complianceScore >= 60) rating = 'pass';
    else rating = 'fail';

    const keyLearnings = state.decisionHistory
      .filter(record => !record.isCorrect)
      .map(record => record.consequence.explanation)
      .slice(0, 5);

    if (keyLearnings.length === 0) {
      keyLearnings.push('太棒了！你完美完成了本次配送任务，所有操作都符合冷链规范。');
      keyLearnings.push('继续保持这种专业态度，你将成为一名优秀的冷链司机。');
    }

    return {
      levelId: level.id,
      levelName: level.name,
      complianceScore: state.complianceScore,
      damageRisk: state.damageRisk,
      complaintRisk: state.complaintRisk,
      decisionHistory: state.decisionHistory,
      keyLearnings,
      overallRating: rating,
    };
  },

  calculatePracticeResult: (): GameResult => {
    const state = get();
    const level = state.getCurrentLevel();
    const practiceTitle = state.practiceConfig?.title || '专项练习';

    if (!level) {
      return {
        levelId: '',
        levelName: practiceTitle,
        complianceScore: 0,
        damageRisk: 0,
        complaintRisk: 0,
        decisionHistory: [],
        keyLearnings: [],
        overallRating: 'fail',
      };
    }

    let rating: 'excellent' | 'good' | 'pass' | 'fail';
    if (state.complianceScore >= 90) rating = 'excellent';
    else if (state.complianceScore >= 75) rating = 'good';
    else if (state.complianceScore >= 60) rating = 'pass';
    else rating = 'fail';

    const keyLearnings = state.decisionHistory
      .filter(record => !record.isCorrect)
      .map(record => record.consequence.explanation)
      .slice(0, 5);

    if (keyLearnings.length === 0) {
      keyLearnings.push('太棒了！你完美完成了本次专项练习！');
      keyLearnings.push('继续保持，你已经掌握了这些知识点！');
    }

    return {
      levelId: level.id,
      levelName: practiceTitle,
      complianceScore: state.complianceScore,
      damageRisk: state.damageRisk,
      complaintRisk: state.complaintRisk,
      decisionHistory: state.decisionHistory,
      keyLearnings,
      overallRating: rating,
    };
  },

  saveResultToStorage: () => {
    const state = get();
    const result = state.practiceConfig
      ? state.calculatePracticeResult()
      : state.calculateResult();
    if (result.levelId) {
      try {
        localStorage.setItem(GAME_RESULT_STORAGE_KEY, JSON.stringify(result));
      } catch (e) {
        console.error('Failed to save game result:', e);
      }
    }
  },

  getResultFromStorage: (): GameResult | null => {
    try {
      const stored = localStorage.getItem(GAME_RESULT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to get game result:', e);
      return null;
    }
  },

  clearResultFromStorage: () => {
    try {
      localStorage.removeItem(GAME_RESULT_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear game result:', e);
    }
  },
}));

export const getBestScores = () => {
  try {
    const stored = localStorage.getItem('cold_chain_best_scores');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveBestScore = (levelId: string, score: number) => {
  try {
    const scores = getBestScores();
    if (!scores[levelId] || score > scores[levelId].complianceScore) {
      scores[levelId] = {
        complianceScore: score,
        date: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem('cold_chain_best_scores', JSON.stringify(scores));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
