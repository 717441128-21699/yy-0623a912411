import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, Trophy, AlertTriangle, CheckCircle, XCircle, Zap, Clock, Share2, ArrowRight, BarChart3, FileText, Lightbulb } from 'lucide-react';
import { TrainingReport } from '../types/game';
import { getReportById, getPracticeSuggestions } from '../utils/learningProfile';
import { Gauge } from '../components/ui/Gauge';
import {
  getRatingLabel,
  getRatingColor,
  getRatingBgColor,
  getRiskColor,
  getRiskLabel,
} from '../utils/scoring';
import { getLevelById } from '../data/levels';

export const ReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<TrainingReport | null>(null);

  useEffect(() => {
    if (!reportId) return;
    const r = getReportById(reportId);
    setReport(r);
  }, [reportId]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cold-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cold-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-cold-600">报告加载中...</p>
          <button
            onClick={() => navigate('/learning-profile')}
            className="mt-4 px-5 py-2 bg-cold-500 text-white rounded-xl hover:bg-cold-600 transition-all"
          >
            返回学习档案
          </button>
        </div>
      </div>
    );
  }

  const level = getLevelById(report.levelId);
  const sortedTimeline = [...report.decisionHistory].sort((a, b) => a.timestamp - b.timestamp);
  const wrongRecords = report.decisionHistory.filter(r => !r.isCorrect);
  const practiceSuggestions = getPracticeSuggestions(report.levelId, report.weakScenes);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('zh-CN');
    } catch {
      return dateStr;
    }
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  const handleShare = () => {
    const text = "📋 冷链温控训练报告\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📦 任务: " + report.levelName +
      "\n🏆 评级: " + getRatingLabel(report.overallRating) +
      "\n📊 合规分: " + report.complianceScore + "/100" +
      "\n✅ 正确率: " + report.accuracy + "% (" + report.correctCount + "/" + report.totalQuestions + ")" +
      "\n⚠️ 货损风险: " + report.damageRisk +
      "\n📣 投诉风险: " + report.complaintRisk +
      "\n⏰ 训练时间: " + formatDate(report.completedAt) +
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
    try {
      navigator.clipboard.writeText(text);
      alert('报告已复制到剪贴板，快去分享吧！');
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  const handleStartSuggestion = (idx: number) => {
    const suggestion = practiceSuggestions[idx];
    if (!suggestion || !level) return;
    const params = new URLSearchParams();
    params.set('mode', suggestion.config.mode);
    if (suggestion.config.sceneIds && suggestion.config.sceneIds.length > 0) {
      params.set('sceneIds', suggestion.config.sceneIds.join(','));
    }
    if (suggestion.config.sceneId) {
      params.set('sceneId', suggestion.config.sceneId);
    }
    if (suggestion.config.decisionIds && suggestion.config.decisionIds.length > 0) {
      params.set('wrongIds', suggestion.config.decisionIds.join(','));
    }
    if (suggestion.config.includeRandomEvents) {
      params.set('includeRandom', 'true');
    }
    navigate('/practice/' + report.levelId + '?' + params.toString());
  };

  const ratingBg = getRatingBgColor(report.overallRating);
  const ratingTextColor = getRatingColor(report.overallRating);
  const damageRiskColor = getRiskColor(report.damageRisk);
  const complaintRiskColor = getRiskColor(report.complaintRisk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cold-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/learning-profile/' + report.levelId)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-white hover:shadow-md transition-all"
          >
            <ChevronLeft size={20} />
            <span>返回学习档案</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={28} className="text-cyan-500" />
            训练报告
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-cyan-200 text-cyan-600 rounded-xl font-medium hover:border-cyan-400 hover:bg-cyan-50 transition-all"
            >
              <Share2 size={18} />
              <span className="hidden md:inline">复制分享</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
          <div className="text-center mb-8">
            <div className={"inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg animate-float " + ratingBg}>
              {report.overallRating === 'excellent' || report.overallRating === 'good' ? (
                <Trophy className="text-white" size={40} />
              ) : report.overallRating === 'pass' ? (
                <CheckCircle className="text-white" size={40} />
              ) : (
                <AlertTriangle className="text-white" size={40} />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{report.levelName}</h2>
            <p className={"text-2xl font-bold mb-3 " + ratingTextColor}>
              {getRatingLabel(report.overallRating)}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {formatDate(report.completedAt)}
              </span>
              {report.durationMs > 0 && (
                <span className="flex items-center gap-1">⏱️ 用时 {formatDuration(report.durationMs)}</span>
              )}
              {report.practiceConfig && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">专项练习</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Gauge value={report.complianceScore} label="温控合规分" color="text-blue-500" size="md" />
            </div>
            <div className="text-center">
              <Gauge value={report.accuracy} label="答题正确率" color="text-green-500" size="md" />
            </div>
            <div className="text-center">
              <Gauge value={report.damageRisk} label="货损风险" color={damageRiskColor} size="md" inverse={true} />
              <p className={"text-sm mt-1 " + damageRiskColor}>{getRiskLabel(report.damageRisk)}</p>
            </div>
            <div className="text-center">
              <Gauge value={report.complaintRisk} label="投诉风险" color={complaintRiskColor} size="md" inverse={true} />
              <p className={"text-sm mt-1 " + complaintRiskColor}>{getRiskLabel(report.complaintRisk)}</p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-2xl">
              <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="text-green-500" />答题统计
              </h4>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex-1 text-center py-3 bg-white rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{report.correctCount}</p>
                  <p className="text-xs text-gray-500">正确</p>
                </div>
                <div className="flex-1 text-center py-3 bg-white rounded-xl">
                  <p className="text-2xl font-bold text-red-500">{report.wrongCount}</p>
                  <p className="text-xs text-gray-500">错误</p>
                </div>
                <div className="flex-1 text-center py-3 bg-white rounded-xl">
                  <p className="text-2xl font-bold text-cyan-600">{report.accuracy}%</p>
                  <p className="text-xs text-gray-500">正确率</p>
                </div>
              </div>
            </div>

            {report.sceneStats.length > 0 && (
              <div className="p-4 bg-cyan-50 rounded-2xl">
                <h4 className="font-bold text-cyan-800 mb-2 flex items-center gap-2">
                  <BarChart3 className="text-cyan-500" />各场景表现
                </h4>
                <div className="space-y-2 mt-3">
                  {report.sceneStats.map(stat => {
                    const barColor = stat.accuracy >= 80
                      ? 'bg-green-500'
                      : stat.accuracy >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500';
                    const textColor = stat.accuracy >= 80
                      ? 'text-green-600'
                      : stat.accuracy >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600';
                    return (
                      <div key={stat.sceneName} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{stat.sceneName}</span>
                            <span className="text-gray-500">{stat.correct}/{stat.total}</span>
                          </div>
                          <div className="h-2 bg-cyan-200 rounded-full overflow-hidden">
                            <div className={"h-full rounded-full transition-all " + barColor} style={{ width: stat.accuracy + '%' }} />
                          </div>
                        </div>
                        <span className={"text-sm font-bold w-10 text-right " + textColor}>{stat.accuracy}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {wrongRecords.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <XCircle className="text-red-500" size={24} />❌ 本次错题回顾
            </h3>
            <div className="space-y-3">
              {wrongRecords.map((record, idx) => (
                <div key={idx} className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{record.decisionQuestion}</p>
                        {record.isRandomEvent && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-medium">
                            <Zap size={12} /> 突发
                          </span>
                        )}
                        {record.isTimeout && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                            <Clock size={12} /> 超时
                          </span>
                        )}
                      </div>
                      <p className="text-red-600 text-sm mt-1">你的选择: {record.selectedOptionText}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        <strong className="text-green-600">💡 知识点:</strong> {record.consequence.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={24} />📝 关键知识点
          </h3>
          <div className="space-y-2">
            {report.keyLearnings.map((learning, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{learning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.improvementSuggestions.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="text-cyan-500" size={24} />🎯 改进建议
            </h3>
            <div className="space-y-2">
              {report.improvementSuggestions.map((suggestion, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed pt-0.5">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {practiceSuggestions.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="text-orange-500" size={24} />💪 推荐下一组练习
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {practiceSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStartSuggestion(idx)}
                  className="p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-100 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <h4 className="font-bold text-lg text-gray-800 mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-orange-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      开始练习 <ArrowRight size={16} />
                    </span>
                    <span className="text-xs text-gray-400">{suggestion.decisions.length}题</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-cyan-500" size={24} />⏱️ 答题时间线
          </h3>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-200 via-blue-300 to-green-200 rounded-full" />
            <div className="space-y-4">
              {sortedTimeline.slice(0, 10).map((record, idx) => {
                const dotColor = record.isRandomEvent
                  ? 'bg-orange-500 border-orange-100'
                  : record.isCorrect
                  ? 'bg-green-500 border-green-100'
                  : 'bg-red-500 border-red-100';
                const resultTextColor = record.isCorrect ? 'text-green-600' : 'text-red-600';
                const scoreTextColor = record.consequence.complianceScore > 0 ? 'text-green-600' : 'text-red-600';
                return (
                  <div key={idx} className="relative pl-16">
                    <div className={"absolute left-2 top-1 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 " + dotColor}>
                      <span className="text-sm">
                        {record.isRandomEvent ? '⚡' : record.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-gray-800">{record.decisionQuestion}</p>
                        {record.isRandomEvent && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full font-medium">突发</span>
                        )}
                        <span className={"px-2 py-0.5 bg-white text-[10px] rounded-full font-medium " + resultTextColor}>
                          {record.isCorrect ? '正确' : '错误'}
                        </span>
                      </div>
                      {record.consequence.complianceScore !== 0 && (
                        <p className={"text-xs mt-1 " + scoreTextColor}>
                          合规分 {record.consequence.complianceScore > 0 ? '+' : ''}{record.consequence.complianceScore}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {sortedTimeline.length > 10 && (
                <div className="pl-16 text-sm text-gray-400 pt-2">
                  ...还有 {sortedTimeline.length - 10} 条记录
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>冷链温控训练营 © 2024 | 训练报告生成于 {formatDate(report.completedAt)}</p>
        </footer>
      </div>
    </div>
  );
};
