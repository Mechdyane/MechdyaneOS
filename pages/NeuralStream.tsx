
import React, { useState, useEffect } from 'react';

interface NeuralStreamProps {
  isApiEnabled: boolean;
  setIsApiEnabled: (v: boolean) => void;
  pulseSpeed: number;
}

const NeuralStream: React.FC<NeuralStreamProps> = ({ isApiEnabled, setIsApiEnabled, pulseSpeed }) => {
  const [dataPoints, setDataPoints] = useState<number[]>(Array(20).fill(50));
  const [congestion, setCongestion] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [diagnosticStatus, setDiagnosticStatus] = useState<string | null>(null);

  // Simulated live data stream
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => {
        // More jitter during verification
        const jitterRange = isVerifying ? 80 : (congestion ? 20 : 60);
        const base = isVerifying ? 10 : (congestion ? 5 : 20);
        const next = [...prev.slice(1), Math.floor(Math.random() * jitterRange) + base];
        return next;
      });
    }, 500 / pulseSpeed);
    return () => clearInterval(interval);
  }, [pulseSpeed, congestion, isVerifying]);

  useEffect(() => {
    setCongestion(!isApiEnabled);
  }, [isApiEnabled]);

  const handleVerifyLogic = () => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    setDiagnosticStatus("INITIALIZING NEURAL HANDSHAKE...");
    
    // Simulated diagnostic sequence
    setTimeout(() => {
      setDiagnosticStatus("MEASURING PACKET LATENCY...");
      
      setTimeout(() => {
        const simulatedLatency = Math.floor(Math.random() * 2500) + 50; // 50ms - 2550ms
        
        if (simulatedLatency > 3000) {
          setIsApiEnabled(false);
          setDiagnosticStatus(`LATENCY CRITICAL: ${simulatedLatency}ms. ARCHIVE MODE ENGAGED.`);
        } else {
          setIsApiEnabled(true);
          setDiagnosticStatus(`LATENCY STABLE: ${simulatedLatency}ms. CORE LINK VERIFIED.`);
        }
        
        setIsVerifying(false);
        // Clear status after 3 seconds
        setTimeout(() => setDiagnosticStatus(null), 3000);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="p-6 md:p-12 space-y-10 h-full bg-[#020617]/40 overflow-y-auto custom-scrollbar">
      <header className="border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white font-orbitron">Synaptic Engine</h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Neural Stream Diagnostic and Configuration Hub</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5">
          <div className={`w-2 h-2 rounded-full ${isApiEnabled ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-widest font-orbitron ${isApiEnabled ? 'text-blue-400' : 'text-amber-400'}`}>
            {isApiEnabled ? 'Stream: Online' : 'Stream: Archive'}
          </span>
        </div>
      </header>

      {!isApiEnabled && !isVerifying && (
        <div className="bg-amber-600/5 border border-amber-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 animate-in zoom-in-95 duration-500">
           <div className="w-16 h-16 rounded-3xl bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <i className="fas fa-triangle-exclamation text-2xl animate-bounce"></i>
           </div>
           <div className="flex-1 space-y-2 text-center md:text-left">
              <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter font-orbitron">Neural Desync Detected</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xl">
                 High latency detected in the primary stream. OS has shifted to <span className="text-amber-500 font-bold">Static Archive Mode</span> to prevent data corruption. 
                 Manual verification required to re-establish real-time link.
              </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* THROUGHPUT VISUALIZER */}
        <div className="lg:col-span-2 bg-[#0a0f1e]/60 border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-orbitron">Synaptic Throughput</h3>
            <div className="flex items-center gap-3">
               <span className={`text-[10px] font-black font-orbitron ${congestion ? 'text-amber-500' : 'text-blue-400'}`}>
                  {Math.round(pulseSpeed * (congestion ? 25 : 100))} MHz
               </span>
               <div className={`w-1.5 h-1.5 rounded-full ${congestion ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'}`}></div>
            </div>
          </div>
          
          <div className="h-48 flex items-end gap-1 px-2 border-b border-white/5">
            {dataPoints.map((val, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t-sm transition-all duration-300 ${isVerifying ? 'bg-blue-400/40' : (congestion ? 'bg-amber-500/20' : 'bg-blue-600/30')}`}
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
          
          <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <span>Buffer Start</span>
            <span>{isVerifying ? 'Diagnostic Scan Active' : (congestion ? 'Restricted Archive Link' : 'Real-time Neural Stream')}</span>
          </div>
        </div>

        {/* ECOSYSTEM TUNING - Perfectly matched to reference */}
        <div className="space-y-6">
          <div className="bg-[#0a0f1e] border border-blue-500/20 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <i className="fas fa-info-circle text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] font-orbitron">Ecosystem Tuning</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed pr-4">
              Diagnostic Core is monitoring latency. If Real-time Stream latency exceeds 3000ms, the OS automatically shifts to Archive Mode.
            </p>

            <div className="pt-2">
              <button 
                onClick={handleVerifyLogic}
                disabled={isVerifying}
                className={`w-full py-4 bg-transparent border border-blue-500/30 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn font-orbitron ${isVerifying ? 'cursor-wait' : 'hover:bg-blue-500/10 hover:border-blue-500/50 active:scale-95'}`}
              >
                {isVerifying ? (
                   <div className="flex items-center justify-center gap-3">
                      <i className="fas fa-circle-notch animate-spin"></i>
                      <span>Verifying...</span>
                   </div>
                ) : (
                  "Verify Core Logic"
                )}
                {/* Simulated scanning light effect */}
                {isVerifying && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                )}
              </button>
            </div>

            {/* Diagnostic Message */}
            {diagnosticStatus && (
              <div className="pt-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest text-center border-t border-white/5 pt-4">
                  {diagnosticStatus}
                </p>
              </div>
            )}
          </div>

          {/* Quick Controls Card */}
          <div className="p-8 bg-[#0a0f1e]/80 border border-white/5 rounded-[2.5rem] space-y-6 shadow-xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-orbitron">Core Logic Switch</h3>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                 <i className={`fas fa-bolt text-xs ${isApiEnabled ? 'text-blue-400' : 'text-slate-600'}`}></i>
                 <span className="text-xs font-bold text-slate-300">Neural Sync</span>
              </div>
              <button 
                onClick={() => setIsApiEnabled(!isApiEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${isApiEnabled ? 'bg-blue-600 shadow-blue-500/20' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${isApiEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Archive Integrity</p>
                <p className="text-sm font-black text-emerald-500 font-orbitron">98.4% Available</p>
              </div>
              <i className="fas fa-check-double text-emerald-500 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default NeuralStream;
