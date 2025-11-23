
import React, { useState } from 'react';
import { UnitType } from '../../types';
import { CommanderSelectionScreen } from './CommanderSelectionScreen';

interface StartScreenProps {
  onStart: (commanderType: UnitType, unitOrder: UnitType[]) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showSelection, setShowSelection] = useState(false);

  if (showSelection) {
      return <CommanderSelectionScreen onStart={onStart} onBack={() => setShowSelection(false)} />;
  }

  return (
    <div 
        className="h-full w-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => setShowSelection(true)}
    >
        {/* Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="z-10 flex flex-col items-center animate-fade-in-up">
            <div className="mb-12 relative group">
                {/* Glow */}
                <div className="absolute inset-0 blur-3xl bg-yellow-500/20 rounded-full animate-pulse-slow"></div>
                
                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 mb-2 leading-none drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    BLOCK
                </h1>
                <h2 className="text-4xl font-bold text-slate-200 tracking-[0.4em] drop-shadow-lg ml-2">
                    COMMANDER
                </h2>
            </div>

            <div className="mt-24 animate-pulse">
                <div className="px-6 py-2 border-x-2 border-yellow-500/30">
                    <p className="text-lg font-mono text-yellow-400 tracking-widest uppercase font-bold">
                        Tap to Start
                    </p>
                </div>
            </div>
        </div>
        
        <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 1.2s ease-out forwards;
            }
            @keyframes pulse-slow {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(1.1); }
            }
            .animate-pulse-slow {
                animation: pulse-slow 4s infinite ease-in-out;
            }
        `}</style>
    </div>
  );
};
