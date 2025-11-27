import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Camera, Video, MessageSquare } from "lucide-react";

export default function ChecklistModeloForm({ modelo, onSave, onCancel }) {
  const [form, setForm] = useState(modelo || {
    titulo: "",
    descricao: "",
    pilar: "processos",
    categoria: "diario",
    itens: [],
    ativo: true
  });

  const [novoItem, setNovoItem] = useState({
    texto: "",
    obrigatorio: true,
    requer_evidencia: false,
    tipo_evidencia: "foto"
  });

  const handleAddItem = () => {
    if (!novoItem.texto.trim()) return;
    setForm({
      ...form,
      itens: [...form.itens, { ...novoItem }]
    });
    setNovoItem({ texto: "", obrigatorio: true, requer_evidencia: false, tipo_evidencia: "foto" });
  };

  const handleRemoveItem = (idx) => {
    setForm({
      ...form,
      itens: form.itens.filter((_, i) => i !== idx)
    });
  };

  const pilarLabels = {
    processos: "🏆 Processos",
    desempenho: "📈 Desempenho",
    tempo_potencia: "⚡ Tempo de Potência",
    norte_estrategico: "🎯 Norte Estratégico",
    presenca_magnetica: "✨ Presença Magnética",
    geral: "📋 Geral"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-white/70">Título do Checklist *</Label>
          <Input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ex: Abertura de Loja"
            className="bg-white/5 border-white/10 text-white mt-1"
          />
        </div>
        <div>
          <Label className="text-white/70">Pilar</Label>
          <Select value={form.pilar} onValueChange={(v) => setForm({ ...form, pilar: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {Object.entries(pilarLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white/70">Frequência</Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="pontual">Pontual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label className="text-white/70">Descrição</Label>
          <Textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="bg-white/5 border-white/10 text-white mt-1"
            rows={2}
          />
        </div>
      </div>

      {/* Itens do Checklist */}
      <div>
        <Label className="text-white/70 mb-3 block">Itens do Checklist</Label>
        
        {form.itens.length > 0 && (
          <div className="space-y-2 mb-4">
            {form.itens.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group">
                <GripVertical size={16} className="text-white/30" />
                <span className="flex-1 text-white/80 text-sm">{item.texto}</span>
                {item.obrigatorio && (
                  <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">Obrigatório</span>
                )}
                {item.requer_evidencia && (
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full flex items-center gap-1">
                    {item.tipo_evidencia === "foto" && <Camera size={12} />}
                    {item.tipo_evidencia === "video" && <Video size={12} />}
                    {item.tipo_evidencia === "comentario" && <MessageSquare size={12} />}
                    Evidência
                  </span>
                )}
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar novo item */}
        <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/20">
          <div className="flex gap-3 mb-3">
            <Input
              value={novoItem.texto}
              onChange={(e) => setNovoItem({ ...novoItem, texto: e.target.value })}
              placeholder="Digite o item do checklist..."
              className="bg-white/5 border-white/10 text-white flex-1"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
            />
            <Button onClick={handleAddItem} className="bg-[#FF4D00] hover:bg-[#E64500]">
              <Plus size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={novoItem.obrigatorio}
                onCheckedChange={(c) => setNovoItem({ ...novoItem, obrigatorio: c })}
              />
              <label className="text-sm text-white/60">Obrigatório</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={novoItem.requer_evidencia}
                onCheckedChange={(c) => setNovoItem({ ...novoItem, requer_evidencia: c })}
              />
              <label className="text-sm text-white/60">Requer evidência</label>
            </div>
            {novoItem.requer_evidencia && (
              <Select
                value={novoItem.tipo_evidencia}
                onValueChange={(v) => setNovoItem({ ...novoItem, tipo_evidencia: v })}
              >
                <SelectTrigger className="w-32 h-8 bg-white/5 border-white/10 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="foto">Foto</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="comentario">Comentário</SelectItem>
                  <SelectItem value="qualquer">Qualquer</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1 border-white/10 text-white">
          Cancelar
        </Button>
        <Button
          onClick={() => onSave(form)}
          disabled={!form.titulo || form.itens.length === 0}
          className="flex-1 bg-[#FF4D00] hover:bg-[#E64500]"
        >
          {modelo ? "Salvar" : "Criar Modelo"}
        </Button>
      </div>
    </div>
  );
}