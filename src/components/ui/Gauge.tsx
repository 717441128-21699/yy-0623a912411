import { useEffect, useState } from 'react';

interface GaugeProps {
  value: number;
  maxValue?: number;
  label: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  inverse?: boolean;
}

export const Gauge = ({
  value,
  maxValue = 100,
  label,
  color,
  size = 'md',
  showValue = true,
  inverse = false,
}: GaugeProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const clampedValue = Math.max(0, Math.min(maxValue, value));
  const percentage = (clampedValue / maxValue) * 100;

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = clampedValue / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < clampedValue) {
        setDisplayValue(start);
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(clampedValue);
      }
    };

    const timer = setTimeout(animate, 200);
    return () => clearTimeout(timer);
  }, [clampedValue]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeMap = {
    sm: { container: 'w-24 h-24', text: 'text-xl', label: 'text-xs' },
    md: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-4xl', label: 'text-base' },
  };

  const displayPercentage = inverse ? 100 - percentage : percentage;
  const displayNumber = inverse ? maxValue - displayValue : displayValue;

  return (
    <div className={`${sizeMap[size].container} relative flex flex-col items-center justify-center`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className={`font-bold ${sizeMap[size].text} ${color}`}>
            {Math.round(displayNumber)}
          </span>
        )}
        <span className={`${sizeMap[size].label} text-gray-600 font-medium`}>
          {label}
        </span>
      </div>
    </div>
  );
};
