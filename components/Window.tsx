
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
  const [pos, setPos] = useState({ x: 100 + (zIndex % 20) * 10, y: 50 + (zIndex % 20) * 10 });
  const [size, setSize] = useState({ width: 800, height: 550 });
  const [isDragging, setIsDragging] = useState(false);
  const [resizing, setResizing] = useState<string | null>(null);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile || isMaximized) return;
    onFocus();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
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
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragStart.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.current.y))
      });
    } else if (resizing) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      let newW = resizeStart.current.w;
      let newH = resizeStart.current.h;
      let newX = resizeStart.current.px;
      let newY = resizeStart.current.py;

      if (resizing.includes('e')) newW = Math.max(300, resizeStart.current.w + dx);
      if (resizing.includes('s')) newH = Math.max(200, resizeStart.current.h + dy);
      if (resizing.includes('w')) {
        const delta = Math.min(resizeStart.current.w - 300, dx);
        newW = resizeStart.current.w - delta;
        newX = resizeStart.current.px + delta;
      }
      if (resizing.includes('n')) {
        const delta = Math.min(resizeStart.current.h - 200, dy);
        newH = resizeStart.current.h - delta;
        newY = resizeStart.current.py + delta;
      }

      setSize({ width: newW, height: newH });
      setPos({ x: newX, y: newY });
    }
  }, [isDragging, resizing]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resizing, handleMouseMove, handleMouseUp]);

  const baseStyle: React.CSSProperties = isMobile 
    ? { 
        width: '100vw', 
        height: 'calc(100% - 48px)', 
        left: 0, 
        top: 0, 
        borderRadius: 0,
        border: 'none'
      }
    : isMaximized 
    ? {
        width: '100vw',
        height: 'calc(100vh - 48px)', 
        left: 0,
        top: 0,
        borderRadius: 0,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    : { 
        width: `${size.width}px`, 
        height: `${size.height}px`, 
        left: `${pos.x}px`, 
        top: `${pos.y}px`, 
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      };

  const windowStyle: React.CSSProperties = {
    ...baseStyle,
    position: 'absolute',
    display: isMinimized ? 'none' : 'flex',
    flexDirection: 'column',
    zIndex,
    overflow: 'visible',
    transition: isDragging || resizing ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div 
      className={`glass shadow-2xl transition-shadow duration-300 ${
        isActive ? 'ring-1 ring-blue-500/50 shadow-blue-500/30' : ''
      }`}
      style={windowStyle}
      onMouseDown={onFocus}
    >
      {/* Resizers */}
      {!isMobile && !isMaximized && (
        <>
          <div className="absolute inset-x-0 -top-1 h-2 cursor-ns-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className="absolute inset-x-0 -bottom-1 h-2 cursor-ns-resize z-50" onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className="absolute inset-y-0 -left-1 w-2 cursor-ew-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className="absolute inset-y-0 -right-1 w-2 cursor-ew-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'e')} />
          <div className="absolute -top-1 -left-1 w-3 h-3 cursor-nwse-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
          <div className="absolute -top-1 -right-1 w-3 h-3 cursor-nesw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 cursor-nesw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        </>
      )}

      {/* Title Bar */}
      <div 
        className={`h-11 flex items-center justify-between px-4 bg-white/5 border-b border-white/10 select-none shrink-0 ${
          isMobile || isMaximized ? '' : 'cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20`}>
            <i className={`fas ${icon} text-blue-400 text-xs`}></i>
          </div>
          <span className={`font-orbitron font-black uppercase tracking-widest text-slate-300 truncate max-w-[150px] md:max-w-none text-[10px]`}>
            {title}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-slate-400"
            title="Minimize"
          >
            <i className="fas fa-minus text-[10px]"></i>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-slate-400"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <i className={`${isMaximized ? 'fas fa-compress' : 'far fa-square'} text-[10px]`}></i>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/80 transition-colors group ml-1"
            title="Close"
          >
            <i className="fas fa-times text-[10px] text-slate-400 group-hover:text-white"></i>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-[#020617]/40 scroll-smooth custom-scrollbar relative">
        {children}
      </div>
    </div>
  );
};

export default Window;
