
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

  const addNode = () => {
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: 'New Idea',
      x: 100 + Math.random() * 500,
      y: 100 + Math.random() * 300,
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
    if (linkMode) {
      if (!linkingFromId) {
        setLinkingFromId(id);
      } else if (linkingFromId !== id) {
        // Create edge
        const edgeId = `${linkingFromId}-${id}`;
        if (!edges.some(e => e.id === edgeId)) {
          setEdges([...edges, { id: edgeId, fromId: linkingFromId, toId: id }]);
        }
        setLinkingFromId(null);
      }
      return;
    }

    setDraggingNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      dragOffset.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y
      };
    }
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - dragOffset.current.x;
    const y = e.clientY - dragOffset.current.y;

    setNodes(prev => prev.map(n => 
      n.id === draggingNodeId ? { ...n, x, y } : n
    ));
  }, [draggingNodeId]);

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
        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
            
            // Calculate centers (approx 80px width, 40px height)
            const fx = from.x + 80;
            const fy = from.y + 20;
            const tx = to.x + 80;
            const ty = to.y + 20;

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
          {linkingFromId && (
            <path className="animate-pulse" />
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            onPointerDown={(e) => handlePointerDown(e, node.id)}
            style={{ left: node.x, top: node.y }}
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
