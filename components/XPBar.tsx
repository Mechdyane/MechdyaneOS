
import React from 'react';

interface XPBarProps {
  currentXp: number;
  nextLevelXp: number;
  label?: string;
}

const XPBar: React.FC<XPBarProps> = ({ currentXp, nextLevelXp, label = "XP Progress" }) => {
  const percentage = Math.min(100, (currentXp / nextLevelXp) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-xs font-semibold text-blue-400 font-orbitron">
        <span>{label}</span>
        <span>{currentXp} / {nextLevelXp} XP</span>
      </div>
      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out glow-blue"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;
