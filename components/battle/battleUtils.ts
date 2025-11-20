
import { BattleEntity, EntityStats, UnitType, CommanderClass } from '../../types';
import { SPAWN_CONFIG, UNIT_STATS, UNIT_UPGRADES, BUFF_CONFIG } from '../../constants';

/**
 * Calculate spawn X position based on type and team configuration
 */
export const getSpawnX = (type: UnitType, team: 'PLAYER' | 'ENEMY'): number => {
    const config = team === 'ENEMY' ? SPAWN_CONFIG.ENEMY : SPAWN_CONFIG.PLAYER;
    // @ts-ignore - dynamic property access safe due to DEFAULT fallback
    const spawnData = config[type] || config.DEFAULT;
    return spawnData.base + (Math.random() * spawnData.variance);
};

/**
 * Calculates the final effective stats of an entity by combining:
 * 1. Base Stats
 * 2. Active Buffs (via BUFF_CONFIG)
 */
export const calculateEntityStats = (entity: BattleEntity): EntityStats => {
    const base = entity; // entity already has base + upgrades applied at spawn time
    
    let finalDef = base.def;
    let finalRange = base.range;
    let finalMoveSpeed = base.moveSpeed;
    let finalAtk = base.atk;
    let finalMaxHp = base.maxHp;

    // Apply Buffs from Configuration
    entity.buffs.forEach(buffId => {
        const mod = BUFF_CONFIG[buffId];
        if (mod) {
            if (mod.def) finalDef += mod.def;
            if (mod.range) finalRange += mod.range;
            if (mod.moveSpeed) finalMoveSpeed += mod.moveSpeed;
            if (mod.atk) finalAtk += mod.atk;
            if (mod.maxHp) finalMaxHp += mod.maxHp;
        }
    });

    return {
        ...base,
        def: finalDef,
        range: finalRange,
        moveSpeed: finalMoveSpeed,
        atk: finalAtk,
        maxHp: finalMaxHp
    };
};

/**
 * Determines if a Commander of specific class exists on the given team
 */
export const hasCommanderClass = (entities: BattleEntity[], team: 'PLAYER' | 'ENEMY', cls: CommanderClass): boolean => {
    return entities.some(e => e.team === team && e.commanderClass === cls && e.hp > 0);
};
