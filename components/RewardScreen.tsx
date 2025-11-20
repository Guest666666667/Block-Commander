
import React, { useState } from 'react';
import { Box, Grid, Zap, CheckCircle, Coins, Swords, Crosshair, ShieldCheck, Tent } from 'lucide-react';
import { UnitType } from '../types';

interface RewardScreenProps {
  onSelect: (rewardType: string) => void;
  selectionsLeft: number;
}

export const RewardScreen: React.FC<RewardScreenProps> = ({ onSelect, selectionsLeft }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rewards = [
    { id: 'EXPAND', label: 'Expand', desc: 'Increase board size by 1. Adds new Unit types.', icon: Grid },
    { id: 'SCAVENGER', label: 'Scavenger', desc: 'Obstacle lines (3+) summon units passively.', icon: Box },
    { id: 'GREED', label: 'Greed', desc: '+1 Reward Selection for future victories.', icon: Coins },
    // Upgrades
    { id: `UPGRADE_${UnitType.INFANTRY}`, label: 'Elite Inf.', desc: '+HP, +ATK, Larger Size.', icon: Swords },
    { id: `UPGRADE_${UnitType.ARCHER}`, label: 'Elite Arch.', desc: '+HP, +ATK, Larger Size.', icon: Crosshair },
    { id: `UPGRADE_${UnitType.SHIELD}`, label: 'Elite Shld.', desc: '+HP, +DEF, Larger Size.', icon: ShieldCheck },
    { id: `UPGRADE_${UnitType.SPEAR}`, label: 'Elite Spr.', desc: '+HP, +ATK, Larger Size.', icon: Tent },
  ];

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId);
      setSelectedId(null);
    }
  };

  const selectedReward = rewards.find(r => r.id === selectedId);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
      {/* Header */}
      <div className="mt-12 mb-4 text-center">
        <h2 className="text-3xl font-black text-yellow-500 tracking-widest drop-shadow-lg animate-bounce">VICTORY</h2>
        <p className="text-slate-300 text-xs mt-2 bg-slate-800/50 px-4 py-1 rounded-full border border-slate-700 inline-block">
            Picks Left: <span className="text-yellow-400 font-bold">{selectionsLeft}</span>
        </p>
      </div>

      {/* 3-Column Grid Selection */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-md pb-24 overflow-y-auto px-2">
        {rewards.map(r => {
          const isSelected = selectedId === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 aspect-square
                ${isSelected 
                   ? 'bg-gradient-to-br from-yellow-900/50 to-black border-yellow-400 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.3)] z-10' 
                   : 'bg-slate-800 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
                }
              `}
            >
              <div className={`p-2 rounded-full mb-1 ${isSelected ? 'bg-yellow-500 text-black' : 'bg-slate-900 text-slate-400'}`}>
                 <r.icon size={32} strokeWidth={2} />
              </div>
              <span className={`font-bold text-[10px] uppercase text-center leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {r.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Details Panel */}
      <div className={`
          absolute bottom-0 w-full bg-slate-900 border-t border-slate-700 p-4 pb-8 flex flex-col items-center transition-transform duration-300 
          ${selectedReward ? 'translate-y-0' : 'translate-y-full'}
      `}>
        {selectedReward && (
            <div className="w-full max-w-sm text-center">
                <h3 className="text-lg font-bold text-white mb-1">{selectedReward.label}</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{selectedReward.desc}</p>
                
                <button 
                    onClick={handleConfirm}
                    className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all hover:brightness-110"
                >
                    <CheckCircle size={18} />
                    CONFIRM
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
