
import React from 'react';
import { GridItem } from '../../types';
import { UnitIcon } from '../units/UnitIcon';

interface PuzzleCellProps {
    item: GridItem;
    isValidTarget: boolean;
    isCommander: boolean;
    isUpgraded: boolean;
    isMatched: boolean;
    cellSize: string;
    onCellClick: (item: GridItem) => void;
}

export const PuzzleCell: React.FC<PuzzleCellProps> = ({
    item, isValidTarget, isCommander, isUpgraded, isMatched, cellSize, onCellClick
}) => {
    // Logic for animation class:
    // 1. If Matched: Bounce
    // 2. If NOT matched AND is new: Grow in
    // 3. Otherwise: No animation (prevents re-triggering on move)
    const animationClass = isMatched 
        ? 'ring-2 ring-dashed ring-yellow-300 animate-bounce z-20' 
        : (item.isNew ? 'animate-grow-in' : '');

    return (
        <div
            onClick={() => onCellClick(item)}
            className={`
                ${cellSize} rounded-md cursor-pointer transition-all duration-300 relative
                ${isCommander ? 'ring-4 ring-yellow-500 z-10' : ''}
                ${animationClass}
                hover:bg-white/5
            `}
        >
            <UnitIcon type={item.type} isUpgraded={isUpgraded} />
            
            {isValidTarget && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-full h-full border-4 border-white/60 rounded-md animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.4)]"></div>
                </div>
            )}
        </div>
    );
};
