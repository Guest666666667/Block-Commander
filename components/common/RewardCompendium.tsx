
import React, { useState, useMemo } from 'react';
import { X, Filter, Weight, Crown, Diamond, Lock } from 'lucide-react';
import { Rarity } from '../../types';
import { REWARD_DEFINITIONS } from '../rewards/rewardConfig';
import { RARITY_COLORS } from '../rewards/rarityConfig';

interface RewardCompendiumProps {
    rewardsHistory: Record<string, number>;
    onClose: () => void;
}

type FilterType = 'ALL' | Rarity;

export const RewardCompendium: React.FC<RewardCompendiumProps> = ({ rewardsHistory, onClose }) => {
    const [filter, setFilter] = useState<FilterType>('ALL');

    // 1. Calculate Total Weights per Rarity for Probability Logic
    const rarityTotals = useMemo(() => {
        const totals: Record<Rarity, number> = {
            [Rarity.COMMON]: 0,
            [Rarity.RARE]: 0,
            [Rarity.EPIC]: 0,
            [Rarity.MYTHIC]: 0
        };
        Object.values(REWARD_DEFINITIONS).forEach(def => {
            totals[def.rarity] += (def.weight || 1);
        });
        return totals;
    }, []);

    // 2. Prepare and sort data
    const displayList = useMemo(() => {
        const list = Object.values(REWARD_DEFINITIONS).map(def => {
            const count = rewardsHistory[def.id] || 0;
            return {
                ...def,
                count,
                isOwned: count > 0
            };
        });

        // Filter
        const filtered = filter === 'ALL' 
            ? list 
            : list.filter(item => item.rarity === filter);

        // Sort: Owned first, then by Rarity (Mythic -> Common), then ID
        const rarityWeight = { [Rarity.MYTHIC]: 3, [Rarity.EPIC]: 2, [Rarity.RARE]: 1, [Rarity.COMMON]: 0 };
        
        return filtered.sort((a, b) => {
            if (a.isOwned && !b.isOwned) return -1;
            if (!a.isOwned && b.isOwned) return 1;
            
            if (rarityWeight[b.rarity] !== rarityWeight[a.rarity]) {
                return rarityWeight[b.rarity] - rarityWeight[a.rarity];
            }
            return a.id.localeCompare(b.id);
        });
    }, [rewardsHistory, filter]);

    // Calculate Stats based on current filter (displayList is already filtered)
    const currentTotal = displayList.length;
    const currentCollected = displayList.filter(i => i.isOwned).length;
    const progressPercent = currentTotal > 0 ? (currentCollected / currentTotal) * 100 : 0;

    // Global Stats
    const totalStacks = Object.values(rewardsHistory).reduce((sum, count) => sum + count, 0);

    const renderRarityIcon = (rarity: Rarity, size = 12) => {
        switch(rarity) {
            case Rarity.MYTHIC: return <Crown size={size} />;
            case Rarity.EPIC: return <div className="flex -space-x-1"><Diamond size={size}/><Diamond size={size}/><Diamond size={size}/></div>;
            case Rarity.RARE: return <div className="flex -space-x-1"><Diamond size={size}/><Diamond size={size}/></div>;
            default: return <Diamond size={size} />;
        }
    };

    const FilterButton = ({ type, icon, label }: { type: FilterType, icon?: React.ReactNode, label?: string }) => {
        const isSelected = filter === type;
        const rarityColorClass = type === 'ALL' ? 'text-slate-300' : RARITY_COLORS[type as Rarity];
        
        return (
            <button
                onClick={() => setFilter(type)}
                className={`
                    h-7 px-2 rounded flex items-center justify-center transition-all border
                    ${isSelected 
                        ? `bg-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${type === 'ALL' ? 'border-yellow-500 text-yellow-400' : rarityColorClass}`
                        : `bg-transparent !border-transparent opacity-50 hover:opacity-100 hover:bg-slate-800 ${rarityColorClass}`
                    }
                `}
            >
                {icon || <span className="text-[10px] font-bold">{label}</span>}
            </button>
        );
    };

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]" onClick={onClose}>
            {/* Main Container */}
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl shadow-2xl w-[90%] max-w-[340px] flex flex-col relative animate-fade-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                {/* Header & Filter */}
                <div className="p-2 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center gap-2">
                    <div className="flex items-center bg-slate-950/50 rounded-lg p-0.5 border border-slate-700/50">
                        <FilterButton type="ALL" label="ALL" />
                        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
                        <FilterButton type={Rarity.COMMON} icon={renderRarityIcon(Rarity.COMMON, 14)} />
                        <FilterButton type={Rarity.RARE} icon={renderRarityIcon(Rarity.RARE, 14)} />
                        <FilterButton type={Rarity.EPIC} icon={renderRarityIcon(Rarity.EPIC, 14)} />
                        <FilterButton type={Rarity.MYTHIC} icon={renderRarityIcon(Rarity.MYTHIC, 14)} />
                    </div>
                    
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* List Content - Height restricted to show ~3 items */}
                <div className="h-52 overflow-y-auto p-1.5 space-y-1.5 custom-scrollbar bg-slate-900/50">
                    {displayList.length === 0 && (
                        <div className="text-center py-10 text-slate-500 italic text-sm">
                            Empty...
                        </div>
                    )}
                    
                    {displayList.map((item) => {
                        const colorClass = RARITY_COLORS[item.rarity];
                        const isGrayscale = !item.isOwned;
                        
                        // Probability Calc
                        const totalWeight = rarityTotals[item.rarity] || 1;
                        const probability = ((item.weight || 1) / totalWeight) * 100;
                        
                        return (
                            <div 
                                key={item.id} 
                                className={`
                                    relative flex items-center gap-2.5 p-1.5 rounded-lg border transition-all min-h-[52px]
                                    ${isGrayscale 
                                        ? 'bg-slate-900/40 border-slate-800 grayscale opacity-50' 
                                        : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                                    }
                                `}
                            >
                                {/* Icon Box (Smaller for Compactness) */}
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center border shrink-0
                                    ${isGrayscale ? 'bg-slate-900 border-slate-700' : `bg-slate-900 ${colorClass}`}
                                `}>
                                    {item.isOwned ? (
                                        <item.icon size={18} />
                                    ) : (
                                        <Lock size={14} className="text-slate-600" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-0.5">
                                        {/* Title + Rarity (Color Applied to Text) */}
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[10px] font-bold uppercase ${isGrayscale ? 'text-slate-500' : colorClass}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                        
                                        {/* Stats Pills (Count + Probability) */}
                                        <div className="flex gap-1 items-center">
                                            {/* Probability Pill */}
                                            <div className="flex items-center gap-1 bg-slate-950/30 px-1.5 py-0.5 rounded border border-slate-800/50" title="Acquisition Probability">
                                                <Weight size={8} className="text-slate-500" />
                                                <span className="text-[8px] font-mono text-slate-400">{probability.toFixed(2)}%</span>
                                            </div>

                                            {/* Count Pill */}
                                            {item.isOwned && (
                                                <div className="flex items-center gap-0.5 text-[8px] font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-1.5 py-0.5 rounded">
                                                    <span>x{item.count}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="text-[9px] text-slate-400 leading-tight line-clamp-1">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Stats */}
                <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    
                    {/* Progress Bar Section */}
                    <div className="flex flex-col justify-center gap-1 w-28">
                        <div className="flex justify-between text-[8px] leading-none font-bold uppercase">
                            <span className="text-slate-500">Collected</span>
                            <span className={currentCollected === currentTotal ? "text-green-400" : "text-slate-300"}>
                                {currentCollected}/{currentTotal}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div 
                                className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_5px_rgba(34,197,94,0.4)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Total Stacks Info */}
                    <div className="text-[9px] text-slate-500 font-mono uppercase font-bold">
                        <span>TOTAL: <span className="text-yellow-500 text-xs">{totalStacks}</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
