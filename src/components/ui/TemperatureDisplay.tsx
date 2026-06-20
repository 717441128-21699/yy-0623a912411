import { Thermometer } from 'lucide-react';
import { getTemperatureColor } from '../../utils/scoring';

interface TemperatureDisplayProps {
  temperature: number;
  minTemp: number;
  maxTemp: number;
  size?: 'sm' | 'md' | 'lg';
}

export const TemperatureDisplay = ({
  temperature,
  minTemp,
  maxTemp,
  size = 'md',
}: TemperatureDisplayProps) => {
  const tempColor = getTemperatureColor(temperature, minTemp, maxTemp);
  const isOutOfRange = temperature < minTemp || temperature > maxTemp;

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
    <div className={`flex items-center gap-2 ${isOutOfRange ? 'animate-pulse' : ''}`}>
      <Thermometer className={tempColor} size={iconSizes[size]} />
      <span className={`font-bold ${sizeClasses[size]} ${tempColor} transition-all duration-500`}>
        {temperature.toFixed(1)}°C
      </span>
      <span className="text-sm text-gray-500">
        ({minTemp}-{maxTemp}°C)
      </span>
    </div>
  );
};
