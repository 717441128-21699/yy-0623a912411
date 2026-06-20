import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, RotateCcw, ChevronDown, ChevronUp, Trophy, AlertTriangle, CheckCircle, XCircle, Zap, Clock, Thermometer, Minus, Plus, ListOrdered, FileText, Target, ArrowRight, BarChart3, Lightbulb, Share2 } from 'lucide-react';
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
import { DecisionRecord, GameResult, Level } from '../types/game';
import { calculateSceneStats, generateImprovementSuggestions, getRecentReports, getPracticeSuggestions } from '../utils/learningProfile';

export const Result = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<GameResult | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isNewBest, setIsNewBest] = useState(false);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  const { calculateResult, startGame, resetGame, getResultFromStorage, clearResultFromStorage, practiceConfig } = useGameStore();

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

    let gameResult = calculateResult();

    if (!gameResult.levelId || gameResult.decisionHistory.length === 0) {
      const storedResult = getResultFromStorage();
      if (storedResult && storedResult.levelId === levelId) {
        gameResult = storedResult;
        setLoadedFromStorage(true);
      }
    }

    if (!gameResult.levelId || gameResult.decisionHistory.length === 0) {
      navigate('/');
      return;
    }

    setResult(gameResult);

    const wasNewBest = saveBestScore(levelId, gameResult.complianceScore);
    setIsNewBest(wasNewBest);
  }, [levelId, navigate, calculateResult, getResultFromStorage]);

  const handleRetry = () => {
    if (levelId) {
      clearResultFromStorage();
      resetGame();
      startGame(levelId);
      navigate(`/game/${levelId}`);
    }
  };

  const handleBackHome = () => {
    clearResultFromStorage();
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

  const allDecisions = level
    ? [...level.scenes.flatMap(s => s.decisions), ...level.randomEvents]
    : [];

  const getCorrectOptionText = (decisionId: string) => {
    const decision = allDecisions.find(d => d.id === decisionId);
    return decision?.options.find(o => o.isCorrect)?.text || '无';
  };

  const sceneGroups = result.decisionHistory.reduce((groups, record) => {
    const groupName = record.isRandomEvent ? '⚡ 突发情况处理' : record.sceneName;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(record);
    return groups;
  }, {} as Record<string, DecisionRecord[]>);

  const sortedTimeline = [...result.decisionHistory].sort((a, b) => a.timestamp - b.timestamp);

  const getSceneStep = (record: DecisionRecord): { step: number; name: string; icon: string } => {
    if (record.isRandomEvent) {
      return { step: -1, name: '突发情况', icon: '⚡' };
    }
    const sceneOrder: Record<string, { step: number; icon: string }> = {
      '装车前准备': { step: 1, icon: '📦' },
      '途中行驶': { step: 2, icon: '🚚' },
      '门店交接': { step: 3, icon: '🏪' },
    };
    const info = sceneOrder[record.sceneName] || { step: 0, icon: '📋' };
    return { step: info.step, name: record.sceneName, icon: info.icon };
  };

  const correctCount = result.decisionHistory.filter(r => r.isCorrect).length;
  const totalCount = result.decisionHistory.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const sceneStats = useMemo(() => calculateSceneStats(result.decisionHistory), [result]);
  const improvementSuggestions = useMemo(() => generateImprovementSuggestions(result, sceneStats), [result, sceneStats]);
  const weakScenes = useMemo(() => sceneStats.filter(s => s.accuracy < 60).map(s => s.sceneName), [sceneStats]);
  const practiceSuggestions = useMemo(() => levelId ? getPracticeSuggestions(levelId, weakScenes).slice(0, 3) : [], [levelId, weakScenes]);
  const latestReportId = useMemo(() => {
    const reports = levelId ? getRecentReports(5).filter(r => r.levelId === levelId) : [];
    return reports[0]?.id;
  }, [levelId, result]);

  const handleShareReport = () => {
    const text =
`📋 冷链温控训练报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 任务: ${result.levelName}
🏆 评级: ${getRatingLabel(result.overallRating)}
📊 合规分: ${result.complianceScore}/100
✅ 正确率: ${accuracy}% (${correctCount}/${totalCount})
⚠️ 货损风险: ${result.damageRisk}
📣 投诉风险: ${result.complaintRisk}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
关键知识点:
${result.keyLearnings.slice(0, 3).map((k, i) => `${i + 1}. ${k}`).join('\n')}`;
    try {
      navigator.clipboard.writeText(text);
      alert('报告已复制到剪贴板！');
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  const handleStartSuggestion = (idx: number) => {
    const sugg = practiceSuggestions[idx];
    if (!sugg || !levelId) return;
    const params = new URLSearchParams();
    params.set('mode', sugg.config.mode);
    if (sugg.config.sceneIds && sugg.config.sceneIds.length > 0) params.set('sceneIds', sugg.config.sceneIds.join(','));
    if (sugg.config.sceneId) params.set('sceneId', sugg.config.sceneId);
    if (sugg.config.decisionIds && sugg.config.decisionIds.length > 0) params.set('wrongIds', sugg.config.decisionIds.join(','));
    if (sugg.config.includeRandomEvents) params.set('includeRandom', 'true');
    navigate(`/practice/${levelId}?${params.toString()}`);
  };

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
            <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                <span className="text-gray-600">正确: {correctCount}</span>
              </div>
              <div className="w-px h-6 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-500" />
                <span className="text-gray-600">错误: {totalCount - correctCount}</span>
              </div>
              <div className="w-px h-6 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Target size={18} className="text-cyan-500" />
                <span className="text-gray-600 font-bold">正确率: {accuracy}%</span>
              </div>
            </div>
          </div>

          {practiceConfig && (
            <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <Target size={20} />
                本次专项练习表现
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sceneStats.map(stat => (
                  <div key={stat.sceneName} className="bg-white p-3 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1 truncate">{stat.sceneName}</p>
                    <p className={`text-lg font-bold ${
                      stat.accuracy >= 80 ? 'text-green-600' :
                      stat.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stat.accuracy}%
                    </p>
                    <p className="text-xs text-gray-400">{stat.correct}/{stat.total}题</p>
                  </div>
                ))}
              </div>
              {weakScenes.length > 0 && (
                <p className="mt-3 text-sm text-purple-700 flex items-center gap-1">
                  <AlertTriangle size={16} />
                  薄弱环节: {weakScenes.join('、')}，建议下方专项练习强化
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {latestReportId && (
              <button
                onClick={() => navigate(`/report/${latestReportId}`)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-md shadow-cyan-500/30 hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                <FileText size={20} />
                查看详细训练报告
              </button>
            )}
            <button
              onClick={handleShareReport}
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-cyan-300 hover:text-cyan-700 transition-all"
            >
              <Share2 size={20} />
              复制分享
            </button>
          </div>
        </div>

        {improvementSuggestions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="text-yellow-500" size={24} />
              💡 教练改进建议
            </h2>
            <div className="space-y-2">
              {improvementSuggestions.map((sugg, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed pt-0.5">{sugg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {practiceSuggestions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-slide-up" style={{ animationDelay: '90ms' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="text-orange-500" size={24} />
              💪 推荐下一组练习
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {practiceSuggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStartSuggestion(idx)}
                  className="p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-300 text-left group"
                >
                  <h4 className="font-bold text-lg text-gray-800 mb-1">{sugg.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{sugg.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      开始练习 <ArrowRight size={16} />
                    </span>
                    <span className="text-xs text-gray-400">{sugg.decisions.length}题</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ListOrdered className="text-cold-500" size={24} />
            🕐 配送复盘时间线
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-cold-200 via-blue-300 to-green-200 rounded-full" />
            <div className="space-y-6">
              {sortedTimeline.map((record, index) => {
                const sceneInfo = getSceneStep(record);
                const key = record.decisionId + '_' + record.timestamp;
                const isExpanded = expandedItems.has('timeline_' + key);
                return (
                  <div key={key} className="relative pl-16 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className={`absolute left-2 top-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 ${
                      record.isRandomEvent
                        ? 'bg-orange-500 border-orange-100'
                        : sceneInfo.step === 1
                        ? 'bg-blue-500 border-blue-100'
                        : sceneInfo.step === 2
                        ? 'bg-purple-500 border-purple-100'
                        : sceneInfo.step === 3
                        ? 'bg-green-500 border-green-100'
                        : 'bg-gray-500 border-gray-100'
                    }`}>
                      <span className="text-lg">
                        {record.isRandomEvent ? '⚡' : sceneInfo.icon}
                      </span>
                    </div>
                    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
                      record.isRandomEvent
                        ? record.isCorrect
                          ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50'
                          : 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50'
                        : record.isCorrect
                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
                    }`}>
                      <button
                        onClick={() => toggleExpand('timeline_' + key)}
                        className="w-full p-5 flex items-start justify-between text-left hover:bg-black/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              record.isRandomEvent
                                ? 'bg-orange-200 text-orange-800'
                                : sceneInfo.step === 1
                                ? 'bg-blue-200 text-blue-800'
                                : sceneInfo.step === 2
                                ? 'bg-purple-200 text-purple-800'
                                : 'bg-green-200 text-green-800'
                            }`}>
                              {sceneInfo.name}
                            </span>
                            {record.isRandomEvent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-medium">
                                <Zap size={12} />
                                突发
                              </span>
                            )}
                            {record.isTimeout && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                                <Clock size={12} />
                                超时
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              record.isCorrect
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}>
                              {record.isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {record.isCorrect ? '正确' : '错误'}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-800 mb-1">{record.decisionQuestion}</h4>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">选择：</span>{record.selectedOptionText}
                          </p>
                          <div className="flex items-center gap-4 mt-2 flex-wrap text-xs">
                            {record.consequence.complianceScore !== 0 && (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium ${
                                record.consequence.complianceScore > 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                合规分 {record.consequence.complianceScore > 0 ? '+' : ''}{record.consequence.complianceScore}
                              </span>
                            )}
                            {record.consequence.temperatureChange !== 0 && (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium ${
                                record.consequence.temperatureChange > 0
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                <Thermometer size={12} />
                                温度 {record.consequence.temperatureChange > 0 ? '+' : ''}{record.consequence.temperatureChange}℃
                              </span>
                            )}
                            {record.consequence.damageRisk !== 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium bg-yellow-100 text-yellow-700">
                                货损风险 {record.consequence.damageRisk > 0 ? '+' : ''}{record.consequence.damageRisk}
                              </span>
                            )}
                            {record.consequence.complaintRisk !== 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium bg-rose-100 text-rose-700">
                                投诉风险 {record.consequence.complaintRisk > 0 ? '+' : ''}{record.consequence.complaintRisk}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="p-4 bg-white rounded-xl border border-gray-200">
                            <div className="space-y-3">
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <h5 className="font-bold text-blue-800 mb-1 flex items-center gap-2">
                                  💡 知识点解释
                                </h5>
                                <p className="text-blue-700 leading-relaxed">
                                  {record.consequence.explanation}
                                </p>
                              </div>
                              {!record.isCorrect && (
                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <p className="text-yellow-800">
                                    <strong className="flex items-center gap-1">
                                      <CheckCircle size={16} className="text-green-600" />
                                      正确做法：
                                    </strong>
                                    <span className="block mt-1 text-yellow-700">{getCorrectOptionText(record.decisionId)}</span>
                                  </p>
                                </div>
                              )}
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  <strong>反馈：</strong>{record.consequence.feedback}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            📝 决策明细
          </h2>
          <div className="space-y-6">
            {Object.entries(sceneGroups).map(([sceneName, records], sceneIndex) => {
              const isRandomGroup = sceneName === '⚡ 突发情况处理';
              return (
                <div
                  key={sceneName}
                  className={`border-l-4 pl-4 ${
                    isRandomGroup ? 'border-orange-500' : 'border-cold-500'
                  }`}
                >
                  <h3
                    className={`text-lg font-bold mb-4 ${
                      isRandomGroup ? 'text-orange-600' : 'text-cold-700'
                    }`}
                  >
                    {sceneName}
                  </h3>
                  <div className="space-y-3">
                    {records.map((record, recordIndex) => {
                      const isExpanded = expandedItems.has(record.decisionId + record.timestamp);
                      return (
                        <div
                          key={record.decisionId + record.timestamp}
                          className={`rounded-xl border-2 overflow-hidden transition-all ${
                            record.isRandomEvent
                              ? record.isCorrect
                                ? 'border-orange-200 bg-orange-50/50'
                                : 'border-orange-300 bg-orange-50/70'
                              : record.isCorrect
                              ? 'border-green-200 bg-green-50/50'
                              : 'border-red-200 bg-red-50/50'
                          }`}
                        >
                          <button
                            onClick={() => toggleExpand(record.decisionId + record.timestamp)}
                            className="w-full p-4 flex items-start justify-between text-left hover:bg-black/5 transition-colors"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  record.isRandomEvent
                                    ? record.isCorrect
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-orange-600 text-white'
                                    : record.isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {record.isRandomEvent ? (
                                  <Zap size={18} />
                                ) : record.isCorrect ? (
                                  <CheckCircle size={18} />
                                ) : (
                                  <XCircle size={18} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-gray-800">
                                    {record.decisionQuestion}
                                  </p>
                                  {record.isRandomEvent && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-medium">
                                      <Zap size={12} />
                                      突发
                                    </span>
                                  )}
                                  {record.isTimeout && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                                      <Clock size={12} />
                                      超时
                                    </span>
                                  )}
                                </div>
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
                                      {getCorrectOptionText(record.decisionId)}
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
              );
            })}
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
