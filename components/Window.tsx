
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface WindowProps {
  id: string;
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
  id, title, icon, children, onClose, onMinimize, onMaximize, onFocus, zIndex, isActive, isMaximized, isMinimized
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pos, setPos] = useState({ 
    x: isMobile ? 0 : 100 + (zIndex % 15) * 20, 
    y: isMobile ? 0 : 60 + (zIndex % 15) * 20 
  });
  const [size, setSize] = useState({ 
    width: isMobile ? window.innerWidth : 800, 
    height: isMobile ? window.innerHeight - 56 : 550 
  });
  
  const isDragging = useRef(false);
  const resizeDir = useRef<string | null>(null);
  const startPointerPos = useRef({ x: 0, y: 0 });
  const startWindowPos = useRef({ x: 0, y: 0 });
  const startWindowSize = useRef({ w: 0, h: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSize({ width: window.innerWidth, height: window.innerHeight - 56 });
        setPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    onFocus();
    if (isMaximized || isMobile) return;
    
    if ((e.target as HTMLElement).closest('.window-title-bar')) {
      isDragging.current = true;
      startPointerPos.current = { x: e.clientX, y: e.clientY };
      startWindowPos.current = { x: pos.x, y: pos.y };
      document.body.style.userSelect = 'none';
    }
  };

  const handleResizeStart = (e: React.PointerEvent, direction: string) => {
    e.stopPropagation();
    onFocus();
    if (isMaximized || isMobile) return;

    resizeDir.current = direction;
    startPointerPos.current = { x: e.clientX, y: e.clientY };
    startWindowSize.current = { w: size.width, h: size.height };
    startWindowPos.current = { x: pos.x, y: pos.y };
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - startPointerPos.current.x;
        const dy = e.clientY - startPointerPos.current.y;
        setPos({
          x: startWindowPos.current.x + dx,
          y: startWindowPos.current.y + dy
        });
      } else if (resizeDir.current) {
        const dx = e.clientX - startPointerPos.current.x;
        const dy = e.clientY - startPointerPos.current.y;
        const dir = resizeDir.current;
        const minW = 320;
        const minH = 200;

        let newW = startWindowSize.current.w;
        let newH = startWindowSize.current.h;
        let newX = startWindowPos.current.x;
        let newY = startWindowPos.current.y;

        if (dir.includes('e')) newW = Math.max(minW, startWindowSize.current.w + dx);
        if (dir.includes('s')) newH = Math.max(minH, startWindowSize.current.h + dy);
        
        if (dir.includes('w')) {
          const delta = Math.min(startWindowSize.current.w - minW, dx);
          newW = startWindowSize.current.w - delta;
          newX = startWindowPos.current.x + delta;
        }
        
        if (dir.includes('n')) {
          const delta = Math.min(startWindowSize.current.h - minH, dy);
          newH = startWindowSize.current.h - delta;
          newY = startWindowPos.current.y + delta;
        }

        setSize({ width: newW, height: newH });
        setPos({ x: newX, y: newY });
      }
    };

    const onUp = () => {
      isDragging.current = false;
      resizeDir.current = null;
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const getWindowTransform = () => {
    if (isMinimized) {
      return `translate(${pos.x}px, 110vh) scale(0.1) rotateX(45deg)`;
    }
    if (isMaximized || isMobile) {
      return `translate(0, 0)`;
    }
    return `translate(${pos.x}px, ${pos.y}px)`;
  };

  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: (isMaximized || isMobile) ? '100vw' : `${size.width}px`,
    height: (isMaximized || isMobile) ? 'calc(100vh - 56px)' : `${size.height}px`,
    zIndex: isActive ? zIndex + 5000 : zIndex,
    borderRadius: (isMaximized || isMobile) ? '0' : '24px',
    transform: getWindowTransform(),
    transformOrigin: isMinimized ? 'center bottom' : 'center center',
    opacity: isMinimized ? 0 : 1,
    filter: isMinimized ? 'blur(40px)' : 'none',
    pointerEvents: isMinimized ? 'none' : 'auto',
    transition: (isDragging.current || resizeDir.current) 
      ? 'none' 
      : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1.1), opacity 0.4s ease, border-radius 0.3s ease',
  };

  return (
    <div 
      ref={windowRef}
      className={`glass shadow-2xl absolute flex flex-col overflow-hidden select-none border-white/10 ${
        isActive ? 'ring-2 ring-blue-500/40' : ''
      } ${isMobile ? 'border-none' : 'border'}`}
      style={windowStyle}
      onPointerDown={onFocus}
    >
      <div className="absolute inset-0 os-grid opacity-[0.04] pointer-events-none"></div>
      
      {!isMaximized && !isMobile && (
        <>
          <div className="absolute inset-x-0 -top-1 h-4 cursor-ns-resize z-50" onPointerDown={(e) => handleResizeStart(e, 'n')} />
          <div className="absolute inset-x-0 -bottom-1 h-4 cursor-ns-resize z-50" onPointerDown={(e) => handleResizeStart(e, 's')} />
          <div className="absolute inset-y-0 -left-1 w-4 cursor-ew-resize z-50" onPointerDown={(e) => handleResizeStart(e, 'w')} />
          <div className="absolute inset-y-0 -right-1 w-4 cursor-ew-resize z-50" onPointerDown={(e) => handleResizeStart(e, 'e')} />
        </>
      )}

      <div 
        className={`window-title-bar h-14 md:h-12 flex items-center justify-between ${isMobile ? 'px-4' : 'px-5'} bg-white/[0.03] border-b border-white/10 shrink-0 relative z-[60] transition-colors ${
          isActive ? 'bg-blue-600/5' : ''
        } ${isMaximized || isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}
        onPointerDown={handlePointerDown}
        onDoubleClick={!isMobile ? onMaximize : undefined}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-all ${
            isActive ? 'bg-blue-600/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800/40 border-white/10'
          }`}>
            <i className={`fas ${icon} ${isActive ? 'text-blue-400' : 'text-slate-500'} text-xs`}></i>
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className={`font-orbitron font-black uppercase tracking-widest text-[9px] md:text-[10px] leading-none transition-colors truncate block ${
              isActive ? 'text-white' : 'text-slate-500'
            }`}>
              {title}
            </span>
            <span className="text-[6px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1.5 truncate">
              {isMobile ? 'Mobile Interface' : (isMaximized ? 'Primary Node' : 'Sub-Node')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className="flex items-center gap-1">
            {!isMobile && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all text-slate-400" title="Minimize">
                  <i className="fas fa-minus text-[10px]"></i>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all text-slate-400" title={isMaximized ? "Restore" : "Maximize"}>
                  <i className={`${isMaximized ? 'fas fa-compress' : 'far fa-square'} text-[10px]`}></i>
                </button>
              </>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-600/10 md:bg-transparent hover:bg-red-600 text-red-500 md:text-slate-400 hover:text-white transition-all active:scale-90"
              title="Close"
            >
              <i className="fas fa-times text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-[#020617]/95 md:bg-[#020617]/80 backdrop-blur-md relative z-10">
        <div className="h-full w-full overflow-auto custom-scrollbar scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Window;
