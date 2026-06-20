import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { useGameStore, saveBestScore } from '../store/useGameStore';
import { getLevelById } from '../data/levels';
import { SceneProgress } from '../components/game/SceneProgress';
import { StatusBar } from '../components/game/StatusBar';
import { DecisionCard } from '../components/game/DecisionCard';
import { Option, PracticeConfig, PracticeMode, Decision } from '../types/game';
import { addWrongQuestionsFromResult, markQuestionMastered, getWrongQuestions } from '../utils/wrongQuestions';

export const Game = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [randomEventTriggered, setRandomEventTriggered] = useState(false);
  const [randomEventSelectedId, setRandomEventSelectedId] = useState<string | null>(null);
  const [showRandomEventFeedback, setShowRandomEventFeedback] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const {
    currentSceneIndex,
    currentDecisionIndex,
    temperature,
    complianceScore,
    damageRisk,
    complaintRisk,
    showFeedback,
    isGameOver,
    currentRandomEvent,
    lastFeedback,
    practiceConfig,
    practiceDecisions,
    practiceCurrentIndex,
    startGame,
    startPractice,
    selectOption,
    selectRandomEventOption,
    selectPracticeOption,
    nextDecision,
    nextPracticeDecision,
    resetGame,
    getCurrentScene,
    getCurrentDecision,
    getCurrentLevel,
    getCurrentPracticeDecision,
    triggerRandomEvent,
    closeRandomEvent,
    calculateResult,
    calculatePracticeResult,
    saveResultToStorage,
  } = useGameStore();

  const level = getCurrentLevel();
  const scene = getCurrentScene();
  const decision = getCurrentDecision();
  const practiceDecision = getCurrentPracticeDecision();

  const isPracticeRoute = location.pathname.startsWith('/practice');

  useEffect(() => {
    setIsPracticeMode(isPracticeRoute);
  }, [isPracticeRoute]);

  useEffect(() => {
    if (!levelId) {
      navigate('/');
      return;
    }
    const levelData = getLevelById(levelId);
    if (!levelData) {
      navigate('/');
      return;
    }

    if (isPracticeRoute) {
      const mode = searchParams.get('mode') as PracticeMode | null;
      const sceneId = searchParams.get('sceneId') || undefined;
      const wrongQuestionIdsStr = searchParams.get('wrongIds') || '';

      if (!mode) {
        navigate('/');
        return;
      }

      let practiceTitle = '';
      let selectedDecisions: Decision[] = [];

      if (mode === 'random') {
        practiceTitle = `${levelData.name} - 突发情况专项练习`;
        selectedDecisions = levelData.randomEvents;
      } else if (mode === 'scene' && sceneId) {
        const targetScene = levelData.scenes.find(s => s.id === sceneId);
        if (targetScene) {
          practiceTitle = `${levelData.name} - ${targetScene.name}专项练习`;
          selectedDecisions = targetScene.decisions;
        }
      } else if (mode === 'wrong') {
        practiceTitle = `${levelData.name} - 错题专项练习`;
        const wrongIds = wrongQuestionIdsStr.split(',').filter(Boolean);
        const allDecisions = [...levelData.scenes.flatMap(s => s.decisions), ...levelData.randomEvents];
        selectedDecisions = allDecisions.filter(d => wrongIds.includes(d.id));
      }

      if (selectedDecisions.length === 0) {
        navigate('/');
        return;
      }

      const config: PracticeConfig = {
        mode,
        levelId,
        sceneId,
        title: practiceTitle,
      };
      startPractice(config, selectedDecisions, practiceTitle);
    } else {
      startGame(levelId);
    }

    return () => {
      resetGame();
    };
  }, [levelId, navigate, startGame, startPractice, resetGame, isPracticeRoute, searchParams]);

  useEffect(() => {
    if (isGameOver && levelId) {
      const result = practiceConfig
        ? calculatePracticeResult()
        : calculateResult();

      if (!practiceConfig) {
        saveBestScore(levelId, result.complianceScore);
      }

      const levelData = getLevelById(levelId);
      if (levelData) {
        addWrongQuestionsFromResult(result.decisionHistory, levelId, levelData);
      }

      if (practiceConfig?.mode === 'wrong') {
        const correctIds = result.decisionHistory
          .filter(r => r.isCorrect)
          .map(r => r.decisionId);
        correctIds.forEach(id => markQuestionMastered(`${levelId}_${id}`));
      }

      saveResultToStorage();
      navigate(`/result/${levelId}`);
    }
  }, [isGameOver, levelId, navigate, calculateResult, calculatePracticeResult, saveResultToStorage, practiceConfig]);

  useEffect(() => {
    if (
      isPracticeMode ||
      !level ||
      currentSceneIndex !== 1 ||
      currentDecisionIndex !== 0 ||
      randomEventTriggered ||
      level.randomEvents.length <= 0
    ) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * level.randomEvents.length);
    const randomEvent = level.randomEvents[randomIndex];

    const timer = setTimeout(() => {
      triggerRandomEvent(randomEvent);
      setRandomEventTriggered(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    level,
    currentSceneIndex,
    currentDecisionIndex,
    randomEventTriggered,
    triggerRandomEvent,
    isPracticeMode,
  ]);

  const handleSelectOption = useCallback(
    (option: Option) => {
      if (showFeedback) return;
      setSelectedOptionId(option.id);
      if (isPracticeMode) {
        selectPracticeOption(option);
      } else {
        selectOption(option);
      }
      setShowNextButton(true);
    },
    [showFeedback, selectOption, selectPracticeOption, isPracticeMode]
  );

  const handleNext = useCallback(() => {
    setSelectedOptionId(null);
    setShowNextButton(false);
    if (isPracticeMode) {
      nextPracticeDecision();
    } else {
      nextDecision();
    }
  }, [nextDecision, nextPracticeDecision, isPracticeMode]);

  const handleTimeUp = useCallback(() => {
    if (currentRandomEvent && !showRandomEventFeedback) {
      const worstOption = currentRandomEvent.options.reduce((worst, option) => {
        return option.consequence.complianceScore < worst.consequence.complianceScore
          ? option
          : worst;
      }, currentRandomEvent.options[0]);
      setRandomEventSelectedId(worstOption.id);
      selectRandomEventOption(worstOption, true);
      setShowRandomEventFeedback(true);
    } else {
      const currentDec = isPracticeMode ? practiceDecision : decision;
      if (currentDec && !showFeedback) {
        const worstOption = currentDec.options.reduce((worst, option) => {
          return option.consequence.complianceScore < worst.consequence.complianceScore
            ? option
            : worst;
        }, currentDec.options[0]);
        if (isPracticeMode) {
          setSelectedOptionId(worstOption.id);
          selectPracticeOption(worstOption, true);
          setShowNextButton(true);
        } else {
          handleSelectOption(worstOption);
        }
      }
    }
  }, [currentRandomEvent, decision, practiceDecision, showFeedback, showRandomEventFeedback, selectRandomEventOption, selectPracticeOption, handleSelectOption, isPracticeMode]);

  const handleRandomEventOption = useCallback(
    (option: Option) => {
      if (!currentRandomEvent) return;
      setRandomEventSelectedId(option.id);
      selectRandomEventOption(option, false);
      setShowRandomEventFeedback(true);
    },
    [currentRandomEvent, selectRandomEventOption]
  );

  const handleCloseRandomEventFeedback = useCallback(() => {
    setRandomEventSelectedId(null);
    setShowRandomEventFeedback(false);
    closeRandomEvent();
  }, [closeRandomEvent]);

  const handleBackHome = () => {
    navigate('/');
  };

  const currentDisplayDecision = isPracticeMode ? practiceDecision : decision;
  const totalDecisions = isPracticeMode
    ? practiceDecisions.length
    : level?.scenes.reduce((sum, s) => sum + s.decisions.length, 0) || 0;
  const completedDecisions = isPracticeMode
    ? practiceCurrentIndex
    : (level
        ? level.scenes.slice(0, currentSceneIndex).reduce((sum, s) => sum + s.decisions.length, 0) + currentDecisionIndex
        : 0);
  const progressPercentage = totalDecisions > 0 ? ((completedDecisions + 1) / totalDecisions) * 100 : 0;
  const isLastDecision = isPracticeMode
    ? practiceCurrentIndex >= practiceDecisions.length - 1
    : level
      ? currentSceneIndex === level.scenes.length - 1 && currentDecisionIndex >= (scene?.decisions.length || 0) - 1
      : false;
  const displayTitle = practiceConfig?.title || level?.name || '';

  if (!level || (!isPracticeMode && (!scene || !decision)) || (isPracticeMode && !practiceDecision)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cold-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cold-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-cold-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cold-50 via-white to-ice-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-cold-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBackHome}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Home size={20} />
              <span className="hidden md:inline">返回首页</span>
            </button>
            <div className="flex items-center gap-2">
              {isPracticeMode ? (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  专项练习
                </span>
              ) : null}
              <span className="text-2xl">{level.icon}</span>
              <span className="font-bold text-gray-800">{displayTitle}</span>
            </div>
            <div className="w-24 text-right">
              <span className="text-sm text-gray-500">
                进度 {completedDecisions + 1}/{totalDecisions}
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cold-400 to-cold-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-6 max-w-4xl transition-opacity duration-300 ${currentRandomEvent ? 'opacity-50 pointer-events-none' : ''}`}>
        {!isPracticeMode && level && scene && (
          <SceneProgress scenes={level.scenes} currentSceneIndex={currentSceneIndex} />
        )}

        <StatusBar
          level={level}
          temperature={temperature}
          complianceScore={complianceScore}
          damageRisk={damageRisk}
          complaintRisk={complaintRisk}
        />

        <div className="mb-6">
          {!isPracticeMode && scene && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{scene.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{scene.name}</h2>
                  <p className="text-gray-600">{scene.description}</p>
                </div>
              </div>
            </div>
          )}

          <DecisionCard
            decision={currentDisplayDecision!}
            level={level}
            onSelect={handleSelectOption}
            showResult={showFeedback}
            selectedOptionId={selectedOptionId}
            onTimeUp={handleTimeUp}
            paused={!!currentRandomEvent}
            isPractice={isPracticeMode}
            practiceMode={practiceConfig?.mode}
          />
        </div>

        {showNextButton && (
          <div className="flex justify-end mt-6 animate-slide-up">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-cold-500/30 hover:from-cold-600 hover:to-cold-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {isLastDecision ? '查看结果' : '继续'}
              <ArrowRight size={24} />
            </button>
          </div>
        )}
      </div>

      {currentRandomEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg animate-scale-in">
            <DecisionCard
              decision={currentRandomEvent}
              level={level}
              onSelect={handleRandomEventOption}
              showResult={showRandomEventFeedback}
              selectedOptionId={randomEventSelectedId}
              onTimeUp={handleTimeUp}
            />
            {showRandomEventFeedback && (
              <div className="mt-4 flex justify-end animate-slide-up">
                <button
                  onClick={handleCloseRandomEventFeedback}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-cold-500/30 hover:from-cold-600 hover:to-cold-700 transition-all duration-300"
                >
                  继续配送
                  <ArrowRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
