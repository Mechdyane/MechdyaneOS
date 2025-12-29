
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', icon: 'fa-chart-pie', label: 'Dashboard' },
    { path: '/modules', icon: 'fa-cubes', label: 'Modules' },
    { path: '/assistant', icon: 'fa-robot', label: 'Core AI' },
    { path: '/emotions', icon: 'fa-heart-pulse', label: 'Emotions' },
    { path: '/profile', icon: 'fa-user-circle', label: 'Profile' },
  ];

  return (
    <aside className="w-20 md:w-64 glass h-screen sticky top-0 flex flex-col items-center py-8 border-r border-slate-800 transition-all">
      <div className="flex items-center gap-3 mb-12 px-6">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center glow-blue">
          <i className="fas fa-microchip text-xl text-white"></i>
        </div>
        <span className="hidden md:block font-orbitron text-lg font-bold gradient-text tracking-widest">
          MECHDYANE
        </span>
      </div>

      <nav className="flex-1 w-full px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
              ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
            `}
          >
            <i className={`fas ${item.icon} text-xl w-6 text-center group-hover:scale-110 transition-transform`}></i>
            <span className="hidden md:block font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 w-full">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <i className="fas fa-fire text-orange-500"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Streak</p>
              <p className="text-sm font-orbitron text-slate-200">12 DAYS</p>
            </div>
          </div>
        </div>
        <button className="w-full mt-4 flex items-center justify-center gap-3 text-slate-500 hover:text-red-400 transition-colors p-4">
          <i className="fas fa-power-off"></i>
          <span className="hidden md:block text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
