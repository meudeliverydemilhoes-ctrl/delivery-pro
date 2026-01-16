import React, { useState } from "react";
import { 
  ChevronRight, Plus, Trash2, Edit2, Check, X, GripVertical,
  ArrowRight, Circle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FluxogramaSetor({ 
  setor, 
  colunas, 
  onUpdateColunas,
  corPrimaria = "#FF4D00",
  corSecundaria = "#FF4D00"
}) {
  const [editingItem, setEditingItem] = useState(null);
  const [editingColuna, setEditingColuna] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [newColunaText, setNewColunaText] = useState("");

  const handleAddItem = (colunaIdx) => {
    if (!newItemText.trim()) return;
    const newColunas = colunas.map((col, idx) => 
      idx === colunaIdx 
        ? { ...col, itens: [...col.itens, newItemText.trim()] }
        : { ...col, itens: [...col.itens] }
    );
    onUpdateColunas(newColunas);
    setNewItemText("");
    setEditingItem(null);
  };

  const handleUpdateItem = (colunaIdx, itemIdx, newText) => {
    const newColunas = colunas.map((col, idx) => 
      idx === colunaIdx 
        ? { ...col, itens: col.itens.map((item, i) => i === itemIdx ? newText : item) }
        : { ...col, itens: [...col.itens] }
    );
    onUpdateColunas(newColunas);
    setEditingItem(null);
  };

  const handleDeleteItem = (colunaIdx, itemIdx) => {
    const newColunas = colunas.map((col, idx) => 
      idx === colunaIdx 
        ? { ...col, itens: col.itens.filter((_, i) => i !== itemIdx) }
        : { ...col, itens: [...col.itens] }
    );
    onUpdateColunas(newColunas);
  };

  const handleUpdateColunaTitulo = (colunaIdx, newTitulo) => {
    const newColunas = colunas.map((col, idx) => 
      idx === colunaIdx 
        ? { ...col, titulo: newTitulo, itens: [...col.itens] }
        : { ...col, itens: [...col.itens] }
    );
    onUpdateColunas(newColunas);
    setEditingColuna(null);
  };

  const handleAddColuna = () => {
    if (!newColunaText.trim()) return;
    const newColunas = [
      ...colunas.map(col => ({ ...col, itens: [...col.itens] })), 
      { titulo: newColunaText.trim(), itens: [] }
    ];
    onUpdateColunas(newColunas);
    setNewColunaText("");
  };

  const handleDeleteColuna = (colunaIdx) => {
    const newColunas = colunas
      .filter((_, idx) => idx !== colunaIdx)
      .map(col => ({ ...col, itens: [...col.itens] }));
    onUpdateColunas(newColunas);
  };

  return (
    <div className="relative">
      {/* Fluxograma Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-0 min-w-max">
          {colunas.map((coluna, colunaIdx) => (
            <div key={colunaIdx} className="flex items-stretch">
              {/* Coluna */}
              <div className="w-56 flex flex-col">
                {/* Header da Coluna */}
                <div 
                  className="relative px-4 py-3 rounded-t-xl border-b-4 group"
                  style={{ 
                    backgroundColor: `${corPrimaria}20`,
                    borderColor: corPrimaria
                  }}
                >
                  {editingColuna === colunaIdx ? (
                    <div className="flex gap-1">
                      <Input
                        value={coluna.titulo}
                        onChange={(e) => {
                          const newColunas = [...colunas];
                          newColunas[colunaIdx].titulo = e.target.value;
                          onUpdateColunas(newColunas);
                        }}
                        className="h-7 text-sm bg-white/10 border-white/20 text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingColuna(null)}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Check size={14} className="text-emerald-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h4 
                        className="font-bold text-sm text-center flex-1"
                        style={{ color: corPrimaria }}
                      >
                        {coluna.titulo}
                      </h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingColuna(colunaIdx)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Edit2 size={12} className="text-white/50" />
                        </button>
                        {colunas.length > 1 && (
                          <button
                            onClick={() => handleDeleteColuna(colunaIdx)}
                            className="p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Itens da Coluna */}
                <div 
                  className="flex-1 p-3 space-y-2 min-h-[200px] rounded-b-xl"
                  style={{ backgroundColor: `${corPrimaria}08` }}
                >
                  {coluna.itens.map((item, itemIdx) => (
                    <div key={itemIdx} className="relative group">
                      {editingItem?.coluna === colunaIdx && editingItem?.item === itemIdx ? (
                        <div className="flex gap-1">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newColunas = [...colunas];
                              newColunas[colunaIdx].itens[itemIdx] = e.target.value;
                              onUpdateColunas(newColunas);
                            }}
                            className="h-8 text-xs bg-white/10 border-white/20 text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Check size={12} className="text-emerald-400" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-start gap-2 p-2 rounded-lg border transition-all hover:border-opacity-50 group"
                          style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderColor: `${corPrimaria}30`
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: corPrimaria }}
                          />
                          <span className="text-xs text-white/80 flex-1 leading-relaxed">
                            {item}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingItem({ coluna: colunaIdx, item: itemIdx })}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Edit2 size={10} className="text-white/50" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(colunaIdx, itemIdx)}
                              className="p-1 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 size={10} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Linha conectora vertical */}
                      {itemIdx < coluna.itens.length - 1 && (
                        <div 
                          className="absolute left-[18px] top-full w-0.5 h-2"
                          style={{ backgroundColor: `${corPrimaria}40` }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Adicionar Item */}
                  {editingItem?.coluna === colunaIdx && editingItem?.item === 'new' ? (
                    <div className="flex gap-1">
                      <Input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Nova etapa..."
                        className="h-8 text-xs bg-white/10 border-white/20 text-white placeholder:text-white/30"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddItem(colunaIdx);
                          if (e.key === 'Escape') {
                            setEditingItem(null);
                            setNewItemText("");
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddItem(colunaIdx)}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Check size={12} className="text-emerald-400" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setNewItemText("");
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <X size={12} className="text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingItem({ coluna: colunaIdx, item: 'new' })}
                      className="w-full flex items-center justify-center gap-1 p-2 rounded-lg border border-dashed border-white/20 text-white/40 hover:text-white/60 hover:border-white/40 transition-colors text-xs"
                    >
                      <Plus size={12} />
                      Adicionar etapa
                    </button>
                  )}
                </div>
              </div>

              {/* Seta Conectora */}
              {colunaIdx < colunas.length - 1 && (
                <div className="flex items-center justify-center w-8 relative">
                  <div 
                    className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
                    style={{ backgroundColor: `${corPrimaria}60` }}
                  />
                  <div 
                    className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: corPrimaria }}
                  >
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Adicionar Coluna */}
          <div className="flex items-center ml-4">
            <div className="w-48">
              <div className="p-3 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 transition-colors">
                <Input
                  value={newColunaText}
                  onChange={(e) => setNewColunaText(e.target.value)}
                  placeholder="Nova coluna..."
                  className="h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30 mb-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColuna();
                  }}
                />
                <Button
                  onClick={handleAddColuna}
                  disabled={!newColunaText.trim()}
                  size="sm"
                  className="w-full text-xs"
                  style={{ backgroundColor: corPrimaria }}
                >
                  <Plus size={12} className="mr-1" />
                  Adicionar Coluna
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}