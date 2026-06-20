import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, RotateCcw, ChevronDown, ChevronUp, Trophy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useGameStore, getBestScores, saveBestScore } from '../store/useGameStore';
import { getLevelById } from '../data/levels';
import { Gauge } from '../components/ui/Gauge';
import {
  getRatingLabel,
  getRatingColor,
  getRatingBgColor,
  getRiskColor,
  getRiskLabel,
} from '../utils/scoring';
import { DecisionRecord, GameResult } from '../types/game';

export const Result = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<GameResult | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isNewBest, setIsNewBest] = useState(false);

  const { calculateResult, startGame, resetGame } = useGameStore();

  useEffect(() => {
    if (!levelId) {
      navigate('/');
      return;
    }

    const level = getLevelById(levelId);
    if (!level) {
      navigate('/');
      return;
    }

    const gameResult = calculateResult();
    setResult(gameResult);

    const wasNewBest = saveBestScore(levelId, gameResult.complianceScore);
    setIsNewBest(wasNewBest);
  }, [levelId, navigate, calculateResult]);

  const handleRetry = () => {
    if (levelId) {
      resetGame();
      startGame(levelId);
      navigate(`/game/${levelId}`);
    }
  };

  const handleBackHome = () => {
    resetGame();
    navigate('/');
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cold-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cold-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-cold-600">加载中...</p>
        </div>
      </div>
    );
  }

  const level = getLevelById(levelId || '');

  const sceneGroups = result.decisionHistory.reduce((groups, record) => {
    if (!groups[record.sceneName]) {
      groups[record.sceneName] = [];
    }
    groups[record.sceneName].push(record);
    return groups;
  }, {} as Record<string, DecisionRecord[]>);

  const correctCount = result.decisionHistory.filter(r => r.isCorrect).length;
  const totalCount = result.decisionHistory.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cold-50 via-white to-ice-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${getRatingBgColor(
              result.overallRating
            )} shadow-lg animate-float`}
          >
            {result.overallRating === 'excellent' || result.overallRating === 'good' ? (
              <Trophy className="text-white" size={40} />
            ) : result.overallRating === 'pass' ? (
              <CheckCircle className="text-white" size={40} />
            ) : (
              <AlertTriangle className="text-white" size={40} />
            )}
          </div>

          {isNewBest && (
            <div className="inline-block mb-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold animate-bounce-slow">
              🎉 新纪录！
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            配送任务完成！
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {level?.icon} {result.levelName}
          </p>
          <p className={`text-2xl font-bold ${getRatingColor(result.overallRating)}`}>
            {getRatingLabel(result.overallRating)}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            任务评估报告
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <div className="text-center">
              <Gauge
                value={result.complianceScore}
                label="温控合规分"
                color="text-blue-500"
                size="lg"
              />
              <p className="mt-2 text-sm text-gray-500">满分100分</p>
            </div>
            <div className="text-center">
              <Gauge
                value={result.damageRisk}
                label="货损风险"
                color={getRiskColor(result.damageRisk)}
                size="lg"
                inverse={true}
              />
              <p className={`mt-2 text-sm ${getRiskColor(result.damageRisk)}`}>
                {getRiskLabel(result.damageRisk)}
              </p>
            </div>
            <div className="text-center">
              <Gauge
                value={result.complaintRisk}
                label="投诉风险"
                color={getRiskColor(result.complaintRisk)}
                size="lg"
                inverse={true}
              />
              <p className={`mt-2 text-sm ${getRiskColor(result.complaintRisk)}`}>
                {getRiskLabel(result.complaintRisk)}
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                <span className="text-gray-600">正确: {correctCount}</span>
              </div>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-500" />
                <span className="text-gray-600">错误: {totalCount - correctCount}</span>
              </div>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="text-gray-600">正确率: {Math.round((correctCount / totalCount) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            📝 决策明细
          </h2>
          <div className="space-y-6">
            {Object.entries(sceneGroups).map(([sceneName, records], sceneIndex) => (
              <div key={sceneName} className="border-l-4 border-cold-500 pl-4">
                <h3 className="text-lg font-bold text-cold-700 mb-4">
                  {sceneName}
                </h3>
                <div className="space-y-3">
                  {records.map((record, recordIndex) => {
                    const isExpanded = expandedItems.has(record.decisionId);
                    return (
                      <div
                        key={record.decisionId}
                        className={`rounded-xl border-2 overflow-hidden transition-all ${
                          record.isCorrect
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-red-200 bg-red-50/50'
                        }`}
                      >
                        <button
                          onClick={() => toggleExpand(record.decisionId)}
                          className="w-full p-4 flex items-start justify-between text-left hover:bg-black/5 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                record.isCorrect
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {record.isCorrect ? (
                                <CheckCircle size={18} />
                              ) : (
                                <XCircle size={18} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {record.decisionQuestion}
                              </p>
                              <p
                                className={`text-sm mt-1 ${
                                  record.isCorrect ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                你的选择: {record.selectedOptionText}
                              </p>
                              {record.consequence.complianceScore !== 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  合规分 {record.consequence.complianceScore > 0 ? '+' : ''}
                                  {record.consequence.complianceScore}
                                </p>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                💡 知识点
                              </h4>
                              <p className="text-gray-600 leading-relaxed">
                                {record.consequence.explanation}
                              </p>
                              {!record.isCorrect && (
                                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <p className="text-yellow-700 text-sm">
                                    <strong>正确做法：</strong>
                                    {
                                      level?.scenes
                                        .flatMap(s => s.decisions)
                                        .find(d => d.id === record.decisionId)
                                        ?.options.find(o => o.isCorrect)?.text
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            🎓 学习总结
          </h2>
          <div className="space-y-3">
            {result.keyLearnings.map((learning, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-cold-50 to-ice-50 rounded-xl border border-cold-200 animate-slide-up"
                style={{ animationDelay: `${index * 100 + 300}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-cold-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{learning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-cold-500/30 hover:from-cold-600 hover:to-cold-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <RotateCcw size={24} />
            再次挑战
          </button>
          <button
            onClick={handleBackHome}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-cold-600 border-2 border-cold-500 rounded-xl font-bold text-lg hover:bg-cold-50 transition-all duration-300"
          >
            <Home size={24} />
            返回首页
          </button>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>冷链温控训练营 © 2024 | 让每个冷链司机都成为温度守护者</p>
        </footer>
      </div>
    </div>
  );
};
