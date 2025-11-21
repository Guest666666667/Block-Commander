
import { UnitType } from '../../types';
import { BaseUnit } from './BaseUnit';

export class SpearUnit extends BaseUnit {
    
    constructor(id: string, team: 'PLAYER' | 'ENEMY', initialBuffs: string[], upgrades: UnitType[], difficultyMult: number) {
        super(id, UnitType.SPEAR, team, initialBuffs, upgrades, difficultyMult);
        this.aiState = 'WAITING';
        this.aiTimer = 0;
    }

    protected updateBehavior(delta: number, speedMultiplier: number) {
        // 1. Manage Buff State Visualization based on AI State
        const chargeBuff = 'SPEAR_CHARGE';
        const hasBuff = this.buffs.includes(chargeBuff);
        const isChargingState = this.aiState === 'WAITING' || this.aiState === 'CHARGING';

        if (isChargingState && !hasBuff) this.buffs.push(chargeBuff);
        else if (!isChargingState && hasBuff) this.buffs = this.buffs.filter(b => b !== chargeBuff);

        // 2. State Machine
        if (this.aiState && this.aiState !== 'NORMAL') {
            this.aiTimer = (this.aiTimer || 0) + (delta * speedMultiplier);
            
            if (this.aiState === 'WAITING') {
                if (this.aiTimer >= 2000) this.aiState = 'CHARGING';
            } else if (this.aiState === 'CHARGING') {
                // Charge towards enemy side (Simple 1D charge)
                const targetX = this.team === 'PLAYER' ? 90 : 10;
                const distToTarget = Math.abs(targetX - this.x);
                
                // Charge speed based on stats (which includes the Buff we just added)
                const chargeSpeed = this.moveSpeed * (delta / 16) * speedMultiplier;
                const dir = Math.sign(targetX - this.x);
                
                this.x += dir * chargeSpeed;
                
                // End charge if close to edge
                if (distToTarget < 2) this.aiState = 'NORMAL';
            }
        }
    }
}
