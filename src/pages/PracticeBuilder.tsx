import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, Zap, MapPin, ArrowRight, CheckCircle2, AlertCircle, Target, Shuffle, RotateCcw, BookOpen } from 'lucide-react';
import { getLevelById } from '../data/levels';
import { Decision, Scene } from '../types/game';
import { getWrongQuestions } from '../utils/wrongQuestions';

export const PracticeBuilder = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const level = levelId ? getLevelById(levelId) : null;
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [includeRandomEvents, setIncludeRandomEvents] = useState(false);
  const [includeWrongOnly, setIncludeWrongOnly] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    if (!level) return;
    setSelectedSceneIds(level.scenes.map(s => s.id));
  }, [level]);

  const toggleScene = (sceneId: string) => {
    setSelectedSceneIds(prev => {
      if (prev.includes(sceneId)) {
        return prev.filter(id => id !== sceneId);
      }
      return [...prev, sceneId];
    });
  };

  const selectAllScenes = () => {
    if (!level) return;
    setSelectedSceneIds(level.scenes.map(s => s.id));
  };

  const clearAllScenes = () => {
    setSelectedSceneIds([]);
  };

  const totalQuestions = useMemo(() => {
    if (!level) return 0;
    let questions: Decision[] = [];
    const wrongs = includeWrongOnly ? getWrongQuestions().filter(q => !q.mastered && q.levelId === levelId) : [];
    const wrongIds = wrongs.map(q => q.decision.id);

    level.scenes
      .filter(s => selectedSceneIds.includes(s.id))
      .forEach(s => {
        if (includeWrongOnly) {
          questions.push(...s.decisions.filter(d => wrongIds.includes(d.id)));
        } else {
          questions.push(...s.decisions);
        }
      });

    if (includeRandomEvents) {
      if (includeWrongOnly) {
        questions.push(...level.randomEvents.filter(d => wrongIds.includes(d.id)));
      } else {
        questions.push(...level.randomEvents);
      }
    }

    return questions.length;
  }, [level, selectedSceneIds, includeRandomEvents, includeWrongOnly, levelId]);

  const selectedScenes = useMemo(() => {
    if (!level) return [] as Scene[];
    return level.scenes.filter(s => selectedSceneIds.includes(s.id));
  }, [level, selectedSceneIds]);

  const handleStart = () => {
    if (!level || !levelId) return;
    if (totalQuestions === 0) {
      alert('请至少选择一个有题目的模块');
      return;
    }

    const params = new URLSearchParams();
    params.set('mode', 'scene');
    if (selectedSceneIds.length === 1) {
      params.set('sceneId', selectedSceneIds[0]);
    } else if (selectedSceneIds.length > 1) {
      params.set('sceneIds', selectedSceneIds.join(','));
    }
    if (includeRandomEvents) {
      params.set('includeRandom', 'true');
    }
    if (includeWrongOnly) {
      const wrongIds = getWrongQuestions()
        .filter(q => !q.mastered && q.levelId === levelId)
        .map(q => q.decision.id);
      params.set('mode', 'wrong');
      params.set('wrongIds', wrongIds.join(','));
    }
    navigate(`/practice/${levelId}?${params.toString()}`);
  };

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cold-50">
        <div className="text-center">
          <p className="text-cold-600 mb-4">关卡不存在</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-cold-500 text-white rounded-xl"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cold-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-white hover:shadow-md transition-all"
          >
            <ChevronLeft size={20} />
            <span>返回首页</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-purple-500" size={32} />
            自定义专项练习
          </h1>
          <div className="w-24" />
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg mb-6">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
              level.id === 'vaccine'
                ? 'bg-gradient-to-br from-blue-400 to-cold-500'
                : 'bg-gradient-to-br from-green-400 to-emerald-500'
            }`}>
              {level.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{level.name}</h2>
              <p className="text-sm text-gray-500">勾选你想练习的模块组合</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" />
                选择场景
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={selectAllScenes}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  全选
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearAllScenes}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  清空
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {level.scenes.map(scene => {
                const checked = selectedSceneIds.includes(scene.id);
                return (
                  <button
                    key={scene.id}
                    onClick={() => toggleScene(scene.id)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 text-left ${
                      checked
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      checked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {checked ? <CheckCircle2 size={22} /> : <span className="text-lg">{scene.icon}</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{scene.name}</p>
                      <p className="text-sm text-gray-500">{scene.decisions.length}道决策题</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {checked && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Zap size={20} className="text-orange-500" />
              额外模块
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setIncludeRandomEvents(v => !v)}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 text-left ${
                  includeRandomEvents
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  includeRandomEvents ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Zap size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">突发情况练习</p>
                  <p className="text-sm text-gray-500">加入 {level.randomEvents.length} 道随机突发事件</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  includeRandomEvents ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {includeRandomEvents && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </button>

              <button
                onClick={() => setIncludeWrongOnly(v => !v)}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 text-left ${
                  includeWrongOnly
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  includeWrongOnly ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <BookOpen size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">只练错题</p>
                  <p className="text-sm text-gray-500">从已选模块中只保留未掌握的错题</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  includeWrongOnly ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                }`}>
                  {includeWrongOnly && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </button>
            </div>
          </div>

          {selectedScenes.length > 0 && (
            <div className="mb-6 p-4 bg-cyan-50 rounded-2xl border border-cyan-200">
              <h4 className="font-bold text-cyan-800 mb-2 text-sm">练习内容预览</h4>
              <div className="flex flex-wrap gap-2">
                {selectedScenes.map(s => (
                  <span key={s.id} className="px-3 py-1 bg-white text-cyan-700 rounded-full text-sm font-medium border border-cyan-200">
                    {s.icon} {s.name} ({s.decisions.length}题)
                  </span>
                ))}
                {includeRandomEvents && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium border border-orange-200">
                    ⚡ 突发情况 ({level.randomEvents.length}题)
                  </span>
                )}
                {includeWrongOnly && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                    📖 仅错题
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg sticky bottom-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">共 <strong className="text-gray-800 text-lg">{totalQuestions}</strong> 道题</p>
              {totalQuestions === 0 && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  请至少选择一个模块
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedSceneIds(level.scenes.map(s => s.id));
                  setIncludeRandomEvents(false);
                  setIncludeWrongOnly(false);
                }}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={16} />
                重置
              </button>
              <button
                onClick={handleStart}
                disabled={totalQuestions === 0}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${
                  totalQuestions === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                开始练习
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
