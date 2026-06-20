import { Check, Package, Truck, Handshake } from 'lucide-react';
import { Scene } from '../../types/game';

interface SceneProgressProps {
  scenes: Scene[];
  currentSceneIndex: number;
}

const sceneIcons = {
  loading: Package,
  transit: Truck,
  delivery: Handshake,
};

export const SceneProgress = ({ scenes, currentSceneIndex }: SceneProgressProps) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {scenes.map((scene, index) => {
          const Icon = sceneIcons[scene.id as keyof typeof sceneIcons] || Package;
          const isActive = index === currentSceneIndex;
          const isCompleted = index < currentSceneIndex;

          return (
            <div key={scene.id} className="flex flex-col items-center flex-1 relative">
              {index < scenes.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-1 bg-gray-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-cold-500' : 'bg-gray-200'
                    }`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-cold-500 text-white scale-110 shadow-lg shadow-cold-500/30'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center transition-colors ${
                  isActive
                    ? 'text-cold-600'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                {scene.name}
              </span>
              <span className="text-xl mt-1">{scene.icon}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
