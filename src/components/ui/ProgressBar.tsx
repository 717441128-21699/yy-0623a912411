import { getProgressColor } from '../../utils/scoring';

interface ProgressBarProps {
  percentage: number;
  height?: string;
  showLabel?: boolean;
  label?: string;
  color?: string;
}

export const ProgressBar = ({
  percentage,
  height = 'h-2',
  showLabel = false,
  label,
  color,
}: ProgressBarProps) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const barColor = color || getProgressColor(clampedPercentage);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || '进度'}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      )}
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};
