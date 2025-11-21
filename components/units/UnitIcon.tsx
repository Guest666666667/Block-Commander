
import React from 'react';
import { UnitType } from '../../types';
import { Sword, Shield, Target, Hexagon, User, Triangle, CircleOff, Swords, Crosshair, ShieldCheck, Tent, Zap } from 'lucide-react';
import { UNIT_COLORS } from './unitConfig';

interface UnitIconProps {
  type: UnitType;
  size?: number;
  className?: string;
  isUpgraded?: boolean;
}

export const UnitIcon: React.FC<UnitIconProps> = ({ type, size = 20, className = "", isUpgraded = false }) => {
  const colorClass = UNIT_COLORS[type] || 'bg-gray-500';
  
  let Icon = User;
  switch (type) {
    case UnitType.INFANTRY: Icon = isUpgraded ? Swords : Sword; break;
    case UnitType.ARCHER: Icon = isUpgraded ? Crosshair : Target; break;
    case UnitType.SHIELD: Icon = isUpgraded ? ShieldCheck : Shield; break;
    case UnitType.SPEAR: Icon = isUpgraded ? Tent : Triangle; break; 
    case UnitType.OBSTACLE: Icon = CircleOff; break;

    // Specific Commanders
    case UnitType.COMMANDER_CENTURION: Icon = Hexagon; break;
    case UnitType.COMMANDER_ELF: Icon = Crosshair; break;
    case UnitType.COMMANDER_WARLORD: Icon = Swords; break;
    case UnitType.COMMANDER_GUARDIAN: Icon = ShieldCheck; break;
    case UnitType.COMMANDER_VANGUARD: Icon = Zap; break;
  }

  return (
    <div className={`flex items-center justify-center rounded-md shadow-sm text-white ${colorClass} ${className}`} style={{ width: '100%', height: '100%' }}>
      <Icon size={size} strokeWidth={isUpgraded ? 3 : 2.5} />
    </div>
  );
};
