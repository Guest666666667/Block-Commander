
import { UnitType } from '../../types';
import { BaseUnit } from './BaseUnit';
import { SpearUnit } from './SpearUnit';
import { CommanderUnit } from './CommanderUnit';

export const createUnit = (
    id: string,
    type: UnitType,
    team: 'PLAYER' | 'ENEMY',
    initialBuffs: string[],
    upgrades: UnitType[],
    difficultyMult: number
): BaseUnit => {
    
    if (type === UnitType.SPEAR) {
        return new SpearUnit(id, team, initialBuffs, upgrades, difficultyMult);
    }

    if (type.startsWith('COMMANDER_')) {
        return new CommanderUnit(id, type, team, initialBuffs, upgrades, difficultyMult);
    }

    // Default Soldier
    return new BaseUnit(id, type, team, initialBuffs, upgrades, difficultyMult);
};
