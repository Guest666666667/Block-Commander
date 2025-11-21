
import { CommanderClass, UnitType } from '../../types';
import { BaseUnit } from './BaseUnit';
import { UNIT_STATS } from './unitConfig';

export class CommanderUnit extends BaseUnit {
    
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
}
