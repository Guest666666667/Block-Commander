
import { BattleEntity, EntityStats, UnitType } from '../../types';
import { SPAWN_CONFIG } from './battleConfig';

/**
 * Calculate spawn X position based on type and team configuration
 */
export const getSpawnX = (type: UnitType, team: 'PLAYER' | 'ENEMY'): number => {
    const config = team === 'ENEMY' ? SPAWN_CONFIG.ENEMY : SPAWN_CONFIG.PLAYER;
    // @ts-ignore - dynamic property access safe due to DEFAULT fallback
    const spawnData = config[type] || config.DEFAULT;
    return spawnData.base + (Math.random() * spawnData.variance);
};

export const isInRange = (entity: BattleEntity, target: BattleEntity): boolean => {
    let rangeThreshold = 5; 
    
    if (entity.range > 1.5) {
        rangeThreshold = entity.range * 8; 
    }
    
    const dist = Math.hypot(target.x - entity.x, target.y - entity.y);
    return dist <= rangeThreshold;
};

export const calculateDamage = (attacker: BattleEntity, target: BattleEntity): number => {
    return Math.max(1, attacker.atk - target.def);
};

export const calculateMovement = (
    entity: BattleEntity, 
    target: BattleEntity, 
    delta: number, 
    speedMultiplier: number
): { x: number, y: number } => {
    const dist = Math.hypot(target.x - entity.x, target.y - entity.y);
    if (dist === 0) return { x: entity.x, y: entity.y };

    const moveSpeed = entity.moveSpeed * (delta / 16) * speedMultiplier;
    const vx = (target.x - entity.x) / dist;
    const vy = (target.y - entity.y) / dist;
    
    return {
        x: entity.x + (vx * moveSpeed),
        y: entity.y + (vy * moveSpeed)
    };
};

// --- VISUAL HELPERS ---

export const getUnitGlowColor = (type: UnitType): string => {
    switch (type) {
      case UnitType.INFANTRY:
      case UnitType.COMMANDER_WARLORD:
        return '#ef4444'; // Red-500
      case UnitType.ARCHER:
      case UnitType.COMMANDER_ELF:
        return '#10b981'; // Emerald-500
      case UnitType.SHIELD:
      case UnitType.COMMANDER_GUARDIAN:
        return '#3b82f6'; // Blue-500
      case UnitType.SPEAR:
      case UnitType.COMMANDER_VANGUARD:
        return '#a855f7'; // Purple-500
      case UnitType.COMMANDER_CENTURION:
        return '#f97316'; // Orange-500
      default:
        return '#eab308'; // Yellow-500
    }
};

export const getEntityFilterStyle = (entity: BattleEntity): string => {
    // Only apply grayscale/darkening if the unit is downed (HP <= 0)
    if (entity.hp <= 0) {
        return 'grayscale(100%) brightness(40%) contrast(120%)';
    }
    
    // Living units render with natural colors (no filters)
    return 'none';
};
