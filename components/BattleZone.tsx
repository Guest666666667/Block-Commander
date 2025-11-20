
import React, { useState } from 'react';
import { BattleEntity, Phase, UnitType } from '../types';
import { REWARD_DEFINITIONS, BUFF_CONFIG } from '../constants';
import { UnitIcon } from './UnitIcon';
import { Play, MoveRight, Sparkles, Pause, X, Shield, Sword, Heart, Zap, Plus, Flag, Target, Footprints } from 'lucide-react';
import { useBattleLoop } from './battle/useBattleLoop';
import { calculateEntityStats } from './battle/battleUtils';

interface BattleZoneProps {
  allies: UnitType[];
  level: number;
  phase: Phase;
  commanderUnitType: UnitType; 
  onBattleEnd: (victory: boolean, survivors?: UnitType[], kills?: Record<string, number>) => void;
  upgrades?: UnitType[];
  rewardsHistory: Record<string, number>;
}

export const BattleZone: React.FC<BattleZoneProps> = (props) => {
  const {
      entities,
      projectiles,
      effects,
      speedMultiplier,
      isPaused,
      setSpeedMultiplier,
      setIsPaused
  } = useBattleLoop({
    ...props,
    upgrades: props.upgrades || []
  });

  const [selectedEntity, setSelectedEntity] = useState<BattleEntity | null>(null);

  const toggleSpeed = () => setSpeedMultiplier(prev => prev === 3 ? 1 : prev + 1);
  
  const togglePause = () => {
    setIsPaused(prev => {
        const newState = !prev;
        if (!newState) setSelectedEntity(null); 
        return newState;
    });
  };
  
  const handleSurrender = () => {
      props.onBattleEnd(false);
  };

  const handleEntityClick = (entity: BattleEntity) => {
      if (!isPaused) setIsPaused(true);
      setSelectedEntity(entity);
  };

  const handleCloseModal = () => {
      setSelectedEntity(null);
      setIsPaused(false);
  };

  const aliveEnemies = entities.filter(e => e.team === 'ENEMY' && e.hp > 0).length;
  const aliveAllies = entities.filter(e => e.team === 'PLAYER' && e.hp > 0).length;

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
       <style>{`
         @keyframes spawn-unit {
            0% { opacity: 0; transform: scale(0); }
            80% { transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
         }
         .animate-spawn-unit {
            animation: spawn-unit 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
         }
       `}</style>

       <div className={`absolute inset-0 transition-all duration-500 ${isPaused ? 'grayscale brightness-75' : ''}`}>
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           {projectiles.map(p => (
               <div key={p.id} className="absolute w-4 h-2 text-yellow-300 z-30 pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`, opacity: p.opacity ?? 1 }}>
                   <MoveRight size={16} strokeWidth={3} />
               </div>
           ))}

           {entities.map(ent => {
             if (ent.hp <= 0) return null;
             const zIndex = Math.floor(ent.y * 100);
             const isHit = performance.now() - ent.lastHitTime < 150;
             const isUpgraded = props.upgrades?.includes(ent.type) && ent.team === 'PLAYER';
             const scale = ent.scale || 1;
             
             const effectiveStats = calculateEntityStats(ent);
             const healthRatio = ent.hp / effectiveStats.maxHp;
             
             // Check for Unified Commander Buff
             const hasCommanderBuff = ent.buffs.some(b => BUFF_CONFIG[b]?.isCommanderBuff);

             let filterStyle = '';
             if (ent.team === 'PLAYER') {
                 const b = 1 + (1 - healthRatio) * 1.2;
                 const s = 0.3 + (0.7 * healthRatio);
                 filterStyle = `brightness(${b}) saturate(${s})`;
             } else {
                 const b = 0.25 + (healthRatio * 0.45);
                 filterStyle = `brightness(${b})`;
             }

             return (
               <div 
                key={ent.id} 
                onClick={() => handleEntityClick(ent)} 
                className={`
                    absolute transition-transform duration-100 will-change-transform cursor-pointer hover:scale-110 active:scale-95 rounded-md
                    ${hasCommanderBuff ? 'ring-2 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : ''}
                `} 
                style={{ 
                    left: `${ent.x}%`, 
                    top: `${ent.y}%`, 
                    zIndex: zIndex, 
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    width: '32px', 
                    height: '32px',
                    filter: filterStyle,
                }}
               >
                 <div className="w-full h-full animate-spawn-unit">
                    <div className={`w-full h-full transition-all duration-75 ${isHit ? 'brightness-200 sepia saturate-200 hue-rotate-[-50deg]' : ''}`}
                        style={{ transform: `scale(${ent.team === 'ENEMY' ? '-1, 1' : '1, 1'})` }}>
                        <UnitIcon type={ent.type} isUpgraded={isUpgraded} />
                    </div>
                 </div>
                 
                 {ent.type === UnitType.SPEAR && ent.aiState === 'CHARGING' && (
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-yellow-300 animate-pulse whitespace-nowrap shadow-black drop-shadow-md">
                        CHARGE!
                     </div>
                 )}

                 {/* Buff visual indicators removed in favor of unified golden border */}
                 {ent.buffs.includes('HEAL') && (
                    <div className="absolute top-0 right-0 w-1 h-1 bg-green-400 rounded-full animate-ping" />
                 )}
               </div>
             );
           })}

           {effects.map(fx => (
               <div key={fx.id} className={`absolute z-40 pointer-events-none ${fx.type === 'SLASH' ? 'text-red-500 scale-150' : fx.type === 'HEAL' ? 'text-green-400' : 'text-yellow-200'}`} 
                    style={{ left: `${fx.x}%`, top: `${fx.y}%`, transform: 'translate(-50%, -50%)' }}>
                    {fx.type === 'SLASH' ? <div className="animate-ping font-bold text-xl">/</div> : fx.type === 'HEAL' ? <div className="animate-float-up text-xs font-bold">+</div> : <Sparkles size={24} className="animate-ping" />}
               </div>
           ))}
       </div>

       {/* UI Overlays */}
       <div className="absolute top-2 left-2 text-[10px] text-green-400/70 font-mono pointer-events-none border border-green-900/50 bg-black/20 px-2 py-1 rounded z-50">ALLIES: {aliveAllies}</div>
       <div className="absolute top-2 right-2 text-[10px] text-red-400/70 font-mono pointer-events-none border border-red-900/50 bg-black/20 px-2 py-1 rounded z-50">ENEMIES: {aliveEnemies}</div>

       <div className="absolute bottom-2 left-2 flex gap-2 z-40">
            {Object.entries(props.rewardsHistory).map(([id, count]) => {
                const def = REWARD_DEFINITIONS[id];
                if (!def) return null;
                if (id.startsWith('UPGRADE_')) return null; 
                return (
                    <div key={id} className="relative w-8 h-8 bg-slate-800/80 border border-slate-600 rounded p-1.5 text-yellow-500 flex items-center justify-center shadow-lg backdrop-blur-sm">
                        <def.icon size={20} />
                        {count > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-900 shadow-sm">
                                {count}
                            </div>
                        )}
                    </div>
                )
            })}
       </div>

       <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2 z-50">
           <button onClick={togglePause} className={`bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-1 flex items-center justify-center transition-all shadow-lg active:scale-95 w-10 ${isPaused ? 'animate-pulse ring-2 ring-yellow-500' : ''}`}>
             {isPaused ? <Play size={14} /> : <Pause size={14} />}
           </button>
           <button onClick={toggleSpeed} className="bg-slate-800/80 hover:bg-slate-700 text-yellow-400 border border-slate-600 rounded-md px-3 py-1 flex items-center gap-0.5 transition-all shadow-lg active:scale-95 min-w-[40px] justify-center">
             {Array.from({ length: speedMultiplier }).map((_, i) => (<Play key={i} size={12} fill="currentColor" className={i > 0 ? "-ml-1.5" : ""} />))}
           </button>
           <button onClick={handleSurrender} className="bg-red-900/80 hover:bg-red-700 text-white border border-red-700 rounded-md px-3 py-1 flex items-center justify-center transition-all shadow-lg active:scale-95 w-10">
             <Flag size={14} />
           </button>
       </div>

       {isPaused && selectedEntity && (() => {
           const effectiveStats = calculateEntityStats(selectedEntity);
           
           const renderStatBox = (icon: React.ReactNode, current: number, base: number, isFloat: boolean, multiplier = 1) => {
                const val = current * multiplier;
                const baseVal = base * multiplier;
                const diff = val - baseVal;
                
                // For float, fix to 1 decimal. For int, round.
                const display = isFloat ? val.toFixed(1) : Math.round(val);
                const displayDiff = isFloat ? diff.toFixed(1) : Math.round(diff);
                const hasBonus = diff > (isFloat ? 0.05 : 0);

                return (
                    <div className="bg-slate-900/60 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-700/50 relative h-14">
                        <div className="text-slate-400 mb-0.5 scale-90">{icon}</div>
                        <span className="font-mono font-bold text-white text-lg leading-none">{display}</span>
                        {hasBonus && (
                            <span className="text-[9px] font-bold text-green-400 absolute top-1 right-1">+{displayDiff}</span>
                        )}
                    </div>
                )
           }

           return (
             <div className="absolute inset-0 z-[60] flex items-center justify-center p-8" onClick={handleCloseModal}>
               <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-5 shadow-2xl max-w-sm w-full relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
                   
                   {/* Compact Header */}
                   <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                           <div className={`w-14 h-14 rounded-lg p-2 border-2 shadow-inner ${selectedEntity.team === 'PLAYER' ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}>
                               <UnitIcon type={selectedEntity.type} isUpgraded={props.upgrades?.includes(selectedEntity.type) && selectedEntity.team === 'PLAYER'} />
                           </div>
                           <div>
                               <h3 className={`font-black text-xl uppercase tracking-wide ${selectedEntity.team === 'PLAYER' ? 'text-green-400' : 'text-red-400'}`}>
                                   {selectedEntity.type.replace('COMMANDER_', '').replace('INFANTRY', 'INF.').replace('OBSTACLE', 'OBST.')}
                               </h3>
                               <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    LV.{props.level} {selectedEntity.team === 'PLAYER' ? 'ALLY' : 'ENEMY'}
                               </span>
                           </div>
                       </div>
                       
                       <div className="flex flex-col items-end gap-1">
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white p-1 bg-slate-900 rounded-full hover:bg-slate-700 transition-colors">
                                <X size={18} />
                            </button>
                           <div className="flex items-center gap-2 text-2xl font-mono font-bold text-slate-200">
                               <Heart size={18} className="text-red-500 fill-red-500" />
                               <span>
                                   <span className={selectedEntity.hp < effectiveStats.maxHp ? "text-red-400" : "text-white"}>
                                       {Math.ceil(selectedEntity.hp)}
                                   </span>
                                   <span className="text-slate-500 text-lg">/{effectiveStats.maxHp}</span>
                               </span>
                           </div>
                       </div>
                   </div>

                   {/* Compact Stats Grid */}
                   <div className="grid grid-cols-4 gap-2 mb-4">
                        {renderStatBox(<Sword size={18}/>, effectiveStats.atk, selectedEntity.atk, false)}
                        {renderStatBox(<Shield size={18}/>, effectiveStats.def, selectedEntity.def, false)}
                        {renderStatBox(<Target size={18}/>, effectiveStats.range, selectedEntity.range, true)}
                        {renderStatBox(<Footprints size={18}/>, effectiveStats.moveSpeed, selectedEntity.moveSpeed, true, 100)} 
                   </div>
                   
                   {/* Buffs Section */}
                   {selectedEntity.buffs.length > 0 && (
                       <div className="bg-slate-900/50 px-3 py-2 rounded border border-slate-700/50">
                           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider"><Zap size={12} /> Active Effects</div>
                           <div className="w-full space-y-2">
                               {selectedEntity.buffs.map(b => {
                                   const conf = BUFF_CONFIG[b];
                                   return (
                                       <div key={b} className="text-xs bg-black/30 px-2 py-1.5 rounded flex flex-col">
                                           <div className="flex items-center gap-1 text-yellow-400 font-bold">
                                               <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
                                               {conf?.label || b}
                                           </div>
                                           {conf?.description && (
                                               <div className="text-slate-400 text-[10px] leading-tight mt-0.5 pl-3 opacity-80">
                                                   {conf.description}
                                               </div>
                                           )}
                                       </div>
                                   );
                               })}
                           </div>
                       </div>
                   )}
               </div>
             </div>
           );
       })()}
    </div>
  );
};
