
import React from 'react';
import { AppId } from '../types';
import { SOFTWARE_CATALOG } from '../constants';

interface DesktopProps {
  installedAppIds: AppId[];
  onIconClick: (id: AppId) => void;
}

const Desktop: React.FC<DesktopProps> = ({ installedAppIds, onIconClick }) => {
  const icons = SOFTWARE_CATALOG.filter(a => installedAppIds.includes(a.id));

  return (
    <div className="flex flex-wrap gap-8 p-12 overflow-y-auto pointer-events-auto">
      {icons.map((item) => (
        <button
          key={item.id}
          onClick={() => onIconClick(item.id)}
          className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all group w-28 h-28"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
            <i className={`fas ${item.icon} text-2xl text-blue-400 group-hover:text-white`}></i>
          </div>
          <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 transition-all tracking-widest uppercase text-center">{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Desktop;
