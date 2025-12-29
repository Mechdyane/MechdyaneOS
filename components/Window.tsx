
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface WindowProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  zIndex: number;
  isActive: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
}

const Window: React.FC<WindowProps> = ({ 
  title, icon, children, onClose, onMinimize, onMaximize, onFocus, zIndex, isActive, isMaximized, isMinimized
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pos, setPos] = useState({ 
    x: isMobile ? 8 : 100 + (zIndex % 15) * 15, 
    y: isMobile ? 8 : 60 + (zIndex % 15) * 15 
  });
  const [size, setSize] = useState({ 
    width: isMobile ? window.innerWidth - 16 : 800, 
    height: isMobile ? window.innerHeight - 120 : 550 
  });
  const [scale, setScale] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);
  const [resizing, setResizing] = useState<string | null>(null);
  
  const interactionStart = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isMaximized) {
        setSize({ width: window.innerWidth - 16, height: window.innerHeight - 130 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || isMobile) {
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = Math.pow(1.1, delta / 120);
      setScale(prev => Math.max(0.4, Math.min(2.0, prev * factor)));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isMaximized) return;
    onFocus();
    if ((e.target as HTMLElement).closest('.window-title-bar')) {
      setIsInteracting(true);
      interactionStart.current = { x: e.clientX, y: e.clientY };
      windowStartPos.current = { x: pos.x, y: pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleResizeStart = (e: React.PointerEvent, direction: string) => {
    e.stopPropagation();
    if (isMaximized) return;
    onFocus();
    setResizing(direction);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height,
      px: pos.x,
      py: pos.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (isInteracting) {
      const dx = e.clientX - interactionStart.current.x;
      const dy = e.clientY - interactionStart.current.y;
      setPos({
        x: windowStartPos.current.x + dx,
        y: windowStartPos.current.y + dy
      });
    } else if (resizing) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      let newW = resizeStart.current.w;
      let newH = resizeStart.current.h;
      let newX = resizeStart.current.px;
      let newY = resizeStart.current.py;
      const minW = isMobile ? 260 : 320;
      const minH = isMobile ? 120 : 180;
      if (resizing.includes('e')) newW = Math.max(minW, resizeStart.current.w + dx);
      if (resizing.includes('s')) newH = Math.max(minH, resizeStart.current.h + dy);
      if (resizing.includes('w')) {
        const delta = Math.min(resizeStart.current.w - minW, dx);
        newW = resizeStart.current.w - delta;
        newX = resizeStart.current.px + delta;
      }
      if (resizing.includes('n')) {
        const delta = Math.min(resizeStart.current.h - minH, dy);
        newH = resizeStart.current.h - delta;
        newY = resizeStart.current.py + delta;
      }
      setSize({ width: newW, height: newH });
      setPos({ x: newX, y: newY });
    }
  }, [isInteracting, resizing, isMobile]);

  const handlePointerUp = useCallback(() => {
    setIsInteracting(false);
    setResizing(null);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const windowStyle: React.CSSProperties = isMaximized 
    ? {
        width: '100vw',
        height: 'calc(100vh - 56px)', 
        left: 0,
        top: 0,
        borderRadius: 0,
        zIndex: zIndex + 2000,
        transform: `scale(${scale})`,
        opacity: isMinimized ? 0 : 1,
        pointerEvents: isMinimized ? 'none' : 'auto',
        transition: isInteracting || resizing ? 'none' : 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }
    : { 
        width: `${size.width}px`, 
        height: `${size.height}px`, 
        left: `${pos.x}px`, 
        top: `${pos.y}px`, 
        zIndex,
        borderRadius: isMobile ? '28px' : '24px',
        transform: `scale(${isMinimized ? 0.85 : scale})`,
        opacity: isMinimized ? 0 : 1,
        filter: isMinimized ? 'blur(20px) brightness(0.5)' : 'none',
        pointerEvents: isMinimized ? 'none' : 'auto',
        transition: isInteracting || resizing ? 'none' : 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
      };

  return (
    <div 
      ref={windowRef}
      onWheel={handleWheel}
      className={`glass shadow-2xl absolute flex flex-col overflow-hidden animate-window-zoom border border-white/10 select-none ${
        isActive ? 'ring-2 ring-blue-500/40 shadow-[0_20px_60px_rgba(59,130,246,0.15)]' : 'shadow-[0_10px_40px_rgba(0,0,0,0.4)]'
      }`}
      style={windowStyle}
      onPointerDown={onFocus}
    >
      <div className="absolute inset-0 os-grid opacity-[0.04] pointer-events-none"></div>
      {isInteracting && (
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none z-0"></div>
      )}

      {!isMaximized && (
        <>
          <div className="absolute inset-x-0 -top-1 h-4 cursor-ns-resize z-50" onPointerDown={(e) => handleResizeStart(e, 'n')} />
          <div className="absolute inset-x-0 -bottom-1 h-4 cursor-ns-resize z-50" onPointerDown={(e) => handleResizeStart(e, 's')} />
          <div className="absolute inset-y-0 -left-1 w-4 cursor-ew-resize z-50" onPointerDown={(e) => handleResizeStart(e, 'w')} />
          <div className="absolute inset-y-0 -right-1 w-4 cursor-ew-resize z-50" onPointerDown={(e) => handleResizeStart(e, 'e')} />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 cursor-nwse-resize z-50 flex items-end justify-end p-1 opacity-20 hover:opacity-100" onPointerDown={(e) => handleResizeStart(e, 'se')}>
            <div className="w-4 h-4 border-r-2 border-b-2 border-white/40 rounded-br-lg"></div>
          </div>
        </>
      )}

      <div 
        className={`window-title-bar h-14 md:h-12 flex items-center justify-between ${isMobile && isMaximized ? 'px-2' : 'px-3 md:px-5'} bg-white/[0.03] border-b border-white/10 shrink-0 relative z-[60] transition-colors ${
          isActive ? 'bg-blue-600/5' : ''
        } ${isMaximized ? '' : 'cursor-grab active:cursor-grabbing'}`}
        onPointerDown={handlePointerDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          {/* Hide icon on mobile when maximized to save space */}
          {(!isMobile || !isMaximized) && (
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-all ${
              isActive ? 'bg-blue-600/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800/40 border-white/10'
            }`}>
              <i className={`fas ${icon} ${isActive ? 'text-blue-400' : 'text-slate-500'} text-xs`}></i>
            </div>
          )}
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className={`font-orbitron font-black uppercase tracking-widest text-[9px] md:text-[10px] leading-none transition-colors truncate block ${
              isActive ? 'text-white' : 'text-slate-500'
            }`}>
              {title}
            </span>
            {/* Hide subtitle on mobile when maximized */}
            {(!isMobile || !isMaximized) && (
              <span className="text-[6px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1.5 hidden xs:block truncate">
                {isMaximized ? 'Primary Node' : 'Sub-Node Interface'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-2">
          {scale !== 1 && (
            <button 
              onClick={() => setScale(1)}
              className="px-2 py-1 rounded-lg bg-blue-600/10 text-[7px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20 hover:bg-blue-600/20 transition-all mr-1 md:mr-2"
            >
              <span className="hidden xs:inline">RESET: </span>{Math.round(scale * 100)}%
            </button>
          )}
          
          <div className="flex items-center gap-0.5 md:gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              className={`${isMobile && isMaximized ? 'w-8 h-8' : 'w-9 h-9 md:w-8 md:h-8'} flex items-center justify-center rounded-xl hover:bg-white/5 transition-all text-slate-400 active:scale-90`}
              title="Minimize"
            >
              <i className="fas fa-minus text-[10px]"></i>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onMaximize(); }}
              className={`${isMobile && isMaximized ? 'w-8 h-8' : 'w-9 h-9 md:w-8 md:h-8'} flex items-center justify-center rounded-xl hover:bg-white/5 transition-all text-slate-400 active:scale-90`}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <i className={`${isMaximized ? 'fas fa-compress' : 'far fa-square'} text-[10px]`}></i>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className={`${isMobile && isMaximized ? 'w-8 h-8' : 'w-9 h-9 md:w-8 md:h-8'} flex items-center justify-center rounded-xl hover:bg-red-600 text-white transition-all active:scale-90 shadow-lg shadow-red-600/10`}
              title="Close"
            >
              <i className="fas fa-times text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-[#020617]/80 backdrop-blur-md relative z-10">
        <div className="h-full w-full overflow-auto custom-scrollbar scroll-smooth">
          {children}
        </div>
      </div>

      {isMobile && !isMinimized && !isInteracting && !resizing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-20 animate-pulse z-[70] flex flex-col items-center gap-1">
           <i className="fas fa-chevron-up text-[8px] text-slate-500"></i>
           <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em]">Interactive Hub</p>
        </div>
      )}
    </div>
  );
};

export default Window;
