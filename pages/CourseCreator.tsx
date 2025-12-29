
import React, { useState } from 'react';
import { ModuleCategory, LearningModule } from '../types';

interface CourseCreatorProps {
  onAddModule: (module: LearningModule) => void;
}

const CourseCreator: React.FC<CourseCreatorProps> = ({ onAddModule }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Fixed mapping of non-existent ModuleCategory.ACADEMIC to ARTS_HUMANITIES
  const [category, setCategory] = useState<ModuleCategory>(ModuleCategory.ARTS_HUMANITIES);
  const [icon, setIcon] = useState('fa-book');
  const [color, setColor] = useState('bg-blue-600');
  const [objectives, setObjectives] = useState(['', '', '']);
  
  const colors = [
    { name: 'Blue', class: 'bg-blue-600' },
    { name: 'Emerald', class: 'bg-emerald-600' },
    { name: 'Indigo', class: 'bg-indigo-600' },
    { name: 'Amber', class: 'bg-amber-600' },
    { name: 'Rose', class: 'bg-rose-600' },
    { name: 'Slate', class: 'bg-slate-800' },
    { name: 'Violet', class: 'bg-violet-600' },
    { name: 'Teal', class: 'bg-teal-600' },
  ];

  const icons = [
    'fa-book', 'fa-laptop-code', 'fa-brain', 'fa-chart-line', 'fa-microchip', 'fa-gear', 'fa-dna', 'fa-atom', 'fa-palette'
  ];

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjs = [...objectives];
    newObjs[index] = value;
    setObjectives(newObjs);
  };

  const handleDeploy = () => {
    if (!title || !description) {
      alert("System Error: Incomplete Knowledge Node parameters.");
      return;
    }

    const newModule: LearningModule = {
      id: `custom-${Date.now()}`,
      title,
      description,
      category,
      icon,
      color,
      objectives: objectives.filter(o => o.trim() !== ''),
      outline: Array.from({ length: 12 }, (_, i) => `Layer ${i + 1}: Automated Curriculum Node`),
      progress: 0,
      lessonsFinished: 0,
      totalLessons: 12,
      difficulty: 'Custom Node',
      milestones: [], 
      isEnrolled: false
    };

    onAddModule(newModule);
    alert("Knowledge Node Deployed successfully to the Global Ecosystem.");
    // Reset form
    setTitle('');
    setDescription('');
    setObjectives(['', '', '']);
  };

  return (
    <div className="p-8 md:p-12 space-y-12 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar pb-32">
      <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight font-orbitron">Tutor Hub: Node Architect</h1>
          <p className="text-slate-500 font-medium">Design and deploy specialized Knowledge Nodes to the Mechdyane Ecosystem.</p>
        </div>
        <button 
          onClick={handleDeploy}
          className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 font-orbitron"
        >
          Deploy Node
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Core Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Node Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Bio-Engineering"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Category Sector</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ModuleCategory)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  {Object.values(ModuleCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Cognitive Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Define the scope of this knowledge vector..."
                  className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-4 px-6 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all h-32 resize-none"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Integrated Objectives</h2>
            <div className="space-y-3">
              {objectives.map((obj, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                    {i + 1}
                  </div>
                  <input 
                    type="text" 
                    value={obj}
                    onChange={(e) => handleObjectiveChange(i, e.target.value)}
                    placeholder="I will be able to..."
                    className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Visual Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Neural Signature (Color)</label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(c => (
                    <button 
                      key={c.class}
                      onClick={() => setColor(c.class)}
                      className={`w-full aspect-square rounded-xl border-2 transition-all ${c.class} ${color === c.class ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Node Icon</label>
                <div className="grid grid-cols-3 gap-2">
                  {icons.map(i => (
                    <button 
                      key={i}
                      onClick={() => setIcon(i)}
                      className={`w-full aspect-square rounded-xl border transition-all flex items-center justify-center text-xl ${icon === i ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-110' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                    >
                      <i className={`fas ${i}`}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Node Preview</h2>
            <div className={`rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden h-[300px] ${color}`}>
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <i className={`fas ${icon} text-[140px]`}></i>
               </div>
               <div className="relative z-10 h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 mb-8">
                      <i className={`fas ${icon} text-3xl text-white`}></i>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight uppercase font-orbitron">{title || 'Node Title'}</h3>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-4">{category}</p>
                  <p className="text-white/80 font-medium text-xs leading-relaxed line-clamp-2">
                    {description || 'This node is currently under construction by the architect...'}
                  </p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CourseCreator;
