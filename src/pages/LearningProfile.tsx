import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, Trophy, Clock, Target, BookOpen, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Zap, BarChart3, FileText, RefreshCw } from 'lucide-react';
import { levels, getLevelById } from '../data/levels';
import { TrainingReport, LevelProfile, LearningProfile } from '../types/game';
import { getLearningProfile, getReportsByLevel, refreshLevelProfiles } from '../utils/learningProfile';
import {
  getRatingLabel,
  getRatingColor,
  getRatingBgColor,
  getRiskColor,
  getRiskLabel,
} from '../utils/scoring';

export const LearningProfilePage = () => {
  const { levelId } = useParams<{ levelId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [reports, setReports] = useState<TrainingReport[]>([]);

  useEffect(() => {
    const refreshed = refreshLevelProfiles();
    setProfile(refreshed);
    if (levelId) {
      setReports(getReportsByLevel(levelId));
    } else {
      setReports(refreshed.reports);
    }
  }, [levelId]);

  const currentLevel = levelId ? getLevelById(levelId) : null;
  const levelProfiles = profile?.levelProfiles || {};

  const filteredReports = useMemo(() => {
    if (levelId) return reports;
    return reports.slice(0, 30);
  }, [reports, levelId]);

  const totalStats = useMemo(() => {
    const allReports = profile?.reports || [];
    const fullGameReports = allReports.filter(r => !r.practiceConfig);
    return {
      totalGames: fullGameReports.length,
      totalPractice: allReports.filter(r => r.practiceConfig).length,
      avgCompliance: fullGameReports.length > 0
        ? Math.round(fullGameReports.reduce((sum, r) => sum + r.complianceScore, 0) / fullGameReports.length)
        : 0,
      avgAccuracy: allReports.length > 0
        ? Math.round(allReports.reduce((sum, r) => sum + r.accuracy, 0) / allReports.length)
        : 0,
      totalTime: Math.round((profile?.totalTrainingTime || 0) / 60000),
    };
  }, [profile]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const openReport = (report: TrainingReport) => {
    navigate(`/report/${report.id}`);
  };

  if (!profile) {
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cold-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => levelId ? navigate('/learning-profile') : navigate('/')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-white hover:shadow-md transition-all"
            >
              <ChevronLeft size={20} />
              <span>{levelId ? '返回总览' : '返回首页'}</span>
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-cyan-500" size={32} />
            {currentLevel ? `${currentLevel.icon} ${currentLevel.name} 学习档案` : '我的学习档案'}
          </h1>
          <div className="w-32" />
        </div>

        {!levelId && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                <Trophy size={16} className="text-yellow-500" />
                完成训练
              </div>
              <p className="text-2xl font-bold text-gray-800">{totalStats.totalGames} <span className="text-sm text-gray-400 font-normal">次</span></p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                <Zap size={16} className="text-orange-500" />
                专项练习
              </div>
              <p className="text-2xl font-bold text-gray-800">{totalStats.totalPractice} <span className="text-sm text-gray-400 font-normal">次</span></p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                <Target size={16} className="text-cyan-500" />
                平均合规分
              </div>
              <p className="text-2xl font-bold text-gray-800">{totalStats.avgCompliance}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                <CheckCircle size={16} className="text-green-500" />
                平均正确率
              </div>
              <p className="text-2xl font-bold text-gray-800">{totalStats.avgAccuracy}<span className="text-sm text-gray-400 font-normal">%</span></p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                <Clock size={16} className="text-purple-500" />
                累计训练
              </div>
              <p className="text-2xl font-bold text-gray-800">{totalStats.totalTime} <span className="text-sm text-gray-400 font-normal">分钟</span></p>
            </div>
          </div>
        )}

        {!levelId && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {levels.map(level => {
              const lp = levelProfiles[level.id];
              if (!lp) return null;
              return (
                <div
                  key={level.id}
                  onClick={() => navigate(`/learning-profile/${level.id}`)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-cyan-200"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      level.id === 'vaccine'
                        ? 'bg-gradient-to-br from-blue-400 to-cold-500'
                        : 'bg-gradient-to-br from-green-400 to-emerald-500'
                    }`}>
                      {level.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800">{level.name}</h3>
                      <p className="text-sm text-gray-500">已完成 {lp.completionCount} 次完整训练</p>
                    </div>
                    <ChevronLeft size={24} className="text-gray-400 rotate-180" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-yellow-50 rounded-xl">
                      <Trophy size={18} className="text-yellow-500 mx-auto mb-1" />
                      <p className="font-bold text-lg text-gray-800">{lp.bestScore || '-'}</p>
                      <p className="text-xs text-gray-500">最高分</p>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-xl">
                      <Target size={18} className="text-cyan-500 mx-auto mb-1" />
                      <p className="font-bold text-lg text-gray-800">{lp.avgAccuracy || 0}%</p>
                      <p className="text-xs text-gray-500">平均正确率</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <BookOpen size={18} className="text-purple-500 mx-auto mb-1" />
                      <p className="font-bold text-lg text-gray-800">{lp.masteryProgress || 0}%</p>
                      <p className="text-xs text-gray-500">错题掌握</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {levelId && currentLevel && levelProfiles[levelId] && (
          <LevelProfileCard profile={levelProfiles[levelId]} />
        )}

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={24} className="text-cyan-500" />
              {levelId ? '关卡训练历史' : '最近训练记录'}
              <span className="text-sm font-normal text-gray-400">({filteredReports.length}条)</span>
            </h2>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={36} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">暂无训练记录</p>
              <button
                onClick={() => navigate(levelId ? `/game/${levelId}` : '/')}
                className="px-5 py-2.5 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-medium hover:from-cold-600 hover:to-cold-700 transition-all inline-flex items-center gap-2"
              >
                <RefreshCw size={18} />
                开始训练
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  onClick={() => openReport(report)}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/50 transition-all cursor-pointer group"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${getRatingBgColor(report.overallRating)}`}>
                    {report.overallRating === 'excellent' || report.overallRating === 'good' ? (
                      <Trophy className="text-white" size={26} />
                    ) : report.overallRating === 'pass' ? (
                      <CheckCircle className="text-white" size={26} />
                    ) : (
                      <AlertTriangle className="text-white" size={26} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {report.practiceConfig ? (
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          专项练习
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold">
                          完整任务
                        </span>
                      )}
                      <h4 className="font-bold text-gray-800 truncate">{report.levelName}</h4>
                      <span className={`font-bold text-sm ${getRatingColor(report.overallRating)}`}>
                        {getRatingLabel(report.overallRating)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(report.completedAt)}
                      </span>
                      <span>合规分 <strong className="text-gray-700">{report.complianceScore}</strong></span>
                      <span>正确率 <strong className="text-gray-700">{report.accuracy}%</strong></span>
                      <span>{report.correctCount}/{report.totalQuestions} 题</span>
                      {report.weakScenes.length > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle size={14} />
                          薄弱: {report.weakScenes.slice(0, 2).join('、')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronLeft size={22} className="text-gray-300 rotate-180 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>冷链温控训练营 © 2024 | 学习档案帮你追踪进步</p>
        </footer>
      </div>
    </div>
  );
};

const LevelProfileCard = ({ profile }: { profile: LevelProfile }) => {
  const hasData = profile.completionCount > 0;
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg mb-8">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 详细统计</h3>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-yellow-700">
            <Trophy size={20} />
            <span className="text-sm font-medium">最高分</span>
          </div>
          <p className="text-3xl font-bold text-yellow-700">
            {hasData ? profile.bestScore : '-'}
          </p>
          {profile.bestScoreDate && (
            <p className="text-xs text-yellow-600 mt-1">
              {new Date(profile.bestScoreDate).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>

        <div className="bg-cyan-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-cyan-700">
            <Target size={20} />
            <span className="text-sm font-medium">平均正确率</span>
          </div>
          <p className="text-3xl font-bold text-cyan-700">{profile.avgAccuracy}%</p>
          <p className="text-xs text-cyan-600 mt-1">累计 {profile.completionCount} 次训练</p>
        </div>

        <div className="bg-purple-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-purple-700">
            <BookOpen size={20} />
            <span className="text-sm font-medium">错题掌握进度</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{profile.masteryProgress}%</p>
          <p className="text-xs text-purple-600 mt-1">
            {profile.masteredWrongQuestions}/{profile.totalWrongQuestions} 题已掌握
          </p>
          <div className="h-2 bg-purple-200 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
              style={{ width: `${profile.masteryProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-gray-700">
            <Clock size={20} />
            <span className="text-sm font-medium">最近完成</span>
          </div>
          {hasData ? (
            <>
              <p className="text-lg font-bold text-gray-800">合规分 {profile.lastScore}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(profile.lastDamageRisk)} bg-white`}>
                  货损 {profile.lastDamageRisk}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(profile.lastComplaintRisk)} bg-white`}>
                  投诉 {profile.lastComplaintRisk}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(profile.lastCompletedAt).toLocaleString('zh-CN')}
              </p>
            </>
          ) : (
            <p className="text-gray-400">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
};
