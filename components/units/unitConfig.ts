
import { UnitType, CommanderProfile, EntityStats, CommanderClass, BuffStats, SoldierProfile } from '../../types';

// Keys are now the specific UnitType
export const COMMANDERS: Record<string, CommanderProfile> = {
  [UnitType.COMMANDER_CENTURION]: {
    id: UnitType.COMMANDER_CENTURION,
    name: "Centurion",
    description: "A disciplined leader of the iron legion.",
    skillName: "Praetorian Guard",
    skillDesc: "Starts campaign with 2 full mixed squads (8 units).",
    class: CommanderClass.CENTURION
  },
  [UnitType.COMMANDER_ELF]: {
    id: UnitType.COMMANDER_ELF,
    name: "Ranger",
    description: "A master of long-range warfare.",
    skillName: "Eagle Eye",
    skillDesc: "All Archer allies gain Attack Range and Attack Speed bouns.",
    class: CommanderClass.ELF
  },
  [UnitType.COMMANDER_WARLORD]: {
    id: UnitType.COMMANDER_WARLORD,
    name: "Warlord",
    description: "A brutal commander who leads from the front.",
    skillName: "Bloodlust",
    skillDesc: "All Infantry allies gain HP and Attack Range bouns.",
    class: CommanderClass.WARLORD
  },
  [UnitType.COMMANDER_GUARDIAN]: {
    id: UnitType.COMMANDER_GUARDIAN,
    name: "Guardian",
    description: "A stalwart defender of the weak.",
    skillName: "Phalanx",
    skillDesc: "All Shield allies regenerate HP over time.",
    class: CommanderClass.GUARDIAN
  },
  [UnitType.COMMANDER_VANGUARD]: {
    id: UnitType.COMMANDER_VANGUARD,
    name: "Vanguard",
    description: "A lightning-fast initiator.",
    skillName: "Blitzkrieg",
    skillDesc: "All Spear allies gain HP and MoveSpeed bouns.",
    class: CommanderClass.VANGUARD
  }
};

export const SOLDIER_PROFILES: Record<string, SoldierProfile> = {
    [UnitType.INFANTRY]: {
        id: UnitType.INFANTRY,
        name: "Infantry",
        description: "Versatile melee fighter with high mobility. The backbone of any army."
    },
    [UnitType.ARCHER]: {
        id: UnitType.ARCHER,
        name: "Archer",
        description: "Fragile ranged unit. Deals consistent damage from a safe distance."
    },
    [UnitType.SHIELD]: {
        id: UnitType.SHIELD,
        name: "Shield",
        description: "Heavily armored defender. Moves slowly but absorbs massive damage."
    },
    [UnitType.SPEAR]: {
        id: UnitType.SPEAR,
        name: "Spear",
        description: "Tactical unit with extended reach. Charges forward to break enemy lines."
    },
    [UnitType.OBSTACLE]: {
        id: UnitType.OBSTACLE,
        name: "Barricade",
        description: "A stationary object. It just stands there, menacingly."
    }
};

// atkSpeed: Lower is faster (ms delay between attacks)
// moveSpeed: Units per frame (approximate percentage of screen width)
export const UNIT_STATS: Record<UnitType, EntityStats> = {
  // --- COMMANDERS (Distinct Stats) ---
  [UnitType.COMMANDER_CENTURION]: { hp: 280, maxHp: 280, atk: 18, range: 1, def: 5, atkSpeed: 1000, moveSpeed: 0.035, scale: 1.2, commanderClass: CommanderClass.CENTURION },
  [UnitType.COMMANDER_WARLORD]:   { hp: 320, maxHp: 320, atk: 21, range: 1, def: 6, atkSpeed: 800, moveSpeed: 0.04, scale: 1.3, commanderClass: CommanderClass.WARLORD },
  [UnitType.COMMANDER_ELF]:       { hp: 240, maxHp: 240, atk: 25, range: 5, def: 3, atkSpeed: 1200, moveSpeed: 0.025, scale: 1.1, commanderClass: CommanderClass.ELF },
  [UnitType.COMMANDER_GUARDIAN]:  { hp: 450, maxHp: 450, atk: 15, range: 1, def: 8, atkSpeed: 1800, moveSpeed: 0.015, scale: 1.25, commanderClass: CommanderClass.GUARDIAN },
  [UnitType.COMMANDER_VANGUARD]:  { hp: 360, maxHp: 360, atk: 20, range: 1.5, def: 4, atkSpeed: 900, moveSpeed: 0.06, scale: 1.2, commanderClass: CommanderClass.VANGUARD },

  // --- SOLDIERS ---
  [UnitType.INFANTRY]: { hp: 100, maxHp: 100, atk: 20, range: 1, def: 8, atkSpeed: 800, moveSpeed: 0.06, scale: 1, commanderClass: CommanderClass.NONE }, // Fast mover
  [UnitType.ARCHER]:   { hp: 60, maxHp: 60, atk: 15, range: 5, def: 4, atkSpeed: 2000, moveSpeed: 0.025, scale: 0.8, commanderClass: CommanderClass.NONE },   // Slow mover
  [UnitType.SHIELD]:   { hp: 180, maxHp: 180, atk: 12, range: 1, def: 10, atkSpeed: 1500, moveSpeed: 0.015, scale: 1.1, commanderClass: CommanderClass.NONE }, // Very slow
  [UnitType.SPEAR]:    { hp: 80, maxHp: 80, atk: 18, range: 2, def: 5, atkSpeed: 1000, moveSpeed: 0.05, scale: 1, commanderClass: CommanderClass.NONE }, // Average
  [UnitType.OBSTACLE]: { hp: 500, maxHp: 500, atk: 0, range: 0, def: 0, atkSpeed: 99999, moveSpeed: 0, scale: 1, commanderClass: CommanderClass.NONE },
};

// Upgrade Config: Absolute values added to base stats
export const UNIT_UPGRADES: Partial<Record<UnitType, Partial<EntityStats>>> = {
  [UnitType.INFANTRY]: { hp: 25, atk: 5, def: 2, moveSpeed: 0.01, scale: 1.2 },
  [UnitType.ARCHER]: { hp: 30, atk: 10, range: 2, scale: 1.3 },
  [UnitType.SHIELD]: { hp: 120, scale: 1.3 },
  [UnitType.SPEAR]: { hp: 50, atk: 7, scale: 1.3 },
};

// NEW: Centralized Buff Configuration
// Defines the numerical impact of specific buff keys
export const BUFF_CONFIG: Record<string, BuffStats> = {
  'FRENZY': { maxHp: 50, hp: 50, range: 1.5, label: 'Bloodlust', description: 'Increase MaxHP and Melee range.', isCommanderBuff: true }, // Warlord Buff
  'HEAL': { maxHp: 75, hp: 75, hpRegen: 0.03, label: 'Regeneration', description: 'Increase MaxHP and restores 3% HP per second.', isCommanderBuff: true }, // Guardian Buff
  'ELF_RANGE': { range: 3, atkSpeed: -600, label: 'Eagle Eye', description: 'Massively increase Attack Range and Attack Speed.', isCommanderBuff: true }, // Elf Passive
  'SPEAR_CHARGE': { def: 15, moveSpeed: 0.25, label: 'Phalanx Charge', description: 'Massively increase Defense and MoveSpeed.' }, // Spear Charge state (Not a commander passive)
  'VANGUARD_PASSIVE': { maxHp: 120, hp: 120, label: 'Blitzkrieg', description: 'Massively increase MaxHP', isCommanderBuff: true } // Vanguard Commander
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
