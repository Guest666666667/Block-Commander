
import React, { useState } from 'react';
import { COMMANDERS } from '../constants';
import { CommanderType } from '../types';
import { Shield, User, Zap, Target } from 'lucide-react';

interface StartScreenProps {
  onStart: (commanderType: CommanderType) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [selectedId, setSelectedId] = useState<CommanderType | null>(null);

  const selectedCommander = selectedId ? COMMANDERS[selectedId] : null;

  return (
    <div className="h-full w-full flex flex-col items-center bg-slate-900 p-6 text-center relative overflow-hidden">
      {/* Title */}
      <div className="mt-10 mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-2">
            LEGION
        </h1>
        <h2 className="text-2xl font-bold text-white tracking-widest">COMMANDER</h2>
      </div>

      {/* Commander Selection Row */}
      <div className="flex w-full max-w-md gap-4 justify-center mb-6">
        {Object.values(COMMANDERS).map((cmd) => {
            const isSelected = selectedId === cmd.id;
            return (
                <button
                    key={cmd.id}
                    onClick={() => setSelectedId(cmd.id)}
                    className={`
                        flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden
                        ${isSelected ? 'border-yellow-500 bg-slate-800 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-slate-700 bg-slate-800/50 grayscale hover:grayscale-0'}
                    `}
                >
                    {/* Simulated Portrait */}
                    <div className={`w-24 h-24 mb-4 rounded-lg flex items-end justify-center overflow-hidden border-b-4 
                        ${cmd.id === CommanderType.CENTURION ? 'bg-gradient-to-b from-red-900 to-slate-800 border-red-600' : 'bg-gradient-to-b from-emerald-900 to-slate-800 border-emerald-600'}`}>
                        {cmd.id === CommanderType.CENTURION ? (
                            <Shield size={64} className="text-red-400 mb-[-10px]" />
                        ) : (
                            <Target size={64} className="text-emerald-400 mb-[-10px]" />
                        )}
                    </div>

                    <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-400'}`}>{cmd.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{cmd.role}</p>
                </button>
            );
        })}
      </div>

      {/* Details Panel (Fixed Height) */}
      <div className="w-full max-w-md h-32 bg-slate-800/80 rounded-lg p-4 border border-slate-700 mb-8 flex flex-col justify-center transition-all">
        {selectedCommander ? (
            <div className="animate-fade-in">
                <p className="text-sm text-slate-300 mb-3 italic">"{selectedCommander.description}"</p>
                <div className="flex items-center gap-2 text-yellow-500 bg-slate-900/50 p-2 rounded border border-slate-600">
                    <Zap size={16} className="shrink-0" />
                    <div className="text-left">
                        <span className="text-xs font-bold block uppercase">Skill: {selectedCommander.skillName}</span>
                        <span className="text-[10px] text-slate-400 leading-tight block">{selectedCommander.skillDesc}</span>
                    </div>
                </div>
            </div>
        ) : (
            <p className="text-slate-500 text-sm">Select a Commander to view details.</p>
        )}
      </div>

      {/* Start Button */}
      {selectedId && (
          <button 
            onClick={() => onStart(selectedId)}
            className="w-full max-w-xs py-4 bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white font-bold text-xl rounded-full shadow-lg animate-bounce border border-yellow-400/30"
          >
            START CAMPAIGN
          </button>
      )}

    </div>
  );
};
