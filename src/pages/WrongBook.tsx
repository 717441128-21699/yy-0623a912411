import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2, RefreshCw, Zap, Clock, AlertCircle, Search, Filter, ArrowRight } from 'lucide-react';
import { WrongQuestion } from '../types/game';
import { getWrongQuestions, markQuestionMastered, removeQuestion, getUnmasteredCount } from '../utils/wrongQuestions';
import { levels, getLevelById } from '../data/levels';

export const WrongBook = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'unmastered' | 'mastered'>('unmastered');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setQuestions(getWrongQuestions());
  }, [refreshKey]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleMarkMastered = (id: string) => {
    markQuestionMastered(id);
    setRefreshKey(k => k + 1);
  };

  const handleRemove = (id: string) => {
    if (confirm('确定要删除这道错题吗？')) {
      removeQuestion(id);
      setRefreshKey(k => k + 1);
    }
  };

  const handlePracticeAll = () => {
    const filtered = filteredQuestions;
    if (filtered.length === 0) {
      alert('没有可练习的题目！');
      return;
    }
    const levelIds = [...new Set(filtered.map(q => q.levelId))];
    const params = new URLSearchParams();
    params.set('mode', 'wrong');
    const wrongIds = filtered.map(q => q.decision.id).join(',');
    params.set('wrongIds', wrongIds);
    navigate(`/practice/${levelIds[0]}?${params.toString()}`);
  };

  const handlePracticeLevel = (levelId: string) => {
    const levelQuestions = filteredQuestions.filter(q => q.levelId === levelId);
    if (levelQuestions.length === 0) {
      alert('该关卡没有可练习的题目！');
      return;
    }
    const params = new URLSearchParams();
    params.set('mode', 'wrong');
    const wrongIds = levelQuestions.map(q => q.decision.id).join(',');
    params.set('wrongIds', wrongIds);
    navigate(`/practice/${levelId}?${params.toString()}`);
  };

  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    if (filter === 'unmastered') {
      result = result.filter(q => !q.mastered);
    } else if (filter === 'mastered') {
      result = result.filter(q => q.mastered);
    }

    if (levelFilter !== 'all') {
      result = result.filter(q => q.levelId === levelFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(q =>
        q.decision.question.toLowerCase().includes(term) ||
        q.sceneName.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => new Date(b.lastWrongDate).getTime() - new Date(a.lastWrongDate).getTime());
    return result;
  }, [questions, filter, levelFilter, searchTerm]);

  const stats = useMemo(() => {
    const unmastered = questions.filter(q => !q.mastered).length;
    const mastered = questions.filter(q => q.mastered).length;
    const total = questions.length;
    return { unmastered, mastered, total };
  }, [questions]);

  const levelGroups = useMemo(() => {
    const groups: Record<string, WrongQuestion[]> = {};
    filteredQuestions.forEach(q => {
      if (!groups[q.levelId]) groups[q.levelId] = [];
      groups[q.levelId].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  const getCorrectOptionText = (question: WrongQuestion) => {
    return question.decision.options.find(o => o.isCorrect)?.text || '无';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cold-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-white hover:shadow-md transition-all"
          >
            <Home size={20} />
            <span>返回首页</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            错题本
          </h1>
          <div className="w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待复习</p>
                <p className="text-3xl font-bold text-red-500">{stats.unmastered}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">已掌握</p>
                <p className="text-3xl font-bold text-green-500">{stats.mastered}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">累计错题</p>
                <p className="text-3xl font-bold text-purple-500">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen size={24} className="text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索题目..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <div className="flex bg-gray-100 rounded-xl p-1">
                {[
                  { key: 'unmastered', label: '待复习' },
                  { key: 'mastered', label: '已掌握' },
                  { key: 'all', label: '全部' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key as any)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filter === item.key
                        ? 'bg-white shadow text-purple-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors bg-white"
            >
              <option value="all">全部关卡</option>
              {levels.map(l => (
                <option key={l.id} value={l.id}>
                  {l.icon} {l.name}
                </option>
              ))}
            </select>

            {filteredQuestions.filter(q => !q.mastered).length > 0 && (
              <button
                onClick={handlePracticeAll}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700 transition-all"
              >
                <RefreshCw size={18} />
                开始练习全部
              </button>
            )}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 shadow-xl text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {questions.length === 0 ? '错题本是空的' : '没有符合条件的题目'}
            </h3>
            <p className="text-gray-500 mb-6">
              {questions.length === 0
                ? '快去完成训练任务，遇到错题会自动收录到这里。'
                : '试试调整筛选条件看看其他题目。'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-medium shadow-lg hover:from-cold-600 hover:to-cold-700 transition-all"
            >
              去训练
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(levelGroups).map(([levelId, levelQuestions]) => {
              const level = getLevelById(levelId);
              const unmasteredInLevel = levelQuestions.filter(q => !q.mastered).length;
              return (
                <div key={levelId} className="animate-fade-in">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">{level?.icon || '📦'}</span>
                      {level?.name || levelId}
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        {levelQuestions.length}题
                      </span>
                    </h3>
                    {unmasteredInLevel > 0 && (
                      <button
                        onClick={() => handlePracticeLevel(levelId)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
                      >
                        练这{unmasteredInLevel}题
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {levelQuestions.map(q => {
                      const isExpanded = expandedIds.has(q.id);
                      const correctText = getCorrectOptionText(q);
                      return (
                        <div
                          key={q.id}
                          className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all border-2 ${
                            q.mastered ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                          }`}
                        >
                          <button
                            onClick={() => toggleExpand(q.id)}
                            className="w-full p-5 flex items-start justify-between text-left hover:bg-black/5 transition-colors"
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                q.mastered ? 'bg-green-200' : 'bg-red-200'
                              }`}>
                                {q.mastered ? (
                                  <CheckCircle size={20} className="text-green-600" />
                                ) : (
                                  <XCircle size={20} className="text-red-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    q.isRandomEvent
                                      ? 'bg-orange-200 text-orange-800'
                                      : 'bg-blue-200 text-blue-800'
                                  }`}>
                                    {q.isRandomEvent ? (
                                      <span className="flex items-center gap-1">
                                        <Zap size={12} />
                                        突发情况
                                      </span>
                                    ) : (
                                      q.sceneName
                                    )}
                                  </span>
                                  {q.mastered ? (
                                    <span className="px-2.5 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                                      已掌握
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                      待复习
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatDate(q.lastWrongDate)}
                                  </span>
                                </div>
                                <h4 className="font-bold text-gray-800 text-lg leading-relaxed mb-2">
                                  {q.decision.question}
                                </h4>
                                <div className="flex items-center gap-4 flex-wrap text-sm">
                                  <span className={`px-2 py-0.5 rounded-md font-medium ${
                                    q.wrongCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    错{q.wrongCount}次
                                  </span>
                                  {q.correctCount > 0 && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-md font-medium">
                                      对{q.correctCount}次
                                    </span>
                                  )}
                                  {q.lastWrongAnswer && (
                                    <span className="text-red-500 font-medium truncate max-w-[300px]">
                                      上次错选: {q.lastWrongAnswer}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp size={22} className="text-gray-400" />
                              ) : (
                                <ChevronDown size={22} className="text-gray-400" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                              <div className="pt-5 space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                  <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    💡 知识点解释
                                  </h5>
                                  <p className="text-blue-700 leading-relaxed">
                                    {q.decision.options.find(o => o.isCorrect)?.consequence.explanation
                                      || q.decision.options[0]?.consequence.explanation
                                      || '暂无知识点说明'}
                                  </p>
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                  <p className="text-yellow-800">
                                    <strong className="flex items-center gap-1 mb-1">
                                      <CheckCircle size={16} className="text-green-600" />
                                      正确做法：
                                    </strong>
                                    <span className="block text-yellow-700 font-medium">{correctText}</span>
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                  {!q.mastered && (
                                    <button
                                      onClick={() => handleMarkMastered(q.id)}
                                      className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-md"
                                    >
                                      <CheckCircle size={18} />
                                      标记已掌握
                                    </button>
                                  )}
                                  {q.mastered && (
                                    <button
                                      onClick={() => {
                                        const updated = getWrongQuestions().map(wq => {
                                          if (wq.id === q.id) return { ...wq, mastered: false };
                                          return wq;
                                        });
                                        localStorage.setItem('cold_chain_wrong_questions', JSON.stringify(updated));
                                        setRefreshKey(k => k + 1);
                                      }}
                                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors shadow-md"
                                    >
                                      取消已掌握
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleRemove(q.id)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 size={18} />
                                    删除
                                  </button>
                                </div>
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
        )}

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>冷链温控训练营 © 2024 | 错题本让你更快掌握知识点</p>
        </footer>
      </div>
    </div>
  );
};
