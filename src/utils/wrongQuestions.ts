import { WrongQuestion, DecisionRecord, WrongQuestions, Decision, Level } from '../types/game';
import { getLevelById } from '../data/levels';

const STORAGE_KEY = 'cold_chain_wrong_questions';

export const getWrongQuestions = (): WrongQuestions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to get wrong questions:', e);
    return [];
  }
};

export const saveWrongQuestions = (questions: WrongQuestions): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save wrong questions:', e);
  }
};

export const addWrongQuestion = (
  record: DecisionRecord,
  levelId: string,
  sceneId: string
): void => {
  if (record.isCorrect) return;

  const questions = getWrongQuestions();
  const questionId = `${levelId}_${record.decisionId}`;
  const existingIndex = questions.findIndex(q => q.id === questionId);

  const level = getLevelById(levelId);
  const allDecisions = level
    ? [...level.scenes.flatMap(s => s.decisions), ...level.randomEvents]
    : [];
  const decision = allDecisions.find(d => d.id === record.decisionId);

  if (!decision) return;

  if (existingIndex >= 0) {
    questions[existingIndex] = {
      ...questions[existingIndex],
      lastWrongAnswer: record.selectedOptionText,
      lastWrongDate: new Date().toISOString().split('T')[0],
      mastered: false,
      wrongCount: questions[existingIndex].wrongCount + 1,
    };
  } else {
      const scene = level?.scenes.find(s => s.id === sceneId);
      questions.push({
        id: questionId,
        decision,
        levelId,
        levelName: level?.name || '',
        sceneName: record.sceneName,
        sceneId: sceneId,
        isRandomEvent: record.isRandomEvent,
        lastWrongAnswer: record.selectedOptionText,
        lastWrongDate: new Date().toISOString().split('T')[0],
        mastered: false,
        wrongCount: 1,
        correctCount: 0,
      });
    }

  saveWrongQuestions(questions);
};

export const markQuestionMastered = (questionId: string): void => {
  const questions = getWrongQuestions();
  const index = questions.findIndex(q => q.id === questionId);
  if (index >= 0) {
    questions[index].mastered = true;
    saveWrongQuestions(questions);
  }
};

export const markQuestionWrong = (questionId: string): void => {
  const questions = getWrongQuestions();
  const index = questions.findIndex(q => q.id === questionId);
  if (index >= 0) {
    questions[index].correctCount += 1;
    saveWrongQuestions(questions);
  }
};

export const removeQuestion = (questionId: string): void => {
  const questions = getWrongQuestions();
  const filtered = questions.filter(q => q.id !== questionId);
  saveWrongQuestions(filtered);
};

export const getUnmasteredCount = (): number => {
  const questions = getWrongQuestions();
  return questions.filter(q => !q.mastered).length;
};

export const clearAllWrongQuestions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear wrong questions:', e);
  }
};

export const addWrongQuestionsFromResult = (
  records: DecisionRecord[],
  levelId: string,
  level: Level
): void => {
  const sceneIds: Record<string, string> = {};
  level.scenes.forEach(scene => {
    sceneIds[scene.name] = scene.id;
  });

  records.forEach(record => {
    if (!record.isCorrect) {
      const sceneId = sceneIds[record.sceneName] || (record.isRandomEvent ? 'random' : 'unknown');
      addWrongQuestion(record, levelId, sceneId);
    }
  });
};
