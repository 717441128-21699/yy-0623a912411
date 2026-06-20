import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Option } from '../../types/game';

interface OptionCardProps {
  option: Option;
  onSelect: (option: Option) => void;
  disabled?: boolean;
  showResult?: boolean;
  isSelected?: boolean;
}

export const OptionCard = ({
  option,
  onSelect,
  disabled = false,
  showResult = false,
  isSelected = false,
}: OptionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCardStyle = () => {
    if (showResult && isSelected) {
      return option.isCorrect
        ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
        : 'border-red-500 bg-red-50 ring-2 ring-red-500 animate-shake';
    }
    if (showResult && option.isCorrect) {
      return 'border-green-500 bg-green-50';
    }
    if (isHovered && !disabled) {
      return 'border-cold-400 bg-cold-50 shadow-lg -translate-y-1';
    }
    return 'border-gray-200 bg-white hover:border-cold-300';
  };

  return (
    <button
      onClick={() => !disabled && onSelect(option)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${getCardStyle()} ${
        disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            showResult && isSelected
              ? option.isCorrect
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
              : showResult && option.isCorrect
              ? 'bg-green-500 text-white'
              : 'bg-cold-100 text-cold-700'
          }`}
        >
          {showResult && isSelected ? (
            option.isCorrect ? (
              <Check size={18} />
            ) : (
              <X size={18} />
            )
          ) : showResult && option.isCorrect ? (
            <Check size={18} />
          ) : (
            option.id.toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <p
            className={`font-medium ${
              showResult && isSelected
                ? option.isCorrect
                  ? 'text-green-800'
                  : 'text-red-800'
                : 'text-gray-800'
            }`}
          >
            {option.text}
          </p>
          {showResult && isSelected && (
            <p
              className={`mt-2 text-sm ${
                option.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {option.consequence.feedback}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
