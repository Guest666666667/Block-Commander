
import { UnitType, CommanderProfile, EntityStats, CommanderClass, BuffStats } from '../../types';

// Keys are now the specific UnitType
export const COMMANDERS: Record<string, CommanderProfile> = {
  [UnitType.COMMANDER_CENTURION]: {
    id: UnitType.COMMANDER_CENTURION,
    name: "Centurion",
    shortName: "Centurion",
    role: "Tactician",
    description: "A disciplined leader of the iron legion.",
    skillName: "Praetorian Guard",
    skillDesc: "Starts the campaign with a squad of four soldiers.",
    class: CommanderClass.CENTURION
  },
  [UnitType.COMMANDER_ELF]: {
    id: UnitType.COMMANDER_ELF,
    name: "Elven Ranger",
    shortName: "Ranger",
    role: "Sharpshooter",
    description: "A master of long-range warfare.",
    skillName: "Eagle Eye",
    skillDesc: "All Archer allies gain Attack Range and Attack Speed bouns.",
    class: CommanderClass.ELF
  },
  [UnitType.COMMANDER_WARLORD]: {
    id: UnitType.COMMANDER_WARLORD,
    name: "Iron Warlord",
    shortName: "Warlord",
    role: "Berserker",
    description: "A brutal commander who leads from the front.",
    skillName: "Bloodlust",
    skillDesc: "All Infantry allies gain HP and Attack Range bouns.",
    class: CommanderClass.WARLORD
  },
  [UnitType.COMMANDER_GUARDIAN]: {
    id: UnitType.COMMANDER_GUARDIAN,
    name: "High Guardian",
    shortName: "Guardian",
    role: "Protector",
    description: "A stalwart defender of the weak.",
    skillName: "Phalanx",
    skillDesc: "All Shield allies regenerate HP over time.",
    class: CommanderClass.GUARDIAN
  },
  [UnitType.COMMANDER_VANGUARD]: {
    id: UnitType.COMMANDER_VANGUARD,
    name: "Storm Vanguard",
    shortName: "Vanguard",
    role: "Shock Trooper",
    description: "A lightning-fast initiator.",
    skillName: "Blitzkrieg",
    skillDesc: "All Spear allies gain HP and MoveSpeed bouns.",
    class: CommanderClass.VANGUARD
  }
};

// atkSpeed: Lower is faster (ms delay between attacks)
// moveSpeed: Units per frame (approximate percentage of screen width)
export const UNIT_STATS: Record<UnitType, EntityStats> = {
  // --- COMMANDERS (Distinct Stats) ---
  [UnitType.COMMANDER_CENTURION]: { hp: 500, maxHp: 500, atk: 22, range: 1, def: 7, atkSpeed: 1000, moveSpeed: 0.025, scale: 1.2, commanderClass: CommanderClass.CENTURION },
  [UnitType.COMMANDER_ELF]:       { hp: 400, maxHp: 400, atk: 30, range: 5, def: 3, atkSpeed: 1500, moveSpeed: 0.03, scale: 1.1, commanderClass: CommanderClass.ELF },
  [UnitType.COMMANDER_WARLORD]:   { hp: 600, maxHp: 600, atk: 28, range: 1, def: 5, atkSpeed: 800, moveSpeed: 0.04, scale: 1.3, commanderClass: CommanderClass.WARLORD },
  [UnitType.COMMANDER_GUARDIAN]:  { hp: 800, maxHp: 800, atk: 15, range: 1, def: 15, atkSpeed: 1800, moveSpeed: 0.015, scale: 1.25, commanderClass: CommanderClass.GUARDIAN },
  [UnitType.COMMANDER_VANGUARD]:  { hp: 450, maxHp: 450, atk: 35, range: 2, def: 6, atkSpeed: 900, moveSpeed: 0.06, scale: 1.2, commanderClass: CommanderClass.VANGUARD },

  // --- SOLDIERS ---
  [UnitType.INFANTRY]: { hp: 100, maxHp: 100, atk: 15, range: 1, def: 5, atkSpeed: 800, moveSpeed: 0.05, scale: 1, commanderClass: CommanderClass.NONE }, // Fast mover
  [UnitType.ARCHER]:   { hp: 60, maxHp: 60, atk: 20, range: 6, def: 1, atkSpeed: 2000, moveSpeed: 0.025, scale: 0.8, commanderClass: CommanderClass.NONE },   // Slow mover
  [UnitType.SHIELD]:   { hp: 200, maxHp: 200, atk: 8, range: 1, def: 10, atkSpeed: 1500, moveSpeed: 0.02, scale: 1.1, commanderClass: CommanderClass.NONE }, // Very slow
  [UnitType.SPEAR]:    { hp: 120, maxHp: 120, atk: 25, range: 2, def: 8, atkSpeed: 900, moveSpeed: 0.04, scale: 1, commanderClass: CommanderClass.NONE }, // Average
  [UnitType.OBSTACLE]: { hp: 500, maxHp: 500, atk: 0, range: 0, def: 0, atkSpeed: 99999, moveSpeed: 0, scale: 1, commanderClass: CommanderClass.NONE },
};

// Upgrade Config: Absolute values added to base stats
export const UNIT_UPGRADES: Partial<Record<UnitType, Partial<EntityStats>>> = {
  [UnitType.INFANTRY]: { hp: 50, atk: 10, def: 1, moveSpeed: 0.01, scale: 1.3 },
  [UnitType.ARCHER]: { hp: 30, atk: 15, range: 2, scale: 1.3 },
  [UnitType.SHIELD]: { hp: 100, def: 4, scale: 1.3 },
  [UnitType.SPEAR]: { hp: 90, atk: 15, scale: 1.3 },
};

// NEW: Centralized Buff Configuration
// Defines the numerical impact of specific buff keys
export const BUFF_CONFIG: Record<string, BuffStats> = {
  'FRENZY': { maxHp: 50, hp: 50, range: 1.5, label: 'Bloodlust', description: 'Increase MaxHP and Melee range.', isCommanderBuff: true }, // Warlord Buff
  'HEAL': { hpRegen: 0.02, label: 'Regeneration', description: 'Restores 2% HP per second.', isCommanderBuff: true }, // Guardian Buff
  'ELF_RANGE': { range: 3, atkSpeed: -500, label: 'Eagle Eye', description: 'Massively increase Attack Range and Attack Speed.', isCommanderBuff: true }, // Elf Passive
  'SPEAR_CHARGE': { def: 15, moveSpeed: 0.25, label: 'Phalanx Charge', description: 'Massively increase Defense and MoveSpeed.' }, // Spear Charge state (Not a commander passive)
  'VANGUARD_PASSIVE': { maxHp: 120, hp: 120, moveSpeed: 0.04, label: 'Blitzkrieg', description: 'Massively increase MaxHP and MoveSpeed.', isCommanderBuff: true } // Vanguard Commander
};

export const UNIT_COLORS: Record<UnitType, string> = {
  [UnitType.COMMANDER_CENTURION]: 'bg-orange-700',
  [UnitType.COMMANDER_ELF]: 'bg-emerald-950',
  [UnitType.COMMANDER_WARLORD]: 'bg-red-950',
  [UnitType.COMMANDER_GUARDIAN]: 'bg-blue-950',
  [UnitType.COMMANDER_VANGUARD]: 'bg-purple-950',
  
  [UnitType.INFANTRY]: 'bg-red-900',
  [UnitType.ARCHER]: 'bg-emerald-900',
  [UnitType.SHIELD]: 'bg-blue-900',
  [UnitType.SPEAR]: 'bg-purple-900',
  [UnitType.OBSTACLE]: 'bg-gray-700',
};
