import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { useGameStore, saveBestScore } from '../store/useGameStore';
import { getLevelById } from '../data/levels';
import { SceneProgress } from '../components/game/SceneProgress';
import { StatusBar } from '../components/game/StatusBar';
import { DecisionCard } from '../components/game/DecisionCard';
import { Option } from '../types/game';

export const Game = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [randomEventTriggered, setRandomEventTriggered] = useState(false);
  const [randomEventSelectedId, setRandomEventSelectedId] = useState<string | null>(null);
  const [showRandomEventFeedback, setShowRandomEventFeedback] = useState(false);

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
    startGame,
    selectOption,
    selectRandomEventOption,
    nextDecision,
    resetGame,
    getCurrentScene,
    getCurrentDecision,
    getCurrentLevel,
    triggerRandomEvent,
    closeRandomEvent,
    calculateResult,
    saveResultToStorage,
  } = useGameStore();

  const level = getCurrentLevel();
  const scene = getCurrentScene();
  const decision = getCurrentDecision();

  useEffect(() => {
    if (levelId) {
      const levelData = getLevelById(levelId);
      if (!levelData) {
        navigate('/');
        return;
      }
      startGame(levelId);
    }

    return () => {
      resetGame();
    };
  }, [levelId, navigate, startGame, resetGame]);

  useEffect(() => {
    if (isGameOver && levelId) {
      const result = calculateResult();
      saveBestScore(levelId, result.complianceScore);
      saveResultToStorage();
      navigate(`/result/${levelId}`);
    }
  }, [isGameOver, levelId, navigate, calculateResult, saveResultToStorage]);

  useEffect(() => {
    if (
      level &&
      currentSceneIndex === 1 &&
      currentDecisionIndex === 0 &&
      !randomEventTriggered &&
      level.randomEvents.length > 0
    ) {
      const randomIndex = Math.floor(Math.random() * level.randomEvents.length);
      const randomEvent = level.randomEvents[randomIndex];

      const timer = setTimeout(() => {
        triggerRandomEvent(randomEvent);
        setRandomEventTriggered(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [
    level,
    currentSceneIndex,
    currentDecisionIndex,
    randomEventTriggered,
    triggerRandomEvent,
  ]);

  const handleSelectOption = useCallback(
    (option: Option) => {
      if (showFeedback) return;
      setSelectedOptionId(option.id);
      selectOption(option);
      setShowNextButton(true);
    },
    [showFeedback, selectOption]
  );

  const handleNext = useCallback(() => {
    setSelectedOptionId(null);
    setShowNextButton(false);
    nextDecision();
  }, [nextDecision]);

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
    } else if (decision && !showFeedback) {
      const worstOption = decision.options.reduce((worst, option) => {
        return option.consequence.complianceScore < worst.consequence.complianceScore
          ? option
          : worst;
      }, decision.options[0]);
      handleSelectOption(worstOption);
    }
  }, [currentRandomEvent, decision, showFeedback, showRandomEventFeedback, selectRandomEventOption, handleSelectOption]);

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

  if (!level || !scene || !decision) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cold-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cold-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-cold-600">加载中...</p>
        </div>
      </div>
    );
  }

  const totalDecisions = level.scenes.reduce(
    (sum, s) => sum + s.decisions.length,
    0
  );
  const completedDecisions =
    level.scenes.slice(0, currentSceneIndex).reduce((sum, s) => sum + s.decisions.length, 0) +
    currentDecisionIndex;
  const progressPercentage = (completedDecisions / totalDecisions) * 100;

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
              <span className="text-2xl">{level.icon}</span>
              <span className="font-bold text-gray-800">{level.name}</span>
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
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-6 max-w-4xl transition-opacity duration-300 ${currentRandomEvent ? 'opacity-50 pointer-events-none' : ''}`}>
        <SceneProgress scenes={level.scenes} currentSceneIndex={currentSceneIndex} />

        <StatusBar
          level={level}
          temperature={temperature}
          complianceScore={complianceScore}
          damageRisk={damageRisk}
          complaintRisk={complaintRisk}
        />

        <div className="mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{scene.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{scene.name}</h2>
                <p className="text-gray-600">{scene.description}</p>
              </div>
            </div>
          </div>

          <DecisionCard
            decision={decision}
            level={level}
            onSelect={handleSelectOption}
            showResult={showFeedback}
            selectedOptionId={selectedOptionId}
            onTimeUp={handleTimeUp}
            paused={!!currentRandomEvent}
          />
        </div>

        {showNextButton && (
          <div className="flex justify-end mt-6 animate-slide-up">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-cold-500/30 hover:from-cold-600 hover:to-cold-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {currentSceneIndex === level.scenes.length - 1 &&
              currentDecisionIndex === scene.decisions.length - 1
                ? '查看结果'
                : '继续'}
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
