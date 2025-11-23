
import { GameState, UnitType, Phase, Rarity } from '../../types';
import { MAX_PER_UNIT_COUNT } from '../../constants';
import { REWARD_DEFINITIONS, RewardIDs } from './rewardConfig';
import { DEBUG_REWARD_POOL, MAX_REWARD_OPTIONS, DEFAULT_RARITY_WEIGHTS, ELITE_RARITY_WEIGHTS } from './rarityConfig';

// --- TYPES ---
type PoolMap = Record<Rarity, string[]>;

/**
 * Calculates Gem cost accounting for free picks.
 */
export const calculateTransactionCost = (selectedIds: string[], freePicks: number): number => {
    if (selectedIds.length <= freePicks) return 0;
    
    const costs = selectedIds
        .map(id => REWARD_DEFINITIONS[id]?.cost || 0)
        .sort((a, b) => a - b); // Ascending: Cheapest first

    // Greedy: If we have N free picks, we remove the N cheapest items from the bill.
    const costsToPay = costs.slice(freePicks);

    return costsToPay.reduce((sum, c) => sum + c, 0);
};

/**
 * Pure function to calculate the army to restore.
 */
export const restoreSurvivors = (
    prevSummonQueue: UnitType[], 
    perUnitLimit: number, 
    extraRecruits: UnitType[],
    commanderType: UnitType
): UnitType[] => {
    // 1. Filter queue: remove main commander (re-added later in App.tsx)
    const unitsToProcess = prevSummonQueue.filter(u => u !== commanderType);
    const restored: UnitType[] = [];
    const currentTypeCounts: Record<string, number> = {};

    // 2. Restore from previous roster (Revive Logic)
    for (const unit of unitsToProcess) {
        const currentAmt = currentTypeCounts[unit] || 0;
        if (currentAmt < perUnitLimit) {
            restored.push(unit);
            currentTypeCounts[unit] = currentAmt + 1;
        }
    }

    // 3. Add Extra Recruits (Rewards) 
    restored.push(...extraRecruits);
    
    return restored;
};

/**
 * Determines if specific guaranteed rewards should appear based on Level and History.
 */
const getGuaranteedRewards = (level: number, history: Record<string, number>, pickRandom: (r: Rarity) => string | null, pools: PoolMap): string[] => {
    const guaranteed: string[] = [];

    const hasHistoryOf = (rarities: Rarity[]) => {
        return Object.keys(history).some(id => {
            const count = history[id];
            const def = REWARD_DEFINITIONS[id];
            return count && count > 0 && def && rarities.includes(def.rarity);
        });
    };

    switch (level) {
        case 3: // Level 3: Guaranteed Epic if unlucky
        if (!hasHistoryOf([Rarity.EPIC, Rarity.MYTHIC])) {
            guaranteed.push(pickRandom(Rarity.EPIC));
        } 
        break;
        case 4: // Level 4 (Mini Boss): Guaranteed Mythic or EXPAND if not taken
            if (!history[RewardIDs.EXPAND]) guaranteed.push(RewardIDs.EXPAND);
            else guaranteed.push(pickRandom(Rarity.MYTHIC));
        break;
        case 6: // Level 6: Pity Mythic (but not GEMS_HUGE)
        if (!hasHistoryOf([Rarity.MYTHIC])) {
            const validMythics = pools[Rarity.MYTHIC].filter( id => id !== RewardIDs.GEMS_HUGE);
            const fallback = validMythics[Math.floor(Math.random() * validMythics.length)];
            guaranteed.push(fallback);
        } 
        break;

        default: break;
    }

    return guaranteed;
};

/**
 * Generates reward options for the UI.
 */
export const generateRewardOptions = (currentState: GameState): string[] => {
    if (DEBUG_REWARD_POOL.length > 0) return [...DEBUG_REWARD_POOL];

    const { rewardOptionsCount, rewardsHistory, currentLevel, blockCommonRewards, summonQueue } = currentState;
    const generatedIds: string[] = [];

    // Identify existing commanders to prevent duplicates
    const existingCommanders = new Set(summonQueue.filter(u => u.startsWith('COMMANDER_')));

    // 1. Build Pools
    const pools: PoolMap = { [Rarity.COMMON]: [], [Rarity.RARE]: [], [Rarity.EPIC]: [], [Rarity.MYTHIC]: [] };

    Object.values(REWARD_DEFINITIONS).forEach(def => {
        // Check Max Limit
        const currentCount = rewardsHistory[def.id] || 0;
        if (def.maxLimit !== undefined && currentCount >= def.maxLimit) return;
        
        // Check Common Block
        if (blockCommonRewards && def.rarity === Rarity.COMMON) return;

        // Check Logic: Don't recruit a commander we already have
        if (def.associatedUnit && def.associatedUnit.startsWith('COMMANDER_') && existingCommanders.has(def.associatedUnit)) return;
        
        // Add to pool (handle weights)
        const weight = def.weight || 1;
        for (let w = 0; w < weight; w++) {
            pools[def.rarity].push(def.id);
        }
    });

    const removeIdFromPools = (idToRemove: string) => {
        Object.keys(pools).forEach(key => {
            const rarity = key as Rarity;
            pools[rarity] = pools[rarity].filter(id => id !== idToRemove);
        });
    };

    const pickRandom = (rarity: Rarity): string | null => {
        const pool = pools[rarity];
        if (pool && pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
        // Fallback Chain
        if (rarity === Rarity.MYTHIC) return pickRandom(Rarity.EPIC);
        if (rarity === Rarity.EPIC) return pickRandom(Rarity.RARE);
        if (rarity === Rarity.RARE) return pickRandom(Rarity.COMMON);
    };

    // 2. Add Guaranteed Rewards
    const guaranteed = getGuaranteedRewards(currentLevel, rewardsHistory, pickRandom, pools);
    guaranteed.forEach(id => {
        if (!generatedIds.includes(id)) {
            generatedIds.push(id);
            removeIdFromPools(id);
        }
    });

    // 3. Fill remaining slots
    const slotsRemaining = Math.max(0, rewardOptionsCount - generatedIds.length);
    const weights = blockCommonRewards ? ELITE_RARITY_WEIGHTS : DEFAULT_RARITY_WEIGHTS;
    
    for (let i = 0; i < slotsRemaining; i++) {
        const roll = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity = Rarity.COMMON;

        for (const [rarityKey, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (roll < cumulative) {
                selectedRarity = rarityKey as Rarity;
                break;
            }
        }
        
        let selectedId = pickRandom(selectedRarity);
        // Absolute fallback
        if (!selectedId) {
             for (const r of [Rarity.MYTHIC, Rarity.EPIC, Rarity.RARE, Rarity.COMMON]) {
                if (pools[r].length > 0) {
                    selectedId = pools[r][0];
                    break;
                }
            }
        }
        
        if(selectedId) {
            generatedIds.push(selectedId);
            removeIdFromPools(selectedId);
        }
    }

    // 4. Shuffle
    for (let i = generatedIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [generatedIds[i], generatedIds[j]] = [generatedIds[j], generatedIds[i]];
    }

    return generatedIds;
};

/**
 * Applies the specific effect of a single reward ID.
 */
const applyRewardEffect = (
    rewardId: string, 
    state: any // Typed vaguely here as it's an internal accumulator
) => {
    // Common/Gem Rewards with random logic
    if (rewardId === RewardIDs.GEMS_SMALL) {
        state.gems += Math.floor(Math.random() * 41) + 10;
        return state;
    }

    // Generic Unit/Upgrade Handling via Config
    const def = REWARD_DEFINITIONS[rewardId];
    if (def) {
        // Handle Recruits
        if (def.associatedUnit && !rewardId.startsWith(RewardIDs.UPGRADE_PREFIX)) {
            state.extraUnits.push(def.associatedUnit);
        }
        // Handle Upgrades
        if (rewardId.startsWith(RewardIDs.UPGRADE_PREFIX) && def.associatedUnit) {
            if (!state.newUpgrades.includes(def.associatedUnit)) {
                state.newUpgrades.push(def.associatedUnit);
            }
        }
    }

    // Specific Mechanics
    switch (rewardId) {
        case RewardIDs.EXPAND: state.gridSize += 1; break;
        case RewardIDs.SCAVENGER: state.scavengerLevel += 1; break;
        case RewardIDs.GREED: state.maxRewardSelections += 1; break;
        case RewardIDs.AGILITY: state.commanderMoveRange += 1; break;
        case RewardIDs.STEPS_RARE: state.maxStepsBonus += 2; break;
        case RewardIDs.STEPS_EPIC: state.maxStepsBonus += 4; break;
        case RewardIDs.STEPS_MYTHIC: state.maxStepsBonus += 6; break;
        case RewardIDs.REMODEL: state.remodelLevel += 1; break;
        case RewardIDs.LIMIT_BREAK: state.armyLimitBonus += 3; break;
        case RewardIDs.FORTUNE: state.rewardOptionsCount = Math.min(MAX_REWARD_OPTIONS, state.rewardOptionsCount + 1); break;
        case RewardIDs.QUALITY_CONTROL: state.blockCommonRewards = true; break;
        case RewardIDs.GEMS_MEDIUM: state.gems += 60; break;
        case RewardIDs.GEMS_LARGE: state.gems += 120; break;
        case RewardIDs.GEMS_HUGE: state.gems += 200; break;
    }
    return state;
};

/**
 * Main orchestrator for transitioning between levels via Rewards.
 */
export const applyRewardsAndRestoreArmy = (
    prevState: GameState, 
    selectedRewardIds: string[],
    nextLevelBaseSteps: number
): Partial<GameState> => {
    
    // 1. Calculate Initial Cost
    const cost = calculateTransactionCost(selectedRewardIds, prevState.maxRewardSelections);
    const initialGems = Math.max(0, prevState.gems - cost);

    // 2. Initialize Accumulator
    let stateContainer = {
        gridSize: prevState.gridSize,
        scavengerLevel: prevState.scavengerLevel,
        maxRewardSelections: prevState.maxRewardSelections,
        commanderMoveRange: prevState.commanderMoveRange,
        maxStepsBonus: prevState.maxStepsBonus,
        remodelLevel: prevState.remodelLevel,
        armyLimitBonus: prevState.armyLimitBonus || 0,
        rewardOptionsCount: prevState.rewardOptionsCount,
        blockCommonRewards: prevState.blockCommonRewards,
        gems: initialGems,
        extraUnits: [] as UnitType[],
        newUpgrades: [...prevState.upgrades]
    };

    // 3. Apply Effects
    const newHistory = { ...prevState.rewardsHistory };
    selectedRewardIds.forEach(id => {
        newHistory[id] = (newHistory[id] || 0) + 1;
        stateContainer = applyRewardEffect(id, stateContainer);
    });

    // 4. Restore Army
    const finalLimit = MAX_PER_UNIT_COUNT + stateContainer.armyLimitBonus;
    const restoredArmy = restoreSurvivors(
        prevState.summonQueue,
        finalLimit,
        stateContainer.extraUnits,
        prevState.commanderUnitType
    );

    // 5. Return Updates
    return {
        gems: stateContainer.gems,
        gridSize: stateContainer.gridSize,
        scavengerLevel: stateContainer.scavengerLevel,
        maxRewardSelections: stateContainer.maxRewardSelections,
        commanderMoveRange: stateContainer.commanderMoveRange,
        maxStepsBonus: stateContainer.maxStepsBonus,
        remodelLevel: stateContainer.remodelLevel,
        armyLimitBonus: stateContainer.armyLimitBonus,
        rewardOptionsCount: stateContainer.rewardOptionsCount,
        blockCommonRewards: stateContainer.blockCommonRewards,
        upgrades: stateContainer.newUpgrades,
        rewardsHistory: newHistory,
        currentLevel: prevState.currentLevel + 1,
        stepsRemaining: nextLevelBaseSteps + stateContainer.maxStepsBonus,
        reshufflesUsed: 0,
        phase: Phase.PUZZLE, 
        summonQueue: [prevState.commanderUnitType, ...restoredArmy],
        survivors: [], 
        currentRewardIds: [],
        battleId: prevState.battleId + 1
    };
};
