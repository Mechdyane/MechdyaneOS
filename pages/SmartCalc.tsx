
import React, { useState } from 'react';

const SmartCalc: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [lastOp, setLastOp] = useState<string | null>(null);

  const handleInput = (val: string) => {
    if (display === '0' || lastOp) {
      setDisplay(val);
      setLastOp(null);
    } else {
      setDisplay(display + val);
    }
  };

  const handleOp = (op: string) => {
    setLastOp(op);
    setDisplay(display + ' ' + op + ' ');
  };

  const calculate = () => {
    try {
      // Basic eval for demo, in production use a math library
      const result = eval(display.replace(/×/g, '*').replace(/÷/g, '/'));
      const equation = `${display} = ${result}`;
      setHistory([equation, ...history].slice(0, 5));
      setDisplay(String(result));
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setLastOp(null);
  };

  const buttons = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '-',
    '0', '.', 'C', '+'
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617]/40">
      <div className="p-8 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="text-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter font-orbitron">Logic Processor</h2>
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em]">Mathematical Engine</p>
        </div>

        <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
          <div className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Live Output</div>
          <div className="text-4xl font-black text-blue-400 text-right font-orbitron truncate">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {buttons.map(btn => (
            <button 
              key={btn}
              onClick={() => {
                if (btn === 'C') clear();
                else if (['+', '-', '×', '÷'].includes(btn)) handleOp(btn);
                else handleInput(btn);
              }}
              className="h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center font-black text-slate-300 hover:text-white transition-all active:scale-95"
            >
              {btn}
            </button>
          ))}
          <button 
            onClick={calculate}
            className="col-span-4 h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase tracking-widest transition-all active:scale-95 font-orbitron"
          >
            Execute Computation
          </button>
        </div>

        {history.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-white/5">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Synaptic Log</h3>
            {history.map((h, i) => (
              <div key={i} className="text-[10px] font-medium text-slate-400 border-l-2 border-blue-500/30 pl-3 py-1">
                {h}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartCalc;
