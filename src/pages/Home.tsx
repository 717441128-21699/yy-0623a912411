import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Thermometer, Package, CheckCircle, Trophy, ArrowRight } from 'lucide-react';
import { levels, getDifficultyLabel, getDifficultyColor } from '../data/levels';
import { getBestScores } from '../store/useGameStore';
import { BestScores } from '../types/game';

export const Home = () => {
  const navigate = useNavigate();
  const [bestScores, setBestScores] = useState<BestScores>({});

  useEffect(() => {
    setBestScores(getBestScores());
  }, []);

  const handleStartGame = (levelId: string) => {
    navigate(`/game/${levelId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cold-50 via-white to-ice-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
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
            选择配送任务
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {levels.map((level, index) => {
              const bestScore = bestScores[level.id];
              return (
                <div
                  key={level.id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 150 + 300}ms` }}
                  onClick={() => handleStartGame(level.id)}
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
                    <button className="mt-4 w-full py-3 bg-gradient-to-r from-cold-500 to-cold-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:from-cold-600 group-hover:to-cold-700 transition-all duration-300 shadow-lg shadow-cold-500/30">
                      开始任务
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
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
