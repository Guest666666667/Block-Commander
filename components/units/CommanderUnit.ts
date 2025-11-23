
import { CommanderClass, UnitType } from '../../types';
import { BaseUnit } from './BaseUnit';
import { UNIT_STATS } from './unitConfig';

export class CommanderUnit extends BaseUnit {
    
    constructor(id: string, type: UnitType, team: 'PLAYER' | 'ENEMY', initialBuffs: string[], upgrades: UnitType[], difficultyMult: number) {
        super(id, type, team, initialBuffs, upgrades, difficultyMult);
        
        // Special initialization for Vanguard: Start in WAITING state for charge
        if (type === UnitType.COMMANDER_VANGUARD) {
            this.aiState = 'WAITING';
            this.aiTimer = 0;
        }
    }

    /**
     * Inspector Method:
     * When a new ally is spawned on the field, this Commander checks if 
     * the new unit qualifies for its aura/buff.
     * 
     * This logic defines the "Synergy" rules of the game.
     */
    public onAllySpawned(newUnit: BaseUnit) {
        const myClass = UNIT_STATS[this.type]?.commanderClass;
        
        if (!myClass || myClass === CommanderClass.NONE) return;

        switch (myClass) {
            case CommanderClass.WARLORD:
                // Bloodlust: Buffs Infantry
                if (newUnit.type === UnitType.INFANTRY) {
                    newUnit.addBuff('FRENZY');
                }
                break;

            case CommanderClass.GUARDIAN:
                // Phalanx: Buffs Shield
                if (newUnit.type === UnitType.SHIELD) {
                    newUnit.addBuff('HEAL');
                }
                break;

            case CommanderClass.ELF:
                // Eagle Eye: Buffs Archers
                if (newUnit.type === UnitType.ARCHER) {
                    newUnit.addBuff('ELF_RANGE');
                }
                break;

            case CommanderClass.VANGUARD:
                // Blitzkrieg: Buffs Spears
                if (newUnit.type === UnitType.SPEAR) {
                    newUnit.addBuff('VANGUARD_PASSIVE');
                }
                break;

            case CommanderClass.CENTURION:
                // Centurion's ability is static (extra units at start), 
                // handled in App.tsx / Initial Config. 
                // No active aura to apply to new units here.
                break;
        }
    }

    protected updateBehavior(delta: number, speedMultiplier: number) {
        // Only Vanguard has custom movement logic (Charge)
        if (this.type !== UnitType.COMMANDER_VANGUARD) return;

        // 1. Manage Buff State Visualization based on AI State
        const chargeBuff = 'SPEAR_CHARGE';
        const hasBuff = this.buffs.includes(chargeBuff);
        const isChargingState = this.aiState === 'WAITING' || this.aiState === 'CHARGING';

        if (isChargingState && !hasBuff) this.buffs.push(chargeBuff);
        else if (!isChargingState && hasBuff) this.buffs = this.buffs.filter(b => b !== chargeBuff);

        // 2. State Machine (Same logic as SpearUnit)
        if (this.aiState && this.aiState !== 'NORMAL') {
            this.aiTimer = (this.aiTimer || 0) + (delta * speedMultiplier);
            
            if (this.aiState === 'WAITING') {
                // Wait for 2 seconds before charging
                if (this.aiTimer >= 2000) this.aiState = 'CHARGING';
            } else if (this.aiState === 'CHARGING') {
                // Charge towards enemy side (Simple 1D charge)
                const targetX = this.team === 'PLAYER' ? 90 : 10;
                const distToTarget = Math.abs(targetX - this.x);
                
                // Charge speed based on stats
                const chargeSpeed = this.moveSpeed * (delta / 16) * speedMultiplier;
                const dir = Math.sign(targetX - this.x);
                
                this.x += dir * chargeSpeed;
                
                // End charge if close to edge
                if (distToTarget < 2) this.aiState = 'NORMAL';
            }
        }
    }
}
