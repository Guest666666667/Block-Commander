
import { Rarity } from '../../types';

// Global Defaults
export const INITIAL_GEMS = 100;
export const INITIAL_MAX_REWARD_SELECTIONS = 0;
export const INITIAL_REWARD_OPTIONS_COUNT = 5;
export const MAX_REWARD_OPTIONS = 6;

// Leave empty [] to use normal randomization logic.
export const DEBUG_REWARD_POOL: string[] = [];

// Probability Configuration (Must sum to 100)
export type RarityWeights = Record<Rarity, number>;

export const DEFAULT_RARITY_WEIGHTS: RarityWeights = {
    [Rarity.COMMON]: 60,
    [Rarity.RARE]: 25,
    [Rarity.EPIC]: 10,
    [Rarity.MYTHIC]: 5,
};

export const ELITE_RARITY_WEIGHTS: RarityWeights = {
    [Rarity.COMMON]: 0,
    [Rarity.RARE]: 70,
    [Rarity.EPIC]: 20,
    [Rarity.MYTHIC]: 10,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: 'border-slate-500 text-slate-300',
  [Rarity.RARE]: 'border-blue-500 text-blue-400',
  [Rarity.EPIC]: 'border-purple-500 text-purple-400',
  [Rarity.MYTHIC]: 'border-orange-500 text-orange-400',
};
