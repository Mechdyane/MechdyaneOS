
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MindMapNode, MindMapEdge } from '../types';

const MECH_COLORS = [
  { name: 'Blue', class: 'text-blue-400', bg: 'bg-blue-400' },
  { name: 'Emerald', class: 'text-emerald-400', bg: 'bg-emerald-400' },
  { name: 'Amber', class: 'text-amber-400', bg: 'bg-amber-400' },
  { name: 'Rose', class: 'text-rose-400', bg: 'bg-rose-400' },
  { name: 'Violet', class: 'text-violet-400', bg: 'bg-violet-400' },
  { name: 'Neutral', class: 'text-slate-300', bg: 'bg-slate-300' },
];

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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus effect for editing
  useEffect(() => {
    if (editingNodeId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNodeId]);

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
      maxX = Math.max(maxX, node.x + 160); 
      maxY = Math.max(maxY, node.y + 80);  
    });

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const scale = Math.min(
      (rect.width - padding * 2) / contentW,
      (rect.height - padding * 2) / contentH,
      1.5 
    );

    const tx = (rect.width / 2) - scale * (minX + maxX) / 2;
    const ty = (rect.height / 2) - scale * (minY + maxY) / 2;

    setViewTransform({ x: tx, y: ty, k: scale });
  };

  const autoLayout = () => {
    if (nodes.length === 0) return;

    // 1. Build Adjacency List
    const adj: Record<string, string[]> = {};
    edges.forEach(edge => {
      if (!adj[edge.fromId]) adj[edge.fromId] = [];
      adj[edge.fromId].push(edge.toId);
    });

    // 2. Determine Levels (Breadth First Search)
    const rootNode = nodes.find(n => n.id === 'root') || nodes[0];
    const levels: Record<string, number> = {};
    const visited = new Set<string>();
    const queue: { id: string, level: number }[] = [{ id: rootNode.id, level: 0 }];
    
    visited.add(rootNode.id);
    levels[rootNode.id] = 0;

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      (adj[id] || []).forEach(childId => {
        if (!visited.has(childId)) {
          visited.add(childId);
          levels[childId] = level + 1;
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }

    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        levels[n.id] = 0;
      }
    });

    const levelCounts: Record<number, number> = {};
    const levelIndices: Record<number, number> = {};
    Object.values(levels).forEach(l => {
      levelCounts[l] = (levelCounts[l] || 0) + 1;
      levelIndices[l] = 0;
    });

    const startX = 350;
    const startY = 100;
    const hSpace = 200;
    const vSpace = 180;

    const layoutNodes = nodes.map(node => {
      const level = levels[node.id] || 0;
      const count = levelCounts[level] || 1;
      const index = levelIndices[level]++;
      
      const rowWidth = (count - 1) * hSpace;
      const x = startX - (rowWidth / 2) + (index * hSpace);
      const y = startY + (level * vSpace);

      return { ...node, x, y };
    });

    setNodes(layoutNodes);
    setTimeout(fitToView, 500); 
  };

  const createNodeAt = (worldX: number, worldY: number) => {
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: 'New Idea',
      x: worldX - 80, 
      y: worldY - 40, 
      color: 'text-slate-300'
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setEditingNodeId(newNode.id);
  };

  const handleCanvasClick = () => {
    setSelectedNodeId(null);
    setEditingNodeId(null);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || linkMode) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    
    const worldX = (localX - viewTransform.x) / viewTransform.k;
    const worldY = (localY - viewTransform.y) / viewTransform.k;

    createNodeAt(worldX, worldY);
  };

  const addNode = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const worldCenterX = (rect.width / 2 - viewTransform.x) / viewTransform.k;
    const worldCenterY = (rect.height / 2 - viewTransform.y) / viewTransform.k;
    createNodeAt(worldCenterX, worldCenterY);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.fromId !== id && e.toId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    if (editingNodeId === id) setEditingNodeId(null);
  };

  const updateNodeText = (id: string, text: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const updateNodeColor = (id: string, colorClass: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, color: colorClass } : n));
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    
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

  // Minimap Calculations
  const minimapData = useMemo(() => {
    if (nodes.length === 0) return { scale: 1, offsetX: 0, offsetY: 0, bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 } };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + 160);
      maxY = Math.max(maxY, n.y + 80);
    });

    const padding = 100;
    minX -= padding; minY -= padding;
    maxX += padding; maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;
    
    const miniSize = 180;
    const scale = Math.min(miniSize / width, miniSize / height);

    return { scale, offsetX: -minX, offsetY: -minY, bounds: { minX, minY, maxX, maxY, width, height } };
  }, [nodes]);

  const handleMinimapClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    const worldX = localX / minimapData.scale - minimapData.offsetX;
    const worldY = localY / minimapData.scale - minimapData.offsetY;

    const viewRect = containerRef.current.getBoundingClientRect();
    const newTx = (viewRect.width / 2) - viewTransform.k * worldX;
    const newTy = (viewRect.height / 2) - viewTransform.k * worldY;

    setViewTransform(prev => ({ ...prev, x: newTx, y: newTy }));
  };

  const viewportIndicator = useMemo(() => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    
    const worldX = -viewTransform.x / viewTransform.k;
    const worldY = -viewTransform.y / viewTransform.k;
    const worldW = rect.width / viewTransform.k;
    const worldH = rect.height / viewTransform.k;

    return {
      x: (worldX + minimapData.offsetX) * minimapData.scale,
      y: (worldY + minimapData.offsetY) * minimapData.scale,
      w: worldW * minimapData.scale,
      h: worldH * minimapData.scale,
    };
  }, [viewTransform, minimapData]);

  return (
    <div className="flex flex-col h-full bg-[#020617] relative overflow-hidden select-none">
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
          onClick={autoLayout}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all shadow-lg active:scale-95"
          title="Synaptic Alignment"
        >
          <i className="fas fa-wand-magic-sparkles"></i>
        </button>
        <button 
          onClick={() => setShowMinimap(!showMinimap)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all shadow-lg active:scale-95 ${
            showMinimap ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-blue-400 border-white/10 hover:bg-white/10'
          }`}
          title="Toggle Synaptic Overview (Minimap)"
        >
          <i className="fas fa-map"></i>
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

      {/* Minimap Overlay */}
      {showMinimap && (
        <div 
          className="absolute bottom-6 right-6 w-[200px] h-[200px] glass border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden cursor-pointer group"
          onClick={handleMinimapClick}
        >
          <div className="absolute top-2 left-3 text-[7px] font-black text-blue-500 uppercase tracking-widest opacity-50 font-orbitron">
            Synaptic Overview
          </div>
          <div className="relative w-full h-full p-2">
            {/* Viewport Indicator */}
            {viewportIndicator && (
              <div 
                className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none transition-all duration-300"
                style={{
                  left: viewportIndicator.x + 8,
                  top: viewportIndicator.y + 8,
                  width: viewportIndicator.w,
                  height: viewportIndicator.h
                }}
              />
            )}
            
            {/* Scale-down nodes */}
            {nodes.map(node => (
              <div 
                key={`mini-${node.id}`}
                className={`absolute rounded-sm transition-all duration-300 ${node.color?.replace('text-', 'bg-') || 'bg-slate-400'}`}
                style={{
                  left: (node.x + minimapData.offsetX) * minimapData.scale + 8,
                  top: (node.y + minimapData.offsetY) * minimapData.scale + 8,
                  width: 160 * minimapData.scale,
                  height: 80 * minimapData.scale,
                  opacity: 0.8
                }}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="absolute bottom-0 inset-x-0 h-6 bg-slate-900/40 backdrop-blur-sm border-t border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Click to Jump</span>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        className="flex-1 relative cursor-crosshair overflow-hidden"
      >
        <div 
          style={{ 
            transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.k})`,
            transformOrigin: '0 0',
            transition: draggingNodeId ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
              onClick={(e) => e.stopPropagation()} // STOP PROPAGATION HERE: Prevents canvas click from clearing selection
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingNodeId(node.id);
              }}
              style={{ 
                left: node.x, 
                top: node.y,
                pointerEvents: 'auto'
              }}
              className={`absolute w-40 glass border rounded-2xl p-4 cursor-grab active:cursor-grabbing transition-all group ${
                draggingNodeId === node.id ? 'z-50 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500' : 'z-10 shadow-lg'
              } ${selectedNodeId === node.id ? 'ring-2 ring-blue-500/50 border-blue-500/50' : 'border-white/10 hover:border-white/30'} ${linkingFromId === node.id ? 'ring-2 ring-amber-500 border-amber-500' : ''} ${linkMode ? 'hover:scale-105' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2 pointer-events-none">
                <div className={`w-2 h-2 rounded-full ${node.id === 'root' ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-500'}`}></div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Node_{node.id.slice(-4)}</span>
              </div>
              
              {editingNodeId === node.id ? (
                <textarea
                  ref={editInputRef}
                  value={node.text}
                  onChange={(e) => updateNodeText(node.id, e.target.value)}
                  onBlur={() => setEditingNodeId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && setEditingNodeId(null)}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full bg-slate-900/50 border border-blue-500/30 rounded-lg outline-none text-xs font-bold leading-tight resize-none h-16 p-2 custom-scrollbar ${node.color || 'text-white'}`}
                />
              ) : (
                <div className={`w-full text-xs font-bold leading-tight h-12 overflow-hidden break-words pointer-events-none ${node.color || 'text-white'}`}>
                  {node.text}
                </div>
              )}

              {/* Color Swatch Panel */}
              {selectedNodeId === node.id && !editingNodeId && !linkMode && (
                <div 
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 glass border border-white/20 rounded-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[60]"
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={(e) => e.stopPropagation()} 
                >
                  {MECH_COLORS.map(c => (
                    <button
                      key={c.name}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents deselecting the node when choosing a color
                        updateNodeColor(node.id, c.class);
                      }}
                      className={`w-5 h-5 rounded-full border border-white/20 transition-all hover:scale-125 hover:shadow-lg ${c.bg} ${node.color === c.class ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 shadow-blue-500/50' : ''}`}
                      title={c.name}
                    />
                  ))}
                </div>
              )}

              {node.id !== 'root' && !linkMode && !editingNodeId && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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

        <div className="absolute bottom-6 left-6 flex flex-col gap-2">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest pointer-events-none bg-[#020617]/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
            Double-click canvas to spawn node
          </div>
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest pointer-events-none bg-[#020617]/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
            Double-click node to edit text
          </div>
        </div>
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
