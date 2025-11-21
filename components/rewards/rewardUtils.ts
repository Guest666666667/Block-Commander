
import { GameState, UnitType, Phase } from '../../types';
import { MAX_GRID_SIZE, MAX_PER_UNIT_COUNT } from '../../constants';
import { REWARD_DEFINITIONS } from './rewardConfig';

/**
 * Helper: Calculate the Gem cost for a set of selected rewards,
 * accounting for the "Free Selections" allowance.
 * 
 * Logic: The player gets `freePicks` number of items for FREE.
 * To be player-friendly, we automatically discount the MOST EXPENSIVE items.
 */
export const calculateTransactionCost = (selectedIds: string[], freePicks: number): number => {
    if (selectedIds.length <= freePicks) return 0;

    // Get all costs
    const costs = selectedIds
        .map(id => REWARD_DEFINITIONS[id]?.cost || 0)
        .sort((a, b) => b - a); // Descending: [500, 200, 50]

    // Remove the top N (Free picks)
    const costsToPay = costs.slice(freePicks);

    // Sum the rest
    return costsToPay.reduce((sum, c) => sum + c, 0);
};

/**
 * Randomly generates 3 unique reward options based on the current state/history.
 */
export const generateRewardOptions = (currentState: GameState): string[] => {
    const pool: string[] = [];
    const history = currentState.rewardsHistory || {};

    // EXPAND (Max 2 times allowed total)
    if (currentState.gridSize < MAX_GRID_SIZE && (history['EXPAND'] || 0) < 2) {
        pool.push('EXPAND');
    }
    
    // SCAVENGER (Unlimited)
    pool.push('SCAVENGER');

    // LIMIT_BREAK (Unlimited)
    pool.push('LIMIT_BREAK');

    // AGILITY (Max 1 time - adds +1 range)
    if ((history['AGILITY'] || 0) < 1) {
        pool.push('AGILITY');
    }
    
    // REINFORCE (Max 1 time)
    if ((history['REINFORCE'] || 0) < 1) {
        pool.push('REINFORCE');
    }

    // REMODEL (Max 4 times)
    if (currentState.remodelLevel < 4) {
        pool.push('REMODEL');
    }

    // GREED (Max 1 time)
    if ((history['GREED'] || 0) < 1) {
        pool.push('GREED');
    }

    // UPGRADES (Max 1 per type)
    [UnitType.INFANTRY, UnitType.ARCHER, UnitType.SHIELD, UnitType.SPEAR].forEach(type => {
        if (!currentState.upgrades.includes(type)) {
            pool.push(`UPGRADE_${type}`);
        }
    });

    // Shuffle and pick 3
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    return pool.slice(0, 3);
};

/**
 * Processes the selected rewards and calculates the state for the NEXT level.
 * Handles:
 * 1. Deducting Gems
 * 2. Applying reward effects
 * 3. Army Restoration
 * 4. Level Increment
 */
export const applyRewardsAndRestoreArmy = (
    prevState: GameState, 
    selectedRewardIds: string[],
    nextLevelSteps: number
): Partial<GameState> => {
    // 0. Calculate Cost & Deduct Gems
    const cost = calculateTransactionCost(selectedRewardIds, prevState.maxRewardSelections);
    const newGems = Math.max(0, prevState.gems - cost);

    let newSize = prevState.gridSize;
    let newScavenger = prevState.scavengerLevel;
    let newMaxRewards = prevState.maxRewardSelections;
    let newMoveRange = prevState.commanderMoveRange;
    let newRemodelLevel = prevState.remodelLevel;
    let newArmyLimitBonus = prevState.armyLimitBonus || 0;
    const currentUpgrades = [...prevState.upgrades];
    const newHistory = { ...prevState.rewardsHistory };
    
    // 1. Apply Selections
    selectedRewardIds.forEach(rewardId => {
      newHistory[rewardId] = (newHistory[rewardId] || 0) + 1;

      if (rewardId === 'EXPAND' && newSize < MAX_GRID_SIZE) {
          newSize += 1;
      } else if (rewardId === 'SCAVENGER') {
          newScavenger += 1;
      } else if (rewardId === 'GREED') {
          newMaxRewards += 1;
      } else if (rewardId === 'AGILITY') {
          newMoveRange += 1;
      } else if (rewardId === 'REMODEL') {
          newRemodelLevel += 1;
      } else if (rewardId === 'LIMIT_BREAK') {
          newArmyLimitBonus += 1;
      } else if (rewardId.startsWith('UPGRADE_')) {
          const type = rewardId.replace('UPGRADE_', '') as UnitType;
          if (!currentUpgrades.includes(type)) {
              currentUpgrades.push(type);
          }
      }
    });

    // 2. Army Restoration Logic
    const soldiersToProcess = prevState.summonQueue.filter(u => !u.startsWith('COMMANDER_'));
    const perUnitLimit = MAX_PER_UNIT_COUNT + newArmyLimitBonus;

    const typeCounts: Record<string, number> = {};
    const restoredSoldiers: UnitType[] = [];

    for (const unit of soldiersToProcess) {
       const currentCount = typeCounts[unit] || 0;
       if (currentCount < perUnitLimit) {
           restoredSoldiers.push(unit);
           typeCounts[unit] = currentCount + 1;
       }
    }

    const nextLevel = prevState.currentLevel + 1;

    return {
      gems: newGems,
      gridSize: newSize,
      scavengerLevel: newScavenger,
      maxRewardSelections: newMaxRewards,
      commanderMoveRange: newMoveRange,
      remodelLevel: newRemodelLevel,
      armyLimitBonus: newArmyLimitBonus,
      upgrades: currentUpgrades,
      rewardsHistory: newHistory,
      currentLevel: nextLevel,
      stepsRemaining: nextLevelSteps,
      reshufflesUsed: 0,
      phase: Phase.PUZZLE, 
      summonQueue: [prevState.commanderUnitType, ...restoredSoldiers], 
      survivors: [], 
      currentRewardIds: [],
      battleId: prevState.battleId + 1
    };
};
