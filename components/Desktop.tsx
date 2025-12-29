
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
    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-4 md:gap-8 p-4 md:p-12 overflow-y-auto pointer-events-auto">
      {icons.map((item) => (
        <button
          key={item.id}
          onClick={() => onIconClick(item.id)}
          className="flex flex-col items-center gap-2 md:gap-3 p-2 md:p-4 rounded-2xl hover:bg-white/5 transition-all group w-full sm:w-28 h-24 md:h-28"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
            <i className={`fas ${item.icon} text-xl md:text-2xl text-blue-400 group-hover:text-white`}></i>
          </div>
          <span className="text-[7px] md:text-[10px] font-black text-slate-500 group-hover:text-slate-200 transition-all tracking-widest uppercase text-center truncate w-full">
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Desktop;
