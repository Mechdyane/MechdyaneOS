
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MindMapNode, MindMapEdge } from '../types';

const MindMapper: React.FC = () => {
  const [nodes, setNodes] = useState<MindMapNode[]>(() => {
    const saved = localStorage.getItem('mechdyane_mindmap_nodes');
    return saved ? JSON.parse(saved) : [
      { id: 'root', text: 'Central Concept', x: 350, y: 200, color: 'text-blue-400' }
    ];
  });
  
  const [edges, setEdges] = useState<MindMapEdge[]>(() => {
    const saved = localStorage.getItem('mechdyane_mindmap_edges');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, k: 1 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Persistence
  useEffect(() => {
    localStorage.setItem('mechdyane_mindmap_nodes', JSON.stringify(nodes));
    localStorage.setItem('mechdyane_mindmap_edges', JSON.stringify(edges));
  }, [nodes, edges]);

  const fitToView = () => {
    if (!containerRef.current || nodes.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const padding = 60;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + 160); // w-40 is 160px
      maxY = Math.max(maxY, node.y + 80);  // approximate height
    });

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const scale = Math.min(
      (rect.width - padding * 2) / contentW,
      (rect.height - padding * 2) / contentH,
      1.5 // Max zoom
    );

    const tx = (rect.width / 2) - scale * (minX + maxX) / 2;
    const ty = (rect.height / 2) - scale * (minY + maxY) / 2;

    setViewTransform({ x: tx, y: ty, k: scale });
  };

  const addNode = () => {
    // Place new node in the center of current view
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = (rect.width / 2 - viewTransform.x) / viewTransform.k;
    const centerY = (rect.height / 2 - viewTransform.y) / viewTransform.k;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: 'New Idea',
      x: centerX - 80,
      y: centerY - 40,
      color: 'text-slate-300'
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.fromId !== id && e.toId !== id));
  };

  const updateNodeText = (id: string, text: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (linkMode) {
      if (!linkingFromId) {
        setLinkingFromId(id);
      } else if (linkingFromId !== id) {
        const edgeId = `${linkingFromId}-${id}`;
        if (!edges.some(e => e.id === edgeId)) {
          setEdges([...edges, { id: edgeId, fromId: linkingFromId, toId: id }]);
        }
        setLinkingFromId(null);
      }
      return;
    }

    const node = nodes.find(n => n.id === id);
    if (node) {
      setDraggingNodeId(id);
      // Un-transform the pointer to world space offset
      dragOffset.current = {
        x: (e.clientX - viewTransform.x) / viewTransform.k - node.x,
        y: (e.clientY - viewTransform.y) / viewTransform.k - node.y
      };
    }
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    
    const x = (e.clientX - viewTransform.x) / viewTransform.k - dragOffset.current.x;
    const y = (e.clientY - viewTransform.y) / viewTransform.k - dragOffset.current.y;

    setNodes(prev => prev.map(n => 
      n.id === draggingNodeId ? { ...n, x, y } : n
    ));
  }, [draggingNodeId, viewTransform]);

  const handlePointerUp = useCallback(() => {
    setDraggingNodeId(null);
  }, []);

  useEffect(() => {
    if (draggingNodeId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingNodeId, handlePointerMove, handlePointerUp]);

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-hidden select-none">
      {/* Background Grid */}
      <div className="absolute inset-0 os-grid opacity-10 pointer-events-none"></div>

      {/* Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-2 glass rounded-2xl border border-white/10 shadow-2xl">
        <button 
          onClick={addNode}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg active:scale-95"
          title="Add Thought Node"
        >
          <i className="fas fa-plus"></i>
        </button>
        <button 
          onClick={fitToView}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-blue-400 hover:bg-white/10 border border-white/5 transition-all shadow-lg active:scale-95"
          title="Fit to View"
        >
          <i className="fas fa-expand"></i>
        </button>
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <button 
          onClick={() => {
            setLinkMode(!linkMode);
            setLinkingFromId(null);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 border ${
            linkMode ? 'bg-amber-600 text-white border-amber-500 shadow-lg' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
          }`}
          title="Toggle Link Mode"
        >
          <i className="fas fa-project-diagram"></i>
        </button>
        <button 
          onClick={() => {
            if(confirm('Clear all synaptic pathways?')) {
              setNodes([{ id: 'root', text: 'Central Concept', x: 350, y: 200, color: 'text-blue-400' }]);
              setEdges([]);
              setViewTransform({ x: 0, y: 0, k: 1 });
            }
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-600/20 text-slate-400 hover:text-red-400 border border-white/5 transition-all"
          title="Clear Board"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 relative cursor-crosshair overflow-hidden">
        <div 
          style={{ 
            transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.k})`,
            transformOrigin: '0 0',
            transition: draggingNodeId ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {edges.map(edge => {
              const from = nodes.find(n => n.id === edge.fromId);
              const to = nodes.find(n => n.id === edge.toId);
              if (!from || !to) return null;
              
              const fx = from.x + 80;
              const fy = from.y + 35;
              const tx = to.x + 80;
              const ty = to.y + 35;

              return (
                <line 
                  key={edge.id}
                  x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke="url(#line-gradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-[dash_20s_linear_infinite]"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              style={{ 
                left: node.x, 
                top: node.y,
                pointerEvents: 'auto'
              }}
              className={`absolute w-40 glass border rounded-2xl p-4 cursor-grab active:cursor-grabbing transition-shadow group ${
                draggingNodeId === node.id ? 'z-50 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500' : 'z-10 shadow-lg'
              } ${linkingFromId === node.id ? 'ring-2 ring-amber-500 border-amber-500' : 'border-white/10 hover:border-white/30'} ${linkMode ? 'hover:scale-105' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2 pointer-events-none">
                <div className={`w-2 h-2 rounded-full ${node.id === 'root' ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`}></div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Node_{node.id.slice(-4)}</span>
              </div>
              
              <textarea
                value={node.text}
                onChange={(e) => updateNodeText(node.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={`w-full bg-transparent border-none outline-none text-xs font-bold leading-tight resize-none h-12 custom-scrollbar ${node.color || 'text-white'}`}
              />

              {node.id !== 'root' && !linkMode && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-times text-[10px]"></i>
                </button>
              )}
            </div>
          ))}
        </div>

        {linkMode && (
          <div className="absolute bottom-6 right-6 p-4 glass border border-amber-500/30 rounded-2xl animate-in slide-in-from-right duration-300">
             <div className="flex items-center gap-3">
               <i className="fas fa-bolt text-amber-500 animate-pulse"></i>
               <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                 {linkingFromId ? 'Select Target Node' : 'Select Source Node'}
               </p>
             </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
};

export default MindMapper;
