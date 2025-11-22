
import React, { useState, useEffect, useRef } from 'react';
import { Diamond } from 'lucide-react';

interface GemCounterProps {
  amount: number;
  bonus?: number; // If > 0, triggers the "count up" animation for Rewards
  className?: string;
  showBackground?: boolean;
}

interface FloatingGem {
  id: string;
  value: number;
}

export const GemCounter: React.FC<GemCounterProps> = ({ 
  amount, 
  bonus = 0, 
  className = "",
  showBackground = true
}) => {
  const [displayValue, setDisplayValue] = useState(amount);
  const [floaters, setFloaters] = useState<FloatingGem[]>([]);
  const [isBumping, setIsBumping] = useState(false);
  
  const prevAmount = useRef(amount);
  const bumpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAmountRef = useRef(amount); // Track latest prop for async operations

  useEffect(() => {
      currentAmountRef.current = amount;
  }, [amount]);

  // --- Bonus Mode (Reward Screen) ---
  // Runs only on mount/bonus change to trigger the initial "Win" animation
  useEffect(() => {
    if (bonus > 0) {
        // Start visual at [total - bonus]
        setDisplayValue(amount - bonus);
        
        // Add a single large floater for the bonus
        const id = `bonus-${Date.now()}`;
        setFloaters([{ id, value: bonus }]);

        // Clean up floater
        setTimeout(() => {
            setFloaters(prev => prev.filter(f => f.id !== id));
        }, 2000);
        
        // Trigger Bump & Update to final value
        const tBump = setTimeout(() => {
            triggerBump();
            setDisplayValue(currentAmountRef.current);
        }, 2100); 

        return () => clearTimeout(tBump);
    }
  }, []); 

  // --- Real-time Mode (Battle UI) ---
  // Watches for prop changes to handle spending or gaining gems
  useEffect(() => {
    // If amount decreased (Spending), update immediately without flair
    if (amount < prevAmount.current) {
        setDisplayValue(amount);
    } 
    // If amount increased
    else if (amount > prevAmount.current) {
        // Ensure we don't double-trigger if this was the mount-bonus update
        // Logic: If bonus > 0, the mount effect handles the *initial* gap. 
        // But if we gain gems dynamically in a screen that has a bonus prop (unlikely but safe to check),
        // we generally want the float behavior for "new" gains.
        // Since RewardScreen bonus is static, this block mainly serves BattleUI where bonus=0.
        
        if (bonus === 0) {
            const diff = amount - prevAmount.current;
            const id = `float-${Date.now()}-${Math.random()}`;
            
            // 1. Spawn Floater immediately
            setFloaters(prev => [...prev, { id, value: diff }]);

            // 2. Schedule Removal of this specific floater
            setTimeout(() => {
                setFloaters(prev => prev.filter(f => f.id !== id));
            }, 1500);

            // 3. Schedule Counter Update & Bump
            // We debounce the main display update slightly so it feels like the gems "arrive"
            if (bumpTimeoutRef.current) clearTimeout(bumpTimeoutRef.current);
            
            bumpTimeoutRef.current = setTimeout(() => {
                triggerBump();
                setDisplayValue(currentAmountRef.current);
            }, 600);
        }
    }
    prevAmount.current = amount;
  }, [amount, bonus]);

  const triggerBump = () => {
      setIsBumping(false);
      // Force reflow-like delay
      setTimeout(() => setIsBumping(true), 50);
      setTimeout(() => setIsBumping(false), 300);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
       <style>{`
        @keyframes gem-float-up-fade {
            0% { transform: translateY(100%) scale(0.5); opacity: 0; }
            20% { transform: translateY(0) scale(1.2); opacity: 1; }
            100% { transform: translateY(-150%) scale(1); opacity: 0; }
        }
        .animate-gem-float {
            animation: gem-float-up-fade 1.2s ease-out forwards;
        }
      `}</style>
      <div className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 relative
        ${showBackground ? 'bg-black/40' : 'bg-transparent'}
        ${floaters.length > 0 ? 'border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-slate-600'}
        ${isBumping ? 'scale-125 bg-cyan-900/50 border-cyan-400' : 'scale-100'}
      `}>
        <Diamond size={14} className={`transition-colors duration-300 ${isBumping ? 'text-white fill-white' : 'text-cyan-400 fill-cyan-400'}`} />
        <span className={`font-mono font-bold min-w-[24px] text-right transition-colors duration-300 ${isBumping ? 'text-white' : 'text-cyan-300'}`}>
          {displayValue}
        </span>

        {/* Multiple Floaters: Absolute positioned relative to the container, shifted right */}
        {floaters.map(f => (
            <span key={f.id} className="absolute top-0 right-0 translate-x-full ml-2 text-xs font-bold text-cyan-300 animate-gem-float whitespace-nowrap drop-shadow-md pointer-events-none">
              +{f.value}
            </span>
        ))}
      </div>
    </div>
  );
};
    