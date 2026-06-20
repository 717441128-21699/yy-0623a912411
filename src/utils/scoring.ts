import { GameResult } from '../types/game';

export const getRatingLabel = (rating: string): string => {
  const labels: Record<string, string> = {
    excellent: '🌟 优秀',
    good: '👍 良好',
    pass: '✅ 及格',
    fail: '❌ 不合格',
  };
  return labels[rating] || rating;
};

export const getRatingColor = (rating: string): string => {
  const colors: Record<string, string> = {
    excellent: 'text-yellow-500',
    good: 'text-green-500',
    pass: 'text-blue-500',
    fail: 'text-red-500',
  };
  return colors[rating] || 'text-gray-500';
};

export const getRatingBgColor = (rating: string): string => {
  const colors: Record<string, string> = {
    excellent: 'bg-yellow-500',
    good: 'bg-green-500',
    pass: 'bg-blue-500',
    fail: 'bg-red-500',
  };
  return colors[rating] || 'bg-gray-500';
};

export const getTemperatureColor = (temp: number, min: number, max: number): string => {
  if (temp < min) return 'text-blue-500';
  if (temp > max) return 'text-red-500';
  return 'text-green-500';
};

export const getTemperatureBgColor = (temp: number, min: number, max: number): string => {
  if (temp < min) return 'bg-blue-500';
  if (temp > max) return 'bg-red-500';
  return 'bg-green-500';
};

export const getRiskColor = (risk: number): string => {
  if (risk >= 70) return 'text-red-500';
  if (risk >= 40) return 'text-yellow-500';
  return 'text-green-500';
};

export const getRiskBgColor = (risk: number): string => {
  if (risk >= 70) return 'bg-red-500';
  if (risk >= 40) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const getRiskLabel = (risk: number): string => {
  if (risk >= 70) return '高风险';
  if (risk >= 40) return '中风险';
  return '低风险';
};

export const formatScore = (score: number): string => {
  return Math.round(score).toString();
};

export const calculateOverallScore = (result: GameResult): number => {
  const complianceWeight = 0.5;
  const damageWeight = 0.3;
  const complaintWeight = 0.2;

  const complianceScore = result.complianceScore;
  const damageScore = 100 - result.damageRisk;
  const complaintScore = 100 - result.complaintRisk;

  return Math.round(
    complianceScore * complianceWeight +
    damageScore * damageWeight +
    complaintScore * complaintWeight
  );
};

export const getProgressColor = (percentage: number): string => {
  if (percentage > 66) return 'bg-green-500';
  if (percentage > 33) return 'bg-yellow-500';
  return 'bg-red-500';
};
