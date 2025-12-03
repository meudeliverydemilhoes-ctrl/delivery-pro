import React, { useState } from "react";
import {
  Check, Clock, X, Edit2, Save, Plus, Trash2, ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const statusConfig = {
  pendente: { icon: X, color: "text-red-400", bg: "bg-red-500/20", label: "❌ A FAZER" },
  em_andamento: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20", label: "⏳ EM ANDAMENTO" },
  concluido: { icon: Check, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "✅ CONCLUÍDO" }
};

export default function TabelaInterativa({ 
  colunas, 
  dados, 
  onUpdate, 
  onAdd, 
  onDelete,
  onOpenMaterial 
}) {
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [newRow, setNewRow] = useState({});

  const handleEdit = (idx, row) => {
    setEditingRow(idx);
    setEditData({ ...row });
  };

  const handleSave = (idx) => {
    onUpdate?.(idx, editData);
    setEditingRow(null);
    setEditData({});
  };

  const handleAddRow = () => {
    if (Object.values(newRow).some(v => v?.trim?.())) {
      onAdd?.(newRow);
      setNewRow({});
    }
  };

  const calcularProgresso = (row) => {
    if (row.status === "concluido") return 100;
    if (row.status === "em_andamento") return row.percentual || 50;
    return 0;
  };

  const calcularProgressoTotal = () => {
    if (!dados?.length) return 0;
    const total = dados.reduce((acc, row) => acc + calcularProgresso(row), 0);
    return Math.round(total / dados.length);
  };

  const progressoTotal = calcularProgressoTotal();

  return (
    <div className="space-y-4">
      {/* Barra de progresso geral */}
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <span className="text-sm text-white/60">Progresso Geral:</span>
        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              progressoTotal >= 80 ? "bg-emerald-500" : 
              progressoTotal >= 40 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${progressoTotal}%` }}
          />
        </div>
        <span className={`text-sm font-bold ${
          progressoTotal >= 80 ? "text-emerald-400" : 
          progressoTotal >= 40 ? "text-amber-400" : "text-red-400"
        }`}>
          {progressoTotal}%
        </span>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {colunas.map((col, idx) => (
                <th key={idx} className="text-left p-3 text-white/60 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="text-center p-3 text-white/60 font-medium w-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados?.map((row, rowIdx) => {
              const isEditing = editingRow === rowIdx;
              const StatusIcon = statusConfig[row.status]?.icon || X;
              const progresso = calcularProgresso(row);

              return (
                <tr key={rowIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {colunas.map((col, colIdx) => (
                    <td key={colIdx} className="p-3">
                      {col.key === "status" ? (
                        isEditing ? (
                          <Select 
                            value={editData.status || "pendente"} 
                            onValueChange={(v) => setEditData({ ...editData, status: v })}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                              <SelectItem value="pendente">❌ A FAZER</SelectItem>
                              <SelectItem value="em_andamento">⏳ EM ANDAMENTO</SelectItem>
                              <SelectItem value="concluido">✅ CONCLUÍDO</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${statusConfig[row.status]?.bg} ${statusConfig[row.status]?.color}`}>
                            <StatusIcon size={12} />
                            {statusConfig[row.status]?.label}
                          </span>
                        )
                      ) : col.key === "percentual" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                progresso >= 80 ? "bg-emerald-500" : 
                                progresso >= 40 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${progresso}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            progresso >= 80 ? "text-emerald-400" : 
                            progresso >= 40 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {progresso}%
                          </span>
                        </div>
                      ) : col.key === "atividade" && row.materialLink ? (
                        <button 
                          onClick={() => onOpenMaterial?.(row)}
                          className="text-left text-white/80 hover:text-[#FF4D00] flex items-center gap-1"
                        >
                          {row[col.key]}
                          <ExternalLink size={12} className="text-[#FF4D00]" />
                        </button>
                      ) : isEditing && col.editable !== false ? (
                        <Input
                          value={editData[col.key] || ""}
                          onChange={(e) => setEditData({ ...editData, [col.key]: e.target.value })}
                          className="bg-white/5 border-white/10 text-white h-8 text-sm"
                        />
                      ) : (
                        <span className="text-white/80">{row[col.key]}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSave(rowIdx)} className="p-1.5 hover:bg-emerald-500/20 rounded text-emerald-400">
                            <Save size={14} />
                          </button>
                          <button onClick={() => setEditingRow(null)} className="p-1.5 hover:bg-white/10 rounded text-white/40">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(rowIdx, row)} className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => onDelete?.(rowIdx)} className="p-1.5 hover:bg-red-500/10 rounded text-red-400/50 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adicionar nova linha */}
      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
        {colunas.filter(c => c.key !== "percentual").map((col, idx) => (
          col.key === "status" ? (
            <Select 
              key={idx}
              value={newRow.status || "pendente"} 
              onValueChange={(v) => setNewRow({ ...newRow, status: v })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-8 w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="pendente">❌ A FAZER</SelectItem>
                <SelectItem value="em_andamento">⏳ EM ANDAMENTO</SelectItem>
                <SelectItem value="concluido">✅ CONCLUÍDO</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              key={idx}
              value={newRow[col.key] || ""}
              onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value })}
              placeholder={col.label}
              className="flex-1 bg-white/5 border-white/10 text-white h-8 text-sm placeholder:text-white/30"
            />
          )
        ))}
        <Button size="sm" onClick={handleAddRow} className="h-8 px-3 bg-[#FF4D00] hover:bg-[#E64500]">
          <Plus size={14} />
        </Button>
      </div>
    </div>
  );
}