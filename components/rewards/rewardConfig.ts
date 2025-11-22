
import { Rarity, UnitType } from '../../types';
import { Box, Coins, Swords, Crosshair, ShieldCheck, Tent, Footprints, Hammer, UserPlus, Crown, Clover, Gem, Sword, Target, Shield, Triangle, Ban, Zap, Grid, Hexagon, Timer } from 'lucide-react';
import { MAX_GRID_SIZE } from '../../constants';
import { MAX_REWARD_OPTIONS, INITIAL_REWARD_OPTIONS_COUNT } from './rarityConfig';

// Centralized Reward IDs to prevent magic strings
export const RewardIDs = {
    EXPAND: 'EXPAND',
    GEMS_HUGE: 'GEMS_HUGE',
    GEMS_LARGE: 'GEMS_LARGE',
    GEMS_MEDIUM: 'GEMS_MEDIUM',
    GEMS_SMALL: 'GEMS_SMALL',
    RECRUIT_CENTURION: 'RECRUIT_CENTURION',
    RECRUIT_WARLORD: 'RECRUIT_WARLORD',
    RECRUIT_ELF: 'RECRUIT_ELF',
    RECRUIT_GUARDIAN: 'RECRUIT_GUARDIAN',
    RECRUIT_VANGUARD: 'RECRUIT_VANGUARD',
    AGILITY: 'AGILITY',
    GREED: 'GREED',
    REMODEL: 'REMODEL',
    REINFORCE: 'REINFORCE',
    QUALITY_CONTROL: 'QUALITY_CONTROL',
    LIMIT_BREAK: 'LIMIT_BREAK',
    SCAVENGER: 'SCAVENGER',
    FORTUNE: 'FORTUNE',
    UNIT_INFANTRY: 'UNIT_INFANTRY',
    UNIT_ARCHER: 'UNIT_ARCHER',
    UNIT_SHIELD: 'UNIT_SHIELD',
    UNIT_SPEAR: 'UNIT_SPEAR',
    // Step Bonuses
    STEPS_RARE: 'STEPS_RARE',
    STEPS_EPIC: 'STEPS_EPIC',
    STEPS_MYTHIC: 'STEPS_MYTHIC',
    // Helper for upgrades
    UPGRADE_PREFIX: 'UPGRADE_',
};

// Reward Definitions
export interface RewardDef {
  id: string;
  label: string;
  desc: string;
  icon: any; // LucideIcon type
  rarity: Rarity;
  cost: number; // Gem cost if free selection is used up
  maxLimit?: number; // Maximum times this can be selected in a run. Undefined = Unlimited.
  noInventory?: boolean; // If true, this reward will not appear in the Battle Buffs list (e.g. one-time consumables)
  weight?: number; // Probability correction: 1 = default (1 entry in pool). 2 = 2 entries, etc.
}

export const REWARD_DEFINITIONS: Record<string, RewardDef> = {
  // --- MYTHIC ---
  [RewardIDs.EXPAND]: { 
      id: RewardIDs.EXPAND, 
      label: 'Expand', 
      desc: 'Increase board size by 1. Adds new Unit types.', 
      icon: Grid, 
      rarity: Rarity.MYTHIC, 
      cost: 200,
      maxLimit: MAX_GRID_SIZE - 3, 
      weight: 3
  },
  [RewardIDs.STEPS_MYTHIC]: { 
    id: RewardIDs.STEPS_MYTHIC, 
    label: 'Time Warp', 
    desc: '+6 Max Steps per level.', 
    icon: Timer, 
    rarity: Rarity.MYTHIC, 
    cost: 400,
    maxLimit: 2, 
    weight: 2
  },
  [RewardIDs.GEMS_HUGE]: {
      id: RewardIDs.GEMS_HUGE,
      label: 'Gem Hoard',
      desc: 'Gain 200 Gems.',
      icon: Gem,
      rarity: Rarity.MYTHIC, 
      cost: 0,
      noInventory: true,
      weight: 2
  },
  
  // NEW COMMANDER REWARDS (MYTHIC)
  [RewardIDs.RECRUIT_CENTURION]: {
      id: RewardIDs.RECRUIT_CENTURION,
      label: 'Centurion',
      desc: 'Recruit a Centurion (Tactician Commander).',
      icon: Hexagon,
      rarity: Rarity.MYTHIC,
      cost: 400,
      maxLimit: 1,
      weight: 1
  },
  [RewardIDs.RECRUIT_WARLORD]: {
      id: RewardIDs.RECRUIT_WARLORD,
      label: 'Warlord',
      desc: 'Recruit an Iron Warlord (Infantry Commander).',
      icon: Swords,
      rarity: Rarity.MYTHIC,
      cost: 400,
      maxLimit: 1,
      weight: 1
  },
  [RewardIDs.RECRUIT_ELF]: {
      id: RewardIDs.RECRUIT_ELF,
      label: 'Ranger',
      desc: 'Recruit an Elven Ranger (Archer Commander).',
      icon: Crosshair,
      rarity: Rarity.MYTHIC,
      cost: 400,
      maxLimit: 1,
      weight: 1
  },
  [RewardIDs.RECRUIT_GUARDIAN]: {
      id: RewardIDs.RECRUIT_GUARDIAN,
      label: 'Guardian',
      desc: 'Recruit a High Guardian (Shield Commander).',
      icon: ShieldCheck,
      rarity: Rarity.MYTHIC,
      cost: 400,
      maxLimit: 1,
      weight: 1
  },
  [RewardIDs.RECRUIT_VANGUARD]: {
      id: RewardIDs.RECRUIT_VANGUARD,
      label: 'Vanguard',
      desc: 'Recruit a Storm Vanguard (Spear Commander).',
      icon: Zap,
      rarity: Rarity.MYTHIC,
      cost: 400,
      maxLimit: 1,
      weight: 1
  },

  // --- EPIC ---
  [RewardIDs.AGILITY]: { 
      id: RewardIDs.AGILITY, 
      label: 'Agility', 
      desc: 'Commander Move Range +1.', 
      icon: Footprints, 
      rarity: Rarity.EPIC,
      cost: 250,
      maxLimit: 2,
      weight: 1
  },
  [RewardIDs.STEPS_EPIC]: { 
    id: RewardIDs.STEPS_EPIC, 
    label: 'Logistics', 
    desc: '+4 Max Steps per level.', 
    icon: Timer, 
    rarity: Rarity.EPIC,
    cost: 300,
    maxLimit: 3,
    weight: 1
  },
  [RewardIDs.GREED]: { 
      id: RewardIDs.GREED, 
      label: 'Greed', 
      desc: '+1 Free Selection (Covers lowest cost item).', 
      icon: Coins, 
      rarity: Rarity.EPIC, 
      cost: 200,
      maxLimit: 2,
      weight: 1
  },
  [RewardIDs.REMODEL]: { 
      id: RewardIDs.REMODEL, 
      label: 'Remodel', 
      desc: 'Replaces 1 Obstacle with a random Unit.', 
      icon: Hammer, 
      rarity: Rarity.EPIC, 
      cost: 200,
      maxLimit: 4,
      weight: 1
  },
  [RewardIDs.REINFORCE]: { 
      id: RewardIDs.REINFORCE, 
      label: 'Reinforce', 
      desc: 'Recruits ALL soldiers within Move Range before battle.', 
      icon: UserPlus, 
      rarity: Rarity.EPIC, 
      cost: 250,
      maxLimit: 1,
      weight: 1
  },
  [RewardIDs.GEMS_LARGE]: {
      id: RewardIDs.GEMS_LARGE,
      label: 'Gem Trove',
      desc: 'Gain 120 Gems.',
      icon: Gem,
      rarity: Rarity.EPIC,
      cost: 0,
      noInventory: true,
      weight: 1
  },

  // --- RARE ---
  [RewardIDs.QUALITY_CONTROL]: {
      id: RewardIDs.QUALITY_CONTROL,
      label: 'Elite Recruiter',
      desc: 'Common rewards will no longer appear.',
      icon: Ban,
      rarity: Rarity.RARE,
      cost: 200,
      maxLimit: 1,
      weight: 2
  },
  [RewardIDs.STEPS_RARE]: { 
    id: RewardIDs.STEPS_RARE, 
    label: 'Planning', 
    desc: '+2 Max Steps per level.', 
    icon: Timer, 
    rarity: Rarity.RARE,
    cost: 200,
    maxLimit: 5,
    weight: 2
  },
  [RewardIDs.LIMIT_BREAK]: { 
      id: RewardIDs.LIMIT_BREAK, 
      label: 'Command Cap', 
      desc: '+3 Army Capacity per unit type.', 
      icon: Crown, 
      rarity: Rarity.RARE, 
      cost: 150,
      maxLimit: 10,
      weight: 2
  },
  [RewardIDs.SCAVENGER]: { 
      id: RewardIDs.SCAVENGER, 
      label: 'Scavenger', 
      desc: 'Now obstacle lines (3+) can summon random available unit.', 
      icon: Box, 
      rarity: Rarity.RARE, 
      cost: 150,
      maxLimit: 1,
      weight: 2
  },
  [RewardIDs.FORTUNE]: { 
      id: RewardIDs.FORTUNE, 
      label: 'Fortune', 
      desc: '+1 Option to choose from next level.', 
      icon: Clover, 
      rarity: Rarity.RARE, 
      cost: 0, 
      maxLimit: MAX_REWARD_OPTIONS - INITIAL_REWARD_OPTIONS_COUNT,
      weight: 2
  },
  [RewardIDs.GEMS_MEDIUM]: {
      id: RewardIDs.GEMS_MEDIUM,
      label: 'Gem Stash',
      desc: 'Gain 60 Gems.',
      icon: Gem,
      rarity: Rarity.RARE,
      cost: 0,
      noInventory: true,
      weight: 2
  },
  
  // Upgrades (RARE)
  [`${RewardIDs.UPGRADE_PREFIX}${UnitType.INFANTRY}`]: { 
      id: `${RewardIDs.UPGRADE_PREFIX}${UnitType.INFANTRY}`, 
      label: 'Elite Inf.', 
      desc: '+HP, +ATK, +SPD', 
      icon: Swords, 
      rarity: Rarity.RARE, 
      cost: 200,
      maxLimit: 1,
      weight: 1
  },
  [`${RewardIDs.UPGRADE_PREFIX}${UnitType.ARCHER}`]: { 
      id: `${RewardIDs.UPGRADE_PREFIX}${UnitType.ARCHER}`, 
      label: 'Elite Arch.', 
      desc: '+HP, +ATK, +RANGE', 
      icon: Crosshair, 
      rarity: Rarity.RARE, 
      cost: 200,
      maxLimit: 1,
      weight: 1
  },
  [`${RewardIDs.UPGRADE_PREFIX}${UnitType.SHIELD}`]: { 
      id: `${RewardIDs.UPGRADE_PREFIX}${UnitType.SHIELD}`, 
      label: 'Elite Shld.', 
      desc: '+HP, +DEF', 
      icon: ShieldCheck, 
      rarity: Rarity.RARE, 
      cost: 200,
      maxLimit: 1,
      weight: 1
  },
  [`${RewardIDs.UPGRADE_PREFIX}${UnitType.SPEAR}`]: { 
      id: `${RewardIDs.UPGRADE_PREFIX}${UnitType.SPEAR}`, 
      label: 'Elite Spr.', 
      desc: '+HP, +ATK', 
      icon: Tent, 
      rarity: Rarity.RARE, 
      cost: 200,
      maxLimit: 1,
      weight: 1
  },

  // --- COMMON (Cost 0) ---
  [RewardIDs.GEMS_SMALL]: {
      id: RewardIDs.GEMS_SMALL,
      label: 'Gem Cache',
      desc: 'Gain 10-50 Gems.',
      icon: Gem,
      rarity: Rarity.COMMON,
      cost: 20,
      noInventory: true,
      weight: 2
  },
  [RewardIDs.UNIT_INFANTRY]: {
      id: RewardIDs.UNIT_INFANTRY,
      label: 'Draft Inf.',
      desc: 'Add 1 Infantry to next battle.',
      icon: Sword,
      rarity: Rarity.COMMON,
      cost: 50,
      noInventory: true,
      weight: 1
  },
  [RewardIDs.UNIT_ARCHER]: {
      id: RewardIDs.UNIT_ARCHER,
      label: 'Draft Arch.',
      desc: 'Add 1 Archer to next battle.',
      icon: Target,
      rarity: Rarity.COMMON,
      cost: 50,
      noInventory: true,
      weight: 1
  },
  [RewardIDs.UNIT_SHIELD]: {
      id: RewardIDs.UNIT_SHIELD,
      label: 'Draft Shld.',
      desc: 'Add 1 Shield to next battle.',
      icon: Shield,
      rarity: Rarity.COMMON,
      cost: 50,
      noInventory: true,
      weight: 1
  },
  [RewardIDs.UNIT_SPEAR]: {
      id: RewardIDs.UNIT_SPEAR,
      label: 'Draft Spear',
      desc: 'Add 1 Spear to next battle.',
      icon: Triangle,
      rarity: Rarity.COMMON,
      cost: 50,
      noInventory: true,
      weight: 1
  },
};
