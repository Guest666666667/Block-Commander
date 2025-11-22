
import React from 'react';
import { Play, Pause, Flag, Backpack } from 'lucide-react';
import { GemCounter } from '../common/GemCounter';

// --- BATTLE CONTROLS ---

interface BattleControlsProps {
    isPaused: boolean;
    speedMultiplier: number;
    showBuffs: boolean;
    hasSelectedEntity: boolean;
    gems: number;
    onTogglePause: () => void;
    onToggleSpeed: () => void;
    onSurrender: () => void;
    onToggleBuffs: () => void;
}

export const BattleControls: React.FC<BattleControlsProps> = ({
    isPaused, speedMultiplier, showBuffs, hasSelectedEntity, gems,
    onTogglePause, onToggleSpeed, onSurrender, onToggleBuffs
}) => {
    return (
        <>
            {/* BOTTOM LEFT: GEMS */}
            <div className="absolute bottom-2 left-2 z-40">
                <div className="scale-90 origin-bottom-left">
                    <GemCounter amount={gems} showBackground={true} />
                </div>
            </div>

            {/* BOTTOM RIGHT: BACKPACK */}
            <div className="absolute bottom-2 right-2 z-40">
                 <button 
                    onClick={onToggleBuffs}
                    className={`
                        w-10 h-10 rounded-md shadow-lg flex items-center justify-center border-2 transition-all
                        ${showBuffs ? 'bg-slate-700 border-yellow-500 text-yellow-400' : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}
                    `}
                >
                    <Backpack size={18} />
                </button>
            </div>

            {/* TOP CONTROLS */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                <button onClick={onTogglePause} className={`bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-1 flex items-center justify-center transition-all shadow-lg active:scale-95 w-10 ${isPaused && !hasSelectedEntity && !showBuffs ? 'animate-pulse ring-2 ring-yellow-500' : ''}`}>
                    {isPaused && !hasSelectedEntity && !showBuffs ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button onClick={onToggleSpeed} className="bg-slate-800/80 hover:bg-slate-700 text-yellow-400 border border-slate-600 rounded-md px-3 py-1 flex items-center gap-0.5 transition-all shadow-lg active:scale-95 min-w-[40px] justify-center">
                    <span className="font-bold text-xs">x{speedMultiplier}</span>
                </button>
                <button onClick={onSurrender} className="bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-1 flex items-center justify-center transition-all shadow-lg active:scale-95 w-10">
                    <Flag size={14} />
                </button>
            </div>
        </>
    );
};
