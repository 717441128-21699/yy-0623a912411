import { GameResult, DecisionRecord, TrainingReport, LearningProfile, LevelProfile, SceneStat, PracticeConfig, Decision } from '../types/game';
import { getLevelById, levels } from '../data/levels';
import { getWrongQuestions } from './wrongQuestions';

const STORAGE_KEY = 'cold_chain_learning_profile';
const MAX_REPORTS_PER_LEVEL = 20;

export const getLearningProfile = (): LearningProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to get learning profile:', e);
  }
  return {
    updatedAt: new Date().toISOString(),
    totalTrainingTime: 0,
    reports: [],
    levelProfiles: {},
  };
};

export const saveLearningProfile = (profile: LearningProfile): void => {
  try {
    profile.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save learning profile:', e);
  }
};

export const calculateSceneStats = (records: DecisionRecord[]): SceneStat[] => {
  const sceneMap: Record<string, { total: number; correct: number; complianceDelta: number }> = {};

  records.forEach(record => {
    const key = record.isRandomEvent ? '⚡ 突发情况处理' : record.sceneName;
    if (!sceneMap[key]) {
      sceneMap[key] = { total: 0, correct: 0, complianceDelta: 0 };
    }
    sceneMap[key].total += 1;
    if (record.isCorrect) sceneMap[key].correct += 1;
    sceneMap[key].complianceDelta += record.consequence.complianceScore;
  });

  return Object.entries(sceneMap).map(([sceneName, data]) => ({
    sceneName,
    total: data.total,
    correct: data.correct,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    complianceDelta: data.complianceDelta,
  }));
};

export const generateImprovementSuggestions = (
  result: GameResult,
  sceneStats: SceneStat[]
): string[] => {
  const suggestions: string[] = [];
  const weakScenes = sceneStats.filter(s => s.accuracy < 60);

  if (result.complianceScore < 60) {
    suggestions.push('温控合规分较低，建议重点复习每个场景的标准操作流程，优先选择合规的选项。');
  } else if (result.complianceScore < 80) {
    suggestions.push('温控合规分中等，部分决策仍有提升空间，建议复盘错题加深理解。');
  }

  if (result.damageRisk > 50) {
    suggestions.push('货损风险较高，在运输途中请密切关注温度变化，及时处理异常情况。');
  }

  if (result.complaintRisk > 50) {
    suggestions.push('客户投诉风险较高，建议在门店交接环节做好温度记录和拍照留证工作。');
  }

  weakScenes.forEach(scene => {
    if (scene.sceneName.includes('突发')) {
      suggestions.push(`突发情况处理正确率仅${scene.accuracy}%，建议在「专项练习」中单独练习突发情况组。`);
    } else {
      suggestions.push(`${scene.sceneName}正确率仅${scene.accuracy}%，建议加强该场景的专项练习。`);
    }
  });

  const timeoutCount = result.decisionHistory.filter(r => r.isTimeout).length;
  if (timeoutCount > 0) {
    suggestions.push(`有${timeoutCount}道题超时未作答，建议提高对场景的反应速度和熟悉度。`);
  }

  if (suggestions.length === 0) {
    suggestions.push('表现优秀！建议尝试更高难度的关卡或挑战满分完成。');
  }

  return suggestions.slice(0, 5);
};

export const buildTrainingReport = (
  result: GameResult,
  practiceConfig: PracticeConfig | null,
  durationMs: number = 0
): TrainingReport => {
  const correctCount = result.decisionHistory.filter(r => r.isCorrect).length;
  const totalCount = result.decisionHistory.length;
  const sceneStats = calculateSceneStats(result.decisionHistory);
  const improvementSuggestions = generateImprovementSuggestions(result, sceneStats);
  const weakScenes = sceneStats.filter(s => s.accuracy < 60).map(s => s.sceneName);

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    levelId: result.levelId,
    levelName: result.levelName,
    completedAt: new Date().toISOString(),
    durationMs,
    practiceConfig,
    complianceScore: result.complianceScore,
    damageRisk: result.damageRisk,
    complaintRisk: result.complaintRisk,
    overallRating: result.overallRating,
    totalQuestions: totalCount,
    correctCount,
    wrongCount: totalCount - correctCount,
    accuracy: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
    decisionHistory: result.decisionHistory,
    sceneStats,
    keyLearnings: result.keyLearnings,
    improvementSuggestions,
    weakScenes,
  };
};

const calculateLevelProfile = (levelId: string, reports: TrainingReport[]): LevelProfile => {
  const level = getLevelById(levelId);
  const levelReports = reports.filter(r => r.levelId === levelId && !r.practiceConfig);
  const wrongQuestions = getWrongQuestions().filter(q => q.levelId === levelId);
  const mastered = wrongQuestions.filter(q => q.mastered).length;
  const unmastered = wrongQuestions.filter(q => !q.mastered).length;

  if (levelReports.length === 0) {
    return {
      levelId,
      levelName: level?.name || levelId,
      completionCount: 0,
      bestScore: 0,
      bestScoreDate: '',
      lastScore: 0,
      lastDamageRisk: 0,
      lastComplaintRisk: 0,
      lastCompletedAt: '',
      totalWrongQuestions: wrongQuestions.length,
      masteredWrongQuestions: mastered,
      unmasteredWrongQuestions: unmastered,
      masteryProgress: wrongQuestions.length > 0 ? Math.round((mastered / wrongQuestions.length) * 100) : 0,
      avgAccuracy: 0,
    };
  }

  const sorted = [...levelReports].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  const best = levelReports.reduce((max, r) => (r.complianceScore > max.complianceScore ? r : max), levelReports[0]);
  const avgAccuracy = Math.round(levelReports.reduce((sum, r) => sum + r.accuracy, 0) / levelReports.length);

  return {
    levelId,
    levelName: level?.name || levelId,
    completionCount: levelReports.length,
    bestScore: best.complianceScore,
    bestScoreDate: best.completedAt,
    lastScore: sorted[0].complianceScore,
    lastDamageRisk: sorted[0].damageRisk,
    lastComplaintRisk: sorted[0].complaintRisk,
    lastCompletedAt: sorted[0].completedAt,
    totalWrongQuestions: wrongQuestions.length,
    masteredWrongQuestions: mastered,
    unmasteredWrongQuestions: unmastered,
    masteryProgress: wrongQuestions.length > 0 ? Math.round((mastered / wrongQuestions.length) * 100) : 0,
    avgAccuracy,
  };
};

export const addTrainingReport = (report: TrainingReport): LearningProfile => {
  const profile = getLearningProfile();
  profile.reports.unshift(report);

  const levelReports = profile.reports.filter(r => r.levelId === report.levelId);
  if (levelReports.length > MAX_REPORTS_PER_LEVEL) {
    const toRemove = levelReports.length - MAX_REPORTS_PER_LEVEL;
    const oldestIds = levelReports
      .slice(-toRemove)
      .map(r => r.id);
    profile.reports = profile.reports.filter(r => !oldestIds.includes(r.id));
  }

  profile.totalTrainingTime += report.durationMs;
  levels.forEach(level => {
    profile.levelProfiles[level.id] = calculateLevelProfile(level.id, profile.reports);
  });

  saveLearningProfile(profile);
  return profile;
};

export const getReportsByLevel = (levelId: string): TrainingReport[] => {
  const profile = getLearningProfile();
  return profile.reports
    .filter(r => r.levelId === levelId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
};

export const getReportById = (reportId: string): TrainingReport | null => {
  const profile = getLearningProfile();
  return profile.reports.find(r => r.id === reportId) || null;
};

export const getRecentReports = (limit: number = 5): TrainingReport[] => {
  const profile = getLearningProfile();
  return [...profile.reports]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit);
};

export const getAllLevelProfiles = (): Record<string, LevelProfile> => {
  const profile = getLearningProfile();
  levels.forEach(level => {
    if (!profile.levelProfiles[level.id]) {
      profile.levelProfiles[level.id] = calculateLevelProfile(level.id, profile.reports);
    }
  });
  return profile.levelProfiles;
};

export const refreshLevelProfiles = (): LearningProfile => {
  const profile = getLearningProfile();
  levels.forEach(level => {
    profile.levelProfiles[level.id] = calculateLevelProfile(level.id, profile.reports);
  });
  saveLearningProfile(profile);
  return profile;
};

export const getPracticeSuggestions = (levelId: string, currentWeakScenes: string[] = []): { title: string; description: string; config: PracticeConfig; decisions: Decision[] }[] => {
  const suggestions: { title: string; description: string; config: PracticeConfig; decisions: Decision[] }[] = [];
  const level = getLevelById(levelId);
  if (!level) return suggestions;

  const wrongQs = getWrongQuestions().filter(q => !q.mastered && q.levelId === levelId);
  if (wrongQs.length > 0) {
    const wrongIds = wrongQs.map(q => q.decision.id);
    const allDecisions = [...level.scenes.flatMap(s => s.decisions), ...level.randomEvents];
    suggestions.push({
      title: '错题巩固',
      description: `复习${wrongQs.length}道未掌握的错题，练对自动标记已掌握`,
      config: {
        mode: 'wrong',
        levelId,
        decisionIds: wrongIds,
        title: `${level.name} - 错题巩固练习`,
      },
      decisions: allDecisions.filter(d => wrongIds.includes(d.id)),
    });
  }

  const allScenes = level.scenes.map(s => s);
  const profile = getLearningProfile();
  const levelProfile = profile.levelProfiles[levelId];

  const scenesToSuggest = currentWeakScenes.length > 0
    ? allScenes.filter(s => currentWeakScenes.some(ws => ws.includes(s.name)))
    : levelProfile
    ? allScenes
    : [];

  scenesToSuggest.slice(0, 2).forEach(scene => {
    suggestions.push({
      title: `${scene.name}专项`,
      description: `单独练习${scene.name}的${scene.decisions.length}个决策点`,
      config: {
        mode: 'scene',
        levelId,
        sceneId: scene.id,
        sceneIds: [scene.id],
        title: `${level.name} - ${scene.name}专项练习`,
      },
      decisions: scene.decisions,
    });
  });

  if (level.randomEvents.length > 0) {
    suggestions.push({
      title: '突发情况挑战',
      description: `集中练习${level.randomEvents.length}个随机突发事件`,
      config: {
        mode: 'random',
        levelId,
        includeRandomEvents: true,
        title: `${level.name} - 突发情况专项练习`,
      },
      decisions: level.randomEvents,
    });
  }

  return suggestions;
};
