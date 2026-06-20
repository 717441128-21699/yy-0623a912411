import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Thermometer, Package, CheckCircle, Trophy, ArrowRight, BookOpen, Zap, MapPin, ChevronRight, XCircle } from 'lucide-react';
import { levels, getDifficultyLabel, getDifficultyColor } from '../data/levels';
import { getBestScores } from '../store/useGameStore';
import { BestScores } from '../types/game';
import { getUnmasteredCount, getWrongQuestions } from '../utils/wrongQuestions';

export const Home = () => {
  const navigate = useNavigate();
  const [bestScores, setBestScores] = useState<BestScores>({});
  const [wrongCount, setWrongCount] = useState(0);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  useEffect(() => {
    setBestScores(getBestScores());
    setWrongCount(getUnmasteredCount());
  }, []);

  const handleStartGame = (levelId: string) => {
    navigate(`/game/${levelId}`);
  };

  const handleStartPractice = (levelId: string, mode: 'random' | 'scene' | 'wrong', sceneId?: string) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (sceneId) params.set('sceneId', sceneId);
    if (mode === 'wrong') {
      const wrongs = getWrongQuestions().filter(q => !q.mastered && q.levelId === levelId);
      const wrongIds = wrongs.map(q => q.decision.id).join(',');
      params.set('wrongIds', wrongIds);
      if (!wrongs.length) {
        alert('该关卡暂无错题，先去练习吧！');
        return;
      }
    }
    navigate(`/practice/${levelId}?${params.toString()}`);
  };

  const handleStartWrongPractice = () => {
    const wrongs = getWrongQuestions().filter(q => !q.mastered);
    if (!wrongs.length) {
      alert('暂无错题，先去练习吧！');
      return;
    }
    const levelIds = [...new Set(wrongs.map(q => q.levelId))];
    handleStartPractice(levelIds[0], 'wrong');
  };

  const toggleLevel = (levelId: string) => {
    setExpandedLevel(prev => prev === levelId ? null : levelId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cold-50 via-white to-ice-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-end mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/wrong-book')}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-purple-200 rounded-2xl shadow-md hover:shadow-lg hover:border-purple-400 transition-all duration-300 group"
          >
            <div className="relative">
              <BookOpen className="text-purple-500 group-hover:text-purple-600 transition-colors" size={24} />
              {wrongCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {wrongCount > 99 ? '99+' : wrongCount}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
              错题本
            </span>
            {wrongCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                {wrongCount}题待复习
              </span>
            )}
          </button>
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cold-400 to-cold-600 rounded-3xl mb-6 shadow-xl shadow-cold-500/30 animate-float">
            <Truck className="text-white" size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            冷链温控训练营
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            成为专业冷链司机的第一步
            <br />
            <span className="text-cold-600">在游戏中学习，在实战中成长</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <Package className="text-cold-500" size={32} />,
              title: '装车前检查',
              desc: '学习正确选择温区、等待预冷、检查温度探头',
            },
            {
              icon: <Truck className="text-cold-500" size={32} />,
              title: '途中行驶',
              desc: '应对堵车、车门未关严、客户催促等突发情况',
            },
            {
              icon: <CheckCircle className="text-cold-500" size={32} />,
              title: '门店交接',
              desc: '记录温度、拍照留证、处理签收争议',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-cold-100 rounded-2xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎯 选择配送任务
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {levels.map((level, index) => {
              const bestScore = bestScores[level.id];
              const levelWrongCount = getWrongQuestions().filter(q => !q.mastered && q.levelId === level.id).length;
              const isExpanded = expandedLevel === level.id;
              return (
                <div
                  key={level.id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 animate-slide-up"
                  style={{ animationDelay: `${index * 150 + 300}ms` }}
                >
                  <div
                    className={`h-32 flex items-center justify-center text-6xl ${
                      level.id === 'vaccine'
                        ? 'bg-gradient-to-r from-blue-400 to-cold-500'
                        : 'bg-gradient-to-r from-green-400 to-emerald-500'
                    }`}
                  >
                    <span className="animate-bounce-slow">{level.icon}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-800">{level.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                          level.difficulty
                        )} bg-gray-100`}
                      >
                        {getDifficultyLabel(level.difficulty)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {level.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Thermometer size={16} />
                        <span>
                          温度要求: {level.targetTemp.min}-{level.targetTemp.max}°C
                        </span>
                      </div>
                      {bestScore && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Trophy size={16} />
                          <span className="text-sm font-medium">
                            最高分: {bestScore.complianceScore}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleStartGame(level.id)}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:from-cold-600 group-hover:to-cold-700 transition-all duration-300 shadow-lg shadow-cold-500/30"
                    >
                      开始完整任务
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => toggleLevel(level.id)}
                      className="w-full px-6 py-3 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium flex items-center gap-2">
                        <MapPin size={16} className="text-blue-500" />
                        专项练习入口
                      </span>
                      <ChevronRight
                        size={18}
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 animate-slide-up">
                        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                          <button
                            onClick={() => handleStartPractice(level.id, 'random')}
                            className="w-full p-4 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <Zap className="text-orange-500" size={24} />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-800">突发情况专项</p>
                                <p className="text-sm text-gray-500">只练随机突发事件{level.randomEvents.length}题</p>
                              </div>
                              <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </button>

                          <div className="space-y-2 pt-1">
                            <p className="text-xs font-bold text-gray-500 px-2">场景专项练习</p>
                            {level.scenes.map(scene => (
                              <button
                                key={scene.id}
                                onClick={() => handleStartPractice(level.id, 'scene', scene.id)}
                                className="w-full p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors text-xl">
                                    {scene.icon}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-sm">{scene.name}</p>
                                    <p className="text-xs text-gray-500">{scene.decisions.length}道决策题</p>
                                  </div>
                                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => handleStartPractice(level.id, 'wrong')}
                            disabled={levelWrongCount === 0}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                              levelWrongCount === 0
                                ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                levelWrongCount === 0 ? 'bg-gray-200' : 'bg-purple-100 group-hover:bg-purple-200'
                              }`}>
                                <BookOpen className={levelWrongCount === 0 ? 'text-gray-400' : 'text-purple-500'} size={24} />
                              </div>
                              <div className="flex-1">
                                <p className={`font-bold ${levelWrongCount === 0 ? 'text-gray-500' : 'text-gray-800'}`}>
                                  错题重练
                                </p>
                                <p className={`text-sm ${levelWrongCount === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {levelWrongCount > 0
                                    ? `复习${levelWrongCount}道错题，练对自动标记已掌握`
                                    : '暂无错题，先去完整任务练习吧'}
                                </p>
                              </div>
                              {levelWrongCount > 0 && (
                                <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            游戏规则
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: '做出选择',
                desc: '在每个场景中，根据实际情况做出正确的决策',
              },
              {
                step: '02',
                title: '限时挑战',
                desc: '部分紧急事件需要在规定时间内做出反应',
              },
              {
                step: '03',
                title: '获得反馈',
                desc: '每次选择后都会获得即时反馈和详细解释',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cold-400 to-cold-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-cold-50 rounded-xl border border-cold-200">
            <p className="text-center text-cold-700 text-sm">
              💡 <strong>提示：</strong>这不是考试，而是学习工具。即使选择错误也没关系，重要的是理解每个操作为什么重要。
            </p>
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>冷链温控训练营 © 2024 | 让每个冷链司机都成为温度守护者</p>
        </footer>
      </div>
    </div>
  );
};
