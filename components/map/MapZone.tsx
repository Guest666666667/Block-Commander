
import React from 'react';
import { GameState } from '../../types';
import { Flag, Skull } from 'lucide-react';

interface MapZoneProps {
  gameState: GameState;
}

export const MapZone: React.FC<MapZoneProps> = ({ gameState }) => {
  const levels = Array.from({ length: gameState.maxLevels }, (_, i) => i + 1);

  return (
    <div className="h-full w-full bg-slate-800 border-b-4 border-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
      
      <div className="flex items-center justify-between w-full max-w-md px-4 relative z-10">
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-600 -z-10 transform -translate-y-1/2"></div>
        
        {levels.map((lvl) => {
          const isCurrent = lvl === gameState.currentLevel;
          const isCompleted = lvl < gameState.currentLevel;
          const isFinal = lvl === gameState.maxLevels;
          const isMiniBoss = lvl === 4;

          // Base style (Future / Inactive)
          // Default: Dark slate background, slate border
          let bgClass = "bg-slate-700 border-slate-500";
          
          if (isFinal) {
             // Final Boss: Standard background, Red border, Opaque
             bgClass = "bg-slate-700 border-red-600";
          } else if (isMiniBoss) {
             // Mini Boss: Standard background, Orange border, Opaque
             bgClass = "bg-slate-700 border-orange-500";
          }

          // State overrides
          if (isCompleted) {
             bgClass = "bg-green-600 border-green-400";
          }
          
          if (isCurrent) {
            if (isFinal) bgClass = "bg-red-600 border-red-400 scale-125";
            else if (isMiniBoss) bgClass = "bg-orange-500 border-orange-300 scale-125";
            else bgClass = "bg-yellow-500 border-yellow-300 scale-125";
          }

          let sizeClass = "w-8 h-8 border-2";
          if (isFinal) sizeClass = "w-12 h-12 border-4";
          else if (isMiniBoss) sizeClass = "w-10 h-10 border-4";

          return (
            <div key={lvl} className={`flex flex-col items-center gap-1`}>
              <div className={`${sizeClass} rounded-full flex items-center justify-center transition-all shadow-lg ${bgClass}`}>
                {isFinal ? (
                   <Skull size={isCurrent ? 20 : 20} className={isCurrent ? "text-black" : "text-red-500"} />
                ) : isMiniBoss ? (
                   <Skull size={isCurrent ? 16 : 16} className={isCurrent ? "text-black" : "text-orange-500"} />
                ) : isCompleted ? (
                   <Flag size={14} className="text-white" />
                ) : (
                   <span className={`text-xs font-bold ${isCurrent ? "text-black" : "text-gray-400"}`}>{lvl}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
};
