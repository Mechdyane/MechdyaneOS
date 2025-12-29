
import React, { useState, useEffect } from 'react';

const SmartCalc: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<{ expr: string; res: string }[]>(() => {
    const saved = localStorage.getItem('mechdyane_calc_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isScientific, setIsScientific] = useState(false);

  useEffect(() => {
    localStorage.setItem('mechdyane_calc_history', JSON.stringify(history));
  }, [history]);

  const handleInput = (val: string) => {
    if (result !== null) {
      if (!isNaN(Number(val)) || val === '.') {
        setExpression(val);
        setResult(null);
        return;
      } else {
        setExpression(result + val);
        setResult(null);
        return;
      }
    }
    setExpression(prev => prev + val);
  };

  const handleBackspace = () => {
    if (result !== null) {
      setResult(null);
      return;
    }
    setExpression(prev => prev.slice(0, -1));
  };

  const clear = () => {
    setExpression('');
    setResult(null);
  };

  const calculate = () => {
    if (!expression) return;
    try {
      let cleanExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');

      // eslint-disable-next-line no-eval
      const evaluated = eval(cleanExpr);
      const finalRes = Number.isInteger(evaluated) ? evaluated.toString() : evaluated.toFixed(4).replace(/\.?0+$/, '');
      
      setResult(finalRes);
      setHistory(prev => [{ expr: expression, res: finalRes }, ...prev].slice(0, 10));
    } catch (e) {
      setResult('SYNTAX ERROR');
    }
  };

  const scientificButtons = [
    { label: 'sin', val: 'sin(' }, { label: 'cos', val: 'cos(' }, { label: 'tan', val: 'tan(' }, { label: '^', val: '^' },
    { label: 'log', val: 'log(' }, { label: 'ln', val: 'ln(' }, { label: '√', val: 'sqrt(' }, { label: 'π', val: 'π' },
    { label: '(', val: '(' }, { label: ')', val: ')' }, { label: 'e', val: 'e' }, { label: '%', val: '/100' }
  ];

  const standardButtons = [
    { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' }, { label: '÷', val: '÷', color: 'text-blue-400' },
    { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' }, { label: '×', val: '×', color: 'text-blue-400' },
    { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '-', val: '-', color: 'text-blue-400' },
    { label: '0', val: '0' }, { label: '.', val: '.' }, { label: '=', action: calculate, color: 'bg-blue-600 text-white' }, { label: '+', val: '+', color: 'text-blue-400' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617]/40 select-none">
      <div className="p-4 md:p-10 flex-1 flex flex-col space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-center">
          <div className="text-left">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter font-orbitron">Logic Processor</h2>
            <p className="text-[7px] md:text-[8px] font-black text-blue-400 uppercase tracking-[0.4em]">Engine v2.1</p>
          </div>
          <button 
            onClick={() => setIsScientific(!isScientific)}
            className={`px-3 py-1.5 rounded-lg border text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all ${isScientific ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}
          >
            {isScientific ? 'Standard' : 'Scientific'}
          </button>
        </header>

        {/* Display Unit */}
        <div className="bg-black/60 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-end min-h-[100px] md:min-h-[140px] gap-2">
          <div className="text-right space-y-1">
            <div className="text-slate-500 text-xs md:text-sm font-medium font-orbitron truncate opacity-60">
              {expression || '0'}
            </div>
            <div className={`text-2xl md:text-4xl font-black font-orbitron truncate ${result === 'SYNTAX ERROR' ? 'text-red-500' : 'text-blue-400'}`}>
              {result !== null ? result : (expression ? '' : '0')}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          <button onClick={clear} className="h-12 md:h-14 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-red-500 transition-all active:scale-95 text-[10px] md:text-xs uppercase tracking-widest">AC</button>
          <button onClick={handleBackspace} className="h-12 md:h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-slate-400 transition-all active:scale-95"><i className="fas fa-backspace text-sm"></i></button>
          <div className="col-span-2"></div>

          {isScientific && scientificButtons.map(btn => (
            <button 
              key={btn.label}
              onClick={() => handleInput(btn.val)}
              className="h-12 md:h-14 bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-500/10 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-indigo-400 text-[10px] md:text-xs transition-all active:scale-95"
            >
              {btn.label}
            </button>
          ))}

          {standardButtons.map(btn => (
            <button 
              key={btn.label}
              onClick={() => btn.action ? btn.action() : handleInput(btn.val!)}
              className={`h-12 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black transition-all active:scale-95 text-base md:text-lg border border-white/5 shadow-lg ${btn.color || 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* History Log */}
        {!isScientific && history.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Cache</h3>
            <div className="space-y-2">
              {history.slice(0, 3).map((h, i) => (
                <div 
                  key={i} 
                  onClick={() => { setExpression(h.res); setResult(null); }}
                  className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] group cursor-pointer transition-all"
                >
                  <span className="text-[9px] font-medium text-slate-500 truncate pr-4">{h.expr}</span>
                  <span className="text-[10px] font-black text-blue-400 font-orbitron shrink-0">= {h.res}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <footer className="p-4 md:p-6 bg-slate-900/40 border-t border-white/5 text-center">
         <p className="text-[7px] md:text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">Mechdyane Core Active</p>
      </footer>
    </div>
  );
};

export default SmartCalc;
