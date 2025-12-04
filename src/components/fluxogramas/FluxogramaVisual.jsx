import React, { useState, useRef, useCallback } from "react";
import {
  Plus, Trash2, Save, Link2, StickyNote, Square, Circle,
  Diamond, ArrowRight, Move, ZoomIn, ZoomOut, RotateCcw,
  FileText, ClipboardList, Settings, CheckCircle2, X,
  GripVertical, Pencil, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const nodeTypes = [
  { type: "inicio", label: "Início", icon: Circle, color: "#10B981", shape: "circle" },
  { type: "processo", label: "Processo", icon: Square, color: "#3B82F6", shape: "rectangle" },
  { type: "decisao", label: "Decisão", icon: Diamond, color: "#F59E0B", shape: "diamond" },
  { type: "fim", label: "Fim", icon: Circle, color: "#EF4444", shape: "circle" },
  { type: "sop", label: "SOP", icon: FileText, color: "#8B5CF6", shape: "rectangle" },
  { type: "checklist", label: "Checklist", icon: ClipboardList, color: "#EC4899", shape: "rectangle" },
  { type: "nota", label: "Nota", icon: StickyNote, color: "#6B7280", shape: "note" }
];

const shapeStyles = {
  circle: "rounded-full aspect-square",
  rectangle: "rounded-xl",
  diamond: "rotate-45",
  note: "rounded-lg border-l-4"
};

export default function FluxogramaVisual({ 
  fluxogramaData, 
  onSave, 
  sops = [], 
  checklists = [],
  readOnly = false 
}) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState(fluxogramaData?.nodes || []);
  const [connections, setConnections] = useState(fluxogramaData?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [editingNode, setEditingNode] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddNode = (type) => {
    const nodeConfig = nodeTypes.find(n => n.type === type);
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      label: nodeConfig.label,
      x: 200 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      color: nodeConfig.color,
      content: "",
      linkedSopId: null,
      linkedChecklistId: null,
      notes: ""
    };
    setNodes([...nodes, newNode]);
    setHasChanges(true);
  };

  const handleNodeMouseDown = (e, node) => {
    if (readOnly) return;
    if (connectingFrom) {
      if (connectingFrom.id !== node.id) {
        const newConnection = {
          id: `conn_${Date.now()}`,
          from: connectingFrom.id,
          to: node.id,
          label: ""
        };
        setConnections([...connections, newConnection]);
        setHasChanges(true);
      }
      setConnectingFrom(null);
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggedNode(node);
    setDragOffset({
      x: e.clientX - rect.left - node.x * zoom,
      y: e.clientY - rect.top - node.y * zoom
    });
    setSelectedNode(node);
  };

  const handleCanvasMouseMove = (e) => {
    if (!draggedNode || readOnly) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - dragOffset.x) / zoom;
    const newY = (e.clientY - rect.top - dragOffset.y) / zoom;
    
    setNodes(nodes.map(n => 
      n.id === draggedNode.id ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) } : n
    ));
    setHasChanges(true);
  };

  const handleCanvasMouseUp = () => {
    setDraggedNode(null);
  };

  const handleStartConnection = (node) => {
    if (readOnly) return;
    setConnectingFrom(node);
  };

  const handleDeleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    setHasChanges(true);
  };

  const handleDeleteConnection = (connId) => {
    setConnections(connections.filter(c => c.id !== connId));
    setHasChanges(true);
  };

  const openEditDialog = (node) => {
    setEditingNode({ ...node });
    setEditDialogOpen(true);
  };

  const saveNodeEdit = () => {
    setNodes(nodes.map(n => n.id === editingNode.id ? editingNode : n));
    setEditDialogOpen(false);
    setEditingNode(null);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.({ nodes, connections });
    setHasChanges(false);
  };

  const handleReset = () => {
    setNodes(fluxogramaData?.nodes || []);
    setConnections(fluxogramaData?.connections || []);
    setHasChanges(false);
  };

  const getNodePosition = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 60, y: node.y + 30 };
  };

  const renderConnection = (conn) => {
    const from = getNodePosition(conn.from);
    const to = getNodePosition(conn.to);
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    
    const length = Math.sqrt(dx * dx + dy * dy);
    
    return (
      <g key={conn.id} className="group">
        <line
          x1={from.x * zoom}
          y1={from.y * zoom}
          x2={to.x * zoom}
          y2={to.y * zoom}
          stroke="#FF4D00"
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
          className="cursor-pointer hover:stroke-[#FF6B2B]"
          onClick={() => !readOnly && handleDeleteConnection(conn.id)}
        />
        {conn.label && (
          <text
            x={((from.x + to.x) / 2) * zoom}
            y={((from.y + to.y) / 2) * zoom - 10}
            fill="white"
            fontSize="12"
            textAnchor="middle"
            className="pointer-events-none"
          >
            {conn.label}
          </text>
        )}
      </g>
    );
  };

  const renderNode = (node) => {
    const nodeConfig = nodeTypes.find(n => n.type === node.type);
    const Icon = nodeConfig?.icon || Square;
    const isSelected = selectedNode?.id === node.id;
    const isDiamond = node.type === "decisao";
    
    return (
      <div
        key={node.id}
        className={`absolute cursor-move transition-shadow ${isSelected ? "ring-2 ring-[#FF4D00] ring-offset-2 ring-offset-black" : ""}`}
        style={{
          left: node.x * zoom,
          top: node.y * zoom,
          transform: `scale(${zoom})`,
          transformOrigin: "top left"
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        onDoubleClick={() => !readOnly && openEditDialog(node)}
      >
        <div
          className={`relative min-w-[120px] p-3 border-2 ${isDiamond ? "rotate-45" : "rounded-xl"}`}
          style={{ 
            backgroundColor: `${node.color}20`, 
            borderColor: node.color 
          }}
        >
          <div className={`flex flex-col items-center gap-1 ${isDiamond ? "-rotate-45" : ""}`}>
            <Icon size={20} style={{ color: node.color }} />
            <span className="text-xs font-medium text-white text-center">{node.label}</span>
            {node.content && (
              <span className="text-[10px] text-white/60 text-center line-clamp-2">{node.content}</span>
            )}
            {(node.linkedSopId || node.linkedChecklistId) && (
              <div className="flex gap-1 mt-1">
                {node.linkedSopId && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded">SOP</span>
                )}
                {node.linkedChecklistId && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-pink-500/30 text-pink-300 rounded">Check</span>
                )}
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          {isSelected && !readOnly && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1 bg-zinc-800 rounded-lg p-1 shadow-lg">
              <button
                onClick={(e) => { e.stopPropagation(); handleStartConnection(node); }}
                className="p-1 hover:bg-white/10 rounded"
                title="Conectar"
              >
                <Link2 size={12} className="text-[#FF4D00]" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openEditDialog(node); }}
                className="p-1 hover:bg-white/10 rounded"
                title="Editar"
              >
                <Pencil size={12} className="text-white/60" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                className="p-1 hover:bg-red-500/20 rounded"
                title="Excluir"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          )}
        </div>
        
        {node.notes && (
          <div className="absolute -right-2 -top-2">
            <StickyNote size={14} className="text-amber-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <button
                  key={nodeType.type}
                  onClick={() => handleAddNode(nodeType.type)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  title={`Adicionar ${nodeType.label}`}
                >
                  <Icon size={16} style={{ color: nodeType.color }} />
                  <span className="text-xs text-white/70">{nodeType.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-1.5 hover:bg-white/10 rounded"
              >
                <ZoomOut size={16} className="text-white/60" />
              </button>
              <span className="text-xs text-white/60 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                className="p-1.5 hover:bg-white/10 rounded"
              >
                <ZoomIn size={16} className="text-white/60" />
              </button>
            </div>
            
            {hasChanges && (
              <>
                <Button variant="outline" size="sm" onClick={handleReset} className="border-white/10 text-white">
                  <RotateCcw size={14} className="mr-1" /> Resetar
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-[#FF4D00] hover:bg-[#E64500]">
                  <Save size={14} className="mr-1" /> Salvar
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Connection mode indicator */}
      {connectingFrom && (
        <div className="p-3 bg-[#FF4D00]/20 border border-[#FF4D00]/30 rounded-lg text-center">
          <span className="text-sm text-[#FF4D00]">
            Clique em outro nó para conectar a partir de "{connectingFrom.label}"
          </span>
          <button
            onClick={() => setConnectingFrom(null)}
            className="ml-3 text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="relative bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden"
        style={{ 
          height: "500px",
          backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`
        }}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onClick={() => setSelectedNode(null)}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#FF4D00" />
            </marker>
          </defs>
          <g className="pointer-events-auto">
            {connections.map(renderConnection)}
          </g>
        </svg>

        {/* Nodes */}
        {nodes.map(renderNode)}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Settings size={40} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/40">Clique nos botões acima para adicionar elementos</p>
              <p className="text-white/30 text-sm mt-1">Arraste para posicionar, clique duplo para editar</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-3 bg-white/5 border border-white/10 rounded-lg">
        <span className="text-xs text-white/50">Legenda:</span>
        {nodeTypes.map((nt) => {
          const Icon = nt.icon;
          return (
            <div key={nt.type} className="flex items-center gap-1">
              <Icon size={12} style={{ color: nt.color }} />
              <span className="text-xs text-white/60">{nt.label}</span>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Elemento</DialogTitle>
          </DialogHeader>
          
          {editingNode && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-white/50 mb-2 block">Tipo</label>
                <Select
                  value={editingNode.type}
                  onValueChange={(v) => {
                    const config = nodeTypes.find(n => n.type === v);
                    setEditingNode({ 
                      ...editingNode, 
                      type: v, 
                      color: config.color,
                      label: editingNode.label === nodeTypes.find(n => n.type === editingNode.type)?.label 
                        ? config.label 
                        : editingNode.label
                    });
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {nodeTypes.map((nt) => (
                      <SelectItem key={nt.type} value={nt.type}>
                        <div className="flex items-center gap-2">
                          <nt.icon size={14} style={{ color: nt.color }} />
                          {nt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-2 block">Rótulo</label>
                <Input
                  value={editingNode.label}
                  onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-2 block">Descrição</label>
                <Textarea
                  value={editingNode.content || ""}
                  onChange={(e) => setEditingNode({ ...editingNode, content: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
              </div>

              {(editingNode.type === "processo" || editingNode.type === "sop") && sops.length > 0 && (
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Vincular SOP</label>
                  <Select
                    value={editingNode.linkedSopId || "none"}
                    onValueChange={(v) => setEditingNode({ ...editingNode, linkedSopId: v === "none" ? null : v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione um SOP" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      <SelectItem value="none">Nenhum</SelectItem>
                      {sops.map((sop) => (
                        <SelectItem key={sop.id} value={sop.id}>{sop.titulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(editingNode.type === "processo" || editingNode.type === "checklist") && checklists.length > 0 && (
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Vincular Checklist</label>
                  <Select
                    value={editingNode.linkedChecklistId || "none"}
                    onValueChange={(v) => setEditingNode({ ...editingNode, linkedChecklistId: v === "none" ? null : v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione um checklist" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      <SelectItem value="none">Nenhum</SelectItem>
                      {checklists.map((cl) => (
                        <SelectItem key={cl.id} value={cl.id}>{cl.titulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-xs text-white/50 mb-2 block">Notas</label>
                <Textarea
                  value={editingNode.notes || ""}
                  onChange={(e) => setEditingNode({ ...editingNode, notes: e.target.value })}
                  placeholder="Adicione observações..."
                  className="bg-white/5 border-white/10 text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-2 block">Cor</label>
                <div className="flex gap-2">
                  {["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6B7280"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingNode({ ...editingNode, color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        editingNode.color === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1 border-white/10 text-white">
                  Cancelar
                </Button>
                <Button onClick={saveNodeEdit} className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]">
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}