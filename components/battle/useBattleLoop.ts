
import { useState, useRef, useEffect } from 'react';
import { BattleEntity, Phase, UnitType, Projectile, VisualEffect, CommanderClass } from '../../types';
import { UNIT_STATS, GAME_LEVELS, UNIT_UPGRADES, VICTORY_DELAY_MS, BUFF_CONFIG, DEFAULT_SPEED_MULTIPLIER } from '../../constants';
import { getSpawnX, calculateEntityStats } from './battleUtils';

interface UseBattleLoopProps {
    allies: UnitType[];
    level: number;
    phase: Phase;
    commanderUnitType: UnitType;
    upgrades: UnitType[];
    onBattleEnd: (victory: boolean, survivors?: UnitType[], kills?: Record<string, number>) => void;
}

export const useBattleLoop = ({ allies, level, phase, commanderUnitType, upgrades, onBattleEnd }: UseBattleLoopProps) => {
    const [entities, setEntities] = useState<BattleEntity[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [effects, setEffects] = useState<VisualEffect[]>([]);
    const [speedMultiplier, setSpeedMultiplier] = useState(DEFAULT_SPEED_MULTIPLIER);
    const [isPaused, setIsPaused] = useState(false);

    const frameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const alliesProcessedCount = useRef<number>(0);
    const isBattleEndingRef = useRef(false);
    const killsRef = useRef<Record<string, number>>({});
    const processedDeathsRef = useRef<Set<string>>(new Set());

    // --- Initialization (Spawning) ---
    useEffect(() => {
        const initialEnemies: BattleEntity[] = [];
        let idCounter = 0;
        
        const configIndex = Math.min(level - 1, GAME_LEVELS.length - 1);
        const config = GAME_LEVELS[configIndex];

        // Pre-calculate Enemy Commander presence for Spawn Logic
        const hasEnemyWarlord = config.enemyCommanders?.includes(UnitType.COMMANDER_WARLORD);
        const hasEnemyGuardian = config.enemyCommanders?.includes(UnitType.COMMANDER_GUARDIAN);
        const hasEnemyElf = config.enemyCommanders?.includes(UnitType.COMMANDER_ELF);
        const hasEnemyVanguard = config.enemyCommanders?.includes(UnitType.COMMANDER_VANGUARD);

        const spawnEnemy = (type: UnitType) => {
            const baseStats = UNIT_STATS[type];
            if (!baseStats) return;
            const enemyScale = (baseStats.scale || 1) * config.difficultyMult;

            // Apply Commander Passives (Enemy) - AT SPAWN
            const initialBuffs: string[] = [];
            if (type === UnitType.INFANTRY && hasEnemyWarlord) initialBuffs.push('FRENZY');
            if (type === UnitType.SHIELD && hasEnemyGuardian) initialBuffs.push('HEAL');
            if (type === UnitType.ARCHER && hasEnemyElf) initialBuffs.push('ELF_RANGE');
            if (type === UnitType.SPEAR && hasEnemyVanguard) initialBuffs.push('VANGUARD_PASSIVE');

            let currentHp = Math.floor(baseStats.maxHp * config.difficultyMult);
            
            // Generic: Apply Initial HP Modifiers from Buffs
            initialBuffs.forEach(buffId => {
                const buffConfig = BUFF_CONFIG[buffId];
                if (buffConfig && buffConfig.hp) {
                    currentHp += buffConfig.hp;
                }
            });

            initialEnemies.push({
                ...baseStats,
                maxHp: Math.floor(baseStats.maxHp * config.difficultyMult), // Base MaxHP (Buffs added dynamically in calc)
                hp: currentHp,
                atk: Math.floor(baseStats.atk * config.difficultyMult),
                scale: enemyScale,
                id: `e-${level}-${type}-${idCounter++}`,
                type: type,
                team: 'ENEMY',
                x: getSpawnX(type, 'ENEMY'),
                y: 20 + (Math.random() * 60),
                targetId: null,
                lastAttackTime: 0,
                lastHitTime: 0,
                aiState: type === UnitType.SPEAR ? 'WAITING' : 'NORMAL',
                aiTimer: 0,
                buffs: initialBuffs
            });
        };

        // Spawn Standard Enemies
        Object.entries(config.unitCounts).forEach(([typeStr, count]) => {
            for (let i = 0; i < count; i++) spawnEnemy(typeStr as UnitType);
        });

        // Spawn Enemy Commanders
        config.enemyCommanders?.forEach(spawnEnemy);
        
        setEntities(initialEnemies);
        setProjectiles([]);
        setEffects([]);
        alliesProcessedCount.current = 0;
        isBattleEndingRef.current = false;
        setIsPaused(false);
        killsRef.current = {};
        processedDeathsRef.current = new Set();
    }, [level]);

    // --- Ally Spawning ---
    useEffect(() => {
        if (allies.length > alliesProcessedCount.current) {
            const newUnits = allies.slice(alliesProcessedCount.current);
            const newEntities: BattleEntity[] = [];
            const playerCmdClass = UNIT_STATS[commanderUnitType]?.commanderClass;

            newUnits.forEach((type, idx) => {
                const base = UNIT_STATS[type];
                let stats = { ...base };
                const initialBuffs: string[] = [];
                let currentHp = stats.maxHp;

                // Apply Upgrades
                if (upgrades.includes(type)) {
                    const bonus = UNIT_UPGRADES[type];
                    if (bonus) {
                        stats.maxHp += (bonus.hp || 0);
                        currentHp += (bonus.hp || 0);
                        stats.hp = currentHp;
                        stats.atk += (bonus.atk || 0);
                        stats.def += (bonus.def || 0);
                        stats.moveSpeed += (bonus.moveSpeed || 0);
                        if (bonus.scale) stats.scale = bonus.scale;
                    }
                }
                
                // Apply Commander Passives (Player) - AT SPAWN
                if (type === UnitType.INFANTRY && playerCmdClass === CommanderClass.WARLORD) initialBuffs.push('FRENZY');
                if (type === UnitType.SHIELD && playerCmdClass === CommanderClass.GUARDIAN) initialBuffs.push('HEAL');
                if (type === UnitType.ARCHER && playerCmdClass === CommanderClass.ELF) initialBuffs.push('ELF_RANGE');
                if (type === UnitType.SPEAR && playerCmdClass === CommanderClass.VANGUARD) initialBuffs.push('VANGUARD_PASSIVE');

                // Generic: Apply Initial HP Modifiers from Buffs
                initialBuffs.forEach(buffId => {
                    const buffConfig = BUFF_CONFIG[buffId];
                    if (buffConfig && buffConfig.hp) {
                        currentHp += buffConfig.hp;
                    }
                });

                newEntities.push({
                    ...stats,
                    hp: currentHp, // Explicitly set to calculated total
                    id: `p-${Date.now()}-${idx}`,
                    type,
                    team: 'PLAYER',
                    x: getSpawnX(type, 'PLAYER'),
                    y: 20 + (Math.random() * 60),
                    targetId: null,
                    lastAttackTime: 0,
                    lastHitTime: 0,
                    aiState: type === UnitType.SPEAR ? 'WAITING' : 'NORMAL',
                    aiTimer: 0,
                    buffs: initialBuffs
                });
            });

            setEntities(prev => [...prev, ...newEntities]);
            alliesProcessedCount.current = allies.length;
        }
    }, [allies, upgrades, commanderUnitType]);

    // --- Game Loop ---
    useEffect(() => {
        lastTimeRef.current = performance.now();
        frameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameRef.current);
    }, [phase, speedMultiplier, isPaused]);

    const loop = (time: number) => {
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;

        if (phase === Phase.BATTLE && !isPaused) {
            updateEntities(time, delta);
            updateProjectiles(time, delta);
            cleanupEffects(time);
        }

        frameRef.current = requestAnimationFrame(loop);
    };

    const updateEntities = (time: number, delta: number) => {
        setEntities(prevEnts => {
            // 1. Handle Deaths
            prevEnts.forEach(e => {
                if (e.hp <= 0 && e.team === 'ENEMY' && !processedDeathsRef.current.has(e.id)) {
                    processedDeathsRef.current.add(e.id);
                    killsRef.current[e.type] = (killsRef.current[e.type] || 0) + 1;
                }
            });

            let activeEnts = prevEnts.filter(e => e.hp > 0);
            const players = activeEnts.filter(e => e.team === 'PLAYER');
            const enemies = activeEnts.filter(e => e.team === 'ENEMY');

            // 2. Victory/Defeat Check
            if (!isBattleEndingRef.current) {
                if (players.length === 0 && enemies.length > 0) {
                    isBattleEndingRef.current = true;
                    onBattleEnd(false, [], killsRef.current);
                } else if (enemies.length === 0 && players.length > 0) {
                    isBattleEndingRef.current = true;
                    setTimeout(() => {
                        const survivors = players.filter(p => !p.type.startsWith('COMMANDER_')).map(p => p.type);
                        onBattleEnd(true, survivors, killsRef.current);
                    }, VICTORY_DELAY_MS);
                } else if (players.length === 0 && enemies.length === 0 && prevEnts.length > 0) {
                     isBattleEndingRef.current = true;
                     onBattleEnd(false, [], killsRef.current);
                }
            }

            // 3. Process Individual Entities
            activeEnts.forEach(entity => {
                const isPlayer = entity.team === 'PLAYER';

                // --- Apply Spear Charge Buff State (State Machine) ---
                if (entity.type === UnitType.SPEAR) {
                    const isCharging = entity.aiState === 'WAITING' || entity.aiState === 'CHARGING';
                    const buffId = 'SPEAR_CHARGE';
                    const hasBuff = entity.buffs.includes(buffId);
                    
                    if (isCharging && !hasBuff) entity.buffs.push(buffId);
                    else if (!isCharging && hasBuff) entity.buffs = entity.buffs.filter(b => b !== buffId);
                }

                // --- Calculate Effective Stats (Base + Upgrades + Buffs) ---
                const stats = calculateEntityStats(entity);

                // --- Process Ticks (Heal) ---
                if (entity.buffs.includes('HEAL')) {
                    const regen = BUFF_CONFIG['HEAL'].hpRegen || 0.02;
                    if (entity.hp < stats.maxHp) {
                        const healAmount = (stats.maxHp * regen) * (delta / 1000) * speedMultiplier;
                        entity.hp = Math.min(stats.maxHp, entity.hp + healAmount);
                        if (Math.random() < 0.01 * speedMultiplier) {
                            setEffects(prev => [...prev, {
                                id: `heal-${Date.now()}-${Math.random()}`,
                                x: entity.x, y: entity.y - 2, type: 'HEAL', createdAt: time, duration: 600
                            }]);
                        }
                    }
                }

                // --- Spear Charge State Machine ---
                if (entity.type === UnitType.SPEAR && entity.aiState && entity.aiState !== 'NORMAL') {
                    entity.aiTimer = (entity.aiTimer || 0) + (delta * speedMultiplier);
                    if (entity.aiState === 'WAITING') {
                        if (entity.aiTimer >= 2000) entity.aiState = 'CHARGING';
                        return; // Skip targeting/attacking while waiting
                    }
                    if (entity.aiState === 'CHARGING') {
                        const targetX = entity.team === 'PLAYER' ? 90 : 10;
                        const distToTarget = Math.abs(targetX - entity.x);
                        
                        const chargeSpeed = stats.moveSpeed * (delta / 16) * speedMultiplier;
                        
                        const dir = Math.sign(targetX - entity.x);
                        entity.x += dir * chargeSpeed;
                        if (distToTarget < 2) entity.aiState = 'NORMAL';
                        return; // Skip targeting/attacking while charging
                    }
                }

                // --- Targeting & Combat ---
                const targets = isPlayer ? enemies : players;
                let minDist = 10000;
                let bestTarget: BattleEntity | null = null;
                
                targets.forEach(t => {
                    const dist = Math.hypot(t.x - entity.x, t.y - entity.y);
                    if (dist < minDist) { minDist = dist; bestTarget = t; }
                });

                const target = bestTarget;
                entity.targetId = target ? target.id : null;

                if (target) {
                    // Calculate Range Threshold based on Effective Stats
                    let rangeThreshold = 5; // Base melee
                    
                    if (stats.range > 1.5) rangeThreshold = stats.range * 8; 
                    
                    const dist = Math.hypot(target.x - entity.x, target.y - entity.y);

                    if (dist <= rangeThreshold) {
                        // Attack
                        const effectiveCooldown = stats.speed / speedMultiplier;
                        if (time - entity.lastAttackTime > effectiveCooldown) {
                            entity.lastAttackTime = time;

                            if (stats.range > 3) {
                                // Ranged
                                setProjectiles(prev => [...prev, {
                                    id: `proj-${Date.now()}-${Math.random()}`,
                                    x: entity.x, y: entity.y,
                                    targetId: target.id,
                                    damage: Math.max(1, stats.atk - calculateEntityStats(target).def), // Use effective Def of target
                                    speed: 0.08 * speedMultiplier,
                                    rotation: Math.atan2(target.y - entity.y, target.x - entity.x) * (180 / Math.PI),
                                    opacity: 1
                                }]);
                            } else {
                                // Melee
                                const targetDef = calculateEntityStats(target).def;
                                const dmg = Math.max(1, stats.atk - targetDef);
                                target.hp -= dmg;
                                target.lastHitTime = time;
                                
                                const isSlash = entity.buffs.includes('FRENZY');
                                setEffects(prev => [...prev, {
                                    id: `vfx-${Date.now()}-${Math.random()}`,
                                    x: target.x, y: target.y,
                                    type: isSlash ? 'SLASH' : 'HIT',
                                    createdAt: time, duration: 300
                                }]);
                            }
                        }
                    } else {
                        // Move
                        const moveSpeed = stats.moveSpeed * (delta / 16) * speedMultiplier;
                        const vx = (target.x - entity.x) / dist;
                        const vy = (target.y - entity.y) / dist;
                        entity.x += vx * moveSpeed;
                        entity.y += vy * moveSpeed;
                    }
                }
            });

            return activeEnts;
        });
    };

    const updateProjectiles = (time: number, delta: number) => {
        setEntities(currentEntities => {
            let nextEntities = [...currentEntities];
            let hitOccurred = false;

            setProjectiles(currentProjs => {
                let nextProjs: Projectile[] = [];
                currentProjs.forEach(p => {
                    const target = nextEntities.find(e => e.id === p.targetId);
                    let tx = p.x, ty = p.y;
                    let targetFound = false;
                    if (target) { tx = target.x; ty = target.y; targetFound = true; }

                    let dx, dy, dist;
                    if (targetFound) {
                        dx = tx - p.x; dy = ty - p.y; dist = Math.hypot(dx, dy);
                    } else {
                        const rad = p.rotation * (Math.PI / 180);
                        dx = Math.cos(rad) * 100; dy = Math.sin(rad) * 100; dist = 1000;
                    }

                    if (targetFound && dist < 2) {
                        target!.hp -= p.damage;
                        target!.lastHitTime = time;
                        hitOccurred = true;
                        setEffects(prev => [...prev, { id: `vfx-${Date.now()}-${Math.random()}`, x: target!.x, y: target!.y, type: 'HIT', createdAt: time, duration: 300 }]);
                    } else {
                        let moveAmt = p.speed * (delta / 16);
                        let newX = p.x, newY = p.y;
                        if (targetFound) {
                            const vx = dx / dist; const vy = dy / dist;
                            newX += vx * moveAmt; newY += vy * moveAmt;
                        } else {
                            const rad = p.rotation * (Math.PI / 180);
                            newX += Math.cos(rad) * moveAmt; newY += Math.sin(rad) * moveAmt;
                        }
                        let newOpacity = p.opacity ?? 1;
                        if (!targetFound) newOpacity -= 0.05;
                        if (newOpacity > 0) nextProjs.push({ ...p, x: newX, y: newY, rotation: p.rotation, opacity: newOpacity });
                    }
                });
                return nextProjs;
            });
            return hitOccurred ? nextEntities : currentEntities;
        });
    };

    const cleanupEffects = (time: number) => {
        setEffects(prev => prev.filter(e => time - e.createdAt < e.duration));
    };

    return {
        entities,
        projectiles,
        effects,
        speedMultiplier,
        isPaused,
        setSpeedMultiplier,
        setIsPaused
    };
};
