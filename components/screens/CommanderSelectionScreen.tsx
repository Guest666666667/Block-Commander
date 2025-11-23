
import React, { useState } from 'react';
import { UnitType } from '../../types';
import { UnitIcon } from '../units/UnitIcon';
import { COMMANDERS } from '../units/unitConfig';

interface CommanderSelectionScreenProps {
  onStart: (commanderType: UnitType, unitOrder: UnitType[]) => void;
  onBack: () => void;
}

export const CommanderSelectionScreen: React.FC<CommanderSelectionScreenProps> = ({ onStart }) => {
  // --- CONFIG ---
  const COMMANDER_ORDER = [
    UnitType.COMMANDER_VANGUARD,
    UnitType.COMMANDER_ELF,
    UnitType.COMMANDER_CENTURION,
    UnitType.COMMANDER_WARLORD,
    UnitType.COMMANDER_GUARDIAN
  ];

  const UNIT_DISPLAY_NAMES: Record<string, string> = {
    [UnitType.INFANTRY]: 'INFANTRY',
    [UnitType.ARCHER]: 'ARCHER',
    [UnitType.SHIELD]: 'SHIELD',
    [UnitType.SPEAR]: 'SPEAR',
  };

  // --- STATE ---
  const [activeIndex, setActiveIndex] = useState(2); // Default: Centurion
  const [unitOrder, setUnitOrder] = useState<UnitType[]>([
      UnitType.INFANTRY, 
      UnitType.ARCHER, 
      UnitType.SHIELD, 
      UnitType.SPEAR
  ]);
  
  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Touch Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const MIN_SWIPE_DISTANCE = 50;

  const totalItems = COMMANDER_ORDER.length;

  // --- CAROUSEL HANDLERS ---

  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % totalItems);
  const handleCardClick = (index: number) => setActiveIndex(index);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > MIN_SWIPE_DISTANCE) handleNext();
    if (distance < -MIN_SWIPE_DISTANCE) handlePrev();
  };

  // --- DRAG AND DROP HANDLERS ---

  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault(); // Necessary to allow dropping
      if (dragOverIndex !== index) {
          setDragOverIndex(index);
      }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null) return;
      
      if (draggedIndex !== dropIndex) {
          const newOrder = [...unitOrder];
          const [movedItem] = newOrder.splice(draggedIndex, 1);
          newOrder.splice(dropIndex, 0, movedItem);
          setUnitOrder(newOrder);
      }
      
      setDraggedIndex(null);
      setDragOverIndex(null);
  };

  const handleDragEnd = () => {
      setDraggedIndex(null);
      setDragOverIndex(null);
  };


  // --- CALCULATIONS ---

  const selectedId = COMMANDER_ORDER[activeIndex];
  const selectedCommander = COMMANDERS[selectedId];

  const getCircularOffset = (index: number, active: number, length: number) => {
    let offset = index - active;
    if (offset > length / 2) offset -= length;
    if (offset < -length / 2) offset += length;
    return offset;
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950 overflow-hidden animate-fade-in select-none">
      
      {/* Main Layout Container: 80% Height */}
      <div className="w-full h-[80%] max-w-md flex flex-col">
          
          {/* === TOP SECTION (50%): COMMANDER SELECTION === */}
          {/* Added pt-6 to push content down, adjusted alignment */}
          <div className="h-[50%] flex flex-col items-center relative z-10 pb-2 pt-6 justify-center">
             <div className="w-full flex items-center gap-4 mb-6 opacity-80 px-8">
                <div className="h-[1px] flex-1 bg-slate-800"></div>
                <h2 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase whitespace-nowrap">
                    Select Commander
                </h2>
                <div className="h-[1px] flex-1 bg-slate-800"></div>
             </div>

             {/* Carousel */}
             <div 
                className="flex-1 w-full flex items-center justify-center relative perspective-500 max-h-44"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
             >
                <div className="relative w-full h-full flex items-center justify-center">
                  {COMMANDER_ORDER.map((cmdId, index) => {
                    const cmd = COMMANDERS[cmdId];
                    const offset = getCircularOffset(index, activeIndex, totalItems);
                    const isActive = offset === 0;
                    
                    let transform = 'translate(-50%, -50%) scale(0.5) opacity(0)'; // Default Hidden
                    let zIndex = 0;
                    let opacity = 0;
                    let pointerEvents = 'none';

                    if (isActive) {
                      // Active Center
                      transform = 'translate(-50%, -50%) scale(1.1)';
                      zIndex = 30;
                      opacity = 1;
                      pointerEvents = 'auto';
                    } else if (offset === -1) {
                      // Left
                      transform = 'translate(-140%, -50%) scale(0.85)';
                      zIndex = 20;
                      opacity = 0.5;
                      pointerEvents = 'auto';
                    } else if (offset === 1) {
                      // Right
                      transform = 'translate(40%, -50%) scale(0.85)';
                      zIndex = 20;
                      opacity = 0.5;
                      pointerEvents = 'auto';
                    }

                    return (
                      <div
                        key={cmdId}
                        onClick={() => handleCardClick(index)}
                        className={`
                          absolute top-1/2 left-1/2 w-32 h-44 rounded-xl border-2 transition-all duration-300 ease-out shadow-2xl
                          flex flex-col items-center justify-center cursor-pointer
                          ${isActive ? 'border-yellow-500 bg-slate-800' : 'border-slate-700 bg-slate-900 grayscale'}
                        `}
                        style={{ transform, zIndex, opacity, pointerEvents: pointerEvents as any }}
                      >
                          <div className={`w-14 h-14 mb-1 rounded-lg overflow-hidden flex items-center justify-center shadow-inner ${isActive ? 'bg-slate-700' : 'bg-slate-800'}`}>
                               <UnitIcon type={cmdId} size={32} />
                          </div>
                          <h3 className={`font-black text-xs uppercase leading-none text-center px-2 mt-2 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                              {cmd.name}
                          </h3>
                      </div>
                    );
                  })}
                </div>
             </div>

             {/* Compact Commander Details */}
             <div className="w-[90%] h-16 bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700 p-2 flex flex-col items-center justify-center shadow-lg mt-4 text-center z-40">
                 <div className="text-yellow-400 font-bold uppercase text-xs mb-1">
                     {selectedCommander.skillName}
                 </div>
                 <div className="text-slate-400 text-[9px] leading-tight max-w-[90%]">
                     {selectedCommander.skillDesc}
                 </div>
             </div>
          </div>

          {/* === MIDDLE SECTION (30%): DEPLOYMENT ORDER === */}
          <div className="h-[30%] w-full flex flex-col items-center justify-center px-4 pt-6">
              <div className="w-full flex items-center gap-4 mb-3 opacity-80 px-8">
                <div className="h-[1px] flex-1 bg-slate-800"></div>
                <h2 className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase whitespace-nowrap">
                    SORT DEPLOYMENT
                </h2>
                <div className="h-[1px] flex-1 bg-slate-800"></div>
             </div>
              
              <div className="w-full grid grid-cols-4 gap-2">
                 {unitOrder.map((type, idx) => {
                     const isDragging = draggedIndex === idx;
                     const isOver = dragOverIndex === idx;
                     
                     const isLocked = idx >= 2;

                     return (
                         <div 
                            key={idx} 
                            className={`flex flex-col items-center gap-1 transition-all duration-200 ${isDragging ? 'opacity-30 scale-90' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                         >
                             <div 
                                className={`
                                    relative w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-move transition-all duration-200 overflow-hidden
                                    ${isOver ? 'border-yellow-400 bg-slate-700 scale-105' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
                                `}
                             >
                                 <div className={`w-1/2 h-1/2 mb-1 pointer-events-none ${isLocked ? 'grayscale opacity-60' : ''}`}>
                                     <UnitIcon type={type} />
                                 </div>

                                 {/* Unit Name Label Inside Card */}
                                 <span className="text-[8px] font-bold text-slate-500 tracking-wider leading-none pointer-events-none">
                                    {UNIT_DISPLAY_NAMES[type]}
                                 </span>
                                 
                                 {/* Locked Visual: Slight Gray Overlay */}
                                 {isLocked && (
                                     <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
                                 )}
                             </div>
                         </div>
                     )
                 })}
              </div>

              <p className="text-[9px] text-slate-500 text-center mt-3 font-mono leading-tight max-w-[85%]">
                  Drag to reorder. <span className="text-slate-400">First 2 units</span> are active initially. Expand grid in battle to unlock the rest.
              </p>
          </div>

          {/* === BOTTOM SECTION (20%): START === */}
          <div className="h-[20%] flex flex-col justify-end pb-4 px-6">
              <button 
                onClick={() => onStart(selectedId, unitOrder)}
                className="w-full h-14 bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white font-black text-lg tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/10 group"
              >
                <span className="group-hover:animate-pulse">START CAMPAIGN</span>
              </button>
          </div>

      </div>
      
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
