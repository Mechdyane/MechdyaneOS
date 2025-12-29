
import React from 'react';

const Calendar: React.FC = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date();
  const currentDay = date.getDate();
  
  // Simple mock month view
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-8 flex flex-col h-full bg-slate-900/40 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight font-orbitron">Neural Calendar</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
           <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><i className="fas fa-chevron-left text-xs"></i></button>
           <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><i className="fas fa-chevron-right text-xs"></i></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map(d => (
          <div key={d} className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {monthDays.map(d => (
          <div 
            key={d} 
            className={`
              min-h-[60px] md:min-h-[100px] p-2 md:p-3 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer
              ${d === currentDay 
                ? 'bg-blue-600/10 border-blue-500/40 ring-1 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                : 'bg-slate-800/40 border-white/5 hover:border-white/20'}
            `}
          >
            <span className={`text-[10px] font-black font-orbitron ${d === currentDay ? 'text-blue-400 scale-125 origin-top-left ml-1' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {d.toString().padStart(2, '0')}
            </span>
            
            {/* Mock Events */}
            <div className="space-y-1 mt-2">
               {d === 15 && <div className="h-1 w-full bg-emerald-500 rounded-full" title="Mastery Check: HW Logic"></div>}
               {d === currentDay && <div className="h-1 w-full bg-blue-500 rounded-full animate-pulse" title="Active Learning Session"></div>}
               {d === 28 && <div className="h-1 w-full bg-purple-500 rounded-full" title="Exam: Synaptic Integration"></div>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
               <i className="fas fa-fire text-orange-500"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Streak Maintenance Zone</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase">Complete Level 2 by 23:59 to sustain link.</p>
            </div>
         </div>
         <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all">Schedule Override</button>
      </div>
    </div>
  );
};

export default Calendar;
