
import { Rarity, UnitType } from '../../types';
import { Box, Grid, Coins, Swords, Crosshair, ShieldCheck, Tent, Footprints, Hammer, UserPlus, Crown } from 'lucide-react';

// Reward Definitions
export interface RewardDef {
  id: string;
  label: string;
  desc: string;
  icon: any; // LucideIcon type
  rarity: Rarity;
  cost: number; // Gem cost if free selection is used up
}

export const REWARD_DEFINITIONS: Record<string, RewardDef> = {
  'EXPAND': { id: 'EXPAND', label: 'Expand', desc: 'Increase board size by 1. Adds new Unit types.', icon: Grid, rarity: Rarity.MYTHIC, cost: 500 },
  'SCAVENGER': { id: 'SCAVENGER', label: 'Scavenger', desc: 'Obstacle lines (3+) summon units passively.', icon: Box, rarity: Rarity.RARE, cost: 150 },
  'REMODEL': { id: 'REMODEL', label: 'Remodel', desc: 'Replaces 1 Obstacle with a random Unit.', icon: Hammer, rarity: Rarity.COMMON, cost: 50 },
  'GREED': { id: 'GREED', label: 'Greed', desc: '+1 Free Selection for future victories.', icon: Coins, rarity: Rarity.RARE, cost: 200 },
  'AGILITY': { id: 'AGILITY', label: 'Agility', desc: 'Commander Move Range +1.', icon: Footprints, rarity: Rarity.EPIC, cost: 250 },
  'REINFORCE': { id: 'REINFORCE', label: 'Reinforce', desc: 'Recruits ALL soldiers within Move Range before battle.', icon: UserPlus, rarity: Rarity.EPIC, cost: 300 },
  'LIMIT_BREAK': { id: 'LIMIT_BREAK', label: 'Command Cap', desc: '+1 Army Capacity per unit type.', icon: Crown, rarity: Rarity.RARE, cost: 150 },
  
  // Upgrades
  [`UPGRADE_${UnitType.INFANTRY}`]: { id: `UPGRADE_${UnitType.INFANTRY}`, label: 'Elite Inf.', desc: '+HP, +ATK, +SPD', icon: Swords, rarity: Rarity.RARE, cost: 150 },
  [`UPGRADE_${UnitType.ARCHER}`]: { id: `UPGRADE_${UnitType.ARCHER}`, label: 'Elite Arch.', desc: '+HP, +ATK, +RANGE', icon: Crosshair, rarity: Rarity.RARE, cost: 150 },
  [`UPGRADE_${UnitType.SHIELD}`]: { id: `UPGRADE_${UnitType.SHIELD}`, label: 'Elite Shld.', desc: '+HP, +DEF', icon: ShieldCheck, rarity: Rarity.RARE, cost: 150 },
  [`UPGRADE_${UnitType.SPEAR}`]: { id: `UPGRADE_${UnitType.SPEAR}`, label: 'Elite Spr.', desc: '+HP, +ATK', icon: Tent, rarity: Rarity.RARE, cost: 150 },
};

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: 'border-slate-500 text-slate-300',
  [Rarity.RARE]: 'border-blue-500 text-blue-400',
  [Rarity.EPIC]: 'border-purple-500 text-purple-400',
  [Rarity.MYTHIC]: 'border-orange-500 text-orange-400',
};
