import { ShieldAlert, PackageOpen, Users } from 'lucide-react';
import { Level } from '../../types/game';
import { TemperatureDisplay } from '../ui/TemperatureDisplay';
import { getRiskColor, getRiskLabel, formatScore } from '../../utils/scoring';

interface StatusBarProps {
  level: Level;
  temperature: number;
  complianceScore: number;
  damageRisk: number;
  complaintRisk: number;
}

export const StatusBar = ({
  level,
  temperature,
  complianceScore,
  damageRisk,
  complaintRisk,
}: StatusBarProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-cold-50 to-cold-100 rounded-xl">
          <span className="text-xs text-gray-500 mb-1">当前温度</span>
          <TemperatureDisplay
            temperature={temperature}
            minTemp={level.targetTemp.min}
            maxTemp={level.targetTemp.max}
            size="md"
          />
        </div>

        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div className="flex items-center gap-1 mb-1">
            <ShieldAlert size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">合规分</span>
          </div>
          <span className={`text-2xl font-bold ${complianceScore >= 60 ? 'text-blue-600' : 'text-red-500'}`}>
            {formatScore(complianceScore)}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
          <div className="flex items-center gap-1 mb-1">
            <PackageOpen size={16} className="text-orange-500" />
            <span className="text-xs text-gray-500">货损风险</span>
          </div>
          <span className={`text-2xl font-bold ${getRiskColor(damageRisk)}`}>
            {formatScore(damageRisk)}
          </span>
          <span className={`text-xs ${getRiskColor(damageRisk)}`}>
            {getRiskLabel(damageRisk)}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <div className="flex items-center gap-1 mb-1">
            <Users size={16} className="text-purple-500" />
            <span className="text-xs text-gray-500">投诉风险</span>
          </div>
          <span className={`text-2xl font-bold ${getRiskColor(complaintRisk)}`}>
            {formatScore(complaintRisk)}
          </span>
          <span className={`text-xs ${getRiskColor(complaintRisk)}`}>
            {getRiskLabel(complaintRisk)}
          </span>
        </div>
      </div>
    </div>
  );
};
