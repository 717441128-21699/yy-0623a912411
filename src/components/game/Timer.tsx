import { Clock } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

interface TimerProps {
  initialTime: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
  isPaused?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Timer = ({
  initialTime,
  onTimeUp,
  autoStart = true,
  isPaused = false,
  size = 'md',
}: TimerProps) => {
  const { timeLeft, percentage, start, reset } = useTimer({
    initialTime,
    onTimeUp,
    autoStart,
  });

  const isUrgent = timeLeft <= 5;

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex items-center gap-2 ${
          isUrgent ? 'animate-pulse' : ''
        }`}
      >
        <Clock
          size={iconSizes[size]}
          className={isUrgent ? 'text-red-500' : 'text-cold-500'}
        />
        <span
          className={`font-bold ${sizeClasses[size]} ${
            isUrgent ? 'text-red-500' : 'text-cold-600'
          } transition-colors`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? 'bg-red-500' : 'bg-cold-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
