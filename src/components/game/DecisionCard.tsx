import { useState, useEffect } from 'react';
import { AlertCircle, Zap, MapPin, BookOpen } from 'lucide-react';
import { Decision, Option, Level, PracticeMode } from '../../types/game';
import { OptionCard } from './OptionCard';
import { Timer } from './Timer';

interface DecisionCardProps {
  decision: Decision;
  level: Level;
  onSelect: (option: Option) => void;
  showResult: boolean;
  selectedOptionId: string | null;
  onTimeUp?: () => void;
  paused?: boolean;
  isPractice?: boolean;
  practiceMode?: PracticeMode;
}

export const DecisionCard = ({
  decision,
  level,
  onSelect,
  showResult,
  selectedOptionId,
  onTimeUp,
  paused = false,
  isPractice = false,
  practiceMode,
}: DecisionCardProps) => {
  const getPracticeBadge = () => {
    if (!isPractice || !practiceMode) return null;
    switch (practiceMode) {
      case 'random':
        return { icon: <Zap size={20} className="text-orange-400" />, text: '突发情况练习', color: 'from-orange-500 to-orange-600' };
      case 'scene':
        return { icon: <MapPin size={20} className="text-blue-400" />, text: '场景专项练习', color: 'from-blue-500 to-blue-600' };
      case 'wrong':
        return { icon: <BookOpen size={20} className="text-purple-400" />, text: '错题巩固练习', color: 'from-purple-500 to-purple-600' };
      default:
        return null;
    }
  };

  const practiceBadge = getPracticeBadge();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [decision.id]);

  const handleTimeout = () => {
    if (onTimeUp) {
      onTimeUp();
    }
  };

  const headerGradient = decision.isRandomEvent
    ? 'from-orange-500 to-red-500'
    : practiceBadge
    ? practiceBadge.color
    : 'from-cold-500 to-cold-600';

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`bg-gradient-to-r ${headerGradient} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {(decision.isRandomEvent || practiceBadge) && (
                <div className="flex items-center gap-2 mb-2">
                  {decision.isRandomEvent ? (
                    <>
                      <AlertCircle size={20} />
                      <span className="font-bold text-sm uppercase tracking-wide text-yellow-300">
                        紧急事件
                      </span>
                    </>
                  ) : practiceBadge ? (
                    <>
                      {practiceBadge.icon}
                      <span className="font-bold text-sm uppercase tracking-wide text-white/90">
                        {practiceBadge.text}
                      </span>
                    </>
                  ) : null}
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{decision.question}</h2>
              <p className="text-white/90 text-sm">{decision.description}</p>
            </div>
            {decision.timeLimit && !showResult && (
              <div className="ml-4 w-24">
                <Timer
                  key={key}
                  initialTime={decision.timeLimit}
                  onTimeUp={handleTimeout}
                  autoStart={true}
                  isPaused={paused}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {decision.options.map(option => (
              <OptionCard
                key={option.id}
                option={option}
                onSelect={onSelect}
                disabled={showResult}
                showResult={showResult}
                isSelected={selectedOptionId === option.id}
              />
            ))}
          </div>

          {showResult && selectedOptionId && (
            <div className="mt-6 p-4 rounded-xl bg-cold-50 border border-cold-200 animate-slide-up">
              <h4 className="font-bold text-cold-800 mb-2">💡 知识点</h4>
              <p className="text-cold-700 text-sm leading-relaxed">
                {
                  decision.options.find(o => o.id === selectedOptionId)
                    ?.consequence.explanation
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
